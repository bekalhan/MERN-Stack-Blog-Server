const mongoose = require('mongoose');

    try{
         mongoose.connect(process.env.MONGODB_URL,{
            useUnifiedTopology : true,
            useNewUrlParser : true
        })
    }catch(error){
        console.log(error);
    }
