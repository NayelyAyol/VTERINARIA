import { create } from "zustand"
import axios from "axios"
import { toast } from "react-toastify"


const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"))
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token}`,
        }
    }
}

const storeTreatments = create(set=>({
    modal:false,
    toggleModal: (modalType) => set((state) => ({ modal: state.modal === modalType ? null : modalType })),

    
    registerTreatments:async(url,data)=>{
        try {
            const respuesta = await axios.post(url, data,getAuthHeaders())
            set((state)=>({modal:!state.modal}))
            toast.success(respuesta.data.msg)
        } catch (error) {
            console.error(error)
        }
    },
    deleteTreatments:async(url)=>{
        // Paso 1: Confirmar la acción con el usuario
        const isConfirmed  = confirm("Vas a eliminar el tratamiento ¿Estás seguro de realizar esta acción?")
        // Paso 2: Verificar la confirmación
        if (isConfirmed ) {
            try {
                // Paso 3: Realizar la petición al backend
                // Eliminar el tratamiento
                const respuesta = await axios.delete(url,getAuthHeaders())
                // Paso 4: Notificar al usuario
                toast.success(respuesta.data.msg)
            } catch (error) {
                console.error(error)
            }
        }
    }
}))


export default storeTreatments
