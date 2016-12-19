var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var data = require('../house_data.json');
var cofig = require('../config');
/* GET home page. */

router.get('/', function(req, res) {
  request.get({
    url: config.api_url
    // url: 'https://rent.591.com.tw/home/search/rsList?is_new_list=1&type=1&kind=0&searchtype=1&region=1&order=posttime&orderType=desc&section=3,5,7,1&pattern=2&hasimg=1&rentprice=4&other=lease',                                                              
  }, function(err, res591, body) {
      if(body) {
        var content = JSON.parse(body);
        var newList = content.data.data;
        var jsonNewList = JSON.stringify(newList);
        if(data[0].post_id === newList[0].post_id) {
          console.log('nothing changed');
          res.render('index', { list: newList });
        } else {
          fs.writeFile('house_data.json', jsonNewList, function(err) {
            if (err) {
              console.log('Something when wrong');
            } else {
              console.log('Saved!');
              res.render('index', { list: newList });
            }
          });
        }
      }
  });
});

module.exports = router;
