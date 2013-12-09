    var nombre;    
    var arrayNames = {};    
    var websocket = io.connect('http://localhost:4000');  
   
    var nombreFace;
    //cronometro
     var t;
 
    $(document).on("ready",iniciar);
    /* 
     * To change this template, choose Tools | Templates
     * and open the template in the editor.
     */
    //NEW facebook autenticacion
     window.fbAsyncInit = function() {
      FB.init({
        appId      : 'App_Id',   
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
      });
      
    

      
      // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
      // for any authentication related change, such as login, logout or session refresh. This means that
      // whenever someone who was previously logged out tries to log in again, the correct case below 
      // will be handled. 
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        // Here we specify what we do with the response anytime this event occurs. 

        if (response.status === 'connected') {
          // The response object is returned with a status field that lets the app know the current
          // login status of the person. In this case, we're handling the situation where they 
          // have logged in to the app.

          testAPI();
        } else if (response.status === 'not_authorized') {
          // In this case, the person is logged into Facebook, but not into the app, so we call
          // FB.login() to prompt them to do so. 
          // In real-life usage, you wouldn't want to immediately prompt someone to login 
          // like this, for two reasons:
          // (1) JavaScript created popup windows are blocked by most browsers unless they 
          // result from direct interaction from people using the app (such as a mouse click)
          // (2) it is a bad experience to be continually prompted to login upon page load.
           FB.login(function(response) {
       // handle the response
       $('#actModal').modal('hide');
        var nombre=response.name+"";
        nombreFace = nombre;
        $('#nombre').html(nombre);
        //enviarNombresFace(nombre);
        console.log("notA");
     });
          //console.log(response.status);
        } else {
          // In this case, the person is not logged into Facebook, so we call the login() 
          // function to prompt them to do so. Note that at this stage there is no indication
          // of whether they are logged into the app. If they aren't then they'll see the Login
          // dialog right after they log in to Facebook. 
          // The same caveats as above apply to the FB.login() call here.

          //cuando el usuario se desconecta de facebook
           FB.login();
           console.log("out");
          $('#nombre').html("");
          $('#iniciar').css("display","block");
        }

      });

      };

      // Load the SDK asynchronously
      (function(d){
       var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement('script'); js.id = id; js.async = true;
       js.src = "//connect.facebook.net/en_US/all.js";
       ref.parentNode.insertBefore(js, ref);
      }(document));

      // Here we run a very simple test of the Graph API after login is successful. 
      // This testAPI() function is only called in those cases. 
      function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log('Good to see you, ' + response.name + '.');
          //console.log(response);
        $('#actModal').modal('hide');

        $('#iniciar').css("display","none");
        $('#logout').css("display","block");

        var nombre=response.name+"";
        nombreFace=nombre;
        $('#nombre').html(nombre);
        $('#logoutNormal').css("display","none");
        enviarNombresFace(nombre);
       
        });
      }

      //END FB 
    function iniciar()
    {

            //Esperamos a que se cargue el dom para iniciar la aplicación canvs
            canvasApp();
             
            $('#adivinar').prop('disabled', true);
            $("#body").css({height:screen.height,width:screen.width});
            var pantallas = [$("#setNombre")];

            $('#formNombre').on('submit', function(e){
                    e.preventDefault();

                    var bandera = 0;
                    var nombreUsu = $('#name').val();

                    for(var i = 0; i < arrayNames.length; i++){

                            if(nombreUsu == arrayNames[i]){
                                    bandera = 1;	
                            }
                    }
                    if(bandera == 0){
                            enviarNombres();	
                    }else{
                            alert("El nombre de usuario ya existe");	
                    }
            });

            $('#formMsg').on('submit', function(e){
                    e.preventDefault();

                    enviarMensaje();		
            });
            $('#users').show();

            //Manejar las funciones que vienen del servidor

            websocket.on('dato', procesarUsuario);
            websocket.on('nuevoMensaje', procesarNuevoMensaje);	
            websocket.on('errorNombre', nomUsuarioRepetido);
            websocket.on('usuarioDesconectado', usuariosDesconectados);	
            websocket.on('modal', mostrarModal);	
            websocket.on('quien', quien);		
            websocket.on('msjJugador', msjJugador);	
            websocket.on('ganador', ganador);		
            websocket.on('perdedor', perdedor);		
            websocket.on('nuevoJuego', nuevoJuego);	
            websocket.on('borrarJugador', borrarJugador);
            websocket.on('asignarNombreTop', asignarNombreTop);
           		
    }
    
    function enviarNombres(){

            nombre = $('#name').val();
            $('#actModal').modal('hide');	

            websocket.emit('enviarNombre', nombre);

    }
    function asignarNombreTop(nombre)
    {
        $('#nombre').html(nombre);
        $('#sesion').hide();                    
        $('#iniciar').html('<a href="#" id="salir"></a>'); 
        $('#logoutNormal').html('<a>logout</a>');
    }
    function salir(){
        //log out de un usuario normal No un usuariofacebook
        location.reload(true);
    }
    //NEW envia los nombres de los que se loguearon en face al chat
    function enviarNombresFace(nombref){

            //console.log(nombref);	
            websocket.emit('enviarNombre', nombref);

    }

    function enviarMensaje(){

            var mje = $('#msg').val();	
            websocket.emit('enviarMensaje', mje);	
            mje = $('#msg').val(' ');	
    }

    

    function procesarNuevoMensaje(data){ 

             if(data[0] == null){                 
                //NEW se comentario porque estaba mostrando el modal a todos los usuarios,  
                //$('#actModal').modal('show');
            }else{		
                    $('#chatInsite').append($('<p>').html("<span>" + data[0] + " Dice: </span>" + data[1]));
                    $('#chat').animate({scrollTop: $('#chatInsite').height()}, 800);	
            }
    }
   
    function mostrarModal(data)
    {
         $('#actModal').modal('show');
         console.log(data);
         
    }
    function nomUsuarioRepetido(){	
        //NEW cuando se refresca la pagina se pierda la conexion con el WS pero no con FB, esto me dice por consola, que sigue conectado al face.
        if( nombreFace )
            {
                console.log("Esta conectado en face" + nombreFace);
            }
        else {     

            alert("El nombre de usuario ya existe");
            location.reload(true);	
            
        }
        
             //alert("El nombre de usuario ya existe");
            //location.reload(true);
    }
    function procesarUsuario(dato){
        //NEW para no reescribir los usuarios
             $('#users').html(""); 
             
            for(i in dato[1]){
                    $('#users').append($('<p>').text(dato[1][i]));
                    arrayNames[i] = dato[1][i];	
                    //NEW
                    //$('#sesion').hide();
                    //console.log(dato[1][i]);
                    //$('#iniciar').html('<a href="#">Logout</a>');                 
                   
                   
                   //NEW si el usuario de FACE se conecto cambia el top solo a el
                   if(dato[0]===nombreFace){
                       $('#iniciar').html('<a href="#"></a>');
                       $('#logout').html('<a>logout</a>');
                   }
                   
            }
            
    }
    
    function usuariosDesconectados(mensaje){
        /*
            for(i in mensaje[1]){

                    $('#users').append($('<p>').text(mensaje[0][i]));
                    $('#chatInsite').append($('<p>').html("<span>El usuario: " +[i] + " se a desconectado"));
                    arrayNames[i] = mensaje[0][i];
                    console.log(mensaje);
                    
            }	
        */
       
       //NEW - solo muestra el nombre del usuario que se desconecto     
            
            if(mensaje[1])
            $('#chatInsite').append($('<p>').html("<span>El usuario: " +mensaje[1]+ " se a desconectado"));

    }
    //NEW el evento al hacer click en logearse con face 
    function logoutface()
            {
                location.reload(true);
                FB.logout();
                $('#logout').css("display","none"); 
                $('#iniciar').css("display","block");                       
                 // location.reload(true);
                 //console.log(FB);
            }
     //NEW muestra lo que debe dibujar
     function Getpalabra()
     {
         var palabras= new Array("Gato","Perro","Casa","isla","Computador","Celular","Carro");
         var num= Math.floor(Math.random()*6);
         return palabras[num];
     }
     function quien(data)
     {         
         //envia a todos los navegadores el nombre de la persona que va a dibujar      
         $("#jugador").html(data);
         //si el jugador inicio sesion empieza el cronometro
         if(data)
             {
                 time();
             }
         //activa el boton adivinar
         $('#adivinar').prop('disabled', false);
     }
     function msjJugador(data)
     {
          if(!data)
             alert("Debe iniciar sesion para jugar");
         else{
             
             var palabra=Getpalabra();
             //manda la palabra al servidor
             websocket.emit('palabra',palabra.toLowerCase());
             alert("La palabra a Dibujar es: "+palabra);
             
         }
     }
     function jugar()
     {        
        //le pregunta al servidor el nombre del jugador 
        websocket.emit('quien');       
        
     }
     function time()
     {
         var i=0;       
         
               var contador = function (){
                        if(i==30){
                            //para el juego
                            clearInterval(t);
                            alert("EL TIEMPO TERMINO");
                        }
                        $("#time").html(i);
                        i++;
                       
                 }
         t= setInterval(contador, 1000);
     }
     function modalAdivinar()
     {
         
         $("#modal-adivinar").modal('show');
     }
     function adivinar()
     {
         var palabra= $("#palabra").val();
         websocket.emit("esPalabra",palabra.toLowerCase());
     }
     function ganador()
     {
         alert("Felicitaciones, ha adivinado la palabra");
         $("#modal-adivinar").modal('hide');
         
     }
     function perdedor()
     {
         
         alert("Fallaste, sigue intentandolo");
         $("#modal-adivinar").modal('hide');
     }
     function nuevoJuego(data)
     {
         alert("El usuario "+data[0]+" Ha adivinado la palabra "+data[1]);
         //para el tiempo si adivinaron la palabra
         clearInterval(t);
          $("#time").html("0");
     }
     function borrarJugador()
     {
         $("#jugador").html("");
     }
    //Comprobamos mediante la librería moderniz que el navegador soporta canvas
    function canvasSupport(){

            return Modernizr.canvas;

    }

    //NEW Aquí se engloba todo lo relacionado con la aplicación canvas.
    function canvasApp() {

            //Si el navegador soporta canvas inicio la app.
            if(canvasSupport()){

                    var theCanvas = document.getElementById("canvas"),
                            context = theCanvas.getContext("2d"),
                            buttonClean = document.getElementById("clean");
                            //socket = io.connect('/');

                    init();

            }

            function init(){

                    //Dibujo la pizarra sin nada en su interior.
                    clean();

                    var click = false, //Cambia a true si el usuario esta pintando
                            block = false; //Cambia a true si hay otro usuario pintando

                    /* Las variables click y block funcionan de forma que cuando un usuario esta dibujando, 
                    los demás deben esperar a que este termine el trazo para poder dibujar ellos */

                    function clean(){
                            context.fillStyle = "green";
                            context.fillRect(0,0,theCanvas.width,theCanvas.height);
                    }

                    //Se inicia al trazo en las coordenadas indicadas.
                    function startLine(e){
                            context.beginPath();
                            context.strokeStyle = "#fff";
                            context.lineCap = "round";
                            context.lineWidth = 5;
                            context.moveTo(e.clientX - theCanvas.offsetLeft, e.clientY - theCanvas.offsetTop);
                    }

                    //Se termina el trazo.
                    function closeLine(e){
                            context.closePath();
                    }

                    //Dibujamos el trazo recibiendo la posición actual del ratón.
                    function draw(e){

                            context.lineTo(e.clientX - theCanvas.offsetLeft, e.clientY - theCanvas.offsetTop);
                            context.stroke();

                    }

                    //Usamos la librería socket.io para comunicarnos con el servidor mediante websockets
                    websocket.on('connect', function(){

                            //Al darle click al botón limpiar enviamos orden de devolver la pizarra a su estado inicial.
                    	
                        buttonClean.addEventListener("click",function(){

                                    if(!block){
                                            websocket.emit('clean',true);
                                    }

                            },false);
    
                            //Al clickar en la pizarra enviamos el punto de inicio del trazo
                            theCanvas.addEventListener("mousedown",function(e){

                                    if(!block){

                                            websocket.emit('startLine',{clientX : e.clientX, clientY : e.clientY});
                                            click = true;
                                            startLine(e);
                                    }

                            },false);

                            //Al soltar el click (dentro o fuera del canvas) enviamos orden de terminar el trazo
                            window.addEventListener("mouseup",function(e){

                                    if(!block){
                                            websocket.emit('closeLine',{clientX : e.clientX, clientY : e.clientY});
                                            click = false;
                                            closeLine(e);
                                    }

                            },false);

                            //Al mover el ratón mientras esta clickado enviamos coordenadas donde continuar el trazo.
                            theCanvas.addEventListener("mousemove",function(e){

                                    if(click){
                                            if(!block){
                                                    websocket.emit('draw',{clientX : e.clientX, clientY : e.clientY});
                                                    draw(e);
                                            }
                                    }

                            },false);


                            //Recibimos mediante websockets las ordenes de dibujo

                            websocket.on('down',function(e){
                                    if(!click){
                                            block = true;
                                            startLine(e);
                                    }
                            });

                            websocket.on('up',function(e){
                                    if(!click){
                                            block = false;
                                            closeLine(e);
                                    }
                            });

                            websocket.on('move',function(e){
                                    if(block){
                                            draw(e);
                                    }
                            });

                            websocket.on('clean',clean);

                    });

            }


    }
