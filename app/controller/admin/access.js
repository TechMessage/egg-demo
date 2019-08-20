'use strict';

var BaseController = require('./base.js');

class AccessController extends BaseController {
  async index() {

    let result = await this.ctx.model.Access.aggregate([{
        $lookup: {
          from: 'access',
          localField: '_id',
          foreignField: 'module_id',
          as: 'items'
        }
      },
      {
        $match: {
          'module_id': '0'
        }
      }
    ])

    console.log(result);


    await this.ctx.render('admin/access/index', {
      list: result
    });
  }

  async add() {

    //获取模块列表
    let result = await this.ctx.model.Access.find({
      'module_id': '0'
    })

    await this.ctx.render('admin/access/add', {
      moduleList: result
    });
  }


  async doAdd() {

    let addResult = this.ctx.request.body;

    let module_id = addResult.module_id;


    if (module_id !== '0') {
      //增加的是 菜单或者 操作 
      addResult.module_id = this.app.mongoose.Types.ObjectId(module_id);

    }

    let access = new this.ctx.model.Access(addResult);

    access.save()

    await this.success('/admin/access', '增加权限成功')

  }


  // 编辑

  async edit() {


    // 数据回显
    let id = this.ctx.query.id;

    // 查询该数据
    let access = await this.ctx.model.Access.find({
      '_id': id
    });

    // console.log('access', access)

    // 查询所有的模块
    let modules = await this.ctx.model.Access.find({
      'module_id': '0'
    })


    await this.ctx.render('admin/access/edit', {
      list: access[0],
      moduleList: modules
    });


  }


  async doEdit() {

    // 获取form表单数据
    let updateResult = this.ctx.request.body;

    // 获取待更新数据的id
    let id = updateResult.id;

    let module_id = updateResult.module_id;


    if (module_id !== '0') {
      //说名是菜单 或者 操作
      updateResult.module_id = this.app.mongoose.Types.ObjectId(module_id);

    }

    let result = await this.ctx.model.Access.updateOne({
      _id: id
    }, updateResult)

    await this.success('/admin/access', '修改权限成功')

  }



}
module.exports = AccessController;