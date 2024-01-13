const express=require("express")
const router=express.Router()
const userControler=require("../controller/userController")

const tryCatchMiddleware=require("../middleware/trycatch")
const verifyToken=require("../middleware/userAuth")

router

.post("/register",tryCatchMiddleware(userControler.userRegister))
.post("/userlogin",tryCatchMiddleware(userControler.userLogin))
.use(verifyToken)
.get("/viewProduct",tryCatchMiddleware(userControler.viewProduct))
.get("/products/:id",tryCatchMiddleware(userControler.productById))
.post("/addCart/:id",tryCatchMiddleware(userControler.addToCart))
 .get("/viewCart/:id",tryCatchMiddleware(userControler.viewCartProduct))
 .post("/addtowishlist/:id",tryCatchMiddleware(userControler.addwishlist))
 .get("/showwishlist/:id",tryCatchMiddleware(userControler.showWishList))
 .delete("/deletewishlist/:id",tryCatchMiddleware(userControler.delete))
 .post("/:id/payment",tryCatchMiddleware(userControler.payment))
 .get("/payment/success",tryCatchMiddleware(userControler.success))
module.exports=router      