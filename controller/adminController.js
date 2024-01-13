const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const Users=require("../modles/UsersSchema");
const UsersSchema = require("../modles/UsersSchema");
const {joiPoductSchema}=require("../modles/validationSchema")
const products=require("../modles/ProductSchema")

module.exports=     {
    login:async(req,res)=>{
        const {email,password}=req.body;
        // console.log(process.env.ADMIN_EMAIL);
        if(
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        ){
            const token=jwt.sign(
                {email:email},
                process.env.ADMIN_ACCESS_TOKEN_SECRET      
            );

            return res.status(200).send({
                status:"success",
                message:"Admin registaration succesful",
                data:token

            });

    
        }else {
      return res.status(404).json({
        status:"error",
        message:"this is not an admin"
      });
 
        }

        },

        //to find all user

allUser:async(req,res)=>{ 
    const allUser=await UsersSchema.find();
   
    if(allUser.length ===0){
        return res.status(404).json({
            status:"error",
            message:"User not found"
        })
    }
    res.status(200).json({
        status:"succesfully",
        message:"sucessfully feched user data",   
        data:allUser,
    })
},

//specific user

useById:async(req,res)=>{
const userId=req.params.id;
const user=await Users.findById(userId);

if(!user){
    return res.status(404).json({
        status:"error",
        message:"Users not found"
    });
}

res.status(200).send({
    status:"Succes",
    message:"Succesfully find user",
    data:user,
});

},

// to create product

creatProduct:async(req,res)=>{
    const {value,error}=joiPoductSchema.validate(req.body);
   
    const {title,description,price,image,category}=value;
    console.log(value); 
    if(error){
        return res.status(400).json({error:error.details[0].message});

    }else{
        await products.create({
            title,
            description,
            price,
            image,
            category,
        });

        res.status(201).json({
  
            status:"success",
            message:"Succesfully Created products",
            data:products,
        });
    }
},
 
//view all product by category

allProduct:async(req,res)=>{
    console.log('....')
    const prods=await products.find()
    console.log(prods)
    if(!prods){
        return(
            res.status(404),
            send({
                status:"error",
                message:"products not found",
            })
        );
    }
    res.status(200).json({
        status:"success",
        message:"succesfully fetched the products details",
        data:prods,
    })
},
productById:async(req,res)=>{
    const productId=req.params.id;
    const product=await products.findById(productId)
    if(!product){ 
        return res.status(404).send({
            status:'error',
            message:"product not found"
        });b 
    }
    res.status(200).json({
        status:"success",
        message:"Succesfully fetched product details",
        data:product
    });
},

deleteProduct:async(req,res)=>{
    const {productId}=req.body
    if(!productId||!mongoose.Types.ObjectId.isValid(productId)){
        return res.status(400).json({
            status:'failure',
            message:"invalid product id provided"
        });
    }

    const deletedProduct=await products.findOneAndDelete({_id:productId});

    if(!deletedProduct){
        return res.status(404).json({
            status:"failure",
            message:'product not found in the database'

        });
    }
    return res.status(200).json({
        status:"success",
        message:"deleted succesfully"
    })


},

updateProduct:async(req,res)=>{
    const {value,error}=joiPoductSchema.validate(req.body);

    if(error){
        return res.status(401).send({message:error.details[0].message})
    }

    const {id,title,description,price,image,category}=value;
    const product=await products.find();

    if(!product){
        return res
        .send(404)
        .json({status:"failed",
    message:"product not found in database"})
    }
    await products.findByIdAndUpdate(
        {_id:id},
        {title,
        description,
        price,
        image,
         category}
        );
        res.status(200).json({
            status:"Success",
            message:"product updated succesfully"
        });
}








}