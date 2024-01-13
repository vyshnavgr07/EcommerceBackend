
const bcrypt=require("bcrypt");
const User=require("../modles/UsersSchema");
const { joiUserSchema } = require("../modles/validationSchema");
const jwt=require("jsonwebtoken")
const products=require("../modles/ProductSchema");
const { default: mongoose } = require("mongoose");
console.log(products);
const stripe=require("stripe")(process.env.stripe_secret);
console.log(process.env.stripe_secret,"envvv");
let sValue=[];

module.exports={
       
    userRegister:async(req,res)=>{
        const {value,error}=joiUserSchema.validate(req.body);
        const {name,email,username,password}=value;
        const hasedPassword=await bcrypt.hash(password,10)
        if(error){
            res.status(400).json({
                status:'Error',
                message:'Invalid user input.plese check data'
            });
        }
        await User.create({
            name:name,
            email:email,
            username:username,
            password:hasedPassword,
        });

        res.status(201).json({
            status:"status",
            message:"User registration Succesfull"
        });

    },

    userLogin:async(req,res)=>{
        const {value,error}=joiUserSchema.validate(req.body);
      
        if(error){
            res.json(error.message);
        } 

        const {username,password}=value;
        const user=await User.findOne({
            username:username,
        });   
        if(!user){  
            return res.status(404).json({
                status:"error",
                message:"User not found"
            }); 
        }    

        if(!password ||!user.password){
            return res 
            .status(400)
            .json({status:"error",message:"Invalid input"});

        }

        const passwordMatch=await bcrypt.compare(password,user.password);
        if(!passwordMatch){
            return res
            .status(401)
            .json({error:"error",message:"incorrect password"});
        }

        const token=jwt.sign(
            {username:user.username},
            process.env.USER_ACCES_TOKEN_SECRET,
            {
                expiresIn:86400,
            }
        );
 
        res
        .status(200)
        .json({status:"success",message:"Login Succesfull",Token:token})
        
  
         },


         //user view all products

      viewProduct: async(req,res)=>{
        const product=await products.find();
        if(!product){
            res.status(404).send({status:"error",message:"product not found"});
        }
        res.status(200).send({
            status:"success",
            message:"succesfully fetched data",
            data:product 
        });

       },

       //specific products

       productById:async(req,res)=>{
        const productId=req.params.id;
        const prod=await products.findById(productId);
        if(!prod){
            return res.status(404).json({
                status:'error',
                message:"product not found"
            });
        }
        res.status(200).json({
            status:"success",
            data:prod
        })
       },
 
       //add to cart 
       addToCart:async(req,res)=>{
        const userId=req.params.id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).send({
                status:"failed",
                message:"user not found",
            });
        }
         
        const {productId}=req.body;

        if(!productId){
            return res.status(404).send({
                status:"failed",
                message:"product not found "
            });
        }

        await User.updateOne({_id:userId},{$addToSet:{cart:productId}});
        res.status(200).send({
            status:"success",
            message:"succesfully product was added to cart",
            
        });


       },
       // cart view
      viewCartProduct:async(req,res)=>{
        const userId=req.params.id;
        const user=await User.findById(userId);

        if(!user){
            return res
            .status(404).json({
                status:"failed",
                message:"user not found"
            })
        }
        const cartProductsId=user.cart;

        if(cartProductsId.length === 0){ 
            return res.status(200).json({
                status:"success",
                message:"cart is empty",
                data:[]
            })
        }
        
        const cartProducts=await products.find({_id:{$in:cartProductsId}});
        res.status(200).json({
            status:"success",
            message:"Cart products fetched succesfully",
            data:cartProducts,
        });

},


//add to wishlist
addwishlist:async(req,res)=>{
    const userId=req.params.id;
     if(!userId){
        return res.status(404).json({
            status:"failure",
            message:"User Not Found!"
        })
     }

     const {productId}=req.body;
     const user= await User.findById(userId);

    //  console.log(prod,"this is prod");

    if (!user){ 
        return res.status(404).json({
            status:"failure",  
            message:"no product found"
        })
    }

    const findprod = await User.findOne({ _id: userId, wishlist: productId });
    // console.log(findprod,"this is the product");  
    if (findprod) {
        return res.status(404).json({
            status: "failure",
            message: "Product already in wishlist"
        });
    } 
    
    const updateResult = await User.updateOne({ _id: userId }, { $push: { wishlist: productId } });
    console.log(updateResult,'xdf')

    
        // Check if the update was successful
        return res.status(201).json({
            status: "success",
            message: "Product successfully added to wishlist",
            data: updateResult
        });
    
},

showWishList:async(req,res)=>{
    const userId=req.params.id;
    const user=await User.findById(userId);
    if(!user){
        return res
        .status(404)
        .json({status:'failed',
    message:"user not found"})
    }

    const wishProdId=user.wishlist;
    if(wishProdId.length===0){
        return res.status(200).json({
            status:"success",
            message:"user wishlist is empty",data:[]
        })
    }

    const wishProducts=await products.find({_id:{$in:wishProdId}});
    res.status(200).json({
        status:"Success",
        message:"Wishlist product fetched succesfully",
        data:wishProducts
    });
},

delete:async(req,res)=>{
    const userId=req.params.id;
    const {productId}=req.body;
    if(!productId){
        return res.status(400).json({
            message:"product not found"
        });
    }

    const user=await User.findById(userId);
    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }

    await User.updateOne({_id:userId},{$pull:{wishlist:productId}});
    res.status(200).json({message:"Succesfully removed from wishlist"})
},



payment:async(req,res)=>{
    const userId=req.params.id;
    const user = await User.findOne({ _id: userId }).populate("cart");
    // console.log("uuu",user)
    if(!user){
        return res.status(404).json({
            message:"User Not found"  
        });
    }

    const cartProducts=user.cart  
    // console.log("cart",cartProducts,);
    if(cartProducts.length===0){
        return res.status(200).json({"status":"success",message:"Cart is empty",data:[]})
    }
 
    const lineItems=cartProducts.map((item)=>{
        return{ 
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.title,
                    description:item.description
                },
                unit_amount:Math.round(item.price*100),
            },
            quantity:1,
        };
    });
    // console.log('iii',lineItems)

        session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `http://https://www.youtube.com/watch?v=1r-F3FIONl8&t=267s`, 

      });

    // console.log("sessionnn",session)
    if(!session){ 
        return res.json({
            status:"Failure",
            message:"Error occured on session side",
        });
    }
    sValue={
        userId,
        user,
        session,
    };  
    // console.log('svalueee',sValue) 
    
    res.status(200).json({
        status: "Success",
        message: "Strip payment session created",
        url: session.url,
      });
},


 success:async(req,res)=>{
        const {id,user,session}=sValue;
        // console.log(sValue)

        const userId=user._id;
        const cartItems=user.cart;
        // console.log(cartItems)

        const orders = await order.create({
            userId: id,
            products: cartItems.map(
              (value) => new mongoose.Types.ObjectId(value._id)
            ),
            order_id: session.id,
            payment_id: `demo ${Date.now()}`,
            total_amount: session.amount_total / 100,
          });
        console.log('ordderr',orders)
        if (!orders) {
            return res.json({ message: "error occured while inputing to orderDB" });
          }

          const userUpdate=await User.updateOne(
            {_id:userId},
            {$push:{orders:orderId},
            $set:{cart:[]},
        },
        {new:true}
          );

          if(userUpdate){
            res.status(200).json({
                status:"Success",
                message:"Failed to update user data.",
            });
          }
    }

    

         


}
