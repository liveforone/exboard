// <Post.js> //
//==dependencies==//
const mongoose = require('mongoose');


//==schema==//
const postSchema = mongoose.Schema({
    title:{type:String, required:true},
    body:{type:String, required:true},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
});