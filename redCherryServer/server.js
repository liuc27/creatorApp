var express = require('express'),
    cors = require('cors'),
    app = express();
app.use(cors());
var paginate = require('mongoose-paginate');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
app.use(cookieParser())

var Product = require('./models/product')
var ServiceProvider = require('./models/serviceProvider')
var User = require('./models/user')
var Reservation = require('./models/reservation')
var Offer = require('./models/offer')

var jwt = require('jwt-simple')
var _ = require('lodash')
var Limiter = require('express-rate-limiter')
var MemoryStore = require('express-rate-limiter/lib/memoryStore')
var url = require('url');
var cf = require('aws-cloudfront-sign')
var async = require('async')

// import entire SDK
var AWS = require('aws-sdk');
// import AWS object without services
var AWS = require('aws-sdk/global');
// import individual service
var S3 = require('aws-sdk/clients/s3');

var https = require('https');
var http = require('http');

var agent = new https.Agent({
    maxSockets: 25
});

AWS.config.update({
    httpOptions: {
        agent: agent
    }
});

AWS.config.update({
    region: 'ap-northeast-1'
});
AWS.config.apiVersions = {
    s3: '2006-03-01',
    ec2: '2014-10-01',
    cloudfront: '2014-10-21'
};


var limiterGet = new Limiter({
    db: new MemoryStore()
});
var limiterPost = new Limiter({
    db: new MemoryStore()
});
var limiterUser = new Limiter({
    db: new MemoryStore()
});

var LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

var fs = require('fs')

var secretKey = 'supersecretkey'

var logger = require('morgan')
var get_ip = require('ipware')().get_ip;


app.use(bodyParser.json({
    limit: '600kb'
}))
app.use(logger('dev'))
app.use('/images/', express.static(__dirname + '/images/'))
// app.use('/', express.static(__dirname + '/www/'))
app.use('/shopImages/', express.static(__dirname + '/shopImages/'))
app.use('/shopCertificates/', express.static(__dirname + '/shopCertificates/'))
app.use('/userCertificates/', express.static(__dirname + '/userCertificates/'))



app.use(function(req, res, next) {
    var ip_info = get_ip(req);
    console.log(ip_info);
    // { clientIp: '127.0.0.1', clientIpRoutable: false }
    next();
})


app.get('/api/products', limiterGet.middleware({
    innerLimit: 1000,
    outerLimit: 6000,
    headers: false
}), function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    /* category filter exists */
    if (req.query.category != "null" && req.query.category != "undefined" && req.query.category != "all") {
        console.log("1rd")
        Product.paginate({
            category: req.query.category
        }, {
            select: 'productName imageURL likedBy serviceProviderName serviceProviderImageURL time serviceProviderId',
            offset: parseInt(req.query.skip),
            limit: parseInt(req.query.limit)
        }, function(err, products) {
            if (err) return next(err);
            res.json(products.docs)
        });
    } else {
        /* serviceProviderName filter exists */
        if (req.query.serviceProviderName != "null" && req.query.serviceProviderName != "undefined") {
            console.log("2rd")
            Product.paginate({
                serviceProviderName: req.query.serviceProviderName
            }, {
                select: 'productName imageURL likedBy serviceProviderName serviceProviderImageURL time serviceProviderId',
                offset: parseInt(req.query.skip),
                limit: parseInt(req.query.limit)
            }, function(err, products) {
                if (err) return next(err);
                res.json(products.docs)
            });
        } else {
            /* no filter exists */
            Product.paginate({}, {
                select: 'productName imageURL likedBy serviceProviderName serviceProviderImageURL time serviceProviderId',
                offset: parseInt(req.query.skip),
                limit: parseInt(req.query.limit)
            }, function(err, products) {
                if (err) return next(err);
                res.json(products.docs)
            });
        }
    }

})

app.get('/api/productDetails', limiterGet.middleware({
    innerLimit: 1000,
    outerLimit: 6000,
    headers: false
}), function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var objectData
    var returnData
    var signedCookiesData

    if (req.query._id) {


        Product.findOne({
            _id: req.query._id
        }, function(err, data) {
            if (err) {
                return next(err)
            } else {
                var options = {
                    keypairId: 'APKAJRBOBPGRJI3TZONQ',
                    privateKeyPath: './pk-APKAJRBOBPGRJI3TZONQ.pem',
                    expireTime: Date.now() + 6000000
                }
                var signedURL = cf.getSignedUrl('http://d247r75rbkpi3y.cloudfront.net/trump.mp4', options);
                if (signedURL) data.videoURL = signedURL
                console.log(data)
                res.json(data)

                // var s3bucket = new AWS.S3({ params: {Bucket: 'aws-videooutput'}, apiVersion: '2006-03-01' });
                // s3bucket.getObject({Key: 'ios/trump400k_.m3u8'}, function(err, data) {
                //   console.log("getojbect")
                //   // Handle any error and exit
                //   if (err) {
                //     console.log(err)
                //     return err
                //   }
                //   returnData = data;
                //
                //   var options = {keypairId: 'APKAJRBOBPGRJI3TZONQ', privateKeyPath: './pk-APKAJRBOBPGRJI3TZONQ.pem',  expireTime: Date.now() + 6000000}
                //   //var signedCookies = cf.getSignedCookies('http://d247r75rbkpi3y.cloudfront.net/ios/trump400k_*.*', options);
                //   var signedURL = cf.getSignedUrl('http://d247r75rbkpi3y.cloudfront.net/ios/trumpHLS', options);
                //   //var returnData =  JSON.parse(JSON.stringify(data));
                //   async.forEach(Object.keys(signedCookies), function (cookieId, callback){
                //     returnData[cookieId] = signedCookies[cookieId];
                //     signedCookiesData = 'Policy' + '=' + signedCookies["CloudFront-Policy"] + '&' + 'Signature' + '=' + signedCookies["CloudFront-Signature"] + '&' + 'Key-Pair-Id' + '=' + signedCookies["CloudFront-Key-Pair-Id"];
                //     callback(); // tell async that the iterator has completed
                //   }, function(err) {
                //     objectData = returnData.Body.toString('utf-8'); // Use the encoding necessary
                //     objectData = objectData.replace(/trump400k_/g, 'http://d247r75rbkpi3y.cloudfront.net/ios/trump400k_')
                //     objectData = objectData.replace(/.ts/g, '.ts'+'?'+signedCookiesData)
                //     //returnData.Body = Buffer.from(objectData, 'utf-8')
                //         // console.log(objectData)
                //         // console.log(returnData)
                //         //res.setHeader('Content-type', 'application/x-mpegURL');
                //         console.log(objectData)
                //
                //         //res.send(objectData)
                //
                //         res.send(signedCookies)
                //
                //   });
                // });
            }

        })
    }
})

app.get('/api/serviceProviders', limiterGet.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    //     ServiceProvider.find(function(err, serviceProviders) {
    //         if (err) {
    //             return next(err)
    //         }
    //         res.json(serviceProviders)
    //     })
    // })
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    if (req.query.category == undefined || req.query.category == "all") {
        ServiceProvider.paginate({}, {
            offset: parseInt(req.query.skip),
            limit: parseInt(req.query.limit)
        }, function(err, serviceProviders) {
            if (err) return next(err);
            res.json(serviceProviders.docs)
        });
    } else {
        ServiceProvider.paginate({
            category: req.query.category
        }, {
            offset: parseInt(req.query.skip),
            limit: parseInt(req.query.limit)
        }, function(err, serviceProviders) {
            if (err) return next(err);
            res.json(serviceProviders.docs)
        });
    }
})


app.get('/api/user', function(req, res, next) {
    User.find(function(err, data) {
        if (err) {
            return next(err)
        }
        console.log(data)
        res.json(data)
    })
})

app.get('/api/getMenu', function(req, res, next) {

    //     var data =  [{
    //       id: 0,
    //       name: '东京',
    //       icon: 'ios-wine',
    //       color: 'red',
    //       category: 'food'
    //     }, {
    //       id: 1,
    //       name: '京都',
    //       icon: 'ios-basket',
    //       color: '#5383FF',
    //       category: 'shopping'

    //     }, {
    //       id: 2,
    //       name: '大阪',
    //       icon: 'ios-color-wand',
    //       color: 'pink',
    //       category: 'beauty'
    //     }, {
    //       id: 3,
    //       name: '北海道',
    //       icon: 'ios-moon',
    //       color: '#5383FF',
    //       category: 'hotel'
    //     }, {
    //       id: 4,
    //       name: '冲绳',
    //       icon: 'ios-film',
    //       color: 'silver',
    //       category: 'movie'
    //     }, {
    //       id: 5,
    //       name: '箱根',
    //       icon: 'ios-car',
    //       color: 'gold',
    //       category: 'car'
    //     }, {
    //       id: 6,
    //       name: '福冈',
    //       icon: 'ios-cafe',
    //       color: 'lightgreen',
    //       category: 'job'
    //     }, {
    //       id: 7,
    //       name: '奈良',
    //       icon: 'ios-musical-notes',
    //       color: 'lightgreen',
    //       category: 'job'
    //     }, {
    //       id: 8,
    //       name: '名古屋',
    //       icon: 'md-add',
    //       color: 'lightgreen',
    //       category: 'job'
    //     }, {
    //       id: 9,
    //       name: '横滨',
    //       icon: 'ios-eye',
    //       color: 'orange',
    //       category: 'all'
    //     }]
    //     res.json(data)
    // })

    var data = [{
        id: 0,
        name: '投资',
        icon: 'ios-wine',
        color: 'red',
        category: 'food'
    }, {
        id: 1,
        name: '融资',
        icon: 'ios-basket',
        color: '#5383FF',
        category: 'funding'

    }, {
        id: 2,
        name: '美丽',
        icon: 'ios-color-wand',
        color: 'pink',
        category: 'beauty'
    }, {
        id: 3,
        name: '会计',
        icon: 'ios-moon',
        color: '#5383FF',
        category: 'accounting'
    }, {
        id: 4,
        name: '语言',
        icon: 'ios-film',
        color: 'silver',
        category: 'launguage'
    }, {
        id: 5,
        name: '运营',
        icon: 'ios-car',
        color: 'gold',
        category: 'operating'
    }, {
        id: 6,
        name: '技能',
        icon: 'ios-cafe',
        color: 'lightgreen',
        category: 'skill'
    }, {
        id: 7,
        name: '育儿',
        icon: 'ios-musical-notes',
        color: 'lightgreen',
        category: 'childcare'
    }, {
        id: 8,
        name: '趋势',
        icon: 'md-add',
        color: 'lightgreen',
        category: 'trend'
    }, {
        id: 9,
        name: '全部',
        icon: 'ios-eye',
        color: 'orange',
        category: 'all'
    }]
    res.json(data)
})

app.post('/api/findServiceProvider', limiterGet.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log("reqBody")
    console.log(req.body)
    ServiceProvider.findOne({
        serviceProviderName: req.body.serviceProviderName
    }, function(err, serviceProvider) {
        if (err) {
            return next(err)
        }
        res.json(serviceProvider)
    })
})

app.post('/api/product', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.name)

    if (req.body.productName && req.body.password && req.body.serviceProviderName) {
        if (!fs.existsSync('./images/')) {
            fs.mkdirSync('./images/');
        }


        ServiceProvider.findOne({
            serviceProviderName: req.body.serviceProviderName
        }, function(err, data) {
            console.log(data)
            if (err) {
                return next(err)
            } else {
                if (data == null) {
                    res.send("找不到serviceProvider")
                } else {
                    console.log("found serviceProvider")
                    if (req.body.password === data.password) {
                        req.body.serviceProviderId = data._id.toString()
                        console.log(req.body)
                        if (req.body.productLevel == "pre") {
                            if (data.preProduct != null) {
                                if (data.preProduct.indexOf(req.body.productName) < 0)
                                    ServiceProvider.update({
                                        serviceProviderName: req.body.serviceProviderName
                                    }, {
                                        $push: {
                                            'preProcut': req.body.productName
                                        }
                                    }, function(err, data) {})
                            } else {
                                ServiceProvider.update({
                                    serviceProviderName: req.body.serviceProviderName
                                }, {
                                    $push: {
                                        product: req.body.productName
                                    }
                                }, function(err, data) {})
                            }
                        } else {
                            if (data.product != null) {
                                if (data.product.indexOf(req.body.productName) < 0) {
                                    ServiceProvider.update({
                                        serviceProviderName: req.body.serviceProviderName
                                    }, {
                                        $push: {
                                            product: req.body.productName
                                        }
                                    }, function(err, data) {})
                                }
                            } else {
                                ServiceProvider.update({
                                    serviceProviderName: req.body.serviceProviderName
                                }, {
                                    $push: {
                                        product: req.body.productName
                                    }
                                }, function(err, data) {})
                            }
                        }


                        var imageURL;
                        var faceImageURL;
                        var serviceProviderImageURL;
                        if (req.body.imageURL) {

                            imageURL = "http://localhost:8080/images/" + req.body.productName + ".image.jpg";
                            data = req.body.imageURL;
                            req.body.imageURL = imageURL;

                            var base64Data, binaryData;
                            base64Data = data.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "");
                            base64Data += base64Data.replace('+', ' ');
                            binaryData = new Buffer(base64Data, 'base64').toString('binary');


                            fs.writeFile("images/" + req.body.productName + ".image.jpg", binaryData, "binary", function(err) {

                                console.log(err); // writes out file without error, but it's not a valid image
                            });
                        }

                        if (req.body.faceImageURL) {
                            faceImageURL = "http://localhost:8080/images/" + req.body.productName + ".faceImage.jpg";
                            data = req.body.faceImageURL;
                            req.body.faceImageURL = faceImageURL;

                            var base64Data, binaryData;
                            base64Data = data.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "");
                            base64Data += base64Data.replace('+', ' ');
                            binaryData = new Buffer(base64Data, 'base64').toString('binary');


                            fs.writeFile("images/" + req.body.productName + ".faceImage.jpg", binaryData, "binary", function(err) {

                                console.log(err); // writes out file without error, but it's not a valid image
                            });
                        }

                        serviceProviderImageURL = "http://localhost:8080/images/" + req.body.serviceProviderName + ".serviceProviderImage.jpg";
                        req.body.serviceProviderImageURL = serviceProviderImageURL;


                        delete req.body.password;
                        var duplicateObject = JSON.parse(JSON.stringify(req.body));
                        console.log("duplicate")
                        console.log(duplicateObject)


                        Product.update({
                            "productName": req.body.productName
                        }, duplicateObject, {
                            upsert: true
                        }, function(err, data) {
                            if (err) {
                                return next(err)
                            } else {
                                res.json({
                                    "data": "uploaded"
                                })
                            }
                        })
                    } else {
                        res.json({
                            "data": "wrongPassword"
                        })
                    }
                }
            }
        });



    } else {
        res.send("NO");
    }
})

app.post('/api/wechatLogin', limiterGet.middleware({
    innerLimit: 1000,
    outerLimit: 6000,
    headers: false
}), function(req, res, next) {
    console.log(req.body)
    var https = require('https');

    var returnData;
    var options1 = {
        host: 'api.weixin.qq.com',
        port: 443,
        path: '/sns/oauth2/access_token?appid=wxf3055e7413a25932&secret=b7da5fcffd98448a2249ee5aecab90e7&code=' + req.body.code + '&grant_type=authorization_code'
    };

    console.log("start")
    var req1 = https.get(options1, function(res1) {
        console.log('STATUS: ' + res1.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res1.headers));

        // Buffer the body entirely for processing as a whole.
        var bodyChunks1 = [];
        res1.on('data', function(chunk) {
            // You can process streamed parts here...
            bodyChunks1.push(chunk);
        }).on('end', function() {
            var body1 = Buffer.concat(bodyChunks1);
            console.log('BODY: ' + body1);
            console.log(body1.toString('utf8'))
            console.log(JSON.parse(body1.toString('utf8')).refresh_token)
            // ...and/or process the entire body here.
            var options2 = {
                host: 'api.weixin.qq.com',
                port: 443,
                path: '/sns/oauth2/refresh_token?appid=wxf3055e7413a25932&grant_type=refresh_token&refresh_token=' + (JSON.parse(body1.toString('utf8'))).refresh_token
            };
            var req2 = https.get(options2, function(res2) {
                console.log('STATUS: ' + res2.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res2.headers));

                // Buffer the body entirely for processing as a whole.
                var bodyChunks2 = [];
                res2.on('data', function(chunk) {
                    // You can process streamed parts here...
                    bodyChunks2.push(chunk);
                }).on('end', function() {
                    var body2 = Buffer.concat(bodyChunks2);

                    var options3 = {
                        host: 'api.weixin.qq.com',
                        port: 443,
                        path: '/sns/userinfo?access_token=' + (JSON.parse(body2.toString('utf8'))).access_token + '&openid=' + (JSON.parse(body2.toString('utf8'))).openid + '&lang=zh_CN'
                    };
                    var req3 = https.get(options3, function(res3) {
                        console.log('STATUS: ' + res3.statusCode);
                        console.log('HEADERS: ' + JSON.stringify(res3.headers));

                        // Buffer the body entirely for processing as a whole.
                        var bodyChunks3 = [];
                        res3.on('data', function(chunk) {
                            // You can process streamed parts here...
                            bodyChunks3.push(chunk);
                        }).on('end', function() {
                            var body3 = Buffer.concat(bodyChunks3);
                            console.log('BODY3: ' + body3);
                            returnData = JSON.parse(body3.toString('utf8'));
                            console.log("send back response")
                            console.log(returnData)

                            var newUser = {};
                            if (returnData.openid) newUser.username = "wechat" + returnData.openid
                            if (returnData.nickname) newUser.nickname = returnData.nickname
                            if (returnData.sex) newUser.sex = returnData.sex
                            if (returnData.launguage) newUser.launguage = returnData.launguage
                            if (returnData.city) newUser.city = returnData.city
                            if (returnData.province) newUser.province = returnData.province
                            if (returnData.country) newUser.country = returnData.country
                            if (returnData.headimgurl) newUser.headImgURL = returnData.headimgurl
                            newUser.password = "wechat" + Math.random().toString(36).slice(-8)
                            console.log(newUser)

                            User.update({
                                username: newUser.username
                            }, newUser, {
                                upsert: true
                            }, function(err, data2) {
                                if (err) {
                                    return next(err)
                                } else if (data2) {
                                    console.log("inserted")
                                    res.json(newUser);
                                }
                            })

                        })
                    }).on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    })

                })
            }).on('error', function(e) {
                console.log('problem with request: ' + e.message);
            })
        })
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

})

app.post('/api/serviceProviderRegister', limiterGet.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {

    if (req.body.serviceProviderImageURL) {
        var serviceProviderImageURL = "http://localhost:8080/images/" + req.body.serviceProviderName + ".serviceProviderImage.jpg";
        data = req.body.serviceProviderImageURL;
        req.body.serviceProviderImageURL = serviceProviderImageURL;

        var base64Data, binaryData;
        base64Data = data.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "");
        base64Data += base64Data.replace('+', ' ');
        binaryData = new Buffer(base64Data, 'base64').toString('binary');

        if (!fs.existsSync('./images/')) {
            fs.mkdirSync('./images/');
        }

        // if (fs.exists("images/" + req.body.serviceProviderName + ".serviceProviderImage.jpg")) {
        //     fs.unlink("images/" + req.body.serviceProviderName + ".serviceProviderImage.jpg", function (err) {
        //         if (err) throw err;
        //         console.log('successfully deleted ');
        //     });
        // }

        fs.writeFile("images/" + req.body.serviceProviderName + ".serviceProviderImage.jpg", binaryData, "binary", function(err) {
            console.log(err); // writes out file without error, but it's not a valid image
        });
    }

    var duplicateObject = JSON.parse(JSON.stringify(req.body));

    ServiceProvider.update({
        "productName": req.body.serviceProviderName
    }, duplicateObject, {
        upsert: true
    }, function(err, data) {
        if (err) {
            return next(err)
        } else {
            res.json({
                data: "registered"
            });
        }
    })
})

app.post('/api/register', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    if (req.body.username && req.body.nickname && req.body.password) {

        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (data == null) {

                console.log("user name not exist, you can use it: " + req.body.username)
                var token = jwt.encode({
                    username: req.body.username
                }, secretKey)
                console.log(token)

                User.update({
                    username: req.body.username
                }, req.body, {
                    upsert: true
                }, function(err, data2) {
                    if (err) {
                        return next(err)
                    } else if (data2) {
                        console.log("inserted")
                        console.log(data2)
                        res.send(data2)
                    }
                })
            } else {
                res.json({
                    data: "alreadyExist"
                })
            }
        })
    }
})

app.post('/api/login', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    if (req.body.username && req.body.password) {

        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (data == null) {
                res.json({
                    data: "NO2"
                })
            } else {
                if (req.body.password == data.password) {
                    var returnData = JSON.parse(JSON.stringify(data))
                    returnData["data"] = "OK"
                    res.json(returnData)
                } else {
                    res.json({
                        data: "NO"
                    })
                }
            }
        })
    }
})

app.post('/api/serviceProviderLogin', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.serviceProviderName)
    console.log(req.body.password)

    if (req.body.serviceProviderName != undefined && req.body.serviceProviderName != null && req.body.password != null) {

        ServiceProvider.findOne({
            "serviceProviderName": req.body.serviceProviderName
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (data == null) {

                console.log("user name not exist, you can use it: " + req.body.username)

                res.json({
                    data: "notExist"
                })
            } else {
                if (req.body.password == data.password) {
                    res.json({
                        data: "OK"
                    })
                } else {
                    res.json({
                        data: "NO"
                    })
                }
            }
        })
    }
})


app.post('/api/likedProduct', limiterGet.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body)
    if (req.body.username && req.body.password) {
        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (req.body.password == data.password) {
                Product.paginate({
                    _id: {
                        $in: req.body.likedProduct
                    }
                }, {
                    select: 'productName imageURL likedBy serviceProviderName serviceProviderImageURL time',
                    offset: parseInt(req.body.skip),
                    limit: parseInt(req.body.limit)
                }, function(err, products) {
                    if (err) return next(err);
                    console.log(products.docs)
                    res.json(products.docs)
                });

            }
        })
    }
})




app.post('/api/likeProduct', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    console.log(req.body.username)

    console.log(req.body.productName)

    console.log(req.body)

    if (req.body.username && req.body.password) {
        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (req.body.password == data.password) {
                console.log("username exists");
                if (data.likedProduct.indexOf(req.body._id) >= 0) {
                    console.log(data)
                    console.log(data.length)

                    User.update({
                        username: req.body.username
                    }, {
                        $pull: {
                            likedProduct: req.body._id
                        }
                    }, function(err, data) {
                        if (err) {
                            console.log("err");
                            return next(err)
                        } else {
                            console.log(data)
                            console.log(req.body)
                            console.log("1111")
                            Product.update({
                                _id: req.body._id
                            }, {
                                $pull: {
                                    likedBy: req.body.username
                                }
                            }, function(err, data) {
                                console.log("pull out likedProduct")
                                if (err) {
                                    console.log("err")
                                    return next(err)
                                } else {
                                    console.log(data)
                                    res.json({
                                        data: "pull"
                                    });

                                }
                            })
                        }
                    })

                } else {
                    console.log(data.likedProduct.indexOf(req.body._id))
                    User.update({
                        username: req.body.username
                    }, {
                        $addToSet: {
                            likedProduct: req.body._id
                        }
                    }, function(err, data) {
                        if (err) {
                            console.log("err");
                            return next(err)
                        } else {
                            console.log(data)
                            console.log("inserted likedProduct")
                            Product.update({
                                _id: req.body._id
                            }, {
                                $addToSet: {
                                    likedBy: req.body.username
                                }
                            }, function(err, data) {
                                if (err) {
                                    console.log("err")
                                    return next(err)
                                } else {
                                    console.log(data)
                                    res.json({
                                        data: "push"
                                    });

                                }
                            })
                        }
                    })
                }
            } else {
                res.send("Cant find")
            }
        })
    }
})


app.post('/api/purchaseProductCheck', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    if (req.body.username != undefined && req.body.username != null && req.body.password != null) {
        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (req.body.password == data.password) {
                console.log("username exists");
                if (data.purchasedProduct.indexOf(req.body.productName) >= 0) {
                    console.log(data)
                    console.log(data.length)
                    res.json({
                        data: "alreadyPurchased"
                    })
                } else {
                    console.log(data.purchasedProduct.indexOf(req.body.productName))
                    res.json({
                        data: "notPurchased"
                    })
                }
            } else {
                res.send("usernameNotfound")
            }
        })
    }
})

//
// app.post('/api/purchaseProduct', limiterPost.middleware({
//     innerLimit: 10,
//     outerLimit: 60,
//     headers: false
// }), function(req, res, next) {
//     console.log(req.body.username)
//     if (req.body.username != undefined && req.body.username != null && req.body.password != null) {
//         User.findOne({ "username": req.body.username }, function(err, data) {
//             if (err) {
//                 console.log("err");
//                 return next(err)
//             } else if (req.body.password == data.password) {
//                 console.log("username exists");
//                 if (data.purchasedProduct.indexOf(req.body.productName) >= 0) {
//                     console.log(data)
//                     console.log(data.length)
//                     res.json({ data: "alreadyPurchased" })
//                 } else {
//                     console.log(data.purchasedProduct.indexOf(req.body.productName))
//                     User.update({ username: req.body.username }, { $addToSet: { purchasedProduct: req.body.productName } }, function(err, data) {
//                         if (err) {
//                             console.log("err");
//                             return next(err)
//                         } else {
//                             console.log(data)
//                             console.log("inserted purchasedProduct")
//                             Product.update({ name: req.body.productName }, { $addToSet: { purchasedBy: req.body.username } }, function(err, data) {
//                                 if (err) {
//                                     console.log("err")
//                                     return next(err)
//                                 } else {
//                                     console.log(data)
//                                     res.json({ data: "purchaseFinished" });
//
//                                 }
//                             })
//                         }
//                     })
//                 }
//             } else {
//                 res.send("Cant find")
//             }
//         })
//     }
// })


app.post('/api/likeServiceProvider', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    if (req.body.username && req.body.serviceProviderName && req.body.password) {
        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (req.body.password == data.password) {
                console.log("username exists");
                if (data.likedServiceProvider.indexOf(req.body.serviceProviderName) >= 0) {
                    console.log(data)
                    console.log(data.length)

                    User.update({
                        username: req.body.username
                    }, {
                        $pull: {
                            likedServiceProvider: req.body.serviceProviderName
                        }
                    }, function(err, data) {
                        if (err) {
                            console.log("err");
                            return next(err)
                        } else {
                            console.log(data)
                            ServiceProvider.update({
                                serviceProviderName: req.body.serviceProviderName
                            }, {
                                $pull: {
                                    likedBy: req.body.username
                                }
                            }, function(err, data) {
                                console.log("pull out likedServiceProvider")
                                if (err) {
                                    console.log("err")
                                    return next(err)
                                } else {
                                    console.log(data)
                                    res.json({
                                        data: "pull"
                                    });

                                }
                            })
                        }
                    })

                } else {
                    console.log(data.likedServiceProvider.indexOf(req.body.serviceProviderName))
                    User.update({
                        username: req.body.username
                    }, {
                        $addToSet: {
                            likedServiceProvider: req.body.serviceProviderName
                        }
                    }, function(err, data) {
                        if (err) {
                            console.log("err");
                            return next(err)
                        } else {
                            console.log(data)
                            console.log("inserted likedServiceProvider")
                            ServiceProvider.update({
                                serviceProviderName: req.body.serviceProviderName
                            }, {
                                $addToSet: {
                                    likedBy: req.body.username
                                }
                            }, function(err, data) {
                                if (err) {
                                    console.log("err")
                                    return next(err)
                                } else {
                                    console.log(data)
                                    res.json({
                                        data: "push"
                                    });

                                }
                            })
                        }
                    })
                }
            } else {
                res.send("Cant find")
            }
        })
    }
})

// app.post('/api/likeServiceProvider', limiterPost.middleware({
//     innerLimit: 10,
//     outerLimit: 60,
//     headers: false
// }), function(req, res, next) {
//     console.log(req.body.username)
//     if(req.body.username != undefined && req.body.username!=null && req.body.password != null) {
//
//         User.findOne({"username": req.body.username}, function (err, data) {
//             if (err) {
//                 console.log("err");
//                 return next(err)
//             } else if(data == null) {
//
//                 console.log("user name not exist, you can use it: " + req.body.username)
//
//             }else {
//                 if (req.body.password == data.password) {
//
//                     console.log("username exists");
//                     User.update({ username: req.body.username }, { $addToSet: { likedServiceProvider: req.body.productName }}, function (err,data) {
//                             if(err){
//                                 console.log("err");
//                                 return next(err)
//                             }else{
//                                 console.log(data)
//                                 ServiceProvider.update(
//                                     {name:req.body.productName},
//                                     {$addToSet: {likedBy: req.body.username}},function (err,data) {
//                                         if(err){
//                                             console.log("err")
//                                             return next(err)
//                                         }else{
//                                             console.log(data)
//                                             res.send("OK")
//                                         }
//                                     }
//                                 )
//                             }
//                         }
//                     )
//
//
//                 } else {
//                     res.send("NO")
//                 }
//             }
//         })
//     }
// })




app.post('/api/addProductComment', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    if (req.body.username != undefined && req.body.username != null && req.body.password != null) {

        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (data == null) {

                console.log("user name not exist, you can use it: " + req.body.username)
                return ("NO")
            } else {

                insertCommentData = {
                    discussion_id: req.body.discussion_id,
                    parent_id: req.body.parent_id,
                    posted: req.body.posted,
                    username: req.body.username,
                    text: req.body.text,
                    notice: false,
                    rate: req.body.rate
                }

                if (req.body.password == data.password) {

                    console.log("username exists");
                    if (err) {
                        console.log("err");
                        return next(err)
                    } else {
                        console.log(data)
                        Product.update({
                            _id: req.body.discussion_id
                        }, {
                            $push: {
                                comment: {
                                    $each: [insertCommentData],
                                    $position: 0
                                }
                            }
                        }, function(err, data) {
                            if (err) {
                                console.log("err")
                                return next(err)
                            } else {
                                console.log(data)
                                User.update({
                                    username: req.body.username
                                }, {
                                    $push: {
                                        comment: {
                                            discussion_id: req.body.discussion_id,
                                            posted: req.body.posted
                                        }
                                    }
                                }, function(err, data) {
                                    if (err) {
                                        console.log("err")
                                        return next(err)
                                    } else {
                                        console.log(data)
                                        res.send("OK")
                                    }
                                })
                            }
                        })
                    }
                } else {
                    res.send("NO")
                }
            }
        })
    }
})


app.post('/api/addServiceProviderComment', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    console.log(req.body.username)
    if (req.body.username && req.body.password) {

        User.findOne({
            "username": req.body.username
        }, function(err, data) {
            if (err) {
                console.log("err");
                return next(err)
            } else if (data == null) {

                console.log("user name not exist, you can use it: " + req.body.username)
                res.json({
                    data: "NO"
                })
            } else {

                insertCommentData = {
                    discussion_id: req.body.discussion_id,
                    parent_id: req.body.parent_id,
                    posted: req.body.posted,
                    username: req.body.username,
                    text: req.body.text,
                    notice: false,
                    rate: req.body.rate
                }

                if (req.body.password == data.password) {

                    console.log("username exists");
                    if (err) {
                        console.log("err");
                        return next(err)
                    } else {
                        console.log(data)
                        ServiceProvider.update({
                            _id: req.body.discussion_id
                        }, {
                            $push: {
                                comment: {
                                    $each: [insertCommentData],
                                    $position: 0
                                }
                            }
                        }, function(err, data) {
                            if (err) {
                                console.log("err")
                                return next(err)
                            } else {
                                console.log(data)
                                User.update({
                                    username: req.body.username
                                }, {
                                    $push: {
                                        comment: {
                                            discussion_id: req.body.discussion_id,
                                            posted: req.body.posted
                                        }
                                    }
                                }, function(err, data) {
                                    if (err) {
                                        console.log("err")
                                        return next(err)
                                    } else {
                                        console.log(data)
                                        res.json({
                                            data: "OK"
                                        })
                                    }
                                })
                            }
                        })
                    }
                } else {
                    res.json({
                        data: "NO"
                    })
                }
            }
        })
    } else {
        res.json({
            data: "NO"
        })
    }
})


// app.post('/api/login', limiterPost.middleware({
//     innerLimit: 10,
//     outerLimit: 60,
//     headers: false
// }), function(req, res, next) {
//
//     if(req.body.username != null && req.body.password != null) {
//         User.findOne({"username": req.body.username}, function (err, data) {
//             console.log(data);
//             if (err) {
//                 console.log("err");
//                 return next(err)
//             } else {
//                 if (data != null) {
//                     if (req.body.password == data.password) {
//                         res.send("OK")
//                     } else {
//                         res.send("NO")
//                     }
//                 }
//             }
//         })
//     }
// })

app.post('/api/createOffers', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    ServiceProvider.findOne({
        serviceProviderName: req.body.serviceProviderName
    }, function(err, data) {
        console.log(data)
        if (err) {
            return next(err)
        } else {
            if (data == null) {
                res.send("找不到serviceProvider")
            } else {
                console.log("pushed 1 serviceProvider")
                if (req.body.password === data.password) {
                    console.log("password right")
                    console.log(req.body)

                    req.body.event.forEach((element, index) => {
                        var thisOffer
                        //make sure the creatorName is the sendername
                        if (element.action === "put") {
                            console.log("put")
                            thisOffer = new Offer(element)
                            thisOffer.creatorName = req.body.serviceProviderName
                            thisOffer.save().then(function(result) {
                                res.json({
                                    data: "OK"
                                })
                            }).catch(function(err) {
                                console.error("something went wrong");
                            })
                        }　
                        else if (element.action === "delete") {
                            console.log("delete")
                            console.log(element)
                            Offer.remove({
                                _id: element._id
                            }).then(function(result) {
                                res.json({
                                    data: "OK"
                                })
                            }).catch(function(err) {
                                console.error("something went wrong");
                            })
                        }
                    })
                }
            }
        }
    })
})

app.get('/api/createOffers', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    /* category filter exists */
    if (req.query.serviceProviderName) {
        ServiceProvider.findOne({
            serviceProviderName: req.query.serviceProviderName
        }, function(err, data) {
            if (err) {
                return next(err)
            } else {
                if (data == null) {
                    res.send("did not find serviceProvider")
                } else {
                    if (req.query.password === data.password) {
                        console.log("found serviceProvider and return data")
                        Offer.find({
                            serviceProviderName: {
                                $all: [req.query.serviceProviderName]
                            }
                        }, function(err, data) {
                            console.log(data)
                            res.json(data)
                        })

                    } else {
                        Offer.find({
                            serviceProviderName: {
                                $all: [req.query.serviceProviderName]
                            }
                        }, function(err, data) {
                            console.log(data)
                            res.json(data)
                        })
                    }
                }
            }
        })
    }
})


app.post('/api/acceptOffers', limiterPost.middleware({
    innerLimit: 10,
    outerLimit: 60,
    headers: false
}), function(req, res, next) {
    User.findOne({
        username: req.body.username
    }, function(err, data) {
        console.log(data)
        if (err) {
            return next(err)
        } else {
            if (data == null) {
                res.send("cant find username")
            } else {
                console.log("pushed 1 username")
                if (req.body.password === data.password) {
                    console.log("password right")
                    console.log(req.body)

                    req.body.event.forEach((element, index) => {
                        //make sure the creatorName is the sendername
                        if (element.action === "put") {
                            console.log("put")

                            Offer.update({
                                _id: req.body.event._id
                            }, {
                                $push: {
                                    username: req.body.username
                                }
                            })
                        } else if (element.action === "delete") {
                            console.log("delete")
                            Offer.update({
                                _id: req.body.event._id
                            }, {
                                $pull: {
                                    username: req.body.username
                                }
                            })
                        }
                    })
                }
            }
        }
    })
})

app.listen(8080, function() {
    console.log('server listening on', 8080)

    // var options = {keypairId: 'APKAJRBOBPGRJI3TZONQ', privateKeyPath: './pk-APKAJRBOBPGRJI3TZONQ.pem',  expireTime: Date.now() + 6000000}
    // var signedUrl = cf.getSignedUrl('http://d247r75rbkpi3y.cloudfront.net/ios/trump400k_.m3u8', options);
    // console.log('Signed URL: ' + signedUrl);

})
