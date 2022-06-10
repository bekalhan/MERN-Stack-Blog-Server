const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


//create a Schema

const userSchema = new mongoose.Schema({
    firstname:{
        required : [true,"first name is required"],
        type : String
    },
    lastname : {
        required: [true,"last name is required"],
        type : String
    },
    profilePhoto :{
        type : String,
        default : "https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236_960_720.png"
    },
    email :{
        required : [true,"email is required"],
        type : String
    },
    bio :{
        type : String,
    },
    password :{
        type : String,
        required : [true,"password is required"]
    },
    postCount : {
        type : Number,
        default : 0
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    isAdmin :{
        type : Boolean,
        default : false
    },
    role :{
        type : String,
        enum:["Admin","Guest","Blogger"]
    },
    isFollowing :{
        type : Boolean,
        default : false
    },
    isUnFollowing :{
        type : Boolean,
        default : false
    },
    isAccountVerified : {type:Boolean,default:false},
    accountVerificationToken : String,
    accountVerificationTokenExpires : Date,

    viewedBy : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ]
    },

    followers : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ]
    },

    following : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ]
    },

    passwordChangeAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,

    active :{
        type : Boolean,
        default : false
    }
},{
    toJSON : {
        virtuals : true
    },
    toObject : {
        virtuals : true
    },
    timestamps : true
})


//virtual methods
userSchema.virtual("posts",{
    ref : "Post",
    foreignField : "user",
    localField : "_id"
})


//hash password

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

//match password

userSchema.methods.matchPassword = async function(enteredpassword){
    return await bcrypt.compare(enteredpassword,this.password);
}

// verify account
userSchema.methods.createAccountVerificationToken = async function(){
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest("hex");
    this.accountVerificationTokenExpires  = Date.now() + 30*60*1000;
    return verificationToken;
}

//password reset-forget

userSchema.methods.createPasswordResetToken = async function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 30*60*1000;
    return resetToken;
}

const User = mongoose.model("User",userSchema);

module.exports = User;