/** @format */

const { Sequelize, DataTypes } = require("sequelize");

const db = new Sequelize("tony-shop", "echia", "echia1992", {
  host: "localhost",
  dialect: "mysql"
});
module.exports = db;

