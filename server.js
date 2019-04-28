//dependencies
var express = require("express");
var mongojs = require("mongojs");
var handlebars = require("express-handlebars");
var mongoose = require("mongoose");
var axios = ("axios");
var cheerio = ("cheerio")
var logger = ("morgan");

//express initialization
var app = express();

//db config
var db = require ("./models");

var PORT = 3000;

//error log
db.on("error", function(error) {
    console.log("Database Error:", error);
  });

app.use(logger("dev"));

//parse requests with JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

//static folder
app.use(express.static("public"));

//connect to Mongo
mongoose.connect ("mongodb://localhost/")

//routes

app.get("/scrape", function (req, res){
    axios.get("https://news.google.com/").then(function(response){
        var $ = cheerio.load(response.data);
        //h2 for articles
        $("article h2").each(function(i, element){
           //empty result
            var result = {};

            //add text and href
            result.title = $(this)
            .children("a")
            .text();
            result.link = $(this)
            .children("a")
            .attr("href");

        //create articles w/result obj
        db.Article.create(result)
        .then(function(dbArticle){
            console.log(dbArticle);
        })
        .catch(function(err){
            console.log(err);
        });
        });
        res.send("Scrape Complete");
    });
});

//route for grabbing 
app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id })
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body)
        .then(function(dbNote){
    return db.Article.findOneAndUpdate({_id: req.params.id }, { note: dbNote._id }, { new: true});     
})


.then(function(dbArticle){
    res.json(dbArticle); 
})

    .catch(function(err){
        res.json(dbArticle);
    })

    .catch(function(err){
        res.json(err);
    });
    });

    //start the server
    app.listen(PORT, function(){
        console.log("I'm listening on port " + PORT + " . ")
    });
