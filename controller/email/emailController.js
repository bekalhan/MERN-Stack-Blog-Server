const expressAsyncHandler = require('express-async-handler');
const sgMail = require('@sendgrid/mail');
const EmailMsg = require('../../model/emailMessaging/EmailMessaging');
const Filter = require('bad-words');


const sendEmailCtrl = expressAsyncHandler(async (req,res)=>{
    const {to,subject,message} = req.body;
    const emailmessage = subject + "" + message;
    const filter = new Filter();

    const isProfane = filter.isProfane(emailmessage);
    if(isProfane) throw new Error("Email sent failed,because it contains profane words");
    try{
        const msg = {
            to,
            subject,
            text : message,
            from :"beratkalhan82@gmail.com"
        }


        await sgMail.send(msg);

        // save
        await EmailMsg.create({
            sentBy : req?.user?._id,
            from : req?.user?.email,
            to,
            message,
            subject,
        });


        res.json(msg);
    }catch(err){
        res.json(err);
    }
})

module.exports = {sendEmailCtrl};