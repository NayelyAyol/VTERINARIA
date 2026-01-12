import mongoose from "mongoose"
import Tratamiento from "../models/Tratamiento.js"

const registrarTratamiento = async (req, res) => {
    try{
        //Paso 1
            const {paciente} = req.body

        //Paso 2: Validar que los campos esten llenos
            if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debes llenar todos los campos" })
            if (!mongoose.Types.ObjectId.isValid(paciente)) return res.status(404).json({ msg: `No existe el paciente ${paciente}` })

        //Paso 3: Guardar el tratamiento
            await Tratamiento.create(req.body)
            
        //Paso 4: Responder al usuario
            res.status(201).json({ msg: "Tratamiento registrado exitosamente" })

    }catch(error){
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarTratamiento = async(req,res)=>{
    try {
        // Paso 1: Obtener el id desde los params
        const {id} = req.params
        // Paso 2: Validar el id
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el tratamiento ${id}`})
        // Paso 3: Eliminar el tratamiento a traves del id
        await Tratamiento.findByIdAndDelete(id)
        // Paso 4: Responder al usuario para informar que se elimino
        res.status(200).json({msg:"Tratamiento eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

export {
    registrarTratamiento,
    eliminarTratamiento
}