module.exports = {
    adminPermissions:'access-all',
    editorPermissions:'create:products,edit:products,get:products,delete:products,update:order-status,get:category,get:variants,upload-image,get:orders',
    vendorPermissions:'create:products,edit:products,get:products,get:orders',
    customerPermissions:'get:products,add-to-cart,create:orders,get:orders',
    orderStatus: {
        0: 'Pending',
        1: 'Paid',
        2: 'Processing',
        3: 'delivered'
    }
}