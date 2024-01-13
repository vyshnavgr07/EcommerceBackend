const mongoos=require("mongoose")
// const autopopulate = require('mongoose-autopopulate')

const userSchema=new mongoos.Schema({
    name:String,
    email:String,
    username:String,
    password:String,
    // cart: [{ type:mongoos.Schema.ObjectId,ref:'Product', autopopulate: true }],
    cart: [{ type:mongoos.Schema.ObjectId,ref:'Product' }],
    wishlist:[{type:mongoos.Schema.ObjectId,ref:'Product'}]
   
})
   
// userSchema.plugin(autopopulate);  

module.exports=mongoos.model("User",userSchema) 