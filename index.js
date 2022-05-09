// <index.js> //
//==dependencies==//
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('./config/passport');
const util = require('./util');
const app = express();
const port = 3000;


//==DB setting==//
mongoose.connect(process.env.MONGO_DB);
const db = mongoose.connection;
db.once('open', () => {
  console.log('DB connected');
});
db.on('error', (err) => {
  console.log('DB ERROR : ', err);
});


//==setting==//
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'Mysecret', resave:true, saveUninitialized:true}));  //express 세션
app.use(passport.initialize());  //passport는 반드시 세션밑에
app.use(passport.session());


//==cusstom middleware==//
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});


//==routing==//
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));


//==Port setting==//
app.listen(port, () => {
  console.log('server on! http://localhost:'+port);
});