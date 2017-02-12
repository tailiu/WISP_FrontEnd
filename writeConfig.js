var fs = require('fs')

var configuration = {}
configuration.serverAddr = 'localhost'
configuration.serverPort = 8000
configuration.algorithmOnePath = './algorithms/A1.py'
configuration.algorithmTwoPath = './algorithms/A2'

fs.writeFileSync('./configuration', JSON.stringify(configuration))

fs.readFile('./configuration', function (err, data) {
	console.log(data.toString())
})