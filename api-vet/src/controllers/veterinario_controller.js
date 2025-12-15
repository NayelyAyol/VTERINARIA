import Veterinario from "../models/Veterinario.js"
import { sendMailToRecoveryPassword, sendMailToRegister } from "../helpers/sendMail.js"
import { crearTokenJWT } from "../middlewares/JWT.js"

const registro = async (req,res)=>{
    try{

        // Paso 1: Obtengo los datos
        const {email,password} = req.body // DE req.body, saca email y password -> desestructuración de email y contraseña

        // Paso 2: Valido los datos
        // Valida que los campos estén llenos
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        
        // Verificar que el email no exista en la base de datos  
        // Realiza una consulta a la base de datos, crea un usuario en memoria      
        const verificarEmailBDD = await Veterinario.findOne({email}) // findOne -> busca un registro en base al email
        if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

        // Paso 3: Desal
        const nuevoVeterinario = new Veterinario(req.body)
        nuevoVeterinario.password = await nuevoVeterinario.encryptPassword(password)

        // Genera un token
        const token = nuevoVeterinario.createToken() // .createToken viene del modelo veterinario
        await sendMailToRegister(email,token) // envía el correo

        await nuevoVeterinario.save() // el usuario deja de estar en memoria para enviarlo a la base de datos

        // Paso 4: 
        res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})


    }catch(error){
        res.status(500).json({msg: `❌ Error en el servidor - ${error}`})
    }
}

const confirmarMail = async (req, res) => {
    try {
        // Paso 1: Obtener los datos. Vamos a sacar el token, tal y cual viene desde veterinario_routes.js 
        const { token } = req.params

        // Paso 2: Validación de datos, con la consulta a la base de datos para traer el registro según el token
        const veterinarioBDD = await Veterinario.findOne({ token })
        if (!veterinarioBDD) return res.status(404).json({ msg: "Token inválido o cuenta ya confirmada" }) // Si no encuentra el token

        // Paso 3: Desarrollar la lógica para validar la cuenta             
        veterinarioBDD.token = null // Una vez que se confirma la cuenta, se pone en null el token en la BDD
        veterinarioBDD.confirmEmail = true // Pone la confirmación en true
        await veterinarioBDD.save() // Lo guarda en la base de datos

        // Paso 4: 
        res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesión" })

    } catch (error) {
    console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

// Clase del 10-11-2025

const recuperarPassword = async(req, res) =>{
    try {
        // PASO 1: sacar el correo
        const {email} = req.body
        // PASO 2: Validaciones
        if(!email) return res.status(400).json({msg: "Debes ingresar un correo electrónico"})
        
        const veterinarioBDD = await Veterinario.findOne({email}) // Traer un registro en base al email. Puede dar dos resultados: el registro o null

        if (!veterinarioBDD) return res.status(400).json({msg:"El ususario no se encuentra registrado"})
     
        // PASO 3: Lógica para guardar en la BDD 
        const token = veterinarioBDD.createToken()
        veterinarioBDD.token = token

        // CORREO
        await sendMailToRecoveryPassword(email, token)
        await veterinarioBDD.save()

        // PASO 4: Respuesta
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })

    } catch (error) {
        console.error(error)
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

const comprobarTokenPassword = async (req, res) =>{
    try{
        // PASO 1
        const {token} = req.params
        // PASO 2
        const veterinarioBDD = await Veterinario.findOne({token})
        if (veterinarioBDD?.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        
        // PASO 3

        // PASO 4
        res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 

    } catch (error){
        console.error(error)
        res.status(500).json({msg:` Error en el servidor ${error}`})
    }
}

const crearNuevoPassword = async (req,res)=>{
    try {
        // PASO 1
        const{password,confirmpassword} = req.body
        const { token } = req.params
        
        // PASO 2
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        
        if(password !== confirmpassword) return res.status(404).json({msg:"Los passwords no coinciden"})
        const veterinarioBDD = await Veterinario.findOne({token})
        if(!veterinarioBDD) return res.status(404).json({msg:"No se puede validar la cuenta"})

        // PASO 3
        veterinarioBDD.token = null
        veterinarioBDD.password = await veterinarioBDD.encryptPassword(password)
        await veterinarioBDD.save()

        // PASO 4
        res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const login = async(req,res)=>{

    try {

        // Paso 1
        const {email,password} = req.body

        // Paso 2
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
        if(!veterinarioBDD) return res.status(404).json({msg:"El usuario no se encuentra registrado"})
        //if(!veterinarioBDD.confirmEmail) return res.status(403).json({msg:"Debes verificar tu cuenta antes de iniciar sesión"})
        const verificarPassword = await veterinarioBDD.matchPassword(password)
        if(!verificarPassword) return res.status(401).json({msg:"El password no es correcto"})
        
        // Paso 3
        const {nombre,apellido,direccion,telefono,_id,rol} = veterinarioBDD
        
        const token = crearTokenJWT(veterinarioBDD._id.toString(), veterinarioBDD.rol.toString())

        // Paso 4
        res.status(200).json({
            token,
            rol,
            nombre,
            apellido,
            direccion,
            telefono,
            _id,
            email:veterinarioBDD.email
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

// 24.11.2025 Perfil del usuario autenticado

// veterinario_controller.js

const perfil = async (req, res) => {
    try{
        // Paso 1 - req.veterinarioHeader ya tiene la información del usuario autenticado
        // Paso 2 - Obtener los datos del usuario autenticado Middleware
        // Paso 3: desestructuración
        const{token,confirmEmail,createdAt,updatedAt,__v,...datosPerfil} = req.veterinarioHeader
        res.status(200).json(datosPerfil) // <--- Se envía la respuesta JSON con los datos del perfil
        // Paso 4: Se ha eliminado el 'res.send("Perfil del usuario")' duplicado
    }catch(error){
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const actualizarPassword = async (req,res) =>{
    try {
        // Paso 1
        const {passwordactual,passwordnuevo} = req.body // Estos nombres deben coincidir con los del frontend
        const{_id} = req.veterinarioHeader

        // Paso 2
        const veterinarioBDD = await Veterinario.findById(req.veterinarioHeader._id)
        if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${_id}`})
        
        const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
        if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
        // Paso 3
        veterinarioBDD.password = await veterinarioBDD.encryptPassword(req.body.passwordnuevo)
        
        // Paso 4
        await veterinarioBDD.save()
        res.status(200).json({msg:"Password actualizado correctamente"})
    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}
// Siempre: 

export { // Exportación nombrada
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPassword
}