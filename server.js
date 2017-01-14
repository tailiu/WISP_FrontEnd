var http = require('http')
var fs = require('fs')
var qs = require('querystring')
var ejs = require('ejs')

//Fixed port server listens to
const PORT=8080;

//Add script tags
function preprocessBundle(str) {
    return '<script>' + str + '</script>'
}

//Dynamic data
function preprocessVar(obj) {
    return '<script> data = ' + JSON.stringify(obj) + '</script>'
}

//Handle the Homapage
function handleHomePage(req, res) {
	fs.readFile('bundlejs/index.js', function(err, bundlejs) {
        if (err) throw err

        //Render the index.ejs file with bundled script file
        var data = {}

        data.bundlejs = preprocessBundle(bundlejs)
        data.variable = preprocessVar(null)

        ejs.renderFile('index.html', data, null, function(err, str){
            res.end(str)
        })
    })
}

//Handle other pages
function handleReferencedFile(req, res) {
    var fileName = req.url.slice(1)

    fs.readFile(fileName, function(err, data) {
        if (err) {
            res.end('File Not Found!!')
        }
        res.end(data)
    })
}

//Handle network planning request
function handleNetworkPlanRequest(req, res) {
    var body = ''

    req.on('data', function(rawData){
        body += rawData
    })

    req.on('end', function(){
        var rawData = qs.parse(body)
        
        fs.readFile('bundlejs/plannedNetwork.js', function(err, bundlejs) {
            if (err) throw err

            //Render the index.ejs file with bundled script file
            var data = {}

            data.bundlejs = preprocessBundle(bundlejs)
            data.variable = preprocessVar(rawData)

            ejs.renderFile('index.html', data, null, function(err, str){
                res.end(str)
            })
        })
    })
}

//Handle unknown requests
function handleDefault(req, res) {
    res.end('Page Not Found!')
}

//A function which handles requests and send a response
function handleRequest(req, res) {
	var path = req.url

    console.log(path)
    
    switch(path) {
    	case '/':
    		handleHomePage(req, res)
    		break

        case '/mapjs/index.js':
        case '/mapjs/plannedNetwork.js':
        case '/styles/css/index.css':
        case '/styles/images/provider.jpg':
        case '/styles/images/newUser.jpg':
            handleReferencedFile(req, res)
            break

        case '/submitNetworkRawData':
            handleNetworkPlanRequest(req, res)
            break

    	default:
    		handleDefault(req, res)
    }    
}

//Create a server
var server = http.createServer(handleRequest)

//Start the server
server.listen(PORT, function(){
	console.log("Server is listening on: http://localhost:%s", PORT)
});