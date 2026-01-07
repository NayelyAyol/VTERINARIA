import storeAuth from '../context/storeAuth'
import { Forbidden } from '../pages/Forbidden'


export default function PrivateRouteWithRole({ children }) {
    //Desestructuracion del storeAuth solo el rol
    const {rol} = storeAuth()

    //Si el rol es paciente no puede acceder a las rutas privadas
    //Si el rol es diferente a paciente puede acceder a las rutas privadas
    //Retornamos el componente Forbidden si el rol es paciente
    //Retornamos los children si el rol es diferente a paciente
    return ("paciente" === rol) ? <Forbidden/> : children
    
}



