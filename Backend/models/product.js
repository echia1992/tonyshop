const express = require('express');
const db = require('../db');
const {DataTypes} = require("sequelize");

const product = db.define('Product',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
    },
    categoryId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    variantId:{
        type:DataTypes.INTEGER,
    },
    title:{
        type:DataTypes.STRING,
        allowNull: false
    },
    description:{
        type:DataTypes.TEXT,
    },
    slug:{
        type:DataTypes.STRING,
    },
    price:{
        type:DataTypes.DOUBLE,
        allowNull:false
    },

    imageUrl:{
        type:DataTypes.TEXT
    }
})
module.exports = product;