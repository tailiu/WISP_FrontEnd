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
        
        //var processedData = processRawData(data.toString())

        // db.db('networkPlanningTool').tableCreate('geo').run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })

        // db.db('networkPlanningTool').tableDrop('geo').run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })

        // db.db('networkPlanningTool').table('geo').insert(processedData).run(conn, function(err, res){
        //     console.log(res)
        // })

        // db.db('networkPlanningTool').table('geo').indexCreate('location', {geo: true}).run(conn, function(err, res){
        //     console.log(res)
        // })

        // var secretBase = db.point(-122.89981484413147, 38.950865400919994);

        // db.db('networkPlanningTool').table('geo').getNearest(secretBase, {index: 'location', maxResults: 1}).run(conn, function(err, res) {
        //     console.log(res[0].doc.pixel)
        // })

        db.db('networkPlanningTool').table('geo').filter({
            pixel: 30584
            }).run(conn, function(err, cursor){
                cursor.toArray(function(err, result) {
                if (err) throw err;
                console.log(JSON.stringify(result));
                console.log(result[0].location.coordinates[0])
            });
        })

        // db.db('networkPlanningTool').table('geo').filter(function(geo) {
        //     return geo("location").eq(db.point(-122.846542, 38.873306))
        // }).run(conn, function(err, cursor){
        //     cursor.toArray(function(err, result) {
        //         if (err) throw err;
        //         console.log(JSON.stringify(result));
        //     });
        // })

        
    })
}


fs.readFile('../data/locations_N38W123_200_200.txt', function(err, data){
    if(err) throw err

    storeInDB(data)
})
