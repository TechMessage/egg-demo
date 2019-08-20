/**
 * 判断当前用户是否有访问当前路径的权限
 */

'use strict';

const Service = require('egg').Service;

class AdminService extends Service {
    async checkAuth() {

        /**
         * 1.session中获取用户信息，role_id
         * 2.查库，获取role_id对应的权限列表（包含url地址）
         * 3.判断当前请求URL是否在上述列表中
         */

        let userinfo = this.ctx.session.userinfo;

        let role_id = userinfo.role_id;

        //忽略权限判断的url地址
        let ignoreUrl = ['/admin/login', '/admin/doLogin', '/admin/verify', '/admin/loginOut']

        let path = this.ctx.request.path;

        if (ignoreUrl.includes(path) || userinfo.is_super == 1) {
            return true
        }


        let accessList = await this.ctx.model.RoleAccess.find({
            'role_id': role_id
        })


        let accessIds = accessList.map(v => v.access_id.toString())
        console.log('获取当前用户的权限列表', accessIds)

        //根据path获取对应的access_id

        let accessResult = await this.ctx.model.Access.find({
            url: path
        })




        if (accessResult.length > 0) {
            console.log('获取当前URL的权限id', accessResult[0]._id.toString())
            if (accessIds.indexOf(accessResult[0]._id.toString()) != -1) {
                return true
            }
            return false
        }
        return false;


    }

    //获取权限列表

    //获取权限列表的方法
    async getAuthList(role_id) {


        /*

         1、获取全部的权限  

         2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中

         3、循环遍历所有的权限数据     判断当前权限是否在角色权限的数组中，   如果在角色权限的数组中：选中    如果不在角色权限的数组中不选中
         
        */


        //1、获取全部的权限

        var result = await this.ctx.model.Access.aggregate([

            {
                $lookup: {
                    from: 'access',
                    localField: '_id',
                    foreignField: 'module_id',
                    as: 'items'
                }
            },
            {
                $match: {
                    "module_id": '0'
                }
            }

        ]);

        //2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中

        var accessReulst = await this.ctx.model.RoleAccess.find({
            "role_id": role_id
        });

        var roleAccessArray = [];

        accessReulst.forEach(function (value) {

            roleAccessArray.push(value.access_id.toString());
        })


        // console.log(roleAccessArray);

        // 3、循环遍历所有的权限数据     判断当前权限是否在角色权限的数组中



        for (var i = 0; i < result.length; i++) {

            if (roleAccessArray.indexOf(result[i]._id.toString()) != -1) {

                result[i].checked = true;

            }

            for (var j = 0; j < result[i].items.length; j++) {

                if (roleAccessArray.indexOf(result[i].items[j]._id.toString()) != -1) {

                    result[i].items[j].checked = true;

                }

            }

        }

        // console.log(result);
        return result;
    }

}

module.exports = AdminService;