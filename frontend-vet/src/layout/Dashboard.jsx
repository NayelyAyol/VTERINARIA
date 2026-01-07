// Importaciones de React Router
import { Link, Outlet, useLocation } from 'react-router'

// Importar el store de autenticación
// Se utiliza para cerrar sesión
import storeAuth from '../context/storeAuth'

// Importar el store del perfil de usuario
// Se utiliza para mostrar nombre y rol
import storeProfile from '../context/storeProfile'

const Dashboard = () => {

    // Obtener la ruta actual
    const location = useLocation()
    const urlActual = location.pathname

    // Función para eliminar el token (logout)
    const { clearToken } = storeAuth()

    // Información del usuario autenticado
    const { user } = storeProfile()

    return (
        <div className='md:flex md:min-h-screen'>

            {/* ===================== */}
            {/* Menú de navegación lateral */}
            {/* ===================== */}
            <div className='md:w-1/5 bg-gray-800 px-5 py-4'>

                {/* Título */}
                <h2 className='text-4xl font-black text-center text-slate-200'>
                    SMARTVET
                </h2>

                {/* Imagen de perfil */}
                <img
                    src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png"
                    alt="img-client"
                    className="m-auto mt-8 p-1 border-2 border-slate-500 rounded-full"
                    width={120}
                    height={120}
                />

                {/* Nombre del usuario */}
                {/* Se valida si es veterinario o propietario */}
                <p className='text-slate-400 text-center my-4 text-sm'>
                    <span className='bg-green-600 w-3 h-3 inline-block rounded-full'></span>
                    {' '}Bienvenido - {user?.nombre || user?.nombrePropietario}
                </p>

                {/* Rol del usuario */}
                <p className='text-slate-400 text-center my-4 text-sm'>
                    Rol - {user?.rol}
                </p>

                <hr className="mt-5 border-slate-500" />

                {/* ===================== */}
                {/* Enlaces de navegación */}
                {/* ===================== */}
                <ul className="mt-5">

                    {/* Enlace Dashboard */}
                    {/* Solo visible para veterinarios */}
                    {user?.rol === 'veterinario' && (
                        <li className="text-center">
                            <Link
                                to='/dashboard'
                                className={`${urlActual === '/dashboard'
                                    ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md'
                                    : 'text-slate-600'
                                } text-xl block mt-2 hover:text-slate-200`}
                            >
                                Dashboard
                            </Link>
                        </li>
                    )}

                    {/* Enlace Perfil */}
                    <li className="text-center">
                        <Link
                            to='/dashboard/profile'
                            className={`${urlActual === '/dashboard/profile'
                                ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md'
                                : 'text-slate-600'
                            } text-xl block mt-2 hover:text-slate-200`}
                        >
                            Perfil
                        </Link>
                    </li>

                    {/* Enlace Listar */}
                    <li className="text-center">
                        <Link
                            to='/dashboard/list'
                            className={`${urlActual === '/dashboard/list'
                                ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md'
                                : 'text-slate-600'
                            } text-xl block mt-2 hover:text-slate-200`}
                        >
                            Listar
                        </Link>
                    </li>

                    {/* Enlace Crear */}
                    <li className="text-center">
                        <Link
                            to='/dashboard/create'
                            className={`${urlActual === '/dashboard/create'
                                ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md'
                                : 'text-slate-600'
                            } text-xl block mt-2 hover:text-slate-200`}
                        >
                            Crear
                        </Link>
                    </li>

                    {/* Enlace Chat */}
                    <li className="text-center">
                        <Link
                            to='/dashboard/chat'
                            className={`${urlActual === '/dashboard/chat'
                                ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md'
                                : 'text-slate-600'
                            } text-xl block mt-2 hover:text-slate-200`}
                        >
                            Chat
                        </Link>
                    </li>
                </ul>
            </div>

            {/* ===================== */}
            {/* Contenido principal */}
            {/* ===================== */}
            <div className='flex-1 flex flex-col justify-between h-screen bg-gray-100'>

                {/* Menú de navegación superior */}
                <div className='bg-gray-800 py-2 flex md:justify-end items-center gap-5 justify-center'>

                    {/* Nombre del usuario */}
                    <div className='text-md font-semibold text-slate-100'>
                        Usuario - {user?.nombre || user?.nombrePropietario}
                    </div>

                    {/* Imagen de usuario */}
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                        alt="img-client"
                        className="border-2 border-green-600 rounded-full"
                        width={50}
                        height={50}
                    />

                    {/* Botón cerrar sesión */}
                    <Link
                        to='/'
                        className="text-white mr-3 text-md block bg-red-800 px-4 py-1 rounded-lg hover:bg-red-900"
                        onClick={clearToken}
                    >
                        Salir
                    </Link>
                </div>

                {/* Contenido dinámico de las rutas hijas */}
                <div className='overflow-y-scroll p-8'>
                    <Outlet />
                </div>

                {/* Footer */}
                <div className='bg-gray-800 h-12'>
                    <p className='text-center text-slate-100 leading-[2.9rem] underline'>
                        Todos los derechos reservados
                    </p>
                </div>

            </div>
        </div>
    )
}

export default Dashboard
