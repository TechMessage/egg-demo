/**
 * 轮播图数据
 */

module.exports = app => {


    const mongoose = app.mongoose;

    const Schema = mongoose.Schema;


    const Focus = new Schema({
        title: {
            type: String
        },
        type: {
            type: Number
        },
        focus_img: {
            type: String
        },
        link: {
            type: String
        },
        sort: {
            type: Number
        },
        status: {
            type: Number,
            default: 1
        },
        add_time: {
            type: Number,
            default: new Date().getTime()
        }

    })

    return mongoose.model('Focus', Focus, 'focus');

}