# egg 项目初始化


### 脚手架搭建项目






### mongodb配置

1. mongodb 的安装和配置，权限控制

```
 
 //安装完毕后直接连接

 1. 创建超级管理员
    use admin

    db.createUser({
        user:'admin',
        pwd:'123456',
        roles:[
            {role:'root', db:'admin'}
        ]
    })
 
 2. 修改配置文件 mongod.conf 配置用户名密码登录
 
    security:
        authorization:enabled

 3. 重启mongodb服务
  
    brew services restart mongodb

 
 4. 用超级管理员登录
    mongo admin -u admin -p

 5. 创建数据库，并且创建一个账户，只能访问该数据库，读写数据库

    use eggcms

    db.createUser({
        user:'eggadmin',
        pwd:'123456',
        roles:[{role:'dbOwner',db:'eggcms'}]
    })

 
 // 连接数据库时url

 const url = 'mongodb://eggadmin:123456@127.0.0.1:27017/eggcms'

```






2. mongodb 的数据导入导出

```
//导出 -o 导出的目录
mongodump -h 127.0.0.1 -u eggadmin -p 123456 -d eggcms -o ./a



//导入  -d 数据库名 ./eggxiaomi/ 数据文件的目录
mongorestore -h 127.0.0.1 -u eggadmin -p 123456 -d eggcms ./eggxiaomi/


```



