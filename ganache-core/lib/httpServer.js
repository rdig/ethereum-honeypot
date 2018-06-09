var http = require("http");
var honeyLogger = require('../../logger');

module.exports = function (provider, logger) {
  var server = http.createServer(function (request, response) {

    var headers = request.headers;
    var method = request.method;
    var url = request.url;
    var body = [];

    request.on('error', function (err) {
      // console.error(err);
    }).on('data', function (chunk) {
      body.push(chunk);
    }).on('end', function () {
      body = Buffer.concat(body).toString();
      // At this point, we have the headers, method, url and body, and can now
      // do whatever we need to in order to respond to this request.

      var headers = {
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      };

      switch (method) {
        case "OPTIONS":
          headers[ "Content-Type" ] = "text/plain"
          response.writeHead(200, headers);
          response.end("");
          break;
        case "POST":
          //console.log("Request coming in:", body);

          const loggerObject = {
            request,
          };

          var payload;
          try {
            payload = JSON.parse(body);
          } catch (e) {
            headers[ "Content-Type" ] = "text/plain";
            response.writeHead(400, headers);
            response.end("400 Bad Request");
            return;
          }

          // Log messages that come into the TestRPC via http
          if (payload instanceof Array) {
            // Batch request
            for (var i = 0; i < payload.length; i++) {
              var item = payload[ i ];
              logger.log(item.method);
              loggerObject.payload = item;
            }
          } else {
            logger.log(payload.method);
            loggerObject.payload = payload;
          }

          provider.send(payload, function (err, result) {
            const responseResult = JSON.stringify(result);
            headers[ "Content-Type" ] = "application/json";
            response.writeHead(200, headers);
            response.end(responseResult);
            loggerObject.response = responseResult;
            honeyLogger(loggerObject);
          });

          break;
        default:
          response.writeHead(400, {
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Content-Type": "text/plain"
          });
          response.end("400 Bad Request");
          break;
      }
    });
  });

  server.ganacheProvider = provider;
  return server;
};
