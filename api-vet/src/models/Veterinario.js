import {Schema, model} from 'mongoose' // De mongoose me traigo schema y modelo
import bcrypt from 'bcryptjs' // Encriptación de modelos de pago<?
 
// Crea un VetSchema a partir del new Schema

const veterinarioSchema = new Schema({
    nombre:{
        type:String,
        required: true,
        trim: true // guarda sin espacios en blanco adelante y atrás, solo deja el texto
    },
    apellido:{
        type:String,
        required: true,
        trim: true
    },
    direccion:{
        type: String,
        trim: true,
        default: null
    },
    celular:{
        type: String,
        trim: true,
        default:null
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    status:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:null
    },
    confirmEmail:{
        type:Boolean,
        default:false
    },
    rol:{
        type:String,
        default:"veterinario"
    }
},{
    timestamps: true
}) 

// Métodos .create, find, count. 

// Métodos propios:

// Método para cifrar el password

veterinarioSchema.methods.encryptPassword = async function(password){ // De nuestro veterinario schema, agrega un metodo llamado encryptPassword, crea una función declarada
    const salt = await bcrypt.genSalt(10) // de la libreria bcrypt
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// recibe el password, entra en juego el algoritmo de encriptacion (bcrypt)

// Método para verificar si el password es el mismo de la BDD
veterinarioSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}

// Método para crear un token 
veterinarioSchema.methods.createToken= function(){
    const tokenGenerado = Math.random().toString(36).slice(2)
    this.token = tokenGenerado
    return tokenGenerado
}

export default model('Veterinario', veterinarioSchema)