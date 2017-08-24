var express = require('express')
var bodyParser = require('body-parser')// 解析表单
var path = require('path')
var mongoose = require('mongoose')
var _ = require('underscore')
var Movie = require('./models/movie')
var User = require('./models/user')
var port = process.env.PORT || 4567;
var app = express()

mongoose.Promise = require('bluebird');// mongoose 需要用到的promise需外部引入


mongoose.connect('mongodb://localhost:27017/my_home',{
    useMongoClient: true
})

app.set('views','./views/pages')// 设置模板路径
app.set('view engine','jade')// 设置模板引擎
app.use(bodyParser.urlencoded({ extended: false }))  
// parse application/json  
app.use(bodyParser.json())  
app.use(express.static(path.join(__dirname,'public')))
app.locals.moment = require('moment')// 引用本地库,作为全局变量
app.listen(port)

console.log('hahaha')
app.get('/',function(req,res){
    Movie.fetch(function(err, movies){
        if(err) {
            console.log(err)
        }
        res.render('index', {
            title: '首页',
            movies: movies
        })
    })
})
// signup
app.post('/user/signup', function(req, res){
    var _user = req.body
    console.log(_user)
    var user = new User(_user)
    
    user.save(function(err, user){
        if (err) {
            console.log(err)
        }
        console.log(user)
    })
})

app.get('/movie/:id',function(req,res){
    var id = req.params.id

    Movie.findById(id, function(err, movie){
        res.render('movies', {
            title: '详情',
            movie: movie
        })
    })

})
app.get('/admin/movie',function(req,res){
    res.render('admin',{
        title: '后台录入页',
        movie: [
            {
                flash: '',
                doctor: '',
                country: '',
                title: '',

            },
        ]
    })
})

//admin update movie
app.get('/admin/update/:id', function(req,res){
    var id = req.params.id
    if(id) {
        Movie.findById(id, function(err, movie){
           res.render('admin',{
               title: '后台更新页',
               movie: movie
           }) 
        })
    }
})
// admin post movie
app.post('/admin/movie/new', function(res, req){// 操作数据库的路由
   // console.log(req.req)
    var id = req.req.body._id
    var movieObj = req.req.body
    var _movie

    if(id !== 'undefined') {
        Movie.findById(id, function(err, movie){
            if(err) {
                console.log(err)
            }

            _movie = _.extend(movie, movieObj)
            _movie.save(function(err, movie){
                if(err) {
                    console.log(err)
                }

                res.res.redirect('/movie/' + movie._id)
            })
        })
    }else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            poster: movieObj.poster,
            flash: movieObj.flash 
        })

        _movie.save(function(err, movie){
            if(err) {
                console.log(err)
            }

            res.res.redirect('/movie/' + movie._id)
        })
    }
})


app.get('/admin/list',function(req,res){
    Movie.fetch(function(err, movies){
        if(err) {
            console.log(err)
        }
        res.render('list', {
            title: '列表页',
            movies: movies
        })
    })
})

// list delete movie
app.delete('/admin/list', function(req, res){
    var id = req.query.id

    if(id) {
        Movie.remove({_id: id}, function(err, movie) {
            if(err) {
                console.log(err)
            }
            else {
                res.json({success: 1})
            }
        })
    }
})