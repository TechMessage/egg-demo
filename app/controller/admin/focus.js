'use strict';

const path = require('path')
const fs = require('fs')

const pump = require('mz-modules/pump');



const Controller = require('egg').Controller;

class FocusController extends Controller {
    async index() {
        await this.ctx.render('admin/focus/index')
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