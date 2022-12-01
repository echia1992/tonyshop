const {DataTypes} = require('sequelize');
const db = require ('../db');

const productVariant = db.define('productVariant',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
    },
    slug:{
        type:DataTypes.TEXT,
        allowNull: false
    }
});
module.exports = productVariant;