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
    res.render('users/new');
});
router.post('/', (req, res) => {  //create
    User.create(req.body, (err, user) => {
      if(err) return res.json(err);
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
    User.findOne({username:req.params.username}, (err, user) => {
      if(err) return res.json(err);
      res.render('users/edit', {user:user});
    });
});
router.put('/:username', (req, res, next) => {  //update
    User.findOne({username:req.params.username}) 
        .select('password') 
        .exec((err, user) => {
          //find에 다양한 함수를 넣을 때에는 .exec를 넣어서 연결해주면 된다.
            if(err) return res.json(err);
  
            // update user object
            user.originalPassword = user.password;
            user.password = req.body.newPassword? req.body.newPassword : user.password; // 2-3
            for(var p in req.body){ 
            user[p] = req.body[p];
            }
  
            // save updated user
            user.save((err, user) => {
                if(err) return res.json(err);
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