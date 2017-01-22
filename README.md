/components :React components<br />
/bundlejs: bundle the React components to the files in this folder<br />
/mapjs: javascript files dealing with map specific elements and events<br />
/styles: marker images and css files<br />
/data: coordinates and pixels<br />
/processData: process data in advance<br />
/rethinkdb_data: some temporary rethink database file<br />
index.html: html template<br />
server.js: server file<br />


React components are written in ES6 and JSX, so run ```npm run build``` to automatically transform them<br />

Run ```node server.js``` to start the server which listens on the port 8080 at localhost<br />