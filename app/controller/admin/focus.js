'use strict';

const path = require('path')
const fs = require('fs')

const pump = require('mz-modules/pump');


const Controller = require('./base');

class FocusController extends Controller {
    async index() {

        //查库
        let results = await this.ctx.model.Focus.find();

        await this.ctx.render('admin/focus/index', {
            list: results
        })
    }

    async add() {
        await this.ctx.render('admin/focus/add');
    }


    async doAdd() {

        let parts = this.ctx.multipart({
            autoFields: true
        });

        let files = {};
        let stream;

        while ((stream = await parts()) != null) {
            console.log('图片上传1')
            if (!stream.filename) {
                break;
            }

            console.log('图片上传1-1')

            let fieldname = stream.fieldname; //表单中file的name

            //上传图片目录
            let dir = await this.service.tools.getUploadFile(stream.filename);

            let target = dir.uploadDir;

            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })
            console.log('图片上传2', files)
        }

        let focus = new this.ctx.model.Focus(Object.assign(files, parts.field))
        console.log(Object.assign(files, parts.field))
        await focus.save()

        await this.success('/admin/focus', '轮播图添加成功')

    }



    //   单个文件上传
    async doSingleUpload() {
        const stream = await this.ctx.getFileStream();
        const target = 'app/public/admin/upload/' + path.basename(stream.filename);
        const writeStream = fs.createWriteStream(target);
        await pump(stream, writeStream);
        this.ctx.body = {
            url: target,
            fields: stream.fields
        }
    }


    async multi() {
        await this.ctx.render('admin/focus/multi')
    }


    // 处理多个文件上传
    async doMultiUpload() {
        console.log('多文件上传')
        const parts = this.ctx.multipart({
            autoFields: true
        })

        const files = [];

        let stream;

        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                return;
            }
            const fieldname = stream.fieldname;

            const target = 'app/public/admin/upload/' + path.basename(stream.filename);

            const writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files.push({
                [fieldname]: target
            })
        }

        this.ctx.body = {
            files: files,
            fields: parts.field
        }

    }
}

module.exports = FocusController;