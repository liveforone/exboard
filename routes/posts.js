// <posts.js> //
//==dependencies==//
const express  = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
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
  let maxPage = 0;
  let searchQuery = await createSearchQuery(req.query);
  let posts = [];

  if(searchQuery) {
    let count = await Post.countDocuments(searchQuery);
    maxPage = Math.ceil(count/limit);
    posts = await Post.find(searchQuery)
      .populate('author')  //Model.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해줌
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  res.render('posts/index', {
    posts:posts,
    currentPage:page,
    maxPage:maxPage,
    limit:limit,
    searchType:req.query.searchType,
    searchText:req.query.searchText
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
      return res.redirect('/posts/new'+res.locals.getPostQueryString());
    }
    res.redirect('/posts'+res.locals.getPostQueryString(false, {page:1, searchText:''}));
    /*
    첫번째 파라미터는 optional이지만 첫번째 파라미터없이 두번째 파라ㅁ;터를 전달할 수 없으므로, 
    (false, {page:1})를 사용합니다.
    */
  });
});
//show//
router.get('/:id', (req, res) => {
  let commentForm = req.flash('commentForm')[0] || {_id: null, form: {}};
  let commentError = req.flash('commentError')[0] || {_id: null, parentComment: null, errors:{}};

  /*
  Promise.all 함수는 Promise 배열을 인자로 받고, 
  전달 받은 모든 Promise들이 resolve될 때까지 기다렸다가 
  resolve된 데이터들를 같은 순서의 배열로 만들어 
  다음 callback으로 전달합니다.
  */
  Promise.all([
    Post.findOne({_id:req.params.id}).populate({path:'author', select:'username'}),
    Comment.find({post:req.params.id}).sort('createdAt').populate({path:'author', select:'username'})
  ])
  .then(([post, comments]) => {
    res.render('posts/show', {post:post, comments:comments, commentForm:commentForm, commentError:commentError});
  })
  .catch((err) => {
    console.log('err: ', err);
    return res.json(err);
  });
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
      return res.redirect('/posts/'+req.params.id+'/edit'+res.locals.getPostQueryString());
    }
    res.redirect('/posts/'+req.params.id+res.locals.getPostQueryString());
  });
});
//destroy//
router.delete('/:id', util.isLoggedin, checkPermission, (req, res) => {
  Post.deleteOne({_id:req.params.id}, (err) => {
    if(err) return res.json(err);
    res.redirect('/posts'+res.locals.getPostQueryString());
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

async function createSearchQuery(queries) { 
  let searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3) {
    /*
    query에 searchType, searchText가 존재하고, 
    searchText가 3글자 이상인 경우에만 search query를 만들고, 
    이외의 경우에는 {}를 전달하여 모든 게시물이 검색되도록 합니다.
    */
    let searchTypes = queries.searchType.toLowerCase().split(',');
    let postQueries = [];

    if(searchTypes.indexOf('title')>=0) {
      postQueries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } });
    }

    if(searchTypes.indexOf('body')>=0) {
      postQueries.push({ body: { $regex: new RegExp(queries.searchText, 'i') } });
    }

    if(searchTypes.indexOf('author!') >= 0) {
      let user = await User.findOne({username: queries.searchText}).exec();
      if(user) postQueries.push({author:user._id});
    } else if (searchTypes.indexOf('author') >= 0) {
      let users = await User.find({username: {$regex: new RegExp(queries.searchText, 'i')}}).exec();
      let userIds = [];
      for(let user of users) {
        userIds.push(user._id);
      }
      if(userIds.length > 0) postQueries.push({author:{$in:userIds}});
    }

    if(postQueries.length > 0) searchQuery = {$or:postQueries};
    else searchQuery = null;
  }
  return searchQuery;
}