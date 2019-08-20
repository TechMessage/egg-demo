'use strict';

// https://www.npmjs.com/package/svg-captcha

var svgCaptcha = require('svg-captcha'); //引入验证

var md5To = require('md5');

const sd = require('silly-datetime');

const mkdrip = require('mz-modules/mkdirp'); //创建目录

const path = require('path')

const Service = require('egg').Service;

class ToolsService extends Service {

  //生成验证码
  async captcha() {
    var captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 32,
      background: "#cc9966"
    });

    this.ctx.session.code = captcha.text; /*验证码的信息*/

    return captcha;
  }
  async md5(str) {

    return md5To(str);
  }
  async getTime() {

    var d = new Date();

    return d.getTime();

  }

  //根据上传的图片生成新的文件名
  async getUploadFile(filename) {

    let dirName = sd.format(new Date(), 'YYYYMMDD'); // 文件目录按照日期建立文件夹

    let dir = path.join(this.config.uploadDir, dirName);

    //创建目录
    await mkdrip(path.join(this.config.uploadDir, dirName));

    //返回保存图片的全路径

    let upload = path.join(dir, `${await this.getTime()}${path.extname(filename)}`); // 目录 + 毫秒数 + 文件扩展名

    return {
      uploadDir: upload,
      saveDir: upload.slice(3), // /public/admin/  可以直接在前端img src显示
    }
  }

  

  // 获取当前时间的毫秒数
  async getTime() {
    return new Date().getTime();
  }

}

module.exports = ToolsService;