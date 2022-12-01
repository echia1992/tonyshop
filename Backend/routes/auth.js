const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');


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
            res.status(400).json({
                status: 400,
                message: 'password too short'
            });
            return;
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
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
});

router.post('/auth',async (req,res,next)=>{
    try {
        let data = req.body
        if (typeof data.username === 'undefined' || typeof data.password === 'undefined' ||
            typeof data.username == null || typeof data.password == null || typeof data.username.trim()== '' ||
           typeof data.password.trim() ==''){
            res.status(400).json({
                status: 400,
                message: 'Please Input required field'
            });
            return;
        }
        let user = await User.findOne({
            where: {
                username: data.username
            },
            include:[Role]
        });
        if (user == null || !bcrypt.compareSync(data.password, user.password)){
            res.status(401).json({
                status: 401,
                message: 'Username or password is not correct'
            });
            return;
        }
        let validator = require("crypto").randomBytes(10).toString("hex");
        let jwtSecret = 'Anthony secret key';
        let jwtToken = jwt.sign(
            {
                userId: user.id,
                validator: validator
            },jwtSecret);
        let session = await Session.create({
            userId: user.id,
            validator:validator,
            ipAddress:req.ip,
            userAgent: JSON.stringify(req.userAgent),
            expiresIn: new Date(Date.now() + 7200 * 1000)
        });
        res.json({
            status:200,
            message:'user Logged In successfully',
            user:user,
            token:jwtToken,
            permissions: user.Role.permissions.split(',')
        });
        console.log(user);
    }catch (err){
        res.status(500).json({
            status:500,
            message: err.message
        });
    }
});
router.get('/users', async (req,res,next)=>{
    res.status(200).json({
        status: 200,
        message: "Users fetched successfully",
        users: await User.findAll()
    });
});
router.get('/users', async (req,res,next)=>{
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
        res.status(401).json({
            status: 401,
            message: "You need to login"
        });
    }
});

module.exports =router;