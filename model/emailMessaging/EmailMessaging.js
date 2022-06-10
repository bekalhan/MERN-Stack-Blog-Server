const mongoose = require('mongoose');


const  emailSchema = new mongoose.Schema({
    from:{
        type : String,
        required : true
    },
    to:{
        type : String,
        required : true

    },
    message :{
        type : String,
        required : true

    },
    subject :{
        type : String,
        required : true
    },
    sentBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    isFlagged : {
        type : Boolean,
        default  : false
    }
},{timestamps : true})


const Email = mongoose.model("Email",emailSchema);

module.exports = Email;