const db = require('../db');
const {DataTypes} = require("sequelize");



const order = db.define('Order',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
       type:DataTypes.STRING,
       allowNull:false
    },
     userId:{
       type:DataTypes.INTEGER,
         allowNull:false
     },
    items:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    status:{
        type:DataTypes.INTEGER,
        defaultValue: 0
    },
    amount:{
        type:DataTypes.INTEGER,
        defaultValue: 0
    },
    ref:{
        type:DataTypes.TEXT,
        allowNull:false
    }
});
module.exports = order;