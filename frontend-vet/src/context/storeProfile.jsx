import { create } from "zustand"
import axios from "axios"
import { toast } from "react-toastify"

const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"))
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token}`,
        },
    }
}


const storeProfile = create((set) => ({
        
    user: null,
    clearUser: () => set({ user: null }),
    profile: async () => {
        try {
            // Llamada al backend
            // Determinar si es veterinario o paciente
            const storedUser = JSON.parse(localStorage.getItem("auth-token"))
            // Definir el endpoint según el rol
            // Si el rol es veterinario, se usa "veterinario/perfil", si es paciente, "paciente/perfil"
            // Se construye la URL completa
            // Ejemplo: http://localhost:4000/veterinario/perfil
            const endpoint = storedUser.state.rol ==="veterinario"
                ? "veterinario/perfil"
                : "paciente/perfil"
            // Construir la URL completa
            const url = `${import.meta.env.VITE_BACKEND_URL}/${endpoint}`
            // Realizar la solicitud GET con los encabezados de autenticación
            //console.log("URL de perfil:", url); // Depuración: mostrar la URL utilizada
            // Realizar la solicitud GET con los encabezados de autenticación
            const respuesta = await axios.get(url, getAuthHeaders())
            set({ user: respuesta.data })
        } catch (error) {
            console.error(error)
        }
    },

    updateProfile:async(url, data)=>{
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            set({ user: respuesta.data })
            toast.success("Perfil actualizado correctamente")
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    },
    
    updatePasswordProfile:async(url,data)=>{
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            return respuesta
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    }

    })
    
)

export default storeProfile
