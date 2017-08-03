require('dotenv').config();
const fetch = require( 'node-fetch');
const express = require('express');
const mongo = require('mongodb');
const app = express();

mongo.connect( 'mongodb://localhost:27017/imgs', ( err, db) => {
  if( err){
    throw new Error( "mongo connect failed");
  } else {
    console.log( "connected to db");
  }

  app.set('port', (process.env.PORT || 8080));
  app.use('/', express.static(process.cwd() + '/public'));

  app.get( '/', (req,res) => {
    res.sendFile( process.cwd() + '/public/index.html');
  });

  app.get( '/api/imagesearch/:search_text', (req, res) => {
    res.send( {result: req.query, text: req.params.search_text});
    // fetch( 'https://pixabay.com/api?key='+process.env.API_KEY+'&per_page=3')
    // 	.then(res => res.json())
    // 	.then(json => console.log(json));

  });

  app.get( '/api/latest', (req, res) => {
    db.collection( 'search_list').find().toArray( (err, docs) => {
      res.send( docs);
    });
  });

  app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
  });
});
