import {Router} from 'express'
import { actualizarPassword, comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } 
from '../controllers/veterinario_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()

//Rutas publicas
router.post('/registro',registro)
router.get('/confirmar/:token',confirmarMail)

router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)


//Rutas privadas
router.post('/veterinario/login',login)


router.get('/veterinario/perfil',verificarTokenJWT,perfil)

router.put('/actualizarpassword/:id', verificarTokenJWT, actualizarPassword)

export default router