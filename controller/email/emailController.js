const expressAsyncHandler = require('express-async-handler');
const sgMail = require('@sendgrid/mail');
const EmailMsg = require('../../model/emailMessaging/EmailMessaging');
const Filter = require('bad-words');


const sendEmailCtrl = expressAsyncHandler(async (req,res)=>{
    console.log("send email");
    const {to,subject,message} = req.body;
    const emailmessage = subject + "" + message;
    const filter = new Filter();

    const isProfane = filter.isProfane(emailmessage);
    if(isProfane) throw new Error("Email sent failed,because it contains profane words");
    try{
        console.log("a");
        const msg = {
            to,
            subject,
            text : message,
            from :"beratkalhan82@gmail.com"
        }

        console.log("b");

        await sgMail.send(msg);

        console.log("c");
        // save
        await EmailMsg.create({
            sentBy : req?.user?._id,
            from : req?.user?.email,
            to,
            message,
            subject,
        });

        console.log("d");

        res.json(msg);
    }catch(err){
        console.log("error enter");
        res.json(err);
    }
})

module.exports = {sendEmailCtrl};