'use strict';

const Controller = require('./base');

class GoodsController extends Controller {
    async index() {

        await this.ctx.render('admin/goods/index');
    }

    async add() {

        await this.ctx.render('admin/goods/add');

    }
}

module.exports = GoodsController;