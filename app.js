

var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var request = require('request');
var nodemailer = require('nodemailer');
var cron = require('node-cron');
var fs = require('fs');
var data = require('./house_data.json');
var async = require('async');

// var users = require('./routes/user');

//For nodemailer
// var connection = {
//     host: 'smtp.mailgun.org',
//     secure: true,
//     auth: {
//         user: 'postmaster@sandbox71cee6567e504a01a0c648f273897726.mailgun.org',
//         pass: '1234qwer'
//     },
//     logger: true
// };
var connection = {
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
        user: 'davidyu37@gmail.com',
        pass: 'basketballmvp1'
    },
    logger: true
};

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(connection);


// var cheerio = require('cheerio');
// var iconv = require('iconv');
// var utf8 = require('utf8');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// cron.schedule('*/59 * * * *', function(){
//     console.log('running a task every one hour');
//     request.get({
//         url: 'https://rent.591.com.tw/home/search/rsList?is_new_list=1&type=1&kind=0&searchtype=1&region=1&order=posttime&orderType=desc&section=3,5,7,1&pattern=2&hasimg=1&rentprice=4&other=lease',                                                              
//     }, function(err, res591, body) {
//         if(body) {
//             var content = JSON.parse(body);
//             var newList = content.data.data;
//             var jsonNewList = JSON.stringify(newList);
            
//             if(data[0].post_id === newList[0].post_id) {
//                 console.log('nothing changed');
//                 //Do nothing because there's no new house posted'
//             } else {
//                 fs.writeFile('house_data.json', jsonNewList, function(err) {
//                 if (err) {
//                     console.log('Something when wrong');
//                 } else {
//                     console.log('Saved!');
//                     // constructHtml(newList);
//                     //Send email notification
//                     sendMail(newList);
//                 }
//                 });
//             }
//         }
//     });
// });

request.get({
    url: 'https://rent.591.com.tw/home/search/rsList?is_new_list=1&type=1&kind=0&searchtype=1&region=1&order=posttime&orderType=desc&section=3,5,7,1&pattern=2&hasimg=1&rentprice=4&other=lease',                                                              
}, function(err, res591, body) {
    if(body) {
        var content = JSON.parse(body);
        var newList = content.data.data;
        var jsonNewList = JSON.stringify(newList);
        
        if(data[0].post_id === newList[0].post_id) {
            console.log('nothing changed');
            // sendMail(newList);
            //Do nothing because there's no new house posted'
        } else {
            fs.writeFile('house_data.json', jsonNewList, function(err) {
            if (err) {
                console.log('Something when wrong');
            } else {
                console.log('Saved!');
                //Send email notification
                sendMail(newList);
            }
            });
        }
    }
});


function sendMail(obj) {
    //Loop through obj to create each html for content
    var html = '';
    if(obj) {
        var eachHtml;
        var text = '<img src="'+ obj[0].cover + '" /><br/>';
        text += '<p>' + obj[0].fulladdress + '</p><br/>';
        text += '<p>$' + obj[0].price + '</p><br/>';
        text += '<p>' + obj[0].section_name + '</p><br/>';
        text += 'https://rent.591.com.tw/rent-detail-' + obj[0].post_id + '.html';
        text += '<br/> View recent list: https://crawling591.herokuapp.com/';
        // obj.forEach(function(house) {
        //     eachHtml = '<div><a href="https://rent.591.com.tw/rent-detail-' + 
        //     house.post_id + '.html' + '"><img src="' + 
        //     house.cover + '"/></a><p>$ ' + 
        //     house.price + '</p><p>' + 
        //     house.section_name + '</p><p>' +
        //     house.fulladdress + '</p><p>' + 
        //     house.layout + '</p><p>' + 
        //     house.floorInfo + '</p><p>' + 
        //     house.living + '</p><p>' + 
        //     house.condition + '</p></div><hr/>';
        //     html += eachHtml;
        // });
        console.log(html);
        // setup e-mail data with unicode symbols
        // 	kaoxiaoyang@gmail.com
        var mailOptions = {
            from: '"591 Houses🔑" <davidyu37@gmail.com>',
            to: 'davidyu37@gmail.com, kaoxiaoyang@gmail.com',
            subject: '591 Houses🔑',
            // text: text,
            html: text // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    }


};
                                                                         
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
