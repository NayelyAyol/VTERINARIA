import jwt from "jsonwebtoken" //importacion de la libreria
import Veterinario from "../models/Veterinario.js" //Importacion del modelo
import Paciente from "../models/Paciente.js" //Importacion del modelo

/**
 * Crear token JWT
 * @param {string} id - ID del usuario
 * @param {string} rol - Rol del usuario
 * @returns {string} token - JWT
 */

//Middleware crear token y verificar ese token
//reques lo que le llega, response la respuesta y next continue

//Funcion para crear token
const crearTokenJWT = (id, rol) => {
    //recibe el id y el rol
    //Cuando deseo que expire
    //Se encripta el id y el rol
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" })
}


//Funcion para verficar token
const verificarTokenJWT = async (req, res, next) => {

    //en las cabezeras se envia una variable denominada autorization
	const { authorization } = req.headers
    //401 token para falla en el token
    if (!authorization) return res.status(401).json({ msg: "Acceso denegado: token no proporcionado" })
    try {
        //token ABC123
        //Se divide con split, se crea un arreglo y se obtiene solo la parte del codigo
        //Solo una parte del codigo
        const token = authorization.split(" ")[1]
        //Desestructurar el id y el rol 
        //Token ABC123 
        //Busca si hace match para poder continuar
        const { id, rol } = jwt.verify(token,process.env.JWT_SECRET)
        if (rol === "veterinario") {
            //se realiza una consulta con findById
            //lean devuelve objetos json 
            //select sirve para FILTRAR, en este caso es no estraer la contraseña
            const veterinarioBDD = await Veterinario.findById(id).lean().select("-password")
            //
            if (!veterinarioBDD) return res.status(401).json({ msg: "Usuario no encontrado" })
            req.veterinarioHeader = veterinarioBDD //en la peticion se esta enviando una nueva variable denominada veterinario header, se setea al usuario que inicio sesion
            next()
        }
        else{
            //consulta para el paciente
            //se importa el modelo paciente 
            //comprobacion para verificar si el paciente existe en la base de datos
            //niveles de acceso
            const pacienteBDD = await Paciente.findById(id).lean().select("-password")
            if (!pacienteBDD) return res.status(401).json({ msg: "Usuario no encontrado" })
            req.pacienteHeader = pacienteBDD
            next()
        }
    } catch (error) {
        console.log(error)
        return res.status(401).json({ msg: `Token inválido o expirado - ${error}` })
    }
}

//autorizacion modulos a los que la persona tiene acceso
//autenticacion ingresar el usuaurio y la contraseña para decir quien es
//autenticacion middleware para verificar el token


export { 
    crearTokenJWT,
    verificarTokenJWT 
}