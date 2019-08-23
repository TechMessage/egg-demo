'use strict';

const Controller = require('./base');

class GoodsTypeAttributeController extends Controller {

    //获取 商品的分类的 属性列表
    async index() {

        //获取商品分类id
        let id = this.ctx.query.id;

        //查库
        let result = await this.ctx.model.GoodsTypeAttribute.aggregate([{
            $lookup: {
                from: 'goods_type',
                localField: 'cate_id',
                foreignField: '_id',
                as: 'goods_type'
            }
        }, {
            $match: {
                "cate_id": this.app.mongoose.Types.ObjectId(id)
            }
        }]);


        await this.ctx.render('admin/goodsTypeAttribute/index', {
            list: result,
            cate_id: id
        })
    }


    //属性新增页
    async add() {
        let cate_id = this.ctx.query.id;
        let goodsTypes = await this.ctx.model.GoodsType.find({})

        await this.ctx.render('admin/goodsTypeAttribute/add', {
            cate_id: cate_id,
            goodsTypes: goodsTypes
        })
    }

    // 处理 新增
    async doAdd() {
        let item = new this.ctx.model.GoodsTypeAttribute(this.ctx.request.body);

        await item.save()

        await this.success('/admin/goodsTypeAttribute?id=' + this.ctx.request.body.cate_id, '增加商品类型属性成功')
    }


    // 功能编辑页
    async edit() {
        let id = this.ctx.query.id;
        let result = await this.ctx.model.GoodsTypeAttribute.find({
            _id: id
        });

        let goodsTypes = await this.ctx.model.GoodsType.find({})

        await this.ctx.render('admin/goodsType/edit', {
            list: result[0],
            goodsTypes
        })
    }

    // 编辑 处理

    async doEdit() {
        let {
            _id,

        } = this.ctx.request.body;

        await this.ctx.model.GoodsTypeAttribute.updateOne({
            _id
        }, this.ctx.request.body)
        await this.success('/admin/goodsTypeAttribute?id=' + this.ctx.request.body.cate_id, '修改商品类型属性成功')
    }

}

module.exports = GoodsTypeAttributeController;