const Router = require('express').Router();

const routes = [
    'auth',
    'user',
    'candidat',
    'sectors-jobs',
    'client'
]

module.exports = {
    init: () => {
        routes.forEach((route) => {
            const Defination = require(`./routes/${route}`);
            Router.use(Defination.basePath, Defination.router);
        });
        return Router;
    }
}