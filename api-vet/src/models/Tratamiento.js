import mongoose, {Schema,model} from 'mongoose'

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
    // Referencia al modelo de Paciente
    paciente:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Paciente'
    }
},{
    timestamps:true
})

export default model('Tratamiento',tratamientoSchema)