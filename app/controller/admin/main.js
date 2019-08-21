'use strict';

const Controller = require('./base');

class MainController extends Controller {
    async index() {
        await this.ctx.render('admin/main/index')
    }

    async welcome() {
        await this.ctx.render('admin/main/welcome');
    }
}

module.exports = MainController;