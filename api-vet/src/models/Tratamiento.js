import {Schema, model, mongoose} from 'mongoose';
import Paciente from './Paciente.js';

// Definición del esquema para Tratamiento
// Incluye referencia al paciente asociado
// Relacion muchos a uno (muchos tratamientos para un paciente)
// Se usa populate en el controlador para obtener los datos completos del paciente
// en lugar de solo el ID
const tratamientoSchema = new Schema({
    nombre:{
        type:String,
        required:true,
        trim:true
    },
    detalle:{
        type:String,
        required:true,  
        trim:true
    },
    prioridad:{
        type:String,
        required:true,
        enum:['Baja','Media','Alta']
    },
    precio: {
        type: Number,
        required: true,
        min: 1
    },
    estadoPago: {
        type: String,
        enum: ['Pendiente', 'Pagado'],
        default: 'Pendiente'
    },
    // Campo de referencia al paciente
    paciente:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Paciente'
    }
},{
    timestamps:true
})



export default model('Tratamiento', tratamientoSchema);