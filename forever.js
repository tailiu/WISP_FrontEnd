var forever = require('forever-monitor');
var fs = require('fs')

const configFilePath = './configuration'

fs.readFile(configFilePath, function (err, data) {
	var configData = JSON.parse(data.toString())
	var logFilePath = configData.logFile
	var outFilePath = configData.outFile
	var errFile = configData.errFile

	var child = new (forever.Monitor)('server.js', {
		minUptime: 1000,    
	    spinSleepTime: 500,
	    logFile: logFilePath, 	// Path to log output from forever process (when daemonized)
	    outFile: outFilePath, 	// Path to log output from child stdout
	    errFile: errFile 		// Path to log output from child stderr
	})

	child.on('restart', function() {
	    console.error('Forever restarting script for ' + child.times + ' time')
	})

	child.on('exit', function () {
		console.log('Server exits')
	})

	child.start()
})

