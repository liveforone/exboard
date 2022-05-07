// <users.js> //
//==dependencies==//
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const util = require('../util');


//==routing==//
//Index//
router.get('/', (req, res) => {
  User.find({})
    .sort({username:1})
    .exec((err, users) => {
      if(err) return res.json(err);
      res.render('users/index', {users:users});
    });
});
//New//
router.get('/new', (req, res) => {
  let user = req.flash('user')[0] || {};
  let errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors });
});
//create//
router.post('/', (req, res) => {
  User.create(req.body, (err, user) => {
    if(err) {
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/users');
  });
});
//show//
router.get('/:username', (req, res) => {
  User.findOne({username:req.params.username}, (err, user) => {
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});
//edit//
router.get('/:username/edit', (req, res) => {
  let user = req.flash('user')[0];
  let errors = req.flash('errors')[0] || {};
  if(!user) {
    User.findOne({username:req.params.username}, (err, user) => {
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  } else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});
//update//
router.put('/:username', (req, res, next) => {
  User.findOne({username:req.params.username})
    .select('password')
    .exec((err, user) => {
      if(err) return res.json(err);

      //update user object//
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(let p in req.body) {
        user[p] = req.body[p];
      }

      //save updated user//
      user.save((err, user) => {
        if(err) {
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
    });
});
//destroy//
router.delete('/:username', (req, res) => {
  User.deleteOne({username:req.params.username}, (err) => {
    if(err) return res.json(err);
    res.redirect('/users');
  });
});

module.exports = router;