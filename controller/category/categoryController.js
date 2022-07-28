const expressAsyncHandler = require('express-async-handler');
const Category = require('../../model/Category/Category');


// create category
const createCategoryCtrl = expressAsyncHandler(async (req,res)=>{
    try{
        const category = await Category.create({
            user : req?.user?._id,
            title : req.body.title
        })
        res.json(category);
    }catch(err){
        res.json(err);
    }
})

//get all categories

const fetchAllCategoriesCtrl = expressAsyncHandler(async (req,res)=>{
    try{
        const categories = await Category.find({}).populate("user").sort("-createdAt");
        res.json(categories);
    }catch(err){
        res.json(err);
    }
})


// get specific category
const fetchCategoryCtrl = expressAsyncHandler(async (req,res) =>{
    const {id} = req.params;
    try{
        const categories = await Category.findById(id).populate("user").sort("-createdAt");
        res.json(categories);
    }catch(err){
        res.json(err);
    }
})

//update
const updateCategoryCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params;
    try{
        const category = await Category.findByIdAndUpdate(id,{
            title : req?.body?.title
        },{new : true,runValidators : true})
        res.json(category);
    }catch(err){
        res.json(err);
    }
})

//delete
const deleteCategoryCtrl = expressAsyncHandler(async (req,res)=>{
    const {id} = req.params;
    try{
        const category = await Category.findByIdAndDelete(id);
        res.json(category);
    }catch(err){
        res.json(err);
    }
})

module.exports =  {createCategoryCtrl,fetchAllCategoriesCtrl,fetchCategoryCtrl,updateCategoryCtrl,deleteCategoryCtrl};