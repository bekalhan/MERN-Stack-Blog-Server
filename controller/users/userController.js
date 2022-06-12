const User = require('../../model/user/User');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const expressAsyncHandler = require('express-async-handler');
const generateToken = require('../../config/token/generateToken')
const validateMongodbId = require('../utils/validateMongodb');
const cloudinaryUploadImg = require('../utils/cloudinary');
const crypto = require('crypto');

console.log("key : ",process.env.SEND_GRID_API_KEYS)

sgMail.setApiKey(process.env.SEND_GRID_API_KEYS);

// User register

const userRegisterCtrl = expressAsyncHandler(async (req,res)=>{
    //check if user exist
    console.log("register");
    console.log(req.body);
    const userExist = await User.findOne({email : req?.body?.email});

    if(userExist) throw new Error("User already exist");
    try{
    const user = await User.create({
        firstname : req?.body?.firstname,
        lastname : req?.body?.lastname,
        email : req?.body?.email,
        password : req?.body?.password
    });
    console.log(user);
    res.json(user);
    }catch(err){
        res.json(err);
    }
})

//login user

const userLoginCtrl = expressAsyncHandler(async (req,res)=>{
    try{
    const {email,password} = req.body;
    const userFound = await User.findOne({email});
    if(userFound.isBlocked) return new Error("Access denied  you have been blocked");
    if(userFound && (await userFound.matchPassword(password))){
        res.json({
            _id : userFound?._id,
            firstname : userFound?.firstname,
            lastname : userFound?.lastname,
            email : userFound?.email,
            profilePhoto : userFound.profilePhoto,
            isAdmin : userFound.isAdmin,
            token :generateToken(userFound?._id),
            isAccountVerified : userFound?.isAccountVerified,
        })
    }else{
        res.status(401);
        throw new Error("invalid credentials")

    }
}catch(err){
    res.json(err);
}
})

// fetch user

const fetchUser = expressAsyncHandler(async (req,res)=>{
    try{
        const users = await User.find({});
        res.json(users);
    }catch(err){
        res.json(err);
    }
    // res.json({user : "fetch all user"})
})

// delete user

const deleteUserCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const deleteduser = await User.findByIdAndDelete(id);
        res.json(deleteduser);
    }catch(err){
        res.json(err);
    }
})

//fetch user details

const fetchUserDetailsCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params;
    validateMongodbId(id);

    try{
        const user = await User.findById(id);
        res.json(user);
    }catch(err){
        res.json(err);
    }
})


// user profile

const userProfileCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("profile ctrl");
    const {id} = req.params;
    validateMongodbId(id);

    // const loginUserId = req.user.id;


    try{
        const myprofile = await User.findById(id).populate("posts");
        // const alreadyViewed = myprofile.viewedBy.find(user => {
        //     return user.id.toString()===loginUserId;
        // });
        // if(alreadyViewed){
        //     res.json(myprofile);
        // }else{
        //     const profile = await User.findByIdAndUpdate(myprofile.id,{
        //         $push : {viewedBy : loginUserId}
        //     })
        //     res.json("Not Viewed");
        // }
        console.log(myprofile);
        res.json(myprofile)
    }catch(err){
        console.log("error");
        res.json(err);
    }
})

//update profile

const userProfileUpdateCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("profile update");
    const {_id} = req.user;
    validateMongodbId(_id);

    const user = await User.findByIdAndUpdate(_id,{
        firstname : req?.body?.firstname,
        lastname : req?.body?.lastname,
        email : req?.body?.email,
        bio : req?.body?.bio
    },{
        new : true,
        runValidators : true
    });
    res.json(user);
})

//update password
const userUpdatePasswordCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("update password");
    const {_id} = req.user;
    const {password} = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if(password){
        user.password = password;
        const updatedUser = await user.save();
        res.json(updatedUser);
    }
    res.json(user);

})

// user following
const followingUserCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("follow user")
    const {followId} = req.body;
    const loginUserId = req.user.id;

    const targetuser = await User.findById(followId);
    const alreadyfollowing = targetuser?.followers?.find(user => user?.toString()=== loginUserId.toString())

    if(alreadyfollowing) throw new Error("you have already following this user");

    await User.findByIdAndUpdate(followId,{
        $push : {followers : loginUserId},
        isFollowing : true
    },{
        new :true
    })


    await User.findByIdAndUpdate(loginUserId,{
        $push : {following : followId}
    },{
        new : true
    })

    res.json("you have succesfully followed this user")
})

//user unfollowed
const unfollowingUserCtrl = expressAsyncHandler(async (req,res)=>{
    const {unFollowId} = req.body;
    const loginUserId = req.user.id;

    await User.findByIdAndUpdate(unFollowId,{
        $pull : {followers: loginUserId},
        isFollowing : false
    },{new : true})


    await User.findByIdAndUpdate(loginUserId,{
        $pull : {following : unFollowId}
    },{new : true})

    res.json("you have succesfully unfollowed this user")
})

//blocked user
const blockUserCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("block user id : "+req.params.id);
    const id = req.params.id;
    validateMongodbId(id);

    const user = await User.findByIdAndUpdate(id,{
        isBlocked:true
    },{new : true})

    res.json(user);
})

//unblock user
const unblockUserCtrl = expressAsyncHandler(async (req,res)=>{
    const id = req.params.id;
    validateMongodbId(id);

    const user = await User.findByIdAndUpdate(id,{
        isBlocked:false
    },{new : true})

    res.json(user);
})


// geenerate verification token -- send email

const generateVerificationTokenCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("verfication token");
    const loginUserId = req.user.id;
    const user = await User.findById(loginUserId);
    console.log("user : ",user);
    try{

        const verificationToken = await  user.createAccountVerificationToken();
        await user.save();

        const resetUrl = `if you were  request to verify your account  , verify now within 10 minitus, otherwise ignore this message
        <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify account</a>`


        const msg = {
            to : "07root07@gmail.com",
            from : "beratkalhan82@gmail.com",
            subject : "email verification",
            html : resetUrl
        };
        await sgMail.send(msg);
        res.json(resetUrl);
    }catch(err){
        res.json("error"+err);
    }
})


//Account verification

const accountVerificationCtrl = expressAsyncHandler(async (req,res)=>{
    const {token} = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");


    const userFound = await User.findOne({accountVerificationToken : hashedToken,accountVerificationTokenExpires:{$gt: new Date()}});
    if(!userFound) throw new Error("token expired,try later");
    userFound.isAccountVerified = true;
    userFound.accountVerificationToken = undefined;
    userFound.accountVerificationTokenExpires=undefined;
    userFound.save();

    res.json(userFound);
});


// forget token 

const forgetPasswordToken = expressAsyncHandler(async (req,res)=>{

    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error("User not found");

    try{
        const token = await user.createPasswordResetToken();
        await user.save();

        const resetUrl = `if you were  request to reset your account  , reset now within 10 minitus, otherwise ignore this message
        <a href="http://localhost:3000/reset-password/${token}">Click to reset password</a>`


        const msg = {
            to : email,
            from : "beratkalhan82@gmail.com",
            subject : "reset password",
            html : resetUrl
        };

        const emailMsg = await sgMail.send(msg);
        res.json(emailMsg);
    }catch(err){}

});

// password reset

const passwordResetCtrl = expressAsyncHandler(async (req,res)=>{
    const {token,password} = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

    const user = await User.findOne({passwordResetToken : hashedToken,passwordResetExpires : {$gt : Date.now()}});

    if(!user) throw new Error("token expired.Try later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

})

// profile photo upload

const profilePhotoUploadCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("profile");
    const {_id} = req.user;
    const localpath = `public/images/profile/${req.file.filename}`;
    const imageUploaded = await cloudinaryUploadImg(localpath);

    const foundUser = await User.findByIdAndUpdate(_id,{
        profilePhoto :imageUploaded?.url
    },{new :true})

    fs.unlinkSync(localpath);
    res.json(foundUser);
})


module.exports = {userRegisterCtrl,userLoginCtrl,fetchUser,deleteUserCtrl,
    fetchUserDetailsCtrl,userProfileCtrl,userProfileUpdateCtrl,userUpdatePasswordCtrl,
    followingUserCtrl,unfollowingUserCtrl,blockUserCtrl,unblockUserCtrl,generateVerificationTokenCtrl,
    accountVerificationCtrl,forgetPasswordToken,passwordResetCtrl,profilePhotoUploadCtrl
}