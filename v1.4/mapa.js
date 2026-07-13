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
        { id: "estadio_carlos_dittborn", nombre: "Estadio Carlos Dittborn", coords: [-18.4875, -70.299167], tipo: "turismo", img: "https://worner.cl/wp-content/uploads/2021/10/20131214_131329-1200x900.jpg" },
        { id: "parque_brasil", nombre: "Parque Brasil", coords: [-18.473889, -70.315833], tipo: "turismo", img: "https://www.fronteranorte.cl/wp-content/uploads/2022/10/Juegos-Parque-Brasil.jpg" },
        { id: "estadio_cerro_la_cruz", nombre: "Estadio Cerro La Cruz", coords: [-18.489722, -70.311111], tipo: "turismo", img: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGk393UOZRPYHWgZsfMnj6WKou5wsHSAkcLY2E6fK2KX5FoMMATq_e-3VAYMB6AYVHH55AOxU0f9RL3-2P87HAro57LqzqfFNbG1RKj64vIcYKi69YLcVeMmNVV725TRe9ldC-D=s680-w680-h510-rw" },
        { id: "plaza_colon", nombre: "Plaza Cristóbal Colón", coords: [-18.478333, -70.320833], tipo: "turismo", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/41/f4/96/view-from-the-cathedral.jpg?w=900&h=-1&s=1" },
        { id: "catedral_san_marcos", nombre: "Catedral de San Marcos", coords: [-18.478889, -70.320833], tipo: "turismo", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/46/18/3f/img-20181023-141007-02.jpg?w=1200&h=1200&s=1" },
        { id: "museo_del_mar", nombre: "Museo del Mar de Arica", coords: [-18.479167, -70.318889], tipo: "turismo", img: "https://www.nochedemuseos.cl/sites/default/files/styles/slider_cultural_space/public/node/cultural_space/2025-10/Fachada-2.jpg?h=0eaffb7c&itok=IDU5KWM9" },
        { id: "museo_colon_10", nombre: "Museo de Sitio Colón 10", coords: [-18.4806329, -70.3216242], tipo: "turismo", img: "https://www.expedientechinchorro.cl/wp-content/uploads/2024/08/museo-colon-10-c.jpg" },
        { id: "ex_isla_alacran", nombre: "Península del Alacrán", coords: [-18.48, -70.331389], tipo: "turismo", img: "https://www.aricaldia.cl/wp-content/uploads/2023/08/Captura-de-Pantalla-2023-08-19-a-las-11.06.41.png" },
        { id: "museo_morro", nombre: "Museo Histórico y de Armas del Morro", coords: [-18.48, -70.324722], tipo: "turismo", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/ba/ba/c3/entrance-to-the-historical.jpg?w=1200&h=1200&s=1" },
        { id: "cristo_de_la_paz", nombre: "Cristo de la Paz", coords: [-18.481540, -70.323890], tipo: "turismo", img: "https://www.monumentos.gob.cl/sites/default/files/image-monumentos/00083_mh_15101.jpg" },
        { id: "ex_aduana_arica", nombre: "Edificio Histórico Ex Aduana", coords: [-18.477222, -70.321111], tipo: "turismo", img: "https://i.pinimg.com/originals/3c/2f/34/3c2f34b570e424ebddd2ae6e623f74f5.jpg" },
        { id: "ex_estacion_ferrocarril", nombre: "Ex Estación Ferrocarril Arica-La Paz", coords: [-18.476944, -70.320000], tipo: "turismo", img: "https://thumbs.dreamstime.com/b/ferrocarril-de-paz-del-arica-la-exterior-en-arica-chile-48382634.jpg" },
        { id: "punto_limpio_bottai", nombre: "Punto Limpio Vidrio Bottai", coords: [-18.511074, -70.276096], tipo: "reciclaje", img: "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=jkl_StDIpTAlER2iIUKp4g&cb_client=search.gws-prod.gps&w=408&h=240&yaw=48.603054&pitch=0&thumbfov=100" },
        { id: "Paradero2", nombre: "Paradero", coords: [-18.490041219549774, -70.2951158381785], tipo: "paradero", img: "images/ParaderoUta.png" },
        { id: "Paradero3", nombre: "Paradero", coords: [-18.48981864127164, -70.29505146516573], tipo: "paradero", img: "images/ParaderoUta2.png" },
        { id: "Paradero4", nombre: "Paradero", coords: [-18.486919753376856, -70.29645111400721], tipo: "paradero", img: "images/ParaderoUta3.png" },
        { id: "Paradero5", nombre: "Paradero", coords: [-18.48685615845173, -70.29765006142334], tipo: "paradero", img: "images/ParaderoEstadio.png" },
        { id: "Paradero6", nombre: "Paradero", coords: [-18.48301982247322, -70.31178716497162], tipo: "paradero", img: "images/ParaderoHospital.png" },
        { id: "Paradero7", nombre: "Paradero", coords: [-18.483527948779354, -70.31015614768403], tipo: "paradero", img: "images/ParaderoSantoT.png" },
        { id: "Paradero8", nombre: "Paradero", coords: [-18.483691549117765, -70.30974772610887], tipo: "paradero", img: "images/ParaderoSantoT2.png" },
        { id: "Paradero9", nombre: "Paradero", coords: [-18.480172089724746, -70.3117631034682], tipo: "paradero", img: "images/ParaderoChacabuco.png" },
        { id: "Paradero10", nombre: "Paradero", coords: [-18.481996145508127, -70.31396784085624], tipo: "paradero", img: "images/ParaderoArturoG.png" },
        { id: "Paradero11", nombre: "Paradero", coords: [-18.482390198962808, -70.31444205501934], tipo: "paradero", img: "images/ParaderoArturoG2.png" },
        { id: "Paradero12", nombre: "Paradero", coords: [-18.47827723375044, -70.31786441067567], tipo: "paradero", img: "images/Paradero18sepCentro.png" },
        { id: "Paradero13", nombre: "Paradero", coords: [-18.484087351309068, -70.30748740535493], tipo: "paradero", img: "images/Paradero18sep.png" },
        { id: "", nombre: "", coords: [], tipo: "", img: "" }
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