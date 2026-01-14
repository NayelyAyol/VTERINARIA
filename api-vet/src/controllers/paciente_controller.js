import { sendMailToOwner } from "../helpers/sendMail.js"
import { subirBase64Cloudinary, subirImagenCloudinary } from "../helpers/uploadCloudinary.js"
import Paciente from "../models/Paciente.js"
import Tratamiento from "../models/Tratamiento.js"
import mongoose from "mongoose"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import { crearTokenJWT } from "../middlewares/JWT.js"


const registrarPaciente = async (req, res) => {

    try {
        const { emailPropietario } = req.body

        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debes llenar todos los campos" })

        const emailExistente = await Paciente.findOne({ emailPropietario })

        if (emailExistente) return res.status(400).json({ msg: "El email ya se encuentra registrado" })

        const password = Math.random().toString(36).toUpperCase().slice(2, 5)

        const nuevoPaciente = new Paciente({
            ...req.body,
            passwordPropietario: await Paciente.prototype.encryptPassword("VET" + password),
            veterinario: req.veterinarioHeader._id
        })

        if (req.files?.imagen) {
            const { secure_url, public_id } = await subirImagenCloudinary(req.files.imagen.tempFilePath)
            nuevoPaciente.avatarMascota = secure_url
            nuevoPaciente.avatarMascotaID = public_id
        }

        if (req.body?.avatarMascotaIA) {
            const secure_url = await subirBase64Cloudinary(req.body.avatarMascotaIA)
            nuevoPaciente.avatarMascotaIA = secure_url
        }

        await nuevoPaciente.save()
        await sendMailToOwner(emailPropietario, "VET" + password)
        res.status(201).json({ msg: "Registro exitoso de la mascota y correo enviado al propietario" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const listarPacientes = async (req, res) => {
    try {
        //Paso 3 consulta a la base de datos
        //find para buscar en la BD
        //se elimina la fecha de creacion, la fecha de salida
        //con el select se quitan los campos que no se desean
        //Metodo populate para mostrar los campos relacionados, Cambiar un ID por la información completa del documento relacionado.
        if (req.pacienteHeader?.rol === "paciente") {
            //pupulate para mostrar los datos del veterinario asociado al paciente
            //se muestra el paciente logueado solo su informacion 
            const pacientes = await Paciente.find(req.pacienteHeader.id).select("-salida -createdAt -updatedAt -__v -passwordPropietario").populate('veterinario', '_id nombre apellido')
            return res.status(200).json(pacientes)
        }else{
        const pacientes = await Paciente.find({ estadoMascota: true, veterinario: req.veterinarioHeader._id }).select("-salida -createdAt -updatedAt -__v -passwordPropietario").populate('veterinario', '_id nombre apellido')
        res.status(200).json(pacientes)
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const detallePaciente = async (req, res) => {

    try {
        //Paso 1: Obtener el id desde el request.params
        const { id } = req.params
        //Paso 2:
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `No existe el veterinario ${id}` });
        //Paso 3: usar los dos metodos para delimitar lo que se desea mostrar
        const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario', '_id nombre apellido')
        const tratamientos = await Tratamiento.find().where('paciente').equals(id)
        paciente.tratamientos = tratamientos

        //Paso 4: Imprimir el resultado
        res.status(200).json(paciente)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarPaciente = async (req, res) => {
    try {
        //Paso 1
        const { id } = req.params
        const { salidaMascota } = req.body

        //Paso 2
        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debes llenar todos los campos" })
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `No existe el paciente ${id}` })

        //Paso 3: Se usa el id y los valores que se desean actualizar
        await Paciente.findByIdAndUpdate(id, { salidaMascota: Date.parse(salidaMascota), estadoMascota: false })
        //Paso 4: Se muestra el mensaje de respuesta
        res.status(200).json({ msg: "Fecha de salida registrado exitosamente" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const actualizarPaciente = async (req, res) => {
    try {
        //Paso 1: Obtener los datos
        const { id } = req.params
        //Paso 2: Validacion, campos vacios
        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
        //validacion para el id
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe el veterinario ${id}` })

        //Paso 3: se verifica si en el req. body hay una imagen
        //con el metodo destroid se borra la imagne que esta en cloudinary en base al ID
        if (req.files?.imagen) {
            const paciente = await Paciente.findById(id)
            if (paciente.avatarMascotaID) {
                console.log(paciente.avatarMascotaID);

                await cloudinary.uploader.destroy(paciente.avatarMascotaID);
            }
            //Se carga la nueva imagen con el metodo upload, la misma que se guardara
            const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Pacientes' });
            req.body.avatarMascota = cloudiResponse.secure_url;
            req.body.avatarMascotaID = cloudiResponse.public_id;
            //se elimina la imagen que se subio de manera temporal
            await fs.unlink(req.files.imagen.tempFilePath);
        }
        //metodo que recibe el id a actualizar, y el new true que lo que hace es actualizar
        await Paciente.findByIdAndUpdate(id, req.body, { new: true })
        //Paso 4: Imprimir el mensaje
        res.status(200).json({ msg: "Actualización exitosa del paciente" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const loginPropietario = async(req,res)=>{

    try {
        const {email:emailPropietario,password:passwordPropietario} = req.body
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        const propietarioBDD = await Paciente.findOne({emailPropietario})
        if(!propietarioBDD) return res.status(404).json({msg:"El propietario no se encuentra registrado"})
        const verificarPassword = await propietarioBDD.matchPassword(passwordPropietario)
        if(!verificarPassword) return res.status(404).json({msg:"El password no es el correcto"})
        const token = crearTokenJWT(propietarioBDD._id,propietarioBDD.rol)
        const {_id,rol} = propietarioBDD
        res.status(200).json({
            token,
            rol,
            _id
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const perfilPropietario = (req, res) => {

    try {

        const{_id, rol,nombrePropietario,cedulaPropietario,emailPropietario,celularPropietario,nombreMascota} = req.pacienteHeader

        res.status(200).json({
            _id,
            rol,
            nombrePropietario,
            cedulaPropietario,
            emailPropietario,
            celularPropietario,
            nombreMascota,
        })

    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


export{
    registrarPaciente,
    listarPacientes,
    detallePaciente,
    eliminarPaciente,
    actualizarPaciente,
    loginPropietario,
    perfilPropietario
}