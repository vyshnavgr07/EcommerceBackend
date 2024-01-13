const jwt=require('jsonwebtoken')

module.exports=function verifyToken(req,res,next){
    const token=req.headers["authorization"]

    if(!token){
        return res.status(403).send({error:"No token provided"})
    }

    jwt.verify(token,process.env.User_ACCES_TOKEN_SECRET,(err,decode)=>{
        if(err){
            return res.status(401).json({error:"unathorization"})
        }
        req.username=decode.username
        next()

    })
}