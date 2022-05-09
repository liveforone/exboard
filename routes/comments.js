// <comment.js> //
//==dependencies==//
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const util = require('../util');


//==routing==//
//create//
router.post('/', util.isLoggedin, checkPostId, (req, res) => {
    let post = res.locals.post;

    req.body.author = req.user._id;
    req.body.post = post._id;

    Comment.create(req.body, (err, comment) => {
        if(err) {
            req.flash('commentForm', {_id:null, form:req.body});
            req.flash('commentError', {_id:null, errors:util.parseError(err)});
        }
        return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
    });
});

module.exports = router;


//==private functions==//
function checkPostId(req, res, next) {
    Post.findOne({_id:req.query.postId}, (err, post) => {
        if(err) return res.json(err);

        res.locals.post = post;
        next();
    });
}