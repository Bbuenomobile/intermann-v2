const Sequelize = require('sequelize');

const sequelize = new Sequelize("intermann", "dev", "dev@123", {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;

