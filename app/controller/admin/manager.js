'use strict';

var BaseController = require('./base.js');

class ManagerController extends BaseController {
  async index() {

    // this.ctx.body='管理员列表'


    /**
     *  
     */

    let result = await this.ctx.model.Admin.aggregate([{
      $lookup: {
        from: 'role',
        localField: 'role_id',
        foreignField: '_id',
        as: 'role'
      }
    }]);



    await this.ctx.render('admin/manager/index', {

      list: result
    });

  }



  // 新增用户
  async add() {
    // 查询所有的角色列表
    let result = await this.ctx.model.Role.find();
    await this.ctx.render('admin/manager/add', {
      roleResult: result
    });

  }


  // 处理增加
  async doAdd() {

    //获取表单数据
    console.log(this.ctx.request.body);

    let {
      username,
      password,
      mobile,
      email,
      role_id
    } = this.ctx.request.body;

    password = await this.service.tools.md5(password);
    // 数据校验
    // 非空校验

    // 查数据库，判断当前用户是否存在，用户名是否相同

    let result = await this.ctx.model.Admin.find({
      username
    });


    if (result.length > 0) {
      await this.error('/admin/manager/add', '此管理员已经存在')
    } else {
      //成功
      let newAdmin = new this.ctx.model.Admin({
        username,
        password,
        mobile,
        email,
        role_id
      })

      await newAdmin.save();

      await this.success('/admin/manager', '增加用户成功')

    }
  }


  // 编辑
  async edit() {
    let id = this.ctx.request.query.id;
    let result = await this.ctx.model.Admin.find({
      _id: id
    });
    // 获取角色
    let roles = await this.ctx.model.Role.find()
    await this.ctx.render('admin/manager/edit', {
      adminResult: result[0],
      roleResult: roles
    });
  }

  async doEdit() {

    // console.log(this.ctx.request.body);

    var id = this.ctx.request.body.id;
    var password = this.ctx.request.body.password;
    var mobile = this.ctx.request.body.mobile;
    var email = this.ctx.request.body.email;
    var role_id = this.ctx.request.body.role_id;

    if (password) {
      //修改密码
      password = await this.service.tools.md5(password);
      await this.ctx.model.Admin.updateOne({
        "_id": id
      }, {
        password,
        mobile,
        email,
        role_id
      })

    } else {

      //不修改密码
      await this.ctx.model.Admin.updateOne({
        "_id": id
      }, {
        mobile,
        email,
        role_id
      })

    }

    await this.success('/admin/manager', '修改用户信息成功')
  }
}

module.exports = ManagerController;