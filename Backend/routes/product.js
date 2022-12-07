const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const productCategory =  require('../models/product-category');
const productVariant =  require('../models/product-variant');
const Product =  require('../models/product');
const Cart = require('../models/cart');
const authController = require('../controllers/auth');
const e = require("express");


router.put('/product/category', async(req,res,next)=>{
   try {
       if (!authController.hasPermission('created:category',req)){
           return next(createError(401,'you are not Authorized please contact your admin'));
  }
       let data = req.body
       if (typeof data.name === 'undefined' || typeof data.name == null || data.name.trim() === ''){
           return next(createError(402,'Please enter a category name'));

       }
       let slug = require('crypto').randomBytes(15).toString("hex");
       let [category, created] = await productCategory.findOrCreate({
           where:{
               name: data.name
           },
           defaults:{
               slug: slug
           },
       });
       if (!created){
           return res.status(200).json({
               status:200,
               message:'Category already existed',
               category:category
           });
       }else {
           return res.status(201).json({
               status:201,
               message:'category created successfully',
               category: category
           })
       }
   }catch (err){
       next(createError(err.statusCode || 500,err.message));
   }
});
router.post('/category/:slug',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('edit:category',req)){
            return next(createError(403,'you are not Authorized please contact your admin'));
        }
        let data = req.body;
        if(typeof data.name === 'undefined' || data.name == null || data.name.trim() === ''){
            return next(createError(400,'Please enter a category name'));

        }
        let category = await productCategory.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if(category == null){
            return next(createError(404,'Category could not be found'));
        }
        await category.update({
            name: data.name
        });
        return res.status(200).json({
            status: 200,
            message: 'Category updated successfully',
            category: category
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
})
router.get('/category',async (req,res,next)=>{
    try{
        let category = await productCategory.findAll({
            order: [
                ['id','DESC']
            ],
            include: typeof req.query.fetchProdct !== 'undefined' ? Product : undefined
        });
        return res.status(200).json({
            status: 200,
            message: 'Category fetched successfully',
            category: category
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.get('/category/group',async (req,res,next)=>{

    try{
        let category = await productCategory.findAll({
            order: [
                ['id','DESC']
            ],
            include: typeof req.query.fetchProduct !== 'undefined' ? Product : undefined
        });

        return res.status(200).json({
            status: 200,
            message: 'Category fetched successfully',
            category: category
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.delete('/category/:slug',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('delete:category',req)){
            return next(createError(403,'You are not authorized to access this resource'));
        }
        let category = await productCategory.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if(category == null){
            return next(createError(404,'Category could not be found'));
        }
        await category.destroy();
        return res.status(200).json({
            status: 200,
            message: 'Category deleted successfully'
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.put('/product',async (req,res,next)=>{
    try {
        if (!authController.hasPermission('created:',req)) {
            return next(createError(401,'you are not Authorized please contact your admin'));
        }
        let data = req.body
        if (typeof data.title === 'undefined' || data.title == null || data.title.trim() ===''){
            return next(createError(402,'Please enter a Product title'));
        }
        if (typeof data.description === 'undefined' || data.description == null || data.description.trim() ===''){
            return next(createError(402,'Please add a valid description'));
        }
        if (typeof data.price === 'undefined' || data.price == null || +data.price <= 0  ){
            return next(createError(402,'Please enter a Product price'));

        }
        if (typeof data.category === 'undefined' || data.category == null || +data.category <= 0){
            return next(createError(402,'Please add a valid category'));
        }
        if (typeof data.variant === 'undefined' || data.variant == null || +data.variant <= 0){
            return next(createError(401,'Please add a valid variant'));
        }
        let category = await productCategory.findOne({
            where:{
                id: data.category
            }
        });
        if (category == null){
            return next(createError(401,'you are not Authorized please contact your admin'));
            return res.status(404).json({
                status: 404,
                message: 'Product category does not exist'
            });
        }
        let variant = await productVariant.findOne({
            where:{
                id: data.variant
            }
        });

        if (variant == null){
            return next(createError(401,'you are not Authorized please contact your admin'));
            return res.status(404).json({
                status: 404,
                message: 'Product variant does not exist'
            });
        }
        let product = await Product.create({
            title: data.title,
            description: data.description,
            slug: require('crypto').randomBytes(20).toString('hex'),
            price: data.price,
            categoryId: data.category,
            variantId:data.variant,
            imageUrl: data.imageUrl,
            userId: req.User.id
        });
        return res.status(201).json({
            status: 201,
            message: 'Product created successfully',
            product: product
        });
    }catch (err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.post('/product/:slug',async (req,res,next)=>{
    try {
        if (!authController.hasPermission('edit:',req)) {
            return next(createError(401,'you are not Authorized please contact your admin'));
        }
        let product = await Product.findOne({
            where:{
                slug : req.params.slug
            }
        });
        if (product == null){
            return next(createError(404,'Product does not exist'));
        }
        if ((product.userId !== req.User.id ) && !authController.hasPermission('access-all')){
            return next(createError(403,'You are not authorized to edit this '));
        }
        let data = req.body
        if (typeof data.title === 'undefined' || data.title == null || data.title.trim() ===''){
            return res.status(402).json({
                status:402,
                message:'Please enter a Product title'
            });
        }
        if (typeof data.description === 'undefined' || data.description == null || data.description.trim() ===''){
            return next(createError(402,'Please add a valid description'));

        }
        if (typeof data.price === 'undefined' || data.price == null || +data.price <= 0  ){
            return next(createError(402,'Please enter a Product price'));
        }
        if (typeof data.category === 'undefined' || data.category == null || +data.category <= 0){
            return next(createError(402,'Please add a valid category'));
        }
        if (typeof data.variant === 'undefined' || data.variant == null || +data.variant <= 0){
            return next(createError(402,'Please add a valid variant'));
        }
        let category = await productCategory.findOne({
            where:{
                id: data.category
            }
        });
        let variant = await productVariant.findOne({
            where:{
                id: data.variant
            }
        });
        if (category == null){
            return next(createError(404,'Product category does not exist'));
        }
        if (variant == null){
            return next(createError(404,'Product variant does not exist'));
        }
         await Product.update({
            title: data.title,
            description: data.description,
            price: data.price,
            categoryId: data.category,
            imageUrl: data.imageUrl,
            variantId:data.variant
        });
        return res.status(201).json({
            status: 201,
            message: 'Product updated successfully',
            product: product
        });
    }catch (err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.get('/products',async (req,res,next)=>{
    try {
            let products = await Product.findAll({
                order: [
                    ['updatedAt','DESC']
                ]
            });
            return res.status(200).json({
                status: 200,
                message: 'Product fetched successfully',
                products: products
            });
        }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.delete('/product/:slug',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('delete:',req)){
            return next(createError(403,'You are not authorized to access this resource'));
        }
        let product = await Product.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if(product == null){
            return next(createError(404,'Product could not be found'));
        }
        await product.destroy();
        return res.status(200).json({
            status: 200,
            message: 'Product deleted successfully'
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.put('/product/variant',async (req,res,next)=>{
    try {
        if (!authController.hasPermission('create:variant',req) ){
            return next(createError(401,'you are not Authorized please contact your admin'));
    }
        let data = req.body
        if (typeof data.name === 'undefined' || typeof data.name == null || data.name.trim() === ''){
           return next(createError(402,'Please enter a Size name'));
        }
        let slug = require('crypto').randomBytes(15).toString("hex");
        let [variant, created] = await productVariant.findOrCreate({
            where:{
                name: data.name
            },
            defaults:{
                slug:slug
            }
        })
        if (!created){
            return res.status(200).json({
                status:200,
                message:'Size already existed',
                variant:variant
            });
        }else {
            return res.status(201).json({
                status:201,
                message:'Size created successfully',
                variant:variant
            })
        }
    }catch (err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.post('/variant/:slug',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('edit:variant',req)){
            return next(createError(403,'You are not authorized to access this resource'));
        }
        let data = req.body;
        if(typeof data.size === 'undefined' || data.size == null || data.size.trim() === ''){
            return next(createError(400,'Please enter a variant name'));
        }
        let variant = await productVariant.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if(variant == null){
            return next(createError(404,'Variant could not be found'));
        }
        await variant.update({
            name: data.name
        });
        return res.status(200).json({
            status: 200,
            message: 'Variant updated successfully',
            variant: variant
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
})
router.get('/variant',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('get:variants',req)){
            return next(createError(401,'You are not authorized to access this resource'));
        }
        let variant = await productVariant.findAll({
            order: [
                ['id','DESC']
            ]
        });

        return res.status(200).json({
            status: 200,
            message: 'Category fetched successfully',
            variant: variant
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.delete('/variant/:slug',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('delete:variant',req)){
            return next(createError(401,'You are not authorized to access this resource'));
        }
        let variant = await productVariant.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if(variant == null){
            return next(createError(404,'Variant Not found '));
        }
        await variant.destroy();
        return res.status(200).json({
            status: 200,
            message: 'Variant deleted successfully'
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.put('/product/:slug/cart',async (req,res,next)=>{
    try {
        if (!authController.hasPermission('add-to-cart',req)){
            return next(createError(401,'You need to Login'));
        }
        let product = await Product.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if (product == null){
            return next(createError(404,'Product Not found '))
        }
        let qty = +req.body.qty || 1;
        let [cart, cartCreated] = await Cart.findOrCreate({
            where:{
                productId: product.id,
                userId: req.User.id
            },
            defaults:{
                qty: qty
            }
        })
        if (!cartCreated){
            await cart.update({
                qty: cart.qty + qty
            });
        }
        return res.status(200).json({
            status:200,
            message: 'Products added to cart successfully'
        })
    }catch (err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.delete('/product/:slug/cart',async (req,res,next)=>{
    try {
        if (!authController.hasPermission('add-to-cart',req)){
            return next(createError(403,'you are not Authorized please contact your admin'));
        }
        let product = await Product.findOne({
            where:{
                slug: req.params.slug
            }
        });
        if (product == null){
            return next(createError(404,'Product Not found'))
        }
        await Cart.destroy({
            where:{
               userId: req.User.id,
                productId: product.id
            }
        });
        return res.status(200).json({
            status:200,
            message: 'Products remove from cart successfully'
        })
    }catch (err){
        next(createError(err.statusCode || 500,err.message));
    }
});
router.delete('/cart',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('add-to-cart',req)){
            return next(createError(403,'You are not authorized to access this resource'));
        }
        await Cart.destroy({
            where: {
                userId: req.User.id
            }
        });
        return res.status(200).json({
            status: 200,
            message: 'Cart cleared successfully'
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
})
router.get('/cart',async (req,res,next)=>{
    try{
        if(!authController.hasPermission('add-to-cart',req)){
            return next(createError(403,'You need to login'));
        }
        let carts = await Cart.findAll({
            where:{
                userId: req.User.id
            },
            include: [Product],
            order: [
                ['updatedAt','DESC']
            ]
        });
        return res.status(200).json({
            status: 200,
            message: 'Cart fetched successfully',
            carts: carts
        });
    }catch(err){
        next(createError(err.statusCode || 500,err.message));
    }
})

module.exports = router;