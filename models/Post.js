// <Post.js> //
//==dependencies==//
const mongoose = require('mongoose');


//==schema==//
const postSchema = mongoose.Schema({
  title:{type:String, required:[true, 'Title is required!']},
  body:{type:String, required:[true, 'Body is required!']},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});


//==model & export==//
const Post = mongoose.model('post', postSchema);
module.exports = Post;