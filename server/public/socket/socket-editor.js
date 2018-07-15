var conId = 1;

/**
 * 
 * @param {SocketIO.Server} io 
 * @param {String} nsp 
 */
module.exports = function (io, nsp){
    var server = io.of(nsp);
    server.on("connection", function (socket){
        socket.user = "user" + conId++;
        
    })
}