'use strict';

const Controller = require('./base');

class GoodsTypeController extends Controller {

    //商品类型列表查询
    async index() {
        //查询商品类型表
        var result = await this.ctx.model.GoodsType.find({});
        await this.ctx.render('admin/goodsType/index', {
            list: result
        });
    }

    // 商品 新增页
    async add() {

        await this.ctx.render('admin/goodsType/add');

    }

     //处理新增
    async doAdd() {

        //  console.log(this.ctx.request.body);

        var res = new this.ctx.model.GoodsType(this.ctx.request.body)

        await res.save(); //注意

        await this.success('/admin/goodsType', '增加类型成功');


    }



    //编辑页
    async edit() {


        var id = this.ctx.query.id;

        var result = await this.ctx.model.GoodsType.find({
            "_id": id
        });

        await this.ctx.render('admin/goodsType/edit', {

            list: result[0]
        });

    }

    //处理编辑
    async doEdit() {



        var _id = this.ctx.request.body._id;
        var title = this.ctx.request.body.title;
        var description = this.ctx.request.body.description;

        await this.ctx.model.GoodsType.updateOne({
            "_id": _id
        }, {
            title,
            description
        })
        await this.success('/admin/goodsType', '编辑类型成功');

    }

}

module.exports = GoodsTypeController;