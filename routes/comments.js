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
//update//
router.put('/:id', util.isLoggedin, checkPermission, checkPostId, (req, res) => {
    let post = res.locals.post;

    req.body.updatedAt = Date.now();
    Comment.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, (err, comment) => {
        if(err) {
            req.flash('commentForm', {_id:req.params.id, form:req.body});
            req.flash('commentError', {_id:req.params.id, errors:util.parseError(err)});
        }
        return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
    });
});
//destroy//
/*
댓글을 완전히 삭제해버리면 삭제된 댓글의 대댓글들이 
고아가 되어버리기 때문에, 실제로 댓글을 삭제하지 않고 
isDeleted를 true로 바꾸는 일만 합니다.
*/
router.delete('/:id', util.isLoggedin, checkPermission, checkPostId, (req, res) => {
    let post = res.locals.post;

    Comment.findOne({_id:req.params.id}, (err, comment) => {
        if(err) return res.json(err);

        //save updated comment//
        comment.isDeleted = true;
        comment.save((err, comment) => {
            if(err) return res.json(err);

            return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
        });
    });
});

module.exports = router;


//==private functions==//
function checkPermission(req, res, next) {
    Comment.findOne({_id:req.params.id}, (err, comment) => {
        if(err) return res.json(err);
        if(comment.author != req.user.id) return util.noPermission(req, res);
        next();
    });
}
function checkPostId(req, res, next) {
    Post.findOne({_id:req.query.postId}, (err, post) => {
        if(err) return res.json(err);

        res.locals.post = post;
        next();
    });
}