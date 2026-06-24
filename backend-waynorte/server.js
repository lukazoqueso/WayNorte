const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'waynorte_db',
    password: '1234', // <-- Pon tu contraseña real aquí
    port: 5432,
});

// --- RUTA 1: Obtener todos los marcadores ---
app.get('/api/marcadores', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM marcadores');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error en la base de datos:", error);
        res.status(500).json({ error: 'Error al obtener los marcadores' });
    }
});

// --- RUTA 2: Registro de Usuarios ---
app.post('/api/registro', async (req, res) => {
    const { email, password } = req.body; 
    try {
        const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ error: 'Este correo ya está registrado.' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, passwordEncriptada]
        );
        res.json({ mensaje: '¡Cuenta creada con éxito!', usuario: nuevoUsuario.rows[0] });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: 'Error interno al crear la cuenta.' });
    }
});

// --- RUTA 3: Inicio de Sesión ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }
        const usuario = resultado.rows[0];
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }
        res.json({ mensaje: 'Inicio de sesión exitoso', usuario: { id: usuario.id, email: usuario.email } });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: 'Error interno al iniciar sesión.' });
    }
});


// --- RUTA 4: Guardar un comentario nuevo (NUEVA) ---
app.post('/api/comentarios', async (req, res) => {
    const { marcador_id, usuario_id, texto, estrellas } = req.body;

    try {
        const nuevoComentario = await pool.query(
            'INSERT INTO comentarios (marcador_id, usuario_id, texto, estrellas) VALUES ($1, $2, $3, $4) RETURNING *',
            [marcador_id, usuario_id, texto, estrellas]
        );
        res.json({ mensaje: 'Comentario guardado con éxito', comentario: nuevoComentario.rows[0] });
    } catch (error) {
        console.error("Error al guardar comentario:", error);
        res.status(500).json({ error: 'No se pudo guardar el comentario en la base de datos.' });
    }
});

// --- RUTA 5: Obtener comentarios de un marcador específico (NUEVA) ---
// Usamos un JOIN para traer el email del usuario que escribió el comentario de forma automática
app.get('/api/comentarios/:marcadorId', async (req, res) => {
    const { marcadorId } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT c.id, c.texto, c.estrellas, c.usuario_id, u.email 
             FROM comentarios c 
             JOIN usuarios u ON c.usuario_id = u.id 
             WHERE c.marcador_id = $1 
             ORDER BY c.fecha DESC`, 
            [marcadorId]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ error: 'Error al obtener las reseñas.' });
    }
});

// --- RUTA 6: Eliminar un comentario (NUEVA) ---
app.delete('/api/comentarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM comentarios WHERE id = $1', [id]);
        res.json({ mensaje: 'Comentario eliminado correctamente.' });
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        res.status(500).json({ error: 'No se pudo eliminar el comentario.' });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de WayNorte corriendo impecable en http://localhost:${PORT}`);
});