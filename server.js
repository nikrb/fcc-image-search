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
    const search_text = req.params.search_text;
    if( search_text){
      let url = 'https://pixabay.com/api?key='+process.env.API_KEY+
        "&q="+encodeURIComponent( search_text);
      if( req.query.per_page){
        url = url.concat( "&per_page=", req.query.per_page);
      }
      if( req.query.offset){
        url = url.concat( "&page=", req.query.offset);
      }
      fetch( url)
        .then(response => response.json())
        .then( (json) => {
          const result = json.hits.map( (d) => {
            return { url: d.previewURL, tags: d.tags, page_url: d.pageURL};
          });
          res.send( {url: url, result: result});
          db.collection( 'search_list').insert( { term: search_text, when: new Date()});
        });
    } else {
      res.send( {result: "search text missing"});
    }
  });

  app.get( '/api/latest/imagesearch', (req, res) => {
    db.collection( 'search_list').find().toArray( (err, docs) => {
      const dox = docs.map( d => ({term:d.term, when:d.when}));
      res.send( dox);
    });
  });

  app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
  });
});
