var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    engines = require('consolidate'),
    MongoClient = require('mongodb'),
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }))

// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error', { error: err });
}

var url = 'mongodb://localhost:27017/video';

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('Successfully connected to mongo server');

  app.get('/', function(req, res, next) {
    res.render('movies', {});
  });

  app.post('/movies', function(req, res, next) {
    var title = req.body.title;
    var year = req.body.year;
    var imdb = req.body.imdb;

    if ( (title == '') || (year == '') || (imdb == '') ) {
      next('Please fill in the fields.')
    } else {
      db.collection('movies').insertOne(
        {'title': title, 'year': year, 'imdb': imdb},
        function (err, r) {
          assert.equal(null, err);
          res.send('Document inserted with _id: ' + r.insertedId);
        }
      );
    }
  });

  app.get('/logger', function(req, res) {
    db.collection('movies').find({}).toArray(function(err, docs) {
      res.render('logger', {'logger': docs});
    });
  });

});

app.use(errorHandler);

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log('Server is up!! At port %s!', port);
});
