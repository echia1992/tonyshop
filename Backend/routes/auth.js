const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const createError = require('http-errors')


const router = express.Router();


const User = require('../models/user')
const Role = require('../models/role')
const Session = require('../models/session')


router.put('/auth',async (req,res,next)=>{
    const data = req.body;
    try {
        if (typeof data.password === 'undefined' || data.password == null ){
            res.status(400).json({
                status: 400,
                message: 'password can not be empty'
            });

            return;
        }
        if (typeof data.password.trim().length >3){
            return next(createError(400,'password too short'));
        }

        let hashedPass = bcrypt.hashSync(data.password,bcrypt.genSaltSync(14))
        let user = await User.create({
            username:data.username,
            password:hashedPass,
            email:data.email,
            gender:data.gender,
            imageUrl:data.imageUrl,
            roleId:2
        });
        let role = await Role.findByPk(user.roleId);
        res.status(200).json({
            status:200,
            message:'User created successfully',
            user: user,
            permission: role.permissions
        })

    }catch (err){
        return next(createError(500,err.message));
    }
});

router.post('/auth',async (req,res,next)=>{
    try{
        let data = req.body;
        if(typeof data.username === 'undefined' || typeof data.password === "undefined" || data.username == null ||  data.password == null){
           return next(createError(400,'Please input required field'))
        }
        let user = await User.findOne({
            where:{
                username: data.username
            },
            include: [Role]
        });
        if(user == null || !bcrypt.compareSync(data.password, user.password)){
            return next(createError(401,'Username or password is incorrect'))
        }
        let validator = require('crypto').randomBytes(10).toString('hex');
        let jwtSecret = 'Anthony secret key';
        let jwtToken = jwt.sign({
            userId: user.id,
            validator: validator
        },jwtSecret);
        let session = await Session.create({
            userId: user.id,
            validator: validator,
            ipAddress: req.ip,
            userAgent: JSON.stringify(req.useragent),
            expiresIn: new Date(Date.now() + (7200 * 1000))
        });
        res.json({
            status: 200,
            message: 'User logged in successfully',
            user: user,
            token: jwtToken,
            permissions: user.Role.permissions.split(",")
        });
    }catch(err){

    }
});
router.get('/users', async (req,res,next)=>{
    res.status(200).json({
        status: 200,
        message: "Users fetched successfully",
        users: await User.findAll()
    });
});
router.get('/admin', async (req,res,next)=>{
    res.status(200).json({
        status: 200,
        message: "Users fetched successfully",
        users: await User.findAll()
    });
});
router.get('/auth',async(req,res,next)=>{
    if(typeof req.User !== 'undefined'){
        res.status(200).json({
            status: 200,
            message: "Users fetched successfully",
            user: req.User,
            permissions: req.User.Role.permissions.split(",")
        });
    }else{
        return next(createError(401, 'You need to Login'))
    }
});

module.exports =router;