'use strict';

const Controller = require('./base');

const path = require('path')
const fs = require('fs')
const pump = require('mz-modules/pump')

const jimp = require('jimp')


class GoodsCateController extends Controller {

    //商品分类展示页
    async index() {

        //查询 自关联
        let result = await this.ctx.model.GoodsCate.aggregate([{
                $lookup: {
                    from: 'goods_cate',
                    localField: '_id',
                    foreignField: 'pid',
                    as: "items"
                }
            },
            {
                $match: {
                    pid: "0"
                }
            }
        ])



        // console.log(result);

        // this.ctx.body = "商品分类"
        await this.ctx.render('admin/goodsCate/index', {
            list: result
        })

    }

    // 商品分类 增加
    async add() {

        // 查询所有分类pid=0
        let result = await this.ctx.model.GoodsCate.find({
            pid: "0"
        })



        await this.ctx.render('admin/goodsCate/add', {
            cateList: result
        })

    }

    // 处理商品增加

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


            //上传图片成功以后生成缩略图
            jimp.read(target, (err, lenna) => {
                if (err) throw err;
                lenna.resize(200, 200) // resize
                    .quality(90) // set JPEG quality                  
                    .write(target + '_200x200' + path.extname(target)); // save
            });



        }


        if (parts.field.pid != 0) {
            parts.field.pid = this.app.mongoose.Types.ObjectId(parts.field.pid); //调用mongoose里面的方法把字符串转换成ObjectId      

        }

        let goodsCate = new this.ctx.model.GoodsCate(Object.assign(files, parts.field));
        await goodsCate.save();

        await this.success('/admin/goodsCate', '增加分类成功');

    }


    // 修改
    async edit() {

        var id = this.ctx.request.query.id;

        var result = await this.ctx.model.GoodsCate.find({
            "_id": id
        });

        var cateList = await this.ctx.model.GoodsCate.find({
            "pid": '0'
        });


        await this.ctx.render('admin/goodsCate/edit', {

            cateList: cateList,
            list: result[0]
        });

    }


    // 处理修改
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


            //生成缩略图
            this.service.tools.jimpImg(target);

        }


        if (parts.field.pid != 0) {
            parts.field.pid = this.app.mongoose.Types.ObjectId(parts.field.pid); //调用mongoose里面的方法把字符串转换成ObjectId      

        }

        var id = parts.field.id;
        var updateResult = Object.assign(files, parts.field);
        await this.ctx.model.GoodsCate.updateOne({
            "_id": id
        }, updateResult);
        await this.success('/admin/goodsCate', '修改分类成功');

    }
}

module.exports = GoodsCateController;