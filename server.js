var server = require('http').createServer(handleRequest)
var io = require('socket.io')(server)
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

function transformCoordinatesToPixels(coordinates, callback) {
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
        callback(null, pixels)
    })
}

function algorithmTwo(pixels) {
    var pArr = [13100, 12300, 11500, 2350, 2100]
    var nArr = [900, 1300, 1500, 1700, 1900]

    pixels[0] = _.union(pixels[0], pArr)
    pixels[1] = _.union(pixels[1], nArr)

    return pixels
}

function algorithmOne(pixels) {
    var pArr = [6950, 15050, 23050]
    var nArr = [300, 500, 700]

    pixels[0] = _.union(pixels[0], pArr)
    pixels[1] = _.union(pixels[1], nArr)

    return pixels
}

function callAlgorithm(algorithm, pixels, callback) {
    var results

    switch(algorithm) {
        case 'A1': 
            results = algorithmOne(pixels)
            break

        case 'A2':
            results = algorithmTwo(pixels)
            break
    }

    callback(null, results)
}

function transformPixelsToCoordinates(pixels, callback) {
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
        //Return coordinates in an array: [ [provider coord arr], [new user coordinate arr] ]
        callback(null, allCoordinates)
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
        
        var defaultAlgorithm = 'A1'
        var coordinates = JSON.parse(rawData.coordinates)
        var rawPixels

        //transform coordinates to pixels -> call algorithm -> transform pixels back to coordinates
        async.waterfall([
            function(callback) {
                transformCoordinatesToPixels(coordinates, function(err, results){
                    rawPixels = results.slice()
                    callback(null, defaultAlgorithm, results)
                })
            },
            function(algorithm, pixels, callback) {
                callAlgorithm(algorithm, pixels, callback)
            },
            function(pixels, callback) {
                transformPixelsToCoordinates(pixels, callback)
            }
        ], function (err, coordinates) {
            fs.readFile('bundlejs/plannedNetwork.js', function(err, bundlejs) {
                if (err) throw err

                //Get boundary coordinates from the database
                getBoundaryCoordinates(function(boundary){
                    var processedData = {}
                    processedData.bandwidth = rawData.bandwidth
                    processedData.costs = rawData.costs
                    processedData.coordinates = coordinates
                    processedData.pixels = rawPixels
                    processedData.boundary = boundary
                    
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

//Start the server
server.listen(serverPort, function(){
	console.log("Server is listening on: http://localhost:%s", serverPort)
})

io.on('connection', function (socket) {
    socket.on('callAlgorithm', function(args) {
        async.waterfall([
            function(callback) {
                callAlgorithm(args.algorithm, args.pixels, callback)
            },
            function(pixels, callback) {
                transformPixelsToCoordinates(pixels, callback)
            }
        ], function (err, coordinates) {
            socket.emit('getResults', coordinates)
        })
    })

    socket.on('recalculateNetworkPlan', function(args) {
        var rawPixels

        async.waterfall([
            function(callback) {
                transformCoordinatesToPixels(args.coordinates, function(err, results){
                    rawPixels = results.slice()
                    callback(null, args.algorithm, results)
                })
            },
            function(algorithm, pixels, callback) {
                callAlgorithm(algorithm, pixels, callback)
            },
            function(pixels, callback) {
                transformPixelsToCoordinates(pixels, callback)
            }
        ], function (err, coordinates) {
            var results = {}
            results.pixels = rawPixels
            results.coordinates = coordinates

            socket.emit('newNetworkPlan', results)
        })
    })
})
