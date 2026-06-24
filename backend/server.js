const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json()); // Permite recibir datos en formato JSON (como el usuario y clave)
app.use(cors());         // Habilita la comunicación segura entre front y back

// Configuración de la conexión a tu PostgreSQL local
const pool = new Pool({
    user: 'postgres',           // ⚠️ Cambia esto por tu usuario de pgAdmin si es diferente
    host: 'localhost',
    database: 'waynorte_db',    // La base de datos que creamos en el paso anterior
    password: '123456789',  // ⚠️ PON AQUÍ la contraseña real de tu PostgreSQL
    port: 5432,
});

// PRUEBA DE CONEXIÓN: Nos avisa en la consola si se conectó bien a Postgres
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo el cliente de la base de datos', err.stack);
    }
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    release();
});

// Ruta Base de prueba
app.get('/', (req, res) => {
    res.send('El servidor de WayNorte está corriendo perfectamente.');
});

// === NUEVA RUTA: INICIO DE SESIÓN ===
app.post('/api/login', async (req, res) => {
    // 1. Extraemos el usuario y contraseña que nos manda el Frontend
    const { username, password } = req.body;

    try {
        // 2. Buscamos en PostgreSQL si existe una fila con ese nombre de usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [username]);

        // 3. Validamos si encontramos al usuario
        if (result.rows.length > 0) {
            const user = result.rows[0]; // Tomamos los datos del usuario encontrado
            
            // 4. Comparamos la contraseña (texto plano por ahora)
            if (user.contrasena === password) {
                // Si todo coincide, respondemos con éxito
                return res.json({ success: true, message: "¡Acceso concedido!" });
            }
        }
        
        // 5. Si el usuario no existe o la contraseña no coincide, rechazamos
        return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });

    } catch (err) {
        console.error('Error al intentar loguear:', err);
        res.status(500).json({ success: false, message: "Error interno en el servidor" });
    }
});

// Encender el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});