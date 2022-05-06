// <posts.js> //
//==dependencies==//
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


//==routing==//
router.get('/', (req, res) => { //home
    Post.find({})
    .sort('-createdAt')
    .exec((err, posts) => {
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    });
});
router.get('/new', (req, res) => {  //new
    res.render('posts/new');
});
router.post('/', (req, res) => {  //create
    Post.create(req.body, (err, post) => {
        if(err) return res.json(err);
        res.redirect('/posts');
    });
});
router.get('/:id', (req, res) => {  //show
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});
router.get('/:id/edit', (req, res) => {  //edit
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err) return res.json(err);
        res.render('posts/edit', {post:post});
    });
});
router.put('/:id', (req, res) => {  //update
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, (err, post) => {
        if(err) return res.json(err);
        res.redirect('/posts/' + req.params.id);
    });
});
router.delete('/:id', (req, res) => {  //destory
    Post.deleteOne({_id:req.params.id}, (err) => {
        if(err) return res.json(err);
        res.redirect('/posts');
    });
});

module.exports = router;