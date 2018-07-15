var conId = 1 // Connection Id (auto increment, start at 1) - 현재 연결된 클라이언트의 개수 (1부터 시작)
var colors = [  
    '#DDFFAA',
    '#95E0C8',
    '#E18060',
    '#FFCBA4'
] //highlight colors. - 하이라이트 색깔들. 필요에따라 추가 또는 수정
var users = {}  //user datas - 현재 연결된 유저의 수
/**
 * 
 * @param {SocketIO.Server} io SocketIO Server
 * @param {String} nsp NameSpace
 */
module.exports = function (io, nsp){
    var server = io.of(nsp) //Set Namespace - 네임스페이스 설정
    server.on("connection", function (socket){
        users[socket.id] = {}   //Create Users - 유저를 생성함
        
        users[socket.id].user = socket.user = "user" + conId    //set username - 이름 설정
        users[socket.id].admin = socket.admin = false            //set admin - 처음 연결한 사람(주인) 여부
        users[socket.id].color = socket.color = colors[conId % colors.length] //set highight colors - 하이라이트 색
        

        conId++ //UserId increment - 연결된 사람을 1 더한다
        console.log('[Socket.IO] ['+ nsp +'] : Connect ' + socket.id) //print connect - 연결됐다고 알림
        if (server.sockets.length == 1){    //if First Connect Client - 처음 연결 여부 (server.sockets는 연결된 클라이언트들이다.)
            socket.emit('admin')    //alert Admin - 주인이라고 알려줌
            socket.admin = true
            // import file data from database - 여기서 파일 내용을 들고옴. (DB또는 다른 곳))
            // socket.emit('resetdata', data) - 들고온 파일의 내용을 socket.emit으로 보냄
        }
        else
            socket.emit('userdata', Object.values(users))   //send Connected User data - 새로 연결한 사람에게 기존에 연결된 사람을 알려줌
        socket.broadcast.emit('connected', {user : socket.user, color : socket.color}) //Alert New Connect - 기존에 연결된 사람에게 새로 연결된 사람을 알려줌

        socket.on('selection', function (data) {       //Content Select Or Cursor Change Event
            data.color = socket.color
            data.user = socket.user
            socket.broadcast.emit('selection', data) 
        }) 
        socket.on('filedata', function(data){   //File Data Event - 파일 내용을 알려주면
            socket.broadcast.emit('resetdata', data)    //Give File Data - 다른 사람에게 전함
        })      
        socket.on('disconnect', function (data) {   //Client Disconnected
            console.log('[Socket.IO] ['+ nsp +'] : disConnect ' + socket.id) //print disconnect
            socket.broadcast.emit("exit", users[socket.id].user)    //Alert Exit Connect
            delete users[socket.id] //delete from Server
        })
        socket.on('key', function (data) {      //Change Content Event
            data.user = socket.user
            socket.broadcast.emit('key', data)
        })
    })
    return server
}