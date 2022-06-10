const express = require('express');
const {createCommentCtrl,fetchAllComment,fetchCommentCtrl,updateCommentCtrl,deleteCommentCtrl} = require('../../controller/comments/commentController');
const authmiddleware = require('../../middlewares/auth/authMiddleWare');
const commentRoute = express.Router();

// post request
commentRoute.post('/api/comments',authmiddleware,createCommentCtrl)
//delete request
commentRoute.delete('/api/comments/:id',authmiddleware,deleteCommentCtrl);
// get request
commentRoute.get('/api/comments',authmiddleware,fetchAllComment);
commentRoute.get('/api/comment/:id',authmiddleware,fetchCommentCtrl);
//put request
commentRoute.put('/api/comments/:id',authmiddleware,updateCommentCtrl);
module.exports = commentRoute;