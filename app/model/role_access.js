/**
 * 角色 权限关系 一对多
 */

module.exports = app => {

    const mongoose = app.mongoose;

    const Schema = mongoose.Schema;

    const RoleAccess = new Schema({
        access_id: {
            type: Schema.Types.ObjectId
        },

        role_id: {
            type: Schema.Types.ObjectId
        },
    })

    return mongoose.model('RoleAccess', RoleAccess, 'role_access')

}