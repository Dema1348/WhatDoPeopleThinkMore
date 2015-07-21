var express= require('express');
var app= express();
var server= require('http').createServer(app);
var twitter= require('twitter');
var io= require('socket.io').listen(server);
server.listen(3000);



app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname+'/index.html');

});

var t = new twitter({
		consumer_key:"7JY08Y6e2uEquf0Y0HZlwOdPW",
		consumer_secret:"xmyDChsUmg6yITWdpeBlyuKWPt393tg4AM7ZkjgvA6QRhGTZXm",
		access_token_key:"2727370027-GnZlVv7zTBF1lss6d5qnAp4Zw1D2CoH1a7uLTcV",
		access_token_secret:"GooOHANIZ0i5hTu9jDuhxh669MC53128lncaYJIT9ebbj"
	});


io.sockets.on('connection',function(socket){
	socket.on('consulta', function(valores){
		console.log('Consulta: '+valores.valor1+' '+valores.valor2);
		t.stream('statuses/filter',{ track: [valores.valor1.toLowerCase(),valores.valor2.toLowerCase()]}, function(stream){

			stream.on('data', function(data){
					console.log(data);
					var text=data.text.toLowerCase();
					var tipoValor=-1;
					if(text.indexOf(valores.valor2)!==-1){
						valores.b++;
						valores.total++;
						tipoValor=1;
					}

					if(text.indexOf(valores.valor1)!==-1){
						valores.a++;
						valores.total++;
						tipoValor=0;
					}

					socket.volatile.emit('tweet',{
					user: data.user.screen_name,
					text: data.text,
					img: data.user.profile_image_url,
					bvalor: (valores.b/valores.total)*100,
					avalor: (valores.a/valores.total)*100,
					tipo: tipoValor
				});

			
				
						
			});

			socket.on('cerrar', function(data){
					 estado= data.close;
					 if(estado){	
					 setTimeout(stream.destroy, 0);
					}
				});	

				socket.on('disconnect',function(){
					setTimeout(stream.destroy,0);
					console.log('connection lost or close');

				});	

		});
		


	});



});