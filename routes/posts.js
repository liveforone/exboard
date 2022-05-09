// <posts.js> //
//==dependencies==//
const express  = require('express');
const router = express.Router();
const Post = require('../models/Post');
const util = require('../util');


//==routing==/
//Index//
/*
await 을 사용하기 위해 함수에 async를 붙임
Query string은 문자열로 전달되기 때문에 parseInt사용
await은 해당 객체가 완료될 때까지 다음 코드로 진행하지 않고 
기다렸다가 해당 객체가 완료되면 값을 반환합니다.
*/
router.get('/', async (req, res) => {
  let page = Math.max(1, parseInt(req.query.page));
  let limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  let skip = (page-1) * limit;
  let count = await Post.countDocuments({});
  let maxPage = Math.ceil(count/limit);
  let posts = await Post.find({})
    .populate('author')  //Model.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해줌
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .exec();

  res.render('posts/index', {
    posts:posts,
    currentPage:page,
    maxPage:maxPage,
    limit:limit
  });
});
//New//
router.get('/new', util.isLoggedin, (req, res) => {
  let post = req.flash('post')[0] || {};
  let errors = req.flash('errors')[0] || {};
  res.render('posts/new', { post:post, errors:errors });
});
//create//
router.post('/', util.isLoggedin, (req, res) => {
  req.body.author = req.user._id;
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
  Post.findOne({_id:req.params.id})
    .populate('author')
    .exec((err, post) => {
      if(err) return res.json(err);
      res.render('posts/show', {post:post});
    })
});
//edit//
router.get('/:id/edit', util.isLoggedin, checkPermission, (req, res) => {
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
router.put('/:id', util.isLoggedin, checkPermission, (req, res) => {
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
router.delete('/:id', util.isLoggedin, checkPermission, (req, res) => {
  Post.deleteOne({_id:req.params.id}, (err) => {
    if(err) return res.json(err);
    res.redirect('/posts');
  });
});

module.exports = router;


//==private functions==//
function checkPermission(req, res, next) {
  Post.findOne({_id:req.params.id}, (err, post) => {
    if(err) return res.json(err);
    if(post.author != req.user.id) return util.noPermission(req, res);
    next();
  });
}