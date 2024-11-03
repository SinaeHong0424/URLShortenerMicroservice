require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
let urlDatabase = [];
let id = 1;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint for shortening URLs
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const urlRegex = new RegExp('^(http|https)://', 'i');

  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = originalUrl.replace(/^(http|https):\/\//, '').split('/')[0];
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    urlDatabase.push({ original_url: originalUrl, short_url: id });
    res.json({ original_url: originalUrl, short_url: id });
    id++;
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = parseInt(req.params.shortUrl);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
