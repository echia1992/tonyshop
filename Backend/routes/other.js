const express = require("express")
const router = express.Router()
const multer = require('multer')
const path = require('path')
const createError = require('http-errors')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const authController = require('../controllers/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!authController.hasPermission('upload-image',req)){
            return
        }
        cb(null,path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        if(!authController.hasPermission('upload-image',req)){
            return;
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix+'-'+file.originalname);
    }
})
const upload = multer({ storage: storage });

router.put('/upload',upload.single('upload'),async(req,res,next)=>{
    try {
        if (!authController.hasPermission('upload-image',req)) {
            return next(401,'You are not allow to access this page');
            if (typeof req.file === 'undefined') {
                return next(createError(400,'no file uploaded'));
            }
        }
        res.status(201).json({
            status: 201,
            message: 'File uploaded successfully',
            path: 'uploads/'+req.file.filename
        });
    }catch (err){
        next(createError(err.statusCode || 500,err.message));
    }
})
router.get('/verify-payment/:ref',async(req,res,next)=>{
    try{
        if(typeof req.User === 'undefined'){
            return next(createError(403,'You are not authorized to access this resource'));
        }
        fetch('https://api.paystack.co/transaction/verify/'+req.params.ref,{
            headers: {
                Authorization: 'Bearer '+process.env.PAYSTACK_SECRET_KEY
            },
            port: 443,
        }).then(response=>{
            return response.json();
        }).then(data=>{
            if(typeof data.data === 'undefined'){
                return next(createError(400,data.message));
            }
            if(data.data.status === 'failed'){
                return next(createError(400,data.gateway_response));
            }
            if(data.data.status === 'success'){
                return res.status(200).json({
                    status: 200,
                    message: 'Transaction reference fetched successfully',
                    reference: data
                });
            }
            return next(createError(422,'Not processable'))
        }).catch(err=>{
            return next(500,err.message)
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
})
module.exports = router;