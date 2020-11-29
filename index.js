var http   = require('http');
var path   = require("path");

const {PeerServer} = require("peer");

var express = require('express');
var app = express();

var httpServer = http.createServer(app);

var LANAccess = "0.0.0.0";
httpServer.listen(8080, LANAccess);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use(express.static('./source'));

const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 3);

var peerServer = PeerServer({
    port: 9000,
    path: '/peerjs',
    generateClientId: customGenerationFunction,
});