'use strict';

const Controller = require('./base');

const fs = require('fs')

const pump = require('mz-modules/pump')

class GoodsController extends Controller {

    //商品列表页
    async index() {

        //查询数据库
        let goodsResult = await this.ctx.model.Goods.find({})
        await this.ctx.render('admin/goods/index', {
            list: goodsResult
        });
    }

    async add() {
        //获取所有的颜色值
        var colorResult = await this.ctx.model.GoodsColor.find({});
        //获取所有的商品类型
        var goodsType = await this.ctx.model.GoodsType.find({});

        //获取商品分类

        var goodsCate = await this.ctx.model.GoodsCate.aggregate([

            {
                $lookup: {
                    from: 'goods_cate',
                    localField: '_id',
                    foreignField: 'pid',
                    as: 'items'
                }
            },
            {
                $match: {
                    "pid": '0'
                }
            }

        ])

        await this.ctx.render('admin/goods/add', {
            colorResult,
            goodsType,
            goodsCate
        });

    }


    async edit() {


        //获取修改数据的id

        var id = this.ctx.request.query.id;

        //获取所有的颜色值
        var colorResult = await this.ctx.model.GoodsColor.find({});

        //获取所有的商品类型
        var goodsType = await this.ctx.model.GoodsType.find({});

        //获取商品分类

        var goodsCate = await this.ctx.model.GoodsCate.aggregate([

            {
                $lookup: {
                    from: 'goods_cate',
                    localField: '_id',
                    foreignField: 'pid',
                    as: 'items'
                }
            },
            {
                $match: {
                    "pid": '0'
                }
            }

        ])


        //获取修改的商品

        var goodsResult = await this.ctx.model.Goods.find({
            '_id': id
        });

        console.log(goodsResult);

        //获取规格信息  (待定)

        var goodsAttsResult = await this.ctx.model.GoodsAttr.find({
            "goods_id": goodsResult[0]._id
        });

        var goodsAttsStr = '';

        goodsAttsResult.forEach(async (val) => {

            if (val.attribute_type == 1) {

                goodsAttsStr += `<li><span>${val.attribute_title}: 　</span><input type="hidden" name="attr_id_list" value="${val.attribute_id}" />  <input type="text" name="attr_value_list"  value="${val.attribute_value}" /></li>`;
            } else if (val.attribute_type == 2) {
                goodsAttsStr += `<li><span>${val.attribute_title}: 　</span><input type="hidden" name="attr_id_list" value="${val.attribute_id}" />  <textarea cols="50" rows="3" name="attr_value_list">${val.attribute_value}</textarea></li>`;
            } else {
                //获取 attr_value  获取可选值列表
                var oneGoodsTypeAttributeResult = await this.ctx.model.GoodsTypeAttribute.find({
                    _id: val.attribute_id
                })

                var arr = oneGoodsTypeAttributeResult[0].attr_value.split('\n');

                goodsAttsStr += `<li><span>${val.attribute_title}: 　</span><input type="hidden" name="attr_id_list" value="${val.attribute_id}" />`;

                goodsAttsStr += `<select name="attr_value_list">`;

                for (var j = 0; j < arr.length; j++) {

                    if (arr[j] == val.attribute_value) {
                        goodsAttsStr += `<option value="${arr[j]}" selected >${arr[j]}</option>`;
                    } else {
                        goodsAttsStr += `<option value="${arr[j]}" >${arr[j]}</option>`;
                    }
                }
                goodsAttsStr += `</select>`;
                goodsAttsStr += `</li>`;
            }

        })

        //商品的图库信息
        var goodsImageResult = await this.ctx.model.GoodsImage.find({
            "goods_id": goodsResult[0]._id
        });

        console.log(goodsImageResult);

        await this.ctx.render('admin/goods/edit', {
            colorResult: colorResult,
            goodsType: goodsType,
            goodsCate: goodsCate,
            goods: goodsResult[0],
            goodsAtts: goodsAttsStr,
            goodsImage: goodsImageResult

        });



    }



    async doAdd() {

        let parts = this.ctx.multipart({
            autoFields: true
        });
        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            let fieldname = stream.fieldname; //file表单的名字

            //上传图片的目录
            let dir = await this.service.tools.getUploadFile(stream.filename);
            let target = dir.uploadDir;
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })

        }




        // console.log(Object.assign(files, parts.field));

        // 获取所有的表单数据

        let formFields = Object.assign(files, parts.field);

        // 入库
        let goodsRes = new this.ctx.model.Goods(formFields);
        let result = await goodsRes.save();

        // 插入数据到图片库
        if (result._id) {
            let goods_image_list = formFields.goods_image_list;

            for (let i = 0; i < goods_image_list.length; i++) {
                const element = goods_image_list[i];

                let goodsImageRes = new this.ctx.model.GoodsImage({
                    goods_id: result._id,
                    img_url: element
                })

                await goodsImageRes.save();
            }
        }

        // 商品的的类型

        if (result._id) {


            var attr_value_list = formFields.attr_value_list;
            var attr_id_list = formFields.attr_id_list;

            for (var i = 0; i < attr_value_list.length; i++) {
                //查询goods_type_attribute
                if (attr_value_list[i]) {
                    var goodsTypeAttributeResutl = await this.ctx.model.GoodsTypeAttribute.find({
                        "_id": attr_id_list[i]
                    })

                    let goodsAttrRes = new this.ctx.model.GoodsAttr({
                        goods_id: result._id,
                        cate_id: formFields.cate_id,
                        attribute_id: attr_id_list[i],
                        attribute_type: goodsTypeAttributeResutl[0].attr_type,
                        attribute_title: goodsTypeAttributeResutl[0].title,
                        attribute_value: attr_value_list[i]
                    });

                    await goodsAttrRes.save();
                }
            }


        }


        // let focus =new this.ctx.model.Focus(Object.assign(files,parts.field));

        // var result=await focus.save();

        await this.success('/admin/goods', '增加商品成功');

    }

    async doEdit() {
        let parts = this.ctx.multipart({
            autoFields: true
        });
        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            let fieldname = stream.fieldname; //file表单的名字

            //上传图片的目录
            let dir = await this.service.tools.getUploadFile(stream.filename);
            let target = dir.uploadDir;
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })

        }

        var formFields = Object.assign(files, parts.field);

        //修改商品的id
        var goods_id = parts.field.id;
        //修改商品信息
        await this.ctx.model.Goods.updateOne({
            "_id": goods_id
        }, formFields);

        //修改图库信息  （增加）

        var goods_image_list = formFields.goods_image_list;
        if (goods_id && goods_image_list) {
            if (typeof (goods_image_list) == 'string') {

                goods_image_list = new Array(goods_image_list);
            }

            for (var i = 0; i < goods_image_list.length; i++) {
                let goodsImageRes = new this.ctx.model.GoodsImage({
                    goods_id: goods_id,
                    img_url: goods_image_list[i]
                });

                await goodsImageRes.save();
            }
        }

        //修改商品类型数据    1、删除以前的类型数据     2、重新增加新的商品类型数据


        //1、删除以前的类型数据

        await this.ctx.model.GoodsAttr.deleteOne({
            "goods_id": goods_id
        });

        //2、重新增加新的商品类型数据

        var attr_value_list = formFields.attr_value_list;
        var attr_id_list = formFields.attr_id_list;

        if (goods_id && attr_id_list && attr_value_list) {

            //解决只有一个属性的时候存在的bug
            if (typeof (attr_id_list) == 'string') {
                attr_id_list = new Array(attr_id_list);
                attr_value_list = new Array(attr_value_list);
            }

            for (var i = 0; i < attr_value_list.length; i++) {
                //查询goods_type_attribute
                if (attr_value_list[i]) {
                    var goodsTypeAttributeResutl = await this.ctx.model.GoodsTypeAttribute.find({
                        "_id": attr_id_list[i]
                    })

                    let goodsAttrRes = new this.ctx.model.GoodsAttr({
                        goods_id: goods_id,
                        cate_id: formFields.cate_id,
                        attribute_id: attr_id_list[i],
                        attribute_type: goodsTypeAttributeResutl[0].attr_type,
                        attribute_title: goodsTypeAttributeResutl[0].title,
                        attribute_value: attr_value_list[i]
                    });

                    await goodsAttrRes.save();
                }
            }

        }

        await this.success('/admin/goods', '修改商品数据成功');

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


    // 图片上传
    async goodsUploadImage() {

        let parts = this.ctx.multipart({
            autoFields: true
        })

        let files = {}

        let stream;

        while ((stream = await parts()) != null) {
            if (!stream.filename) break;

            let fieldname = stream.fieldname; //file表单的name值

            let dir = await this.service.tools.getUploadFile(stream.filename)

            let target = dir.uploadDir;

            //创建写入流
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })
        }

        this.ctx.body = {
            link: files.file
        }
    }

    //上传相册的图片
    async goodsUploadPhoto() {
        //实现图片上传
        let parts = this.ctx.multipart({
            autoFields: true
        });
        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            let fieldname = stream.fieldname; //file表单的名字

            //上传图片的目录
            let dir = await this.service.tools.getUploadFile(stream.filename);
            let target = dir.uploadDir;
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })

            //生成缩略图
            this.service.tools.jimpImg(target);

        }


        //图片的地址转化成 {link: 'path/to/image.jpg'} 

        this.ctx.body = {
            link: files.file
        };


    }
}

module.exports = GoodsController;