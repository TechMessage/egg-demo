# egg 项目初始化


### 脚手架搭建项目






### mongodb配置

1. mongodb 的安装和配置，权限控制







2. mongodb 的数据导入导出

```
//导出 -o 导出的目录
mongodump -h 127.0.0.1 -u eggadmin -p 123456 -d eggcms -o ./a



//导入  -d 数据库名 ./eggxiaomi/ 数据文件的目录
mongorestore -h 127.0.0.1 -u eggadmin -p 123456 -d eggcms ./eggxiaomi/


```



