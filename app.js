var express = require('express'),http = require('http');
var app = express();
var clients = {};
var jugador;
var palabra;
var server = http.createServer(app);

	app.set('views',__dirname + '/views');
	app.engine('html', require('ejs').renderFile); 
	app.configure(function(){
		app.use(express.static(__dirname));
                //No uso layout en las vistas
                app.set('view options', {
                  layout: false
                });
	});
	app.get('/',function(req,res){
		res.render('index.html');
	});
	server.listen(4000);

//websockets

var io = require('socket.io').listen(server);
//io.set('log level',1); //Lo pongo a nivel uno para evitar demasiados logs ajenos a la aplicación.
var usuariosConectados = {};
/*
app.configure(function(){

	//No uso layout en las vistas
	app.set('view options', {
	  layout: false
	});

	//Indicamos el directorio de acceso publico
    //app.use(express.static('public'));

});

//Marco la ruta de acceso y la vista a mostrar
app.get('/', function(req, res){
    res.render('index.jade', { 
    	pageTitle: 'Pizarra'
    });
});
*/
io.sockets.on('connection',function(socket){
        clients[socket.id] = socket;
	socket.on('enviarNombre', function(dato){
			
			if(usuariosConectados[dato]){  
                            
				socket.emit('errorNombre');	
			}else{
				socket.nombreUsuario = dato;
				usuariosConectados[dato] = socket.nombreUsuario;                               
                                socket.emit('asignarNombreTop',dato);	
			}
                        //NEW si el jugador inicio sesion despues va a ver el jugador que esta dibujando
			if(jugador)
                            {
                                io.sockets.emit('quien',jugador);
                            }
			data = [dato, usuariosConectados];
			io.sockets.emit('dato', data);
			
	});
	
        //función cuando un usuario envíe un mensaje
	socket.on('enviarMensaje', function(mensaje){
		var data = [socket.nombreUsuario, mensaje];		
		io.sockets.emit('nuevoMensaje', data);
                //NEW muestra el modal si no si encuentra conectado el usuario
                if(!data[0])
                    socket.emit('modal', socket.id);
                
	});
        //NEW asigna el jugador
         socket.on('quien',function(e){	
                
                jugador=socket.nombreUsuario;
                //envia a todos el nombre del jugador
		io.sockets.emit('quien',socket.nombreUsuario);
                 //envia un solo mensaje al que le dio "jugar"
                socket.emit('msjJugador',jugador);
                
	});
        //NEW el servidor debe conocer la palabra a dibujar
       socket.on('palabra',function(pal){
		palabra=pal;
	});
        //NEW verifica que la palabra enviada por un jugador sea la misma que dibujan
       socket.on('esPalabra',function(pal){
		if(pal===palabra)
                {
                   //mensaje solo al ganador 
                   socket.emit('ganador',pal);
                   //envia a todos los jugadores quien adivino la palabra
                   datos=new Array(socket.nombreUsuario,pal)
                   io.sockets.emit('nuevoJuego',datos);
                }
                 else
                 {
                     //Mensaje solo al perdedor
                     socket.emit('perdedor',pal);
                 }
	}); 
       //NEW
        /* Cuando un usuario realiza una acción en el cliente,
	   recibos los datos de la acción en concreto y 
	   envío a todos los demás las coordenadas */
        socket.on('startLine',function(e){
		console.log('Dibujando...');
		io.sockets.emit('down',e);
	});

	socket.on('closeLine',function(e){
		console.log('Trazo Terminado');
		io.sockets.emit('up',e);
	});

	socket.on('draw',function(e){
		io.sockets.emit('move',e);
	});

	socket.on('clean',function(){
		console.log('Pizarra Limpia');
		io.sockets.emit('clean',true);
	});
	
     socket.on('disconnect', function(mensaje) {
	//var data = [usuariosConectados, socket.nombreUsuario];
        //NEW si el usuario que se desconecta es el mismo que dibuja se boora el nombre de la vista html
       if(jugador===socket.nombreUsuario)
       {
           io.sockets.emit('borrarJugador');
           console.log('borrarJugador...');
           jugador="";
       }
       //NEW remueve el usuario que se desconecto
       delete usuariosConectados[socket.nombreUsuario];
       var data = [usuariosConectados, socket.nombreUsuario];
	io.sockets.emit('usuarioDesconectado', data);
	
        
   });
		
});
