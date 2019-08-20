'use strict';

var BaseController = require('./base.js');

class RoleController extends BaseController {
  async index() {

    var result = await this.ctx.model.Role.find({});

    await this.ctx.render('admin/role/index', {

      list: result
    });

  }

  async add() {


    await this.ctx.render('admin/role/add');

  }

  async doAdd() {

    //  console.log(this.ctx.request.body);


    var role = new this.ctx.model.Role({

      title: this.ctx.request.body.title,

      description: this.ctx.request.body.description,
    })

    await role.save(); //注意

    await this.success('/admin/role', '增加角色成功');


  }




  async edit() {


    var id = this.ctx.query.id;

    var result = await this.ctx.model.Role.find({
      "_id": id
    });

    await this.ctx.render('admin/role/edit', {

      list: result[0]
    });

  }

  async doEdit() {

    /*
    { _csrf: 'b6TZ302c-LE44hFJ7LW9q3aBsmWztZXEA3Vw',
    _id: '5b8cecf5ebad41239888d3e9',
    title: '网站编辑111',
    description: '网站编辑222' }
    */

    var _id = this.ctx.request.body._id;
    var title = this.ctx.request.body.title;
    var description = this.ctx.request.body.description;

    await this.ctx.model.Role.updateOne({
      "_id": _id
    }, {
      title,
      description
    })
    await this.success('/admin/role', '编辑角色成功');

  }


  // 角色授权页
  async auth() {

    //获取角色id
    let id = this.ctx.query.id;

    // 查数据库，获取所有的模块以及模块下的菜单权限

    let results = await this.ctx.model.Access.aggregate([{
        $lookup: {
          from: 'access',
          localField: '_id',
          foreignField: 'module_id',
          as: 'items'
        }
      },

      {
        $match: {
          "module_id": '0'
        }
      }
    ])


    // 查询已有的权限，回显
    let accessResults = await this.ctx.model.RoleAccess.find({
      role_id: id
    })

    console.log('accessResults', accessResults)

    let roleAccessList = [];
    accessResults.forEach(v => roleAccessList.push(v.access_id.toString()));

    // 判断已有的权限在权限总和中的存在与否

    for (let i = 0; i < results.length; i++) {
      if (roleAccessList.indexOf(results[i]._id.toString()) != -1) {
        results[i].checked = true
      }
      for (let j = 0; j < results[i].items.length; j++) {
        if (roleAccessList.indexOf(results[i].items[j]._id.toString()) != -1) {
          results[i].items[j].checked = true
        }
      }
    }


    await this.ctx.render('/admin/role/auth', {
      list: results,
      role_id: id
    })

  }


  // 处理授权
  async doAuth() {
    /** 
     * 相当于更新操作， 1 清空原权限，2 赋值新的数据
     * 
     * form表单提交数据，相同的key时，写成[]的方式，
     * 后台bodyparser 自动解析转为数组
     */

    //  let role_id = this.ctx.request.body.role_id;

    console.log(this.ctx.request.body)

    let roleId = this.ctx.request.body.role_id;

    let accessList = this.ctx.request.body.access_node || [];

    //删除原先的权限
    await this.ctx.model.RoleAccess.deleteMany({
      role_id: roleId
    });

    accessList.forEach(v => {

      let item = new this.ctx.model.RoleAccess({
        role_id: roleId,
        access_id: v
      })


      item.save()

    })

    await this.success('/admin/role/auth?id=' + roleId, '授权成功')

  }

}

module.exports = RoleController;