const express=require("express")
const router=express.Router()
const admin=require("../controller/adminController")
const verifyToken=require("../middleware/adminAuthMiddleware")

const tryCatchMiddleware=require("../middleware/trycatch")
const imageUpload = require("../middleware/imageUpload/imageUpload")
const adminController = require("../controller/adminController")

router 
 
.post("/login",tryCatchMiddleware(admin.login))

.use(verifyToken) 

.get("/users",tryCatchMiddleware(admin.allUser))
.get("/users/:id",tryCatchMiddleware(admin.useById))
.post("/products",imageUpload,tryCatchMiddleware(admin.creatProduct))
.get("/allproduct", tryCatchMiddleware(admin.allProduct) )
.delete("/deleteproducts",tryCatchMiddleware(admin.deleteProduct))
.get("/productbyid/:id",tryCatchMiddleware(adminController.productById))
.put("/products",tryCatchMiddleware(admin.updateProduct))
 




module.exports=router