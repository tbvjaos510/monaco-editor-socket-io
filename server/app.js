var express = require('express')
var app = express()
var server = require('http').createServer(app)
var path = require('path')
var io = require('socket.io')(server) //import socket.io

var editorSocket = require('./socket/socket-editor')(io, '/main');
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', function(req, res){
    res.sendFile('index.html')
})

server.listen(80, function(){
    console.log('server On 80 port')
})