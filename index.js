'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var formidable = require('formidable');

var port = process.env.PORT || 8080;

http.createServer(function(req, res) {
  if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname,'uploads');
    form.keepExtensions = true;
    form.maxFieldsSize = 50 * 1024 * 1024;
    form.multiples = false;

    form.parse(req, function (err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      Object.keys(files).forEach(function (field) {
        var file = files[field];
        if (field !== 'archive') {
          fs.unlinkSync(file.path);
          return;
        }
        var filepath = file.path.match(/\/([^/]+)$/);
        if (filepath) {
          res.write(file.name + ': http://' + req.headers.host +
                    '/' + filepath[1]);
        }
      });
      res.end();
    });

    return;
  }

  if (req.url !== '/' &&
      ['get','head'].indexOf(req.method.toLowerCase()) !== -1) {
    var filePath = path.join(__dirname, 'uploads', req.url.substr(1));
    fs.exists(filePath, function (exists) {
      if (!exists) {
        res.writeHead(404);
        res.end();
        return;
      }
      var stat = fs.statSync(filePath);

      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size
      });
      var readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="archive"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'+
    '<br />'+
    'or use the following command:<br />'+
    'curl -X POST http://' + req.headers.host + '/upload -F archive=@file.tgz'
  );
}).listen(port);

