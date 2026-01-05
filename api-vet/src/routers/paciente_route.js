import { Router} from "express";
import { actualizarPaciente,detallePaciente,eliminarPaciente,listarPacientes, registrarPaciente, loginPropietario, perfilPropietario } from "../controllers/paciente_controller.js";
import { verificarTokenJWT } from "../middlewares/JWT.js";

const router = Router()

//Hay que tener en cuenta el orden de las rutas, ya que si una ruta es mas general que otra,
//la mas general debe ir al final para que no interfiera con las demas rutas mas especificas

router.post('/paciente/login',loginPropietario)
router.get('/paciente/perfil',verificarTokenJWT,perfilPropietario)

router.post('/paciente/registro',  verificarTokenJWT,registrarPaciente)
router.get('/pacientes',verificarTokenJWT,listarPacientes)
router.get("/paciente/:id",verificarTokenJWT, detallePaciente)
router.delete('/paciente/eliminar/:id',verificarTokenJWT,eliminarPaciente)
router.put("/paciente/actualizar/:id", verificarTokenJWT, actualizarPaciente)

export default router