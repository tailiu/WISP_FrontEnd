var db = require('rethinkdb')
var fs = require('fs')

function processRawData(rawData) {
    var processedData = []

    var lines = rawData.split('\n')
    for (var i = 0; i < lines.length - 1 ;i++) {
        var obj = {}
        var entry = lines[i]
        var coordinate = entry.split(' ')

        obj.lat = parseFloat(coordinate[1])
        obj.lng = parseFloat(coordinate[0])

        processedData[i] = obj
    }

    return processedData
}

function storeInDB(data) {
    db.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
        if(err) throw err
        
        // db.dbList().run(conn, function(err, list){
        //     console.log(list)
        // })

        // db.dbDrop('test').run(conn, function(err, list){
        //     console.log(list)
        // })

        // db.dbCreate('networkPlanningTool').run(conn, function(err, list){
        //     console.log(list)
        // })

        // db.db('networkPlanningTool').tableList().run(conn, function(err, list){
        //     console.log(list)
        // })

        // db.db('networkPlanningTool').tableCreate('boundary').run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })

        // db.db('networkPlanningTool').tableDrop('boundary').run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })

        // var arr = []
        // data = {
        //     lat : 11,
        //     lng: 12
        // }

        // arr[0] = data
        

        db.db('networkPlanningTool').table('boundary').run(conn, function(err, cursor) {
            if (err) throw err;
            cursor.toArray(function(err, result) {
                if (err) throw err;
                console.log(JSON.stringify(result));
            });
        });

        // db.db('networkPlanningTool').table('boundary').insert(data).run(conn, function(err, res) {
        //     if(err) throw err
        //     console.log(res)
        // })
    })
}


fs.readFile('../data/boundary_N38W123_200_200.txt', function(err, data){
    if(err) throw err

    var processedData = processRawData(data.toString())

    storeInDB(processedData)
})
