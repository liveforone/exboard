// <posts.js> //
//==dependencies==//
const express  = require('express');
const router = express.Router();
const Post = require('../models/Post');
const util = require('../util');


//==routing==/
//Index//
router.get('/', (req, res) => {
  Post.find({})
    .sort('-createdAt')
    .exec((err, posts) => {
      if(err) return res.json(err);
      res.render('posts/index', {posts:posts});
    });
});
//New//
router.get('/new', (req, res) => {
  let post = req.flash('post')[0] || {};
  let errors = req.flash('errors')[0] || {};
  res.render('posts/new', { post:post, errors:errors });
});
//create//
router.post('/', (req, res) => {
  Post.create(req.body, (err, post) => {
    if(err) {
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new');
    }
    res.redirect('/posts');
  });
});
//show//
router.get('/:id', (req, res) => {
  Post.findOne({_id:req.params.id}, (err, post) => {
    if(err) return res.json(err);
    res.render('posts/show', {post:post});
  });
});
//edit//
router.get('/:id/edit', (req, res) => {
  let post = req.flash('post')[0];
  let errors = req.flash('errors')[0] || {};
  if(!post) {
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err) return res.json(err);
        res.render('posts/edit', { post:post, errors:errors });
    });
  } else {
    post._id = req.params.id;
    res.render('posts/edit', { post:post, errors:errors });
  }
});
//update//
router.put('/:id', (req, res) => {
  req.body.updatedAt = Date.now();
  Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, (err, post) => {
    if(err) {
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/'+req.params.id+'/edit');
    }
    res.redirect('/posts/'+req.params.id);
  });
});
//destroy//
router.delete('/:id', (req, res) => {
  Post.deleteOne({_id:req.params.id}, (err) => {
    if(err) return res.json(err);
    res.redirect('/posts');
  });
});

module.exports = router;