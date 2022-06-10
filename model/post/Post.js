const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title :{
        type : String,
        required : [true,"post title is required"],
        trim : true
    },
    category :{
        type : String,
        required : [true,"post category is required"],
        default : "All"
    },
    isLiked :{
        type:Boolean,
        default : false
    },
    isDisLiked :{
        type :  Boolean,
        default : false
    },
    numViews : {
        type :  Number,
        default : 0
    },
    likes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    disLikes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true,"Please Author is required"]
    },
    description : {
        type : String,
        required : [true,"post description is required"]
    },
    image : {
        type : String,
        default : "https://cdn.pixabay.com/photo/2018/04/16/10/13/newspaper-3324168_960_720.jpg"
    }


},{
    toJSON : {
        virtuals : true
    },
    toObject : {
        virtuals : true
    },
    timestamps : true
});

postSchema.virtual("comments",{
    ref:"Comment",
    foreignField : "post",
    localField : "_id"
})


const Post = mongoose.model("Post",postSchema);

module.exports = Post;