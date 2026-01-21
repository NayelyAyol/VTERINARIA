import mongoose from "mongoose"
import Tratamiento from "../models/Tratamiento.js"
import { Stripe } from "stripe"
import Paciente from "../models/Paciente.js"

const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)

const pagarTratamiento = async (req, res) => {

    try {
        // Paso 1: Obtener los datos del cuerpo de la solicitud
        // paymentMethodId, treatmentId, cantidad, motivo
        const { paymentMethodId, treatmentId, cantidad, motivo } = req.body
        // Paso 2: Validar los datos recibidos
        const tratamiento = await Tratamiento.findById(treatmentId)
        if (tratamiento.estadoPago === "Pagado") return res.status(400).json({ message: "Este tratamiento ya fue pagado" })
        if (!paymentMethodId) return res.status(400).json({ message: "paymentMethodId no proporcionado" })
        const paciente = await Paciente.findById(tratamiento.paciente)
        const clienteStripe = await stripe.customers.create({name: paciente.nombrePropietario,email: paciente.emailPropietario})

        // Paso 3: Crear el pago con Stripe
        const payment = await stripe.paymentIntents.create({
            amount:cantidad, // en centavos $10.00 = 1000 centavos 
            currency: "usd", // moneda
            description: motivo, // descripcion del pago
            payment_method: paymentMethodId, // metodo de pago
            confirm: true,// confirmar el pago
            customer: clienteStripe.id, // asociar el pago al cliente
            receipt_email: paciente.email,// enviar recibo al email del cliente
            // Habilitar pagos automaticos
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never"
            }
        })
        //Psaso 4: Actualizar el estado del tratamiento si el pago fue exitoso
        if (payment.status === "succeeded") {
            await Tratamiento.findByIdAndUpdate(treatmentId, { estadoPago: "Pagado" })
            return res.status(200).json({ msg: "El pago se realizó exitosamente" })
        }else{
            return res.status(400).json({ msg: `El pago no se completó ${payment.status}` })
        }
    } catch (error) {
        res.status(500).json({ msg: `❌ Error al intentar pagar el tratamiento - ${error}` })
    }
}

const registrarTratamiento = async (req,res)=>{

    try {
        const {paciente} = req.body
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if( !mongoose.Types.ObjectId.isValid(paciente)) return res.status(404).json({msg:`No existe el paciente ${paciente}`})
        await Tratamiento.create(req.body)
        res.status(201).json({msg:"Registro exitoso del tratamiento"})

    } catch (error) {
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
    eliminarTratamiento,
    pagarTratamiento
}