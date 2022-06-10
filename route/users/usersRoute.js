const express = require('express');
const userRoutes = express.Router();
const {userRegisterCtrl,userLoginCtrl,fetchUser,deleteUserCtrl,
    fetchUserDetailsCtrl,userProfileCtrl,userProfileUpdateCtrl,
    userUpdatePasswordCtrl,followingUserCtrl,unfollowingUserCtrl,blockUserCtrl,generateVerificationTokenCtrl,
    unblockUserCtrl,accountVerificationCtrl,forgetPasswordToken,passwordResetCtrl,profilePhotoUploadCtrl} = require('../../controller/users/userController')
const authmiddleware = require('../../middlewares/auth/authMiddleWare');
const {PhotoUpload,profilePhotoResize} = require('../../middlewares/uploads/profilePhotoUpload');

//post request
userRoutes.post("/api/users/register",userRegisterCtrl); //
userRoutes.post("/api/users/login",userLoginCtrl); //
userRoutes.post("/api/users/generate-verify-email-token",authmiddleware,generateVerificationTokenCtrl);
userRoutes.post("/api/users/forget-password-token",forgetPasswordToken); 
userRoutes.post("/api/users/reset-password",passwordResetCtrl); 
//get request
userRoutes.get("/api/users",authmiddleware,fetchUser); //
userRoutes.get('/api/users/:id',fetchUserDetailsCtrl); //
userRoutes.get('/api/users/profile/:id',userProfileCtrl);
//delete request
userRoutes.delete('/api/users/:id',deleteUserCtrl); //
//put request
// userRoutes.put('/api/users',authmiddleware,userProfileUpdateCtrl);
userRoutes.put('/api/users/password/:id',authmiddleware,userUpdatePasswordCtrl); 
userRoutes.put('/api/users/follow',authmiddleware,followingUserCtrl); 
userRoutes.put('/api/users/unfollow',authmiddleware,unfollowingUserCtrl); 
userRoutes.put('/api/users/block-user/:id',authmiddleware,blockUserCtrl);
userRoutes.put('/api/users/unblock-user/:id',authmiddleware,unblockUserCtrl);
userRoutes.put('/api/users/verify-account',authmiddleware,accountVerificationCtrl);
userRoutes.put('/api/users/profilephoto-upload',authmiddleware,PhotoUpload.single("image"),profilePhotoResize,profilePhotoUploadCtrl);

module.exports = userRoutes;