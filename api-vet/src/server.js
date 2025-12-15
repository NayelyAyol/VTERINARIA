// Requerir módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import cloudinary from 'cloudinary'
import fileUpload from 'express-fileupload'


// Importar la ruta de los veterinarios
import routerVeterinarios from './routers/veterinario_route.js';
import routerPaciente from './routers/paciente_route.js'
// Inicializaciones
const app = express()
dotenv.config()


// Configuraciones extras
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Middlewares 
app.use(express.json())
app.use(cors()) // comunicacion backend y frontend
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}))


// Variables globales
app.set('port',process.env.PORT || 3000)  // Se usa caundo no tiene deatos sencibles- 
// permite cargar la variable que esta en el archivo .env   process.env.PORT



// Rutas 
// Ruta principal
app.get('/',(req,res)=> res.send("Server on"))  //Al inicializar el server me va a enviar un mensaje
// Ruta dos VETERINARIOS
app.use('/api',routerVeterinarios)
// Ruta para PACIENTES
app.use('/api', routerPaciente)

// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))



// Exportar la instancia de express por medio de app
export default  app