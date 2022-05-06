// <home.js> //
//==dependencies==//
const express = require('express');
const router = express.Router();


//==routing==//
router.get('/', (req, res) => {
  res.render('home/welcome');
});
router.get('/about', (req, res) => {
  res.render('home/about');
});

module.exports = router;