var cluster = require('cluster')
var numCPUs = require('os').cpus().length

function startServer() {
    cluster.setupMaster({
        exec: 'server.js',
        silent: false
    })
    var server = cluster.fork()

    console.log('Server %d started', server.process.pid)
}

for (let i = 0; i < numCPUs; i++) {
    startServer()
}

cluster.on('exit', (worker, code, signal) => {
    console.log('Server %d died', worker.process.pid)
})
