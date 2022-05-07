// <users.js> //
//==dependencies==//
const express = require('express');
const router = express.Router();
const User = require('../models/User');


//==routing==//
router.get('/', (req, res) => {  //index
    User.find({})
      .sort({username:1})
      .exec((err, users) => {
        if(err) return res.json(err);
        res.render('users/index', {users:users});
    });
});
router.get('/new', (req, res) => {  //new
    let user = req.flash('user')[0] || {};
    let errors = req.flash('errors')[0] || {};
    res.render('users/new', {user:user, errors:errors});
});
router.post('/', (req, res) => {  //create
    User.create(req.body, (err, user) => {
      if(err) {
        req.flash('user', req.body);
        req.flash('errors', parseError(err));
        return res.redirect('/users/new');
      }
      res.redirect('/users');
    });
});
router.get('/:username', (req, res) => {  //show
    User.findOne({username:req.params.username}, (err, user) => {
      if(err) return res.json(err);
      res.render('users/show', {user:user});
    });
});
router.get('/:username/edit', (req, res) => {  //edit
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, (err, user) => {
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});
router.put('/:username', (req, res, next) => {
  User.findOne({username:req.params.username})
    .select('password')
    .exec((err, user) => {
      //find에 다양한 함수를 넣을 때에는 .exec를 넣어서 연결해주면 된다.
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }

      // save updated user
      user.save((err, user) => {
        if(err){
          req.flash('user', req.body);
          req.flash('errors', parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});
router.delete('/:username', (req, res) => {  //destroy
    User.deleteOne({username:req.params.username}, (err) => {
      if(err) return res.json(err);
      res.redirect('/users');
    });
});

module.exports = router;

//==functions==//
/*
mongoose에서 내는 에러와 mongoDB에서 내는 에러의 형태가 
다르기 때문에 이 함수를 통해 에러의 형태를 통합시킨다.
*/
function parseError(errors) {
  let parsed = {};
  if(errors.name == 'ValidationError') {
    for(let name in errors.errors) {
      let validationError = errors.errors[name];
      parsed[name] = {message:validationError.message};
    }
  } else if (errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
    parsed.username = {message:'This username already exists!'};
  } else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}