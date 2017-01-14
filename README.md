/components :React components
/bundlejs: bundle the React components to the files in this folder
/mapjs: javascript files dealing with map specific elements and events
index.html: html template
server.js: server file


React components are written in ES6 and JSX, so run ```npm run build``` to transform them first to ES5 and then store the transformed files in the bundlejs folder.  
Run ```node server.js``` to start the server which listens on the port 8080 at localhost. 