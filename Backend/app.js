/** @format */
const http = require("http");
const express = require("express");
const db = require("./db");
const jwt = require('jsonwebtoken');
const useragent = require('express-useragent');
const constant = require('./utils/constant');
const cors = require('cors');


const app = express();

const User = require("./models/user");
const Role = require('./models/role');
const Session = require('./models/session');
const ini_asso = require('./models/init_asso');

ini_asso();

app.use(cors());
app.use(express.json());
app.use(useragent.express());




const authRoute = require('./routes/auth')
const productRoute = require('./routes/product')
const orderRoute= require('./routes/order')
const otherRoute= require('./routes/other')
const { resolve4 } = require('dns');
//const bcrypt = require("bcryptjs");

app.use(async (req,res,next)=>{
  let token = req.header('Authorization');
  if (typeof token === 'undefined' || token == null){
      next();
      return
  }
  let jwtSecret = 'Anthony secret key';
  let data;
  jwt.verify(token, jwtSecret, (err, decoded)=>{
    if(err){
      next();
      return;
    }
    data = decoded;
  });
  if (typeof data === 'undefined' ){
    return next();
  }
  let session = await Session.findOne({
    where:{
      userId: data.userId,
      validator: data.validator
    },
    include: [{
      model: User,
      include: [Role]
    }]
  });
  if (session == null){
    next();
    return;
  }
  let expiresIn = new Date(session.expiresIn).getTime();
  if(expiresIn < Date.now()){
    await session.destroy();
    next();
    return;
  }
  req.User = session.User;
  next();
});


app.use(express.static('public'))
app.use(authRoute);
app.use(productRoute);
app.use(orderRoute);
app.use(otherRoute);

app.use((err,req,res,next)=>{
  let statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
  })
});

const server = http.createServer(app);
//http://localhost:5000
db.sync({

 //force:true
}).then(async result=>{
  try {
    let [admin, createdAdmin] = await Role.findOrCreate({
      where: {
        name: 'Admin'
      },
      defaults: {
        permissions: constant.adminPermissions
      }
    });
    if (!createdAdmin) {
      await admin.update({
        permissions: constant.adminPermissions
      });
    }
    let [customer, createdCustomer] = await Role.findOrCreate({
      where: {
        name: 'Customer'
      },
      defaults: {
        permissions: constant.customerPermissions
      }
    });
    let [vendor, createdVendor] = await Role.findOrCreate({
      where: {
        name: 'Vendor'
      },
      defaults: {
        permissions: constant.vendorPermissions
      }
    });
    let [editor, createdEditor] = await Role.findOrCreate({
      where: {
        name: 'Editor'
      },
      defaults: {
        permissions: constant.editorPermissions
      }
    });
    let bcrypt = require('bcryptjs');
    let [user, createdUser] = await User.findOrCreate({
      where:{
        username: 'Tony',
      },
      defaults:{
        password:  bcrypt.hashSync("12345" , bcrypt.genSaltSync(14)),
        email: 'echiaanthony@gmail.com',
        gender: 'male',
        roleId: admin.id
      }
   });
    server.listen(5000);
    //console.log(server);
  }catch(err){
    console.log(err);
  }
}).catch(err=>{
  console.log(err);
});