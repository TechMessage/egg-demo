var url = require('url');

module.exports = (options, app) => {
    return async function adminauth(ctx, next) {


        /*
         1、用户没有登录跳转到登录页面
         2、只有登录以后才可以访问后台管理系统
        */
        ctx.state.csrf = ctx.csrf; //全局变量

        // 上一页的地址
        ctx.state.prevPage = ctx.request.headers['referer']

        //     /admin/verify?mt=0.7466881301614958  转换成  /admin/verify

        var pathname = url.parse(ctx.request.url).pathname;


        if (ctx.session.userinfo) {
            ctx.state.userinfo = ctx.session.userinfo; //全局变量  

            //判断是否有权限访问页面
            let flag = await ctx.service.admin.checkAuth();


            if (flag) {
                //获取权限列表
                ctx.state.asideList = await ctx.service.admin.getAuthList(ctx.session.userinfo.role_id);
                await next();
            } else {
                ctx.body = "没有权限访问"
            }
        } else {

            //排除不需要做权限判断的页面  /admin/verify?mt=0.7466881301614958
            if (pathname == '/admin/login' || pathname == '/admin/doLogin' || pathname == '/admin/verify') {
                await next();
            } else {
                ctx.redirect('/admin/login');
            }
        }

    };
};