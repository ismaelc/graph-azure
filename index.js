var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({
	limit: '50mb'
})); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
})); // to support URL-encoded bodies

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.render('pages/index');
});

app.get('/graphCallback', function(request, response) {

	console.log("Code: " + request.query.code);
	getToken(request.query.code, function(err, data) {

		body_response = data;
		console.log(data);
		response.send('Yo');
		
	});
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

/*
grant_type=authorization_code
&redirect_uri=<uri>
&client_id=<id>
&client_secret=<secret_key>
&code=<code>
&resource=https%3A%2F%2Fgraph.microsoft.com%2F
*/

function getToken(code, callback) {

	var querystring = require('querystring');
	var https = require('https');

	var data = querystring.stringify({
		'grant_type': 'authorization_code',
		'redirect_uri': process.env.HOST_URL + '/graphCallback',
		'client_id': process.env.AZURE_AD_CLIENT_ID,
		'client_secret': process.env.AZURE_AD_CLIENT_SECRET,
		'code': code,
		'resource': 'https://graph.microsoft.com/'
	});

	var options = {
		host: 'login.microsoftonline.com',
		port: 443,
		path: '/common/oauth2/token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data)
		}
	};
	
	var full;

	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			//callback(null, "body: " + chunk);
			full += chunk;
			
		});
		
		res.on('end', function() {
			callback(null, full);
		})

	});

	//req.write(data);
	req.end(data);

}
