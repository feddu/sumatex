$(document).ready(function () {

	var urlP = "http://gpsroinet.avanza.pe/mobile_controler/";
	var fechaHora = "";
	var rutaImagenG = "";
	var nombreImagen = "";

	metodoInicializacion();//metodo que inicializa al ejecutar el app

	function metodoInicializacion()
	{
		var altura = $('body').height();
		$('.cuerpo-pagina').css({height:(altura-85)+'px'});
		//$('.cuerpo-pagina').animate({scrollTop: 0});

		llenarCamposLogin();
		document.addEventListener("backbutton", onBackKeyDown, false);//DESACTIVAR BOTON ATRAS
	}

    function onBackKeyDown() {} //que pasa cuando preciona boton atras


	function llenarCamposLogin()
	{
		/*if(localStorage.getItem('usu_gps') != null){
			var usu = localStorage.getItem('mail_gps');
			var pass = localStorage.getItem('clave_gps');
		    login(usu, pass);
		}*/
	}

	$("body").on('click', '#btn_login', function(e){
		var usu = $("#mail").val();
		var pass = $("#clave").val();
		alerta();
		login(usu, pass);
	});

	function login(usu,pas)
	{
		$.ajax({
			type: 'POST',
			dataType: 'json', 
			data: {usu:usu, pas:pas},
			beforeSend : function (){},
			url: urlP+"login",
			success : function(data) 
			{
				alertaOf();
				if(data != 0)
				{
					localStorage.setItem('usu_gps', data.id);
					localStorage.setItem('mail_gps', usu);
					localStorage.setItem('clave_gps', pas);
					$("#id_usu").val(data.id);
					if(data.logo){ $("#cab_logo").html("<img src='"+data.logo+"'>");}
					var nomUsu = data.nombre+' '+data.apellido_paterno;
					$("#usu-nom-cab").html(nomUsu.toUpperCase());
					$.mobile.changePage("#principal", {transition:"slide"});
				}else{
					alert("error: verificar datos");
				}
			},
			error: function(data){
				alertaOf();
				llenarAlertPopup("img/error.png", "¡ERROR DE SISTMA! REINICIAR APLICATIVO", false);
				
				//alert("Verifica tu concexión a internet y vuelve a intentarlo.")
		    }
		});
	}

	$("body").on('click', '#marcar-asistencia', function(e){
		fechaHora = fechaHoraAct();
		/*if( $('input:radio[name=marca]:checked').val() == null) {
			alert("Es necesario seleccionar el tipo");
		}else if ( rutaImagenG == "") {*/
		if ( rutaImagenG == "") {
			alert("Es necesario tomar la foto para marcar la asistencia.");
		}else{
			alerta();
			try
			{
				//navigator.geolocation.getAccurateCurrentPosition(posisionOk, posisionFalla, { desiredAccuracy: 30, maxWait: 15000 });
				navigator.geolocation.getCurrentPosition(posisionOk, posisionFalla, { maximumAge: 3000, timeout: 15000, enableHighAccuracy: true });
			}
			catch(er)
			{
				alert(er)
			}
			
		}
	});

	function posisionOk(position)
	{
		var x = position.coords.latitude;
		var y = position.coords.longitude;
		marcarAsistencia(x,y);
	}

	function posisionFalla(er)
	{	
		//alert("No se puede obtener tu ubicación, por favor procura estar en un lugar despejado al momento de realizar esta operación.");
		alertaOf();
		//llenarAlertPopup("img/error.png", "¡ERROR AL OBTENER UBICACIÓN! VERIFICA EL GPS E INTERNET Y VUELVE A INTENTAR", false);
		alert('code: ' + er.code + '\n' + 'message: ' + er.message + '\n');
	}

	$("body").on('click', '.pie-alerta-popup', function(e){
		$("#alertaPopup").popup("close");
	});

	/*$("body").on('click', '#prueba', function(e){
		$("#alertaPopup").popup("open");
	});*/

	/**-------------------------- INICIO CAMARA---------------------------------*/

	$("body").on('click', '#photo', abrirCamara);

	function abrirCamara()
	{
		var opciones = {
				quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,//url de la imagen 
                //destinationType: Camera.DestinationType.DATA_URL,//retorna imagen base64
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 640,
  				targetHeight: 640
		};

		try{
			navigator.camera.getPicture(camaraOK,camaraError,opciones);
		}
		catch(er)
		{
			//alert("Error : "+ er );
			llenarAlertPopup("img/error.png", "¡PROBLEMAS AL ABRIR LA CAMARA! REINICIAR EL APP", false);
		}
		
	}

	function camaraOK(foto)
	{
		alerta();
        $("#mostrar-img").html("<img src='"+foto+"'>") 
        $("#mostrar-img").css({display: 'inline-block'});//mostramos
        $("#fondo1_foto").css({display: 'none'});//mostramos
        convertImgToDataURLviaCanvas(foto, function(base64Img){
        	alertaOf();
        	rutaImagenG = base64Img;
        	nombreImagen = obtenerNombreFoto(foto);
   	 	});
        
	}

	function obtenerNombreFoto(photo)
	{
		var nom = "";
		try{
			var pos = photo.length-1;
			for (var i = photo.length-1; i >= 0; i--) 
			{
				if(photo.charAt(i) == "/")
				{
					pos = i;
					break;
				}
			}

			var nom = photo.substring(pos+1, photo.length);
		}
		catch(er)
		{
			alert(er)
		}
		
		return nom;
	}

	function camaraError(msj)
	{
		//alert(msj)
	}


	function convertImgToDataURLviaCanvas(url, callback, outputFormat)
	{
	    var img = new Image();
	    img.crossOrigin = 'Anonymous';
	    img.onload = function(){
	        var canvas = document.createElement('CANVAS');
	        var ctx = canvas.getContext('2d');
	        var dataURL;
	        canvas.height = this.height;
	        canvas.width = this.width;
	        ctx.drawImage(this, 0, 0);
	        dataURL = canvas.toDataURL(outputFormat);
	        callback(dataURL);
	        canvas = null; 
	    };
	    img.src = url;
	}

	/*function convertFileToDataURLviaFileReader(url, callback){ //otra opcion de convertir imagen a b64
	    var xhr = new XMLHttpRequest();
	    xhr.responseType = 'blob';
	    xhr.onload = function() {
	        var reader  = new FileReader();
	        reader.onloadend = function () {
	            callback(reader.result);
	        }
	        reader.readAsDataURL(xhr.response);
	    };
	    xhr.open('GET', url);
	    xhr.send();
	}*/
	
	/**--------------------------FIN CAMARA--------------------------*/

	//function marcarAsistencia()
	function marcarAsistencia(x, y)
	{
		try
		{
			var datos = new FormData();
			datos.append("foto", rutaImagenG);
			datos.append("nom_foto", nombreImagen);
			datos.append("usu", $("#id_usu").val());
			datos.append("x", x);
			datos.append("y", y);
			datos.append("fec", fechaHora);
			datos.append("lugar", $("#lugar").val());
			//datos.append("tipo", $('input:radio[name=marca]:checked').val());

			$.ajax({
				type: 'POST',
				dataType: 'json', 
				data: datos,
				processData: false,
				contentType: false,
				beforeSend : function (){},
				url: urlP+"marcarAsistencia_debug",
				success : function(data) 
				{
					limpiarAsistencia();//limpiar datos despues de enviar.
					alertaOf();		

					var objExtra = new Array();
					llenarAlertPopup("img/check.png", "¡REGISTRADO CORRECTAMENTE!", false);
				},
				error: function(data){
					alertaOf();
					llenarAlertPopup("img/error.png", "¡ERROR! POR FAVOR VUELVE A INTENTAR", false);
			    }
			});
		}
		catch(er)
		{
			alertaOf();
			alert(er.message)
		}
	}

	function llenarAlertPopup(logo, mensaje, objExtra)
	{
		var nObj = "";

		if(objExtra)
		{
			for(var i=0 ; i<objExtra.length ; i++)
			{
				nObj += "<div class='sector-infor-ap'>";
                nObj += "<div class='ico-info-ap'></div>";
                nObj += "<div class='texto-izq-info-ap'>"+objExtra[i].campo+"</div>";
                nObj += "<div class='texto-der-info-ap'>"+objExtra[i].valor+"</div>";
                nObj += "</div>";
			}
		}

		$("#logo-ap img").attr("src", logo);
		$("#menasaje-ap").html(mensaje);
		$("#extra-ap").html(nObj);

		$("#alertaPopup").popup("open");
	}

	function limpiarAsistencia()
	{
		$("#lugar").val("");
		$("#mostrar-img").html("");
		$("#mostrar-img").css({display: 'none'});
		$("#fondo1_foto").css({display: 'inline-block'});

		rutaImagenG = "";
		nombreImagen = "";
		fechaHora = "";

		//$("input:radio[name=marca]").removeAttr("checked");
		//$("input:radio[name=marca]").checkboxradio("refresh");
	}

	function alerta()
	{
		$(".loading").css({ display: 'inline-block' });
		$.mobile.showPageLoadingMsg();
	}

	function alertaOf()
	{
		$(".loading").css({ display: 'none' });
		$.mobile.hidePageLoadingMsg();
	}

	function fechaHoraAct()
	{
	    var dt = new Date();
	    var fech = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
	    return fech;
	}

});