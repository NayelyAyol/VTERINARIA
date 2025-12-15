import axios from "axios"
import { toast } from "react-toastify"


export function useFetch() {
    // para hacer las peticiones al backend
    const fetchDataBackend = async (url, data=null, method="GET", headers = {}) => 
        {
            const loadingToast = toast.loading("Procesando solicitud...")
            try {
                const options = {
                    method,
                    url,
                    headers: {
                        "Content-Type": "application/json",
                        ...headers,
                    },
                    data
                }
                const response = await axios(options)
                toast.dismiss(loadingToast) // Elimina
                toast.success(response?.data?.msg) // respuesta del backend
                return response?.data

            } catch (error) {             
                toast.dismiss(loadingToast)
                console.error(error)
                toast.error(error.response?.data?.msg) // Manda la respuesta en una notificación
            }
    }
    return fetchDataBackend
}