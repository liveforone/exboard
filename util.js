// <util.js> //
//==dependencies==//
const util = {};


/*
mongoose에서 내는 에러와 mongoDB에서 내는 에러의 형태가 
다르기 때문에 이 함수를 통해 에러의 형태를 통합시킨다.
*/
//==error==//
util.parseError = function(errors){
  let parsed = {};
  if(errors.name == 'ValidationError'){
    for(let name in errors.errors){
      let validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  } 
  else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
    parsed.username = { message:'This username already exists!' };
  } 
  else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}


//==접근 제한==//
util.isLoggedin = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    req.flash('errors', {login:'Please login first'});
    res.redirect('/login');
  }
}
util.noPermission = function(req, res) {
  req.flash('errors', {login:'You don\'t have permission'});
  req.logout();
  res.redirect('/login');
}

module.exports = util;