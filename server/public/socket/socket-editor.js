var conId = 1 // Connection Id (auto increment)
var colors = [  
    '#DDFFAA',
    '#95E0C8',
    '#E18060',
    '#FFCBA4'
] //highlight colors.
var users = {}  //user datas
/**
 * 
 * @param {SocketIO.Server} io 
 * @param {String} nsp 
 */
module.exports = function (io, nsp){
    var server = io.of(nsp)
    server.on("connection", function (socket){
        users[socket.id] = {}
        
        users[socket.id].user = socket.user = "user" + conId    //set username
        users[socket.id].admin = socket.admin = false            //set admin
        users[socket.id].color = socket.color = colors[conId % colors.length] //set highight colors
        

        conId++
        console.log('[Socket.IO] ['+ nsp +'] : disConnect ' + socket.id)
        if (io.sockets.length == 1){
            socket.emit('admin')
            socket.admin = true
            // import file data from database
            // socket.emit('resetdata', data)
        }
        socket.emit('userdata', Object.values(users))   //send User data
        socket.broadcast.emit('connected', {name : socket.user, color : socket.color})

        socket.on('selection', function (data) {
            data.color = socket.color
            data.name = socket.name
            socket.broadcast.emit('selection', data)
        }) 
        socket.on('filedata', function(data){
            socket.broadcast.emit('resetdata', data)
        })      
        socket.on('disconnect', function (data) {
            console.log('[Socket.IO] ['+ nsp +'] : disConnect ' + socket.id)
            socket.broadcast.emit("exit", users[socket.id].name)
            delete users[socket.id]
        })
        socket.on('key', function (data) {
            data.name = socket.name
            socket.broadcast.emit('key', data)
        })
    })

    return server
}