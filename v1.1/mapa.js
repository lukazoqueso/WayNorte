// --- 1. LOGIN WAYNORTE ---
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(document.getElementById("buttonDiv"), { theme: "outline", size: "large" });
};

function handleCredentialResponse() { mostrarMapa(); }
function entrarInvitado() { mostrarMapa(); }

function mostrarMapa() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    document.getElementById('map-legend').style.display = 'block';
    initMap();
}

// --- 2. GESTIÓN DE COMENTARIOS ---
function obtenerComentarios(id) {
    const data = localStorage.getItem(`waynorte_comments_${id}`);
    return data ? JSON.parse(data) : [];
}

window.enviarComentario = function(id) {
    const input = document.getElementById(`input-${id}`);
    const stars = document.getElementById(`stars-${id}`).value;
    const texto = input.value.trim();

    if (texto === "") return;

    const comentarios = obtenerComentarios(id);
    comentarios.push({ c_id: Date.now(), texto, estrellas: stars });
    
    localStorage.setItem(`waynorte_comments_${id}`, JSON.stringify(comentarios));
    input.value = "";
    alert("Comentario guardado. Abre de nuevo el marcador para verlo.");
};

window.eliminarComentario = function(puntoId, comentarioId) {
    if(!confirm("¿Deseas eliminar este comentario?")) return;
    let comentarios = obtenerComentarios(puntoId);
    comentarios = comentarios.filter(c => c.c_id !== comentarioId);
    localStorage.setItem(`waynorte_comments_${puntoId}`, JSON.stringify(comentarios));
    alert("Comentario eliminado.");
};

// --- 3. INICIALIZACIÓN DEL MAPA ---
function initMap() {
    const map = L.map('map').setView([-18.4783, -70.3126], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Grupos de Capas (Filtros)
    const layerTurismo = L.layerGroup().addTo(map);
    const layerReciclaje = L.layerGroup().addTo(map);
    const layerParaderos = L.layerGroup().addTo(map);

    const puntosArica = [
        { id: "morro", nombre: "Morro de Arica", coords: [-18.47935860870728, -70.32437093459546], tipo: "turismo", img: "https://laravel-production-storage1-oddrmnfoicay.s3.amazonaws.com/actividades/Morro%20de%20Arica%20%281%29.jpg" },
        { id: "chinchorro", nombre: "Playa Chinchorro", coords: [-18.462299104462446, -70.30477800312973], tipo: "turismo", img: "https://docs.muniarica.cl/web/Noticias/ImagenFullText/15920-17:55:04.webp" },
        { id: "punto_limpio", nombre: "Punto Limpio Diego Portales", coords: [-18.4745, -70.3010], tipo: "reciclaje", img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400" },
        { id: "Paradero", nombre: "Paradero", coords: [-18.448414688675875, -70.29053481350209], tipo: "paradero", img: "https://www.fronteranorte.cl/wp-content/uploads/2024/01/3-2.jpeg" },
        { id: "Playa Tortuga", nombre: "Playa Tortuga", coords: [-18.4685768850407, -70.3131116776856], tipo: "turismo", img: "https://puranoticia.pnt.cl/cms/site/artic/20150724/imag/foto_0000000120150724120714.jpg" },
        { id: "Paseo Deportivo Las Machas", nombre: "Paseo Deportivo Las Machas", coords: [-18.447219174731206, -70.30255797052403], tipo: "turismo", img: "https://www.flesan.cl/wp-content/uploads/Borde-Costero-Arica-portada-pequena.jpg" },
        { id: "Parque Centenario", nombre: "Parque Centenario", coords: [-18.46056072819313, -70.2995745910482], tipo: "turismo", img: "https://www.imaarica.cl/ParqueCentenario/img/antes-despues/20.%20Plaza%20Deportiva/02.jpg" },
        { id: "Mallplaza Arica", nombre: "Mallplaza Arica", coords: [-18.469378131440294, -70.30968565043023], tipo: "turismo", img: "https://i.ytimg.com/vi/JUkUSbU26W0/maxresdefault.jpg" },
        { id: "Luckia Casino", nombre: "Luckia Casino", coords: [-18.47331651557929, -70.31458515638649], tipo: "turismo", img: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHNKnxzI1qx4FVfnwWxvcdZ5hTEQXGoNONc3dbNZ4-2d195eak-b0K43m9ji1CUoX42Vb7rRr6EHFV0Sj-ARhUQDtfJyDO1Rnq2sEK19MxpK9bMKJ9EwjVBY3U48Psz1JYy9uZz=w408-h408-k-no" },
        { id: "Playa El Laucho", nombre: "Playa El Laucho", coords: [-18.487751288162805, -70.32673114903297], tipo: "turismo", img: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHdIQI9odjK5BKnkJjmhS-_U1HSzrC-vryYakvq0zsz2CwQZyqSbot7mLgEP5uhhadFq_td6GH1VEVyUAdi_I4pm0g3ERzpfLkSa08QdnSDL9Ke434SP5CX9OOSN5KNnMzS0VTS=w408-h306-k-no" },
        { id: "Playa La Lisera", nombre: "Playa La Lisera", coords: [-18.493078031811034, -70.32585411782172], tipo: "turismo", img: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFhv5Vfn51OsQn24iuJk9wW_BQARD27ClvCHD1EPkmlnuwzDmjj2B5-cb-fZAjt9wJJQ3PBL5INmp1TRECE4B8CK0rGMhkt41eQN24X8zpkFmmdlbliu6kBgb-2pZFsZ3dxEsOl1w=w408-h271-k-no" },
        { id: "punto_limpio2", nombre: "Punto Limpio Sodimac", coords: [-18.459759922767102, -70.29616007930915], tipo: "reciclaje", img: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFoJMk3Srbpw7YGXQQ_4e_kToy9YTb6m4_mysvBjJl3XfvKklfUcFgnbrT4HArdTyuTYaCPj0ozHka1_e1l2mwKACT0B7YOZVjIiNvsgEs15LeEZCLKnMXPeMjdD7shIW5oCGu8=w408-h306-k-no" },
    ];


    puntosArica.forEach(p => {
         
        const iconTurismo = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const iconReciclaje = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const iconParadero = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

        const comentarios = obtenerComentarios(p.id);
        const listaHtml = comentarios.map(c => `
            <div class="comment-item">
                <span><b>${"★".repeat(c.estrellas)}</b> ${c.texto}</span>
                <button class="btn-delete" onclick="eliminarComentario('${p.id}', ${c.c_id})">✕</button>
            </div>
        `).join("");

        const card = `
            <div class="custom-card">
                <img src="${p.img}" class="popup-img">
                <div class="popup-info">
                    <h3>${p.nombre}</h3>
                    <div class="comment-section">
                        <div class="comment-list">${listaHtml || "Sin reseñas"}</div>
                        <select id="stars-${p.id}" class="comment-input">
                            <option value="5">★★★★★</option><option value="4">★★★★</option>
                            <option value="3">★★★</option><option value="2">★★</option><option value="1">★</option>
                        </select>
                        <input type="text" id="input-${p.id}" class="comment-input" placeholder="Tu opinión...">
                        <button onclick="enviarComentario('${p.id}')" class="btn-comment">Publicar</button>
                    </div>
                </div>
            </div>`;
        
        let iconoActual;
        if (p.tipo === "turismo") iconoActual = iconTurismo;
        else if (p.tipo === "reciclaje") iconoActual = iconReciclaje;
        else if (p.tipo === "paradero") iconoActual = iconParadero;

        // Crear el marcador usando el ícono correspondiente
        const marker = L.marker(p.coords, { icon: iconoActual }).bindPopup(card, { className: 'custom-popup' });
        if (p.tipo === "turismo") marker.addTo(layerTurismo);
        else if (p.tipo === "reciclaje") marker.addTo(layerReciclaje);
        else if (p.tipo === "paradero") marker.addTo(layerParaderos);
    });

    const overlays = { "📍 Turismo": layerTurismo, "♻️ Reciclaje": layerReciclaje, "🚌 Paraderos": layerParaderos };
    L.control.layers(null, overlays, { collapsed: false }).addTo(map);

    // --- GPS Y BOTÓN DE UBICACIÓN ---
    const gpsIcon = L.divIcon({ className: 'user-location-icon', iconSize: [14, 14], iconAnchor: [7, 7] });
    let userMarker = L.marker([0, 0], { icon: gpsIcon }).addTo(map);
    let currentLatLng = null;

    map.locate({ watch: true, setView: false }); // Detectar pero NO mover solo
    map.on('locationfound', (e) => {
        currentLatLng = e.latlng;
        userMarker.setLatLng(e.latlng);
    });

    window.centrarEnUsuario = function() {
        if (currentLatLng) map.setView(currentLatLng, 16);
        else alert("Buscando señal GPS...");
    };
}