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


//==query string middlewre==//
/*
res.locals에 getPostQueryString함수를 추가하는 middleware입니다. 
이렇게 res.locals에 추가된 변수나 함수는 view에서 바로 사용할 수 있고,
 res.locals.getPostQueryString의 형식으로 
 route에서도 사용할 수 있게 됩니다.
*/
util.getPostQueryString = function(req, res, next) {
  res.locals.getPostQueryString = function(isAppended=false, overwrites={}) {
    let queryString = '';
    let queryArray = [];
    let page = overwrites.page ? overwrites.page : (req.query.page ? req.query.page : '');
    let limit = overwrites.limit ? overwrites.limit : (req.query.limit ? req.query.limit : '');
    let searchType = overwrites.searchType ? overwrites.searchType : (req.query.searchType ? req.query.searchType : '');
    let searchText = overwrites.searchText ? overwrites.searchText : (req.query.searchText ? req.query.searchText : '');

    if(page) queryArray.push('page=' + page);
    if(limit) queryArray.push('limit=' + limit);
    if(searchType) queryArray.push('searchType='+searchType);
    if(searchText) queryArray.push('searchText='+searchText);

    if(queryArray.length > 0) queryString = (isAppended ? '&' : '?') + queryArray.join('&');

    return queryString;
  }
  next();
}


module.exports = util;