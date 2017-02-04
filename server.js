var server = require('http').createServer(handleRequest)
var io = require('socket.io')(server)
var fs = require('fs')
var qs = require('querystring')
var ejs = require('ejs')
var r = require('rethinkdb')
var async = require('async')
var _ = require('underscore')
var childProcess = require('child_process')

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

function algorithmOne(input, callback) {
    var path = './algorithms/A1.py'

    console.log('**************** Input ******************')
    console.dir(input, 2)
    console.log('**********************************')
    console.log()

    childProcess.execFile('python', [path, JSON.stringify(input)], function(error, output, stderr){
        if (error) {
            throw error
        }
        
        console.log('**************** Output ******************')
        console.log(output)
        console.log('**********************************')

        callback(null, JSON.parse(output))
    })
}

function algorithmTwo(input, callback) {
    var path = './algorithms/A2'

    console.log('**************** Input ******************')
    console.dir(input, 2)
    console.log('**********************************')
    console.log()

    childProcess.execFile(path, [JSON.stringify(input)], function(error, output, stderr){
        if (error) {
            throw error
        }
        
        console.log('**************** Output ******************')
        console.log(output)
        console.log('**********************************')

        callback(null, JSON.parse(output))
    })
}

function callAlgorithm(algorithm, input, callback) {
    switch(algorithm) {
        case 'A1': 
            algorithmOne(input, callback)
            break

        case 'A2':
            algorithmTwo(input, callback)
            break
    }
}

function collectPixelsFromOutput(output) {
    var pixels = []
    var nodes = output.nodes

    for (var i in nodes) {
        pixels.push(nodes[i].node)
    }

    return pixels
}

function replacePixelsWithCoordinates(output, coordinates) {
    var nodes = output.nodes
    var edges = output.edges
    var index = coordinates.length - 1

    for (var i in nodes) {
        var pixel = nodes[i].node

        for (var j in edges) {
            if (edges[j].nodes[0] == pixel) {
                edges[j].nodes[0] = coordinates[index - i]
            }
            if (edges[j].nodes[1] == pixel) {
                edges[j].nodes[1] = coordinates[index - i]
            }
        }

        nodes[i].node = coordinates[index - i]

    }
}

function transformPixelsToCoordinates(output, callback) {
    var pixels = collectPixelsFromOutput(output)

    getCoordinatesByPixels(pixels, function(coordinates) {
        
        replacePixelsWithCoordinates(output, coordinates)

        callback(null, output)
    })
}

function packageAlgorithmInput(data, pixels) {
    data.coordinates = {}
    data.coordinates.providers = pixels[0]
    data.coordinates.newUsers = pixels[1]

    return data   
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
        var input

        //transform coordinates to pixels -> call algorithm -> transform pixels back to coordinates
        async.waterfall([
            function(callback) {
                transformCoordinatesToPixels(coordinates, function(err, results){
                    callback(null, defaultAlgorithm, results)
                })
            },
            function(algorithm, pixels, callback) {
                input = packageAlgorithmInput(rawData, pixels)

                callAlgorithm(algorithm, input, callback)
            },
            function(output, callback) {
                transformPixelsToCoordinates(output, callback)
            }
        ], function (err, output) {
            fs.readFile('bundlejs/plannedNetwork.js', function(err, bundlejs) {
                if (err) throw err

                //Get boundary coordinates from the database
                getBoundaryCoordinates(function(boundary){
                    var processedData = {}
                    processedData.result = output
                    processedData.input = input
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
                callAlgorithm(args.algorithm, args.input, callback)
            },
            function(output, callback) {
                transformPixelsToCoordinates(output, callback)
            }
        ], function (err, output) {
            socket.emit('getResults', output)
        })
    })
})
