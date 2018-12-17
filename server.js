var net = require('net');
var fs = require('fs');
require('fileTest.js');
var clients = [];
var clientCount = 0;

var server = net.createServer(function(socket) {
	socket.name = socket.remoteAddress + ":" + socket.remotePort 
	let clientName;
	let clientInput = [];
	
	socket.write("\x0C");
	socket.write("choisir un pseudo : ");

	socket.on('data', function (data) {
		clientInput+=data.toString();
		let iSep = clientInput.search('\x13');
		if(iSep>-1 &&  iSep+1<clientInput.length){
			if(clientInput.charCodeAt(iSep+1) == 72){ // suite
				effaceLigne(socket);
				clientInput = clientInput.substring(0,iSep);
				if(!clientName){
					if( clients[clientInput] ){
					  socket.write(' - Pseudo pris, en choisir un autre\r\n')
					  clientInput = [];
					  return;
					} else {
					  clientName = clientInput;
					  clientCount++;
					  clients[clientInput] = socket;
					  socket.write(`- Welcome. Il y a ${clientCount} utilisateurs\r\n`);
					  broadcast(`- ${clientName} nous a rejoint\r\n`);
					  clientInput = [];
					}
				} else { 
					broadcast(`> ${clientName} : ${clientInput}\r\n`,socket);
					clientInput = [];
				}
			}
			else{
				clientInput = clientInput.substring(0,iSep);
				process.stdout.write(`fonction SEP inopérante pour client ${clientName}\r\n`);
			}
		}
		else{
			socket.write(data); // echo local
		}
	});

	socket.on('end', function () {
		if(clientName){
			delete clients[clientName];
			clientCount--;
			broadcast(`- ${clientName} nous quitte\r\n Utilisateurs : ${clientCount}\r\n`);
		}
	});

    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});
server.listen(4545);

function broadcast(msg, sender) {
	for( let client in clients ){
      if( clients[client] !== sender ){
        clients[client].write(msg);
      }
    }
	process.stdout.write(msg)
}
	
function envoiVdt(nom,_socket){
	fs.readFile('./vdt/'+nom+'.vdt', function(err, data) {
		_socket.write(data);
	});
}

function effaceLigne(_socket){
	_socket.write('\x0D');
	_socket.write(' ');
	_socket.write(String.fromCharCode(18));
	_socket.write(String.fromCharCode(38+64));
	_socket.write('\x0D');
}