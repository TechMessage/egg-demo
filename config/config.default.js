'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1534304805936_5738';

  config.session = {
    key: 'SESSION_ID',
    maxAge: 1000 * 60 * 60 * 12,
    httpOnly: true,
    encrypt: true,
    renew: true //  延长会话有效期       
  }


  // add your config here
  config.middleware = ['adminauth'];

  config.adminauth = {
    match: '/admin',
  }


  //多模板引擎配置
  config.view = {
    mapping: {
      '.html': 'ejs',

      '.nj': 'nunjucks'
    },
  };

  //配置mongose连接mongodb数据库

  exports.mongoose = {
    client: {
      url: 'mongodb://eggadmin:123456@127.0.0.1:27017/eggcms',
      options: {},
    }
  };


  // 配置上传文件 根目录
  config.uploadDir = 'app/public/admin/upload';


  //配置表单最大数量
  config.multipart = {
    fields: '50'
  };

  config.security = {
    csrf: { 
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => {
        if (ctx.request.url == '/admin/goods/goodsUploadImage' || ctx.request.url == '/admin/goods/goodsUploadPhoto') {
          return true;
        }
        return false;
      }
    }
  }


  return config;
};