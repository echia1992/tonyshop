const {DataTypes} = require('sequelize')
const db = require('../db')

const User = require('./user');
const Role = require('./role');
const Session = require('./session');
const Product = require('./product');
const productCategory = require('./product-category')
const productVariant = require('./product-variant')
const Order = require('./order');
const Cart = require('./cart');

module.exports = () =>{
    User.belongsTo(db.models.Role, {
        foreignKey:'roleId'
    });
    Role.hasMany(db.models.User,{
        foreignKey: 'roleId'
    });
    Session.belongsTo(db.models.User,{
        foreignKey:'userId'
    });
    Session.hasMany(db.models.Session,{
        foreignKey:'userId'
    });
    Product.belongsTo(db.models.productCategory,{
        foreignKey:'categoryId'
    });
    productCategory.hasMany(db.models.Product,{
        foreignKey:'categoryId'
    });
    productVariant.belongsTo(db.models.Product,{
        foreignKey:'variantId'
    });
    Product.hasMany(db.models.productVariant,{
        foreignKey:'variantId'
    });
    Cart.belongsTo(db.models.User,{
        foreignKey:'userId'
    });
    Cart.belongsTo(db.models.Product,{
        foreignKey:'productId'
    });
    User.hasMany(db.models.Cart,{
        foreignKey:'userId'
    });
    Order.belongsTo(db.models.User,{
        foreignKey:'userId'
    });
    User.hasMany(db.models.Order,{
        foreignKey:'userId'
    });
}
