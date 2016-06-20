var Server = require('socket.io');

var server = null;

function getSocketServer(){

    if(server == null){
        server = new Server(5011);
    }

    return server;

}


module.exports = {
    getSocketServer:getSocketServer
};