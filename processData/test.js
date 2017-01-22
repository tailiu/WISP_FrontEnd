var db = require('rethinkdb')
var fs = require('fs')

function processRawData(rawData) {
    var processedData = []

    var lines = rawData.split('\n')
    for (var i = 0; i < lines.length - 1 ;i++) {
        var obj = {}
        var entry = lines[i]
        var coordinate = entry.split(' ')

        obj.pixel = parseInt(coordinate[2])
        obj.lat = parseFloat(coordinate[1])
        obj.lng = parseFloat(coordinate[0])

        processedData[i] = {
            pixel: obj.pixel,
            location: db.point(obj.lng, obj.lat)
        }

    }

    return processedData
}

function storeInDB(data) {
    db.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
        if(err) throw err
        

        // db.db('test').tableDrop('testGeo').run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })

        // db.db('test').tableCreate('testGeo').run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })

        // var processedData = {
        //     index : 1,
        //     location: {
        //         x: 'good',
        //         y: 'hhhhhh'
        //     }
        // }

        // db.db('test').table('testGeo').insert(processedData).run(conn, function(err, res){
        //     console.log(res)
        // })

        db.db('test').table('testGeo').filter(function(geo) {
            return geo("location")("x").eq('jjjj')
        }).run(conn, function(err, cursor){
                cursor.toArray(function(err, result) {
                if (err) throw err;
                console.log(JSON.stringify(result));
            });
        })
        
    })
}


fs.readFile('../data/locations_N38W123_200_200.txt', function(err, data){
    if(err) throw err

    storeInDB(data)
})
