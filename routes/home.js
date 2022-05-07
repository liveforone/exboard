// <home.js> //
//==dependencies==//
const express = require('express');
const router = express.Router();
const passport = require('../config/passport');


//==routing==//
//Home//
router.get('/', (req, res) => {
  res.render('home/welcome');
});
router.get('/about', (req, res) => {
  res.render('home/about');
});
//Login//
router.get('/login',  (req,res)  => {
  let username = req.flash('username')[0];
  let errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});
//Post Login//
router.post('/login',
  (req, res, next) => {
    let errors = {};
    let isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = 'Username is required!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = 'Password is required!';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors', errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));
//Logout//
router.get('/logout', (req, res)  => {
  req.logout();
  res.redirect('/');
});

module.exports = router;