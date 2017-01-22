var http = require('http')
var fs = require('fs')
var qs = require('querystring')
var ejs = require('ejs')
var r = require('rethinkdb')
var async = require('async')
var _ = require('underscore')

//Fixed port server listens to
const serverPort = 8000
const dbPort = 28015
const host = 'localhost'

//Add script tags
function preprocessBundle(str) {
    return '<script>' + str + '</script>'
}

//Dynamic data
function preprocessVar(obj) {
    return '<script> data = ' + JSON.stringify(obj) + '</script>'
}

//Get the boundary marker coordinates from the database
function getBoundaryCoordinates(callback) {
    r.connect({ host: host, port: dbPort }, function(err, conn) {
        if(err) throw err

        r.db('networkPlanningTool').table('boundary').without('id').run(conn, function(err, cursor) {
            if (err) throw err
            
            cursor.toArray(function(err, result) {
                if (err) throw err

                callback(result)
            })
        })
    })
}

//Handle the Homapage
function handleHomePage(req, res) {
	fs.readFile('bundlejs/index.js', function(err, bundlejs) {
        if (err) throw err

        getBoundaryCoordinates(function(boundary){

            //Render the index.ejs file with bundled script file
            var data = {}

            data.bundlejs = preprocessBundle(bundlejs)
            data.variable = preprocessVar(boundary)

            ejs.renderFile('index.html', data, null, function(err, str){
                res.end(str)
            })
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

//Transform one coordinate to one pixel, using rethinkdb k-Nearest Neighbors algorithm
function getOnePixelByOneCoordinate(coordinate, pixels, callback) {
    r.connect({ host: host, port: dbPort }, function(err, conn) {
        if(err) throw err

        var markerCooridinate = r.point(coordinate.lng, coordinate.lat);

        r.db('networkPlanningTool').table('geo').getNearest(markerCooridinate, {index: 'location', maxResults: 1}).run(conn, function(err, nearestPoint) {
            
            pixels.push(nearestPoint[0].doc.pixel)

            callback(null, pixels)
        })
    })
}

function getPixelsByCoordinates(coordinates, callback) {
    var length = coordinates.length
    var pixels = []

    async.whilst(
        function () { return length > 0 },

        function (callback) {
            --length
            getOnePixelByOneCoordinate(coordinates[length], pixels, callback)
        },

        function (err, pixelArr) {
            callback(pixelArr)
        }
    )
}

function getOneCoordinateByOnePixel(pixel, coordinates, callback) {
    r.connect({ host: host, port: dbPort }, function(err, conn) {
        if(err) throw err

        r.db('networkPlanningTool').table('geo').filter({

            pixel: pixel

            }).run(conn, function(err, cursor){
                cursor.toArray(function(err, result) {
                if (err) throw err;

                var coordinate = result[0].location.coordinates
                var coordinateObj = {}
                coordinateObj.lng = coordinate[0]
                coordinateObj.lat = coordinate[1]

                coordinates.push(coordinateObj)

                callback(null, coordinates) 
            })
        })
    })
}

function getCoordinatesByPixels(pixels, callback) {
    var length = pixels.length
    var coordinates = []

    async.whilst(
        function () { return length > 0 },

        function (callback) {
            --length
            getOneCoordinateByOnePixel(pixels[length], coordinates, callback)
        },

        function (err, coordinateArr) {
            callback(coordinateArr)
        }
    )
}

//As the back end is not determined, we just use a faked algorithm here
function fakedAlgorithm(data, callback) {
    console.log('\n************ Coordinates and Parameters *******************')
    console.log(data)
    console.log('*****************************************\n')

    var coordinates = JSON.parse(data.coordinates)

    async.parallel([
        function(callback) {
            getPixelsByCoordinates(coordinates.provider, function(providerPixels) {
                callback(null, providerPixels);
            })
        },
        function(callback) {
            getPixelsByCoordinates(coordinates.newUser, function(newUserPixels) {
                callback(null, newUserPixels);
            })
        }
    ],
    function(err, pixels) {
        console.log('\n************ Transformed Pixels *******************')
        console.log('Provider Pixels: ' + JSON.stringify(pixels[0]))
        console.log('New User Pixels: ' + JSON.stringify(pixels[1]))
        console.log('*****************************************\n')

        var randomProviderPixels = _.random(0, 39999)
        var randomNewUserPixels = _.random(0, 39999)

        console.log('\n************ New Pixels Returned by Faked Algorithm *******************')
        console.log('A Randomly Generated Provider Pixel: ' + randomProviderPixels)
        console.log('A Randomly Generated New User Pixel: ' + randomNewUserPixels)
        console.log('*****************************************\n')

        pixels[0].push(randomProviderPixels)
        pixels[1].push(randomNewUserPixels)

        async.parallel([
            function(callback) {
                getCoordinatesByPixels(pixels[0], function(providerCoordinates) {
                    callback(null, providerCoordinates);
                })
            },
            function(callback) {
                getCoordinatesByPixels(pixels[1], function(newUserCoordinates) {
                    callback(null, newUserCoordinates);
                })
            }
        ],
        function(err, allCoordinates) {
            console.log('\n************ The Coordinates to Be Rendered on the Map *******************')
            console.log('Provider Coordinates: ' + JSON.stringify(allCoordinates[0]))
            console.log('New User Coordinates: ' + JSON.stringify(allCoordinates[1]))
            console.log('*****************************************\n')

            //Return coordinates in an array: [ [provider coord arr], [new user coordinate arr] ]
            callback(allCoordinates)
        })
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

            //A faked algorithm
            fakedAlgorithm(rawData, function(coordinates){

                //Get boundary coordinates from the database
                getBoundaryCoordinates(function(boundary){
                    var processedData = {}
                    processedData.bandwidth = rawData.bandwidth
                    processedData.costs = rawData.costs
                    processedData.coordinates = {}
                    processedData.coordinates.provider = coordinates[0]
                    processedData.coordinates.newUser = coordinates[1]
                    processedData.coordinates = JSON.stringify(processedData.coordinates)
                    processedData.boundary = JSON.stringify(boundary)

                    //Render the index.ejs file with bundled script file
                    var data = {}

                    data.bundlejs = preprocessBundle(bundlejs)
                    data.variable = preprocessVar(processedData)

                    ejs.renderFile('index.html', data, null, function(err, str){
                        res.end(str)
                    })
                })
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

    //console.log(path)
    
    switch(path) {
    	case '/':
    		handleHomePage(req, res)
    		break

        case '/mapjs/index.js':
        case '/mapjs/plannedNetwork.js':
        case '/styles/css/index.css':
        case '/styles/images/provider.jpg':
        case '/styles/images/newUser.jpg':
        case '/styles/images/boundary.jpg':
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
server.listen(serverPort, function(){
	console.log("Server is listening on: http://localhost:%s", serverPort)
})