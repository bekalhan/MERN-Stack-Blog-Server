const express = require('express');
const {sendEmailCtrl} = require('../../controller/email/emailController');
const authmiddleware = require('../../middlewares/auth/authMiddleWare');
const emailRoute = express.Router();

//post request
emailRoute.post('/api/email',authmiddleware,sendEmailCtrl);

module.exports  = emailRoute;