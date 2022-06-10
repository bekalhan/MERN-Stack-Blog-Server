const Post = require('../../model/post/Post');
const User = require('../../model/user/User');
const fs = require('fs');
const Filter = require('bad-words');
const expressAsyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodb');
const {PhotoUpload,postPhotoResize} = require('../../middlewares/uploads/profilePhotoUpload');
const cloudinaryUploadImg = require('../utils/cloudinary');
const isBlocked = require('../utils/isBlock');
const blockUser = require('../utils/isBlock');


// create post
const createPostCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("create");
    const {_id} = req.user;
    blockUser(req.user);
    console.log(req.body);
    // validateMongodbId(req.body.user);
    const filter = new Filter();
    const isProfane = filter.isProfane(req.body.title,req.body.description);
    //block user
    if(isProfane){
        const user = await User.findByIdAndUpdate(_id,{
            isBlocked : true
        })
        throw new Error("Creating failed because you have been blocked");
    }

    const localpath = `public/images/posts/${req.file.filename}`;
    const imageUploaded = await cloudinaryUploadImg(localpath);
   
    try{
        const post = await Post.create({title:req.body.title,description:req.body.description,category:req.body.category,image: imageUploaded?.url,user : _id});
        const find_user = await User.findById(_id);
        find_user.postCount = find_user.postCount + 1;
        find_user.save();
        res.json(post);
        // fs.unlinkSync(image);
    }catch(err){
        res.json(err);
    }
})


//fetch all post
const fetchAllPosts = expressAsyncHandler(async (req,res)=>{
    const hasCategory = req.query.category;
    try{
        if(hasCategory){
            const posts = await Post.find({category : hasCategory}).populate("user").populate("comments");            
            res.json(posts);
        }else{
            const posts = await Post.find({}).populate("user").populate('comments');            
            res.json(posts);
        }
    }catch(err){

    }
})


//fetch a single posts
const fetchPost = expressAsyncHandler(async (req,res)=>{
    console.log("fetch al");
    const {id} = req.params;
    console.log("id",id);
    // validateMongodbId(id);
    try{
        const post = await Post.findById(id).populate("user").populate("disLikes").populate("likes").populate('comments');
        await Post.findByIdAndUpdate(id,{
            $inc : {numViews :1}
        },{new : true})
        console.log("post",post);
        res.json(post);
    }catch(err){
        console.log("error");
        res.json(err);
    }
})


//update post
const updatePost = expressAsyncHandler(async (req,res)=>{
    console.log("update");
    const {id} = req.params;
    // validateMongodbId(id);
    try{
        const post = await Post.findByIdAndUpdate(id,{
            ...req.body,
            user : req.user?._id
        },{new : true})
        res.json(post);
    }catch(err){
        res.json(err);
    }
})


//delete post

const deletePost = expressAsyncHandler(async (req,res)=>{
    console.log("delete");
    const {id} = req.params;
    // validateMongodbId(id);
    try{
        const post = await Post.findOneAndDelete(id);
        res.json(post);
    }catch(err){
        res.json(err);
    }
})

// post like

const toggleAddLikeCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("enter");
    //find post 
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    //find User
    const loginUserId = req?.user?._id;
    // user already liked this post
    const isLiked = post?.isLiked;
    // user already disliked this post
    const alreadyDisliked = post?.disLikes?.find(userId => userId?.toString() === loginUserId?.toString());
    if(alreadyDisliked){
        const post = await Post.findByIdAndUpdate(postId,{
            $pull : {dislikes : loginUserId},
            isDisLiked : false
        },{new : true})
    }
    if(isLiked){
        const post = await Post.findByIdAndUpdate(postId,{
            $pull : {likes : loginUserId },
            isLiked : false
        },{new : true})
    }else{
        const post = await Post.findByIdAndUpdate(postId,{
            $push : {likes : loginUserId},
            isLiked : true
        },{new : true})
    }

    res.json(post);

})


// post dislikes

const toggleDislikeCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("dislike");
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    console.log(post);
    //find the user
    const loginUserId = req?.user?._id;
    // check user already dislikes this post
    const isDisliked = post?.isDisLiked;
    //check user already likes this  post
    const alreadyLiked = post?.likes?.find(userId => userId.toString() === loginUserId?.toString())

    console.log("a");

    if(alreadyLiked){
        console.log("already liked");
        const post = await Post.findByIdAndUpdate(postId,{
            $pull : {likes : loginUserId},
            isLiked : false
        },{new : true})
    }

    console.log("b");

    if(isDisliked){
        console.log("is disliked");
        const post = await Post.findByIdAndUpdate(postId,{
            $pull : {disLikes : loginUserId },
            isDisLiked : false
        },{new : true})
    }else{
        console.log("else");
        const post = await Post.findByIdAndUpdate(postId,{
            $push : {disLikes : loginUserId},
            isDisLiked : true
        },{new : true})
    }

    console.log("c");

    res.json(post);
})


module.exports = {createPostCtrl,fetchAllPosts,fetchPost,updatePost,deletePost,toggleAddLikeCtrl,toggleDislikeCtrl}
