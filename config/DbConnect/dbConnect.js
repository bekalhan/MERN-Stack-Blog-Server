const mongoose = require('mongoose');

console.log("env"+process.env.MONGODB_URL);

    try{
         mongoose.connect(process.env.MONGODB_URL,{
            useUnifiedTopology : true,
            useNewUrlParser : true
        })
        console.log("db connected succesfully");
    }catch(error){
        console.log(error);
    }
