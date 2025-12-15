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
            const url = `${import.meta.env.VITE_BACKEND_URL}/veterinario/perfil`
            const respuesta = await axios.get(url, getAuthHeaders())
            set({ user: respuesta.data })
        } catch (error) {
            console.error(error)
        }
    },

    updatePasswordProfile: async (url, data) => {
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            toast.success("Contraseña actualizada correctamente")
            return { ok: true, data: respuesta.data }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
            return { ok: false }
        }
    }

}))

export default storeProfile
