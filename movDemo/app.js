var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var mongoose = require('mongoose')
var _ = require('underscore')
var Movie = require('./models/movie')
var port = process.env.PORT || 3000;
var app = express()

mongoose.connect('mongodb://localhost:27017/my_home',{
    useMongoClient: true
})

app.set('views','./views/pages')
app.set('view engine','jade')
app.use(bodyParser())
app.use(express.static(path.join(__dirname,'bower_components')))
app.locals.moment = require('moment')
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
app.post('/admin/movie/new', function(res, req){
    console.log(req.req.body)
    var id = req.req.body.movie._id
    var movieObj = req.req.body.movie
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