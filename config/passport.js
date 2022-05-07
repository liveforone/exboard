// <passport.js> //
//==dependencies==//
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');


//==serialize&deserialize User==//
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findOne({_id:id}, (err, user) => {
    done(err, user);
  });
});


//==local strategy==//
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, username, password, done) {
      User.findOne({username:username})
        .select({password:1})
        .exec((err, user) => {
          if (err) return done(err);

          if (user && user.authenticate(password)){
            return done(null, user);
          }
          else {
            req.flash('username', username);
            req.flash('errors', {login:'The username or password is incorrect.'});
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;