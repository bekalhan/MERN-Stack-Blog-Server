const Comment = require('../../model/comment/Comment');
const Post = require('../../model/post/Post');
const User = require('../../model/user/User');
const expressAsyncHandler  = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodb');
const isBlocked = require('../utils/isBlock');

//create a comment
const createCommentCtrl = expressAsyncHandler(async (req,res)=>{
    //get user
    const user = req.user;

    isBlocked(user);

    const {postId,description} = req.body; 

    try{
        const comment = await Comment.create({
            post : postId,
            user : user,
            description : description
        })
        res.json(comment);
    }catch(err){
        res.json(err);
    }
})


//get all comments
const fetchAllComment = expressAsyncHandler(async (req,res)=>{
    try{
        const comments = await Comment.find({}).sort("-created");
        res.json(comments);
    }catch(err){
        res.json(err);
    }
})

// comments detail

const fetchCommentCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params;

    try{
        const comment = await Comment.findById(id);
        res.json(comment);
    }catch(err){
        res.json(err);
    }

})


//update
const updateCommentCtrl = expressAsyncHandler(async (req,res)=>{
    const {id}  = req.params;

    try{    
        const update = await Comment.findByIdAndUpdate(id,{
            post :req.body?.postId,
            user : req.user,
            description :req?.body?.description
        },{new : true,runValidators : true})
        res.json(update);
    }catch(err){
        res.json(err);
    }
})

//delete comment
const deleteCommentCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const comment = await Comment.findByIdAndDelete(id);
        res.json(comment);
    }catch(err){
        res.json(err);
    }
})

module.exports  = {createCommentCtrl,fetchAllComment,fetchCommentCtrl,updateCommentCtrl,deleteCommentCtrl}