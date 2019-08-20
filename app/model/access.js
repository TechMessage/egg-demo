module.exports = app => {


    const mongoose = app.mongoose;

    const Schema = mongoose.Schema;

    const AccessScheam = new Schema({
        module_name: { //模块名
            type: String
        },
        action_name: { //操作名 
            type: String
        },
        type: { // 节点类型 1 模块 2 菜单 3 操作
            type: Number
        },

        url: {
            type: String
        },

        module_id: {
            type: Schema.Types.Mixed //混合类型
        },

        sort: {
            type: Number,
            default: 100
        },
        description: {
            type: String
        },
        status: {
            type: Number
        },
        add_time: {
            type: Number,
            default: new Date().getTime()
        }

    })

    return mongoose.model('Access', AccessScheam, 'access')

}