const express = require('express');
const {createPostCtrl,fetchAllPosts,fetchPost,updatePost,deletePost,toggleAddLikeCtrl,toggleDislikeCtrl} = require('../../controller/posts/postController');
const authmiddleware = require('../../middlewares/auth/authMiddleWare');
const {postPhotoResize,PhotoUpload} = require('../../middlewares/uploads/profilePhotoUpload');

const postRoute = express.Router();

//post request
postRoute.post('/api/posts',authmiddleware,PhotoUpload.single("image"),postPhotoResize,createPostCtrl);
//get request
postRoute.get('/api/posts',fetchAllPosts);
postRoute.get('/api/posts/:id',fetchPost);
//delete request
postRoute.delete('/api/posts/:id',authmiddleware,deletePost);
//put request
postRoute.put('/api/post/:id',authmiddleware,updatePost);
postRoute.put('/api/posts/likes',authmiddleware,toggleAddLikeCtrl);
postRoute.put('/api/posts/dislikes',authmiddleware,toggleDislikeCtrl);

module.exports = postRoute;