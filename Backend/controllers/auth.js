const express = require('express');
const createError = require('http-errors')

const isAuth = (req,res,next)=>{
    if (typeof req.User === 'undefined' || req.User == null){
        return next(createError(401,'You are not Authenticated'));
    }
}
module.exports.isAuth = isAuth;

exports.hasPermission = (perm,req)=>{
    if (typeof req.User === 'undefined' || req.User == null){
        return false
    }
    let userPerm = req.User.Role.permissions.split(',');
    if (!userPerm.includes(perm) && !userPerm.includes('access-all')){
        return false;
    }
    return true;
}