//父类

'use strict';



const Controller = require('egg').Controller;

class BaseController extends Controller {
  async success(redirectUrl, message) {

    // this.ctx.body='成功';

    await this.ctx.render('admin/public/success', {
      redirectUrl: redirectUrl,
      message: message || '操作成功!'
    });


  }

  async error(redirectUrl, message) {

    // this.ctx.body='成功';

    await this.ctx.render('admin/public/error', {
      redirectUrl: redirectUrl,
      message: message || '操作成功!'
    });

  }

  async verify() {


    var captcha = await this.service.tools.captcha(); //服务里面的方法

    this.ctx.response.type = 'image/svg+xml'; /*指定返回的类型*/

    this.ctx.body = captcha.data; /*给页面返回一张图片*/
  }

  //封装一个 库 公共删除方法   

  async delete() {

    let modelName = this.ctx.query.model;

    let id = this.ctx.query.id;

    await this.ctx.model[modelName].deleteOne({
      '_id': id
    })

    this.ctx.redirect(this.ctx.state.prevPage);

  }



  // 改变用户状态的方法
  async changeStatus() {

    let {
      model,
      attr,
      id
    } = this.ctx.request.query;

    console.log('改变状态', this.ctx.request.query)

    //查库
    let result = await this.ctx.model[model].find({
      _id: id
    })

    if (result.length > 0) {
      let item = result[0]
      let json;
      if (item[attr] == 1) {
        json = {
          [attr]: 0
        }
      } else {
        json = {
          [attr]: 1
        }
      }

      let updateResult = await this.ctx.model[model].updateOne({
        _id: id
      }, json)

      console.log('状态更新', updateResult)

      if (updateResult) {
        this.ctx.body = {
          message: '更新成功',
          success: true
        }
      } else {
        this.ctx.body = {
          message: '更新失败',
          success: false
        }
      }


    } else {
      //接口
      this.ctx.body = {
        message: '更新失败,参数错误',
        success: false
      };
    }

  }


  // 修改表数量的通用方法
  async editNum() {

    //model
    let model = this.ctx.query.model;
    let attr = this.ctx.query.attr;
    let id = this.ctx.query.id;
    let num = this.ctx.query.num;

    let result = await this.ctx.model[model].find({
      _id: id
    })

    if (result.length > 0) {
      //根据id查到待更新的数据
      let json = {
        [attr]: num
      }

      let updateResult = await this.ctx.model[model].updateOne({
        _id: id
      }, json)

      if (updateResult) {
        //更新成功
        this.ctx.body = {
          success: true,
          message: '更新成功'
        }
      } else {
        //更新失败
        this.ctx.body = {
          success: false,
          message: '更新失败'
        }
      }

    } else {

      //未查到数据
      this.ctx.body = {
        message: '参数错误',
        success: false
      }
    }

  }




}

module.exports = BaseController;