const express = require('express');
const {createCategoryCtrl,fetchAllCategoriesCtrl,fetchCategoryCtrl,updateCategoryCtrl,deleteCategoryCtrl} = require('../../controller/category/categoryController');
const authmiddleware = require('../../middlewares/auth/authMiddleWare');
const categoryRoute = express.Router();

//post request 
categoryRoute.post('/api/categories',authmiddleware,createCategoryCtrl);
//delete request
categoryRoute.delete('/api/categories/:id',authmiddleware,deleteCategoryCtrl);
//get request
categoryRoute.get('/api/categories',authmiddleware,fetchAllCategoriesCtrl);
categoryRoute.get('/api/categories/:id',authmiddleware,fetchCategoryCtrl);
//put request
categoryRoute.put('/api/categories/:id',authmiddleware,updateCategoryCtrl);



module.exports = categoryRoute;