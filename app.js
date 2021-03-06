

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
var mandrillTransport = require('nodemailer-mandrill-transport');
var xoauth2 = require('xoauth2');
var config = require('./config');

console.log(config);

// login
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: '',
            clientId: '',
            clientSecret: '',
            scope: "https://mail.google.com/",
            refreshToken: '',
            accessToken: ''
        })
    }
});

// var users = require('./routes/user');

//For nodemailer

// var transporter = nodemailer.createTransport(mandrillTransport({
//   auth: {
//     apiKey: '3janDEcwJBOYj0JbanD6XQ'
//   }
// }));

// var connection = {
//     host: 'smtp.gmail.com',
//     secure: true,
//     port: 465,
//     auth: {
//         user: 'davidyu37@gmail.com',
//         pass: 'basketballmvp1'
//     },
//     logger: true
// };

// var transporter = nodemailer.createTransport(connection);


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

cron.schedule('*/59 * * * *', function(){
    console.log('running a task every one hour');
    request.get({
        url: config.api_url,                                                              
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
});

// request.get({
//         url: config.api_url,                                                              
//     }, function(err, res591, body) {
//         if(body) {
//             var content = JSON.parse(body);
//             var newList = content.data.data;
//             var jsonNewList = JSON.stringify(newList);
            
//             if(data[0].post_id === newList[0].post_id) {
//                 console.log('nothing changed');
//                 sendMail(newList);
//                 //Do nothing because there's no new house posted'
//             } else {
//                 fs.writeFile('house_data.json', jsonNewList, function(err) {
//                 if (err) {
//                     console.log('Something when wrong');
//                 } else {
//                     console.log('Saved!');
//                     //Send email notification
//                     // sendMail(newList);
//                 }
//                 });
//             }
//         }
//     });



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
        // 	kaoxiaoyang@gmail.com
        var mailOptions = {
            from: '',
            to: '',
            subject: '591 Houses🔑',
            // text: text,
            html: text // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ');
            console.log(info)
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
