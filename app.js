//importar el framework(informacion) de express
var express = require('express');

//importar la libreria mongoose
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var multer = require("multer");
var cloudinary = require("cloudinary");
var app_user = "shamba";
var app_password = "123456";
var method_override = require('method-override');
var Schema = mongoose.Schema;

//heroku salvita484marquez@gmail.com
//marquezz1234
//

//credenciales de cuenta en cloudinary
cloudinary.config({
 cloud_name: "salvita", //12345678
 api_key: "642818835136612",
 api_secret: "e0Up2BG4PfPF-xpfKuBH23wxp68"
});


//creando un servidor para responder las peticiones del usuario, ejecutando express
var app = express();

//conectando la base de datos creada en mongodb
mongoose.connect("mongodb://127.0.0.1/dbEscuela");

//utilizar bodyParser para parsear los parametros que vengan de post
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//con methodOverride sobreescribimos el metodo 'post'
// basado en un parametro _method
app.use(method_override("_method"));


var uploader = multer({dest: "./uploads"});


//definir el esquema(schema) de nuestro personal
var personalSchemaJSON = {
  titulo: String,
  cargo: String,
  imageUrl: String,
  otros: String
};

var personalSchema = new Schema(personalSchemaJSON);
personalSchema.virtual("image.url").get(function(){
  if(this.imageUrl === "" || this.imageUrl === "data.png") {
    return "Teachers.png";
  }
  return this.imageUrl;
});

//generar el modelo del esquema 'personal'
var Personal = mongoose.model("Personal", personalSchema);

//motor de las vistas-->jade
app.set("view engine", "jade");

app.use(express.static("public"));

//Recibiendo peticiones desde '/' con el metodo get //***  *****//
app.get("/", function(solicitud, respuesta) {
 //renderisando la vista 'index'
  respuesta.render("index");
});

app.get("/personal", function(solicitud, respuesta) {
 //Buscar los datos(personal) que esta en la base de datos
 //con la queries 'find' buscamos todo lo que esta en el modelo 'Personal'
 //la variable documento recibe todos los datos de la consulta
 Personal.find(function(error,documento){
   if (error){ console.log(error); }
   respuesta.render("personal/mostrarPers",{ listaPersonal: documento})

 });
});

app.post("/admin/adminPers", function(solicitud,respuesta){
  if(solicitud.body.password == app_password && solicitud.body.usuario == app_user){
    //'documento' seria la 'tabla' de la db
    Personal.find(function(error,documento){
      if (error){ console.log(error); }
      respuesta.render("admin/adminPers",{ tablaPersonal: documento})
    });
  }else{
    respuesta.redirect("/admin/iniciar");
  }
});
//function(req,res)<-parametros, es un colback
//actualizando productos
var middleware_upload = uploader.single('imagen');
app.put('/personal/:id', middleware_upload, function(solicitud,respuesta){

  if(solicitud.body.password == app_password){
    //actualizando un 'personal'
    //data=objeto JASON
    var data = {
        titulo: solicitud.body.titulo,
        cargo: solicitud.body.cargo,
        otros: solicitud.body.otros
      };
      if (solicitud.file) {
        //subiendo imagen a cloudinary
        cloudinary.uploader.upload(solicitud.file.path, function(result) {
        //result es donde se encuentra nuestra imagen
        data.imageUrl = result.url;
        //queries 'update' para actualizar un nuevo personal
        Personal.update({"_id": solicitud.params.id},data,function(){
          respuesta.redirect("/personal");
          });
    });
    }else{
      Personal.update({"_id": solicitud.params.id},data,function(){
        respuesta.redirect("/personal");
      });
    }

    }else{
      respuesta.redirect("/admin/iniciar");
    }
});
//mostrar el formulario para editar los productos
app.get("/personal/editar/:id", function(solicitud,respuesta){
  //rescatamos de la solicitud el parametro id
  var id_personal = solicitud.params.id;

  //haciendo la queries respectiva a la base de datos dbEscuela
  Personal.findOne({_id: id_personal},function(error,documento){
    console.log(documento);
    //con JASON({personal: documento}) mostramos los datos
    //que queremos que se envien a la vista editar
   respuesta.render("personal/editar",{personal: documento});

  });
});


//mostrar el formulario para eliminar los productos
app.get("/personal/eliminar/:id", function(solicitud, respuesta){
  var id = solicitud.params.id;

  Personal.findOne({"_id": id}, function(error, documento){
    respuesta.render("personal/eliminar", { personal: documento });
  });

});
//eliminando productos
var middleware_upload = uploader.single('imagen');
app.delete("/personal/:id", middleware_upload, function(solicitud,respuesta){
  var id = solicitud.params.id;
  if(solicitud.body.password == app_password){
    //eliminando un 'personal'
    //data=objeto JASON
    Personal.remove({"_id": id},function(error){
      if(error){console.log(error); }
      respuesta.redirect("/personal")
    });


    }else{
      respuesta.redirect("/personal");
    }

});

app.get("/admin/adminPers", function(solicitud,respuesta){
  respuesta.render("admin/adminPers");
});

app.get("/admin/iniciar", function(solicitud,respuesta){
  respuesta.render("admin/iniciar");
});

app.get("/institucional", function(solicitud,respuesta){
  respuesta.render("institucional");
});
app.get("/eventos/mostrarEvent", function(solicitud,respuesta){
  respuesta.render("eventos/mostrarEvent");
});

app.get("/contacto", function(solicitud, respuesta) {
 //renderisando la vista 'contacto'
respuesta.render("contacto")
});

app.get("/inicio", function(solicitud, respuesta) {
 //renderisando la vista 'inicio'
respuesta.render("inicio")
});

app.get("/index", function(solicitud, respuesta) {
 //renderisando la vista 'index'
respuesta.render("index")
});


//agregando nuevo personal
var middleware_upload = uploader.single('imagen');
app.post("/personal",middleware_upload, function(solicitud,respuesta){

  if(solicitud.body.password == app_password){
    //creando un nuevo 'personal'
    //data=objeto JASON
    var data = {
        titulo: solicitud.body.titulo,
        cargo: solicitud.body.cargo,
        imageUrl: "data.png",
        otros: solicitud.body.otros
        }

      var personal = new Personal(data);
      if (solicitud.file) {

      //subiendo imagen a cloudinary
      cloudinary.uploader.upload(solicitud.file.path, function(result) {
      //result es donde se encuentra nuestra imagen
      personal.imageUrl = result.url;
      //queries 'save' para guardar un nuevo personal
      personal.save(function(err) {
      console.log(personal);
      respuesta.redirect("/personal");
    });
  });
} else{
  //queries 'save' para guardar un nuevo personal aunque no tenga imagen
  personal.save(function(err) {
  console.log(personal);
  respuesta.redirect("/personal");
});
}
} else{
    respuesta.redirect("/personal/new")
  }
});

//definir ruta a traves de la cual se van a administra el personal
app.get("/personal/new",function(solicitud, respuesta){
  respuesta.render("personal/new")
  });

app.get("/personal/mostrarPers",function(solicitud, respuesta){
  respuesta.render("personal/mostrarPers")
  });


//especificar la llamada al puerto
app.listen(8080);
