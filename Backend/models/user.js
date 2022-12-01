/** @format */

const { DataTypes } = require("sequelize");
const db = require("../db");

const user = db.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    validator: {
      isShort(value) {
        if (value.length > 5) {
          throw new Error("User is too Short");
        }
      }
    }
  },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: "Email not valid"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
gender:{
      type:DataTypes.STRING,
  defaultValue: 'male',
  validate:{
        isEmpty(value){
          if (value === 'undefined' || value == null){
            throw new Error('Gender can not be empty')
          }
        },
    isGenderValid(value){
          let arr = ['male','female'];
          if (!arr.includes(value)){
            throw new Error('gender is not valid')
          }
    }
  }
},
  imageUrl:{
    type:DataTypes.TEXT
  },
roleId:{
    type:DataTypes.INTEGER,
  validate:{
      isEmpty(value) {
        if (typeof value === 'undefined' || value == null){
          throw  new Error('Please select role');
        }
      }
  }
}
});

module.exports = user;
