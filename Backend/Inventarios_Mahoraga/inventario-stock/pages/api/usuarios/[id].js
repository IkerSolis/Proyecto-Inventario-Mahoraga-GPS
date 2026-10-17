import {
  obtenerUsuarioPorId,
  editarUsuario,
  cambiarEstadoUsuario,
} from '../../../lib/usuarioService';

//Endpoint: /api/usuarios/[id]
export default function handler(req, res) {
  const { id } = req.query;

  // Obtener usuario por ID
  if (req.method === 'GET') {
    try {
      const usuario = obtenerUsuarioPorId(id);
      return res.status(200).json(usuario);
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

  //Editar datos de usuario y/o asignar rol
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { nombre, edad, telefono, rol, estado } = req.body;

      let usuarioActualizado;

      // Si se envían datos personales o rol, ejecutamos editarUsuario
      if (nombre !== undefined || edad !== undefined || telefono !== undefined || rol !== undefined) {
        usuarioActualizado = editarUsuario(id, { nombre, edad, telefono, rol });
      }

      // Si también se incluyó el estado en la misma petición, lo actualizamos
      if (estado !== undefined) {
        usuarioActualizado = cambiarEstadoUsuario(id, estado);
      }

      if (!usuarioActualizado) {
        usuarioActualizado = obtenerUsuarioPorId(id);
      }

      return res.status(200).json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado,
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

}
