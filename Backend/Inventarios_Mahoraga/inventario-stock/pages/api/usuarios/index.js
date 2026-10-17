import {
  obtenerUsuarios,
  crearUsuario,
} from '../../../lib/usuarioService';

/**
 *  Endpoint: /api/usuarios
 */
export default function handler(req, res) {
  // Obtener lista de usuarios
  if (req.method === 'GET') {
    try {
      const { rol, estado } = req.query;
      const usuarios = obtenerUsuarios({ rol, estado });
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Crear un nuevo usuario
  if (req.method === 'POST') {
    try {
      const { nombre, edad, telefono, rol } = req.body;
      const nuevoUsuario = crearUsuario({ nombre, edad, telefono, rol });
      return res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: nuevoUsuario,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  
}
