const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


router.post('/register',async(req,res)=>{
    try{
        const {username,email,password,profilePic}=req.body
        try{
            const salt=await bcrypt.genSalt(10)
            const hashedPass=await bcrypt.hashSync(password,salt)
            const user=new User({username,email,password:hashedPass,profilePic})
            await user.save()
            res.status(200).json(user)
            
    
        }
        catch(err){
            res.status(500).json(err)
        }

    }
    catch(err){
        console.log(err)
    }
})


router.post('/login',async(req,res)=>{
    try{
       const user=await User.findOne({email:req.body.email})
       !user && res.status(500).json("no user found!")

       const validated=await bcrypt.compare(req.body.password,user.password)

       if(!validated){
        res.status(500).json("no user found!")
       }
       else{
        const accessToken=jwt.sign({id:user._id},process.env.token,{expiresIn:"15d"})
        
        
        const {password,...others}=user._doc
        res.status(200).json({...others,accessToken})
    
       }
       

    }
    catch(err){
       res.status(500).json(err)
    }
})
router.get("/logout",(req,res)=>{
    res.clearCookie('accessToken',{path:"/"})
    res.status(200).json("user logged out!")
})
module.exports=router