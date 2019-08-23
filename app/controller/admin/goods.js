'use strict';

const Controller = require('./base');

class GoodsController extends Controller {
    async index() {

        await this.ctx.render('admin/goods/index');
    }

    async add() {
        //获取所有的颜色值
        var colorResult = await this.ctx.model.GoodsColor.find({});
        //获取所有的商品类型
        var goodsType = await this.ctx.model.GoodsType.find({});

        await this.ctx.render('admin/goods/add', {
            colorResult: colorResult,
            goodsType: goodsType
        });

    }



    async doAdd() {


        console.log(this.ctx.request.body);
        

    }



    //获取商品类型的属性 api接口
    async goodsTypeAttribute() {


        var cate_id = this.ctx.request.query.cate_id;

        //注意 await
        var goodsTypeAttribute = await this.ctx.model.GoodsTypeAttribute.find({
            "cate_id": cate_id
        })

        console.log(goodsTypeAttribute);

        this.ctx.body = {
            result: goodsTypeAttribute
        }

    }
}

module.exports = GoodsController;