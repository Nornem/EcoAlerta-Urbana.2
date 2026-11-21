// js/reportar.js
// Reporte del vecino en menos de un minuto:
// HU-007 foto · HU-008 GPS · HU-009 categoría · HU-010 envío rápido · HU-011 ajuste del pin · HU-013 magnitud

document.addEventListener('DOMContentLoaded', () => {
  const usuario = EcoUI.proteger(['vecino', 'lider']);
  if (!usuario) return;
  EcoUI.montarApp({ titulo: 'Reportar basura', activo: 'reportar' });
  const inicio = Date.now();
  const $ = (id) => document.getElementById(id);

  const form = $('form-reporte');
  const areaFoto = $('area-foto');
  const inputFoto = $('input-foto');
  const inputUbic = $('ubicacion');
  const estadoUbic = $('estado-ubicacion');
  const grupoCat = $('grupo-categoria');
  const alerta = $('alerta-reporte');
  const btnEnviar = $('btn-enviar');

  const reporte = { foto: null, lat: null, lng: null, direccion: '', manual: false };

  // Categorías como opciones tipo chip (HU-009)
  grupoCat.insertAdjacentHTML('beforeend', Object.entries(EcoData.CATEGORIAS).map(([v, t]) =>
    `<label class="chip-op"><input type="radio" name="categoria" value="${v}"><span>${t}</span></label>`).join(''));

  // ---------- Errores ----------
  const campoDe = (el) => el.closest('.campo');
  const marcarError = (el, msg) => { const c = campoDe(el); c.classList.add('con-error'); c.querySelector('.error-app').textContent = msg; };
  const limpiarError = (el) => {
    const c = campoDe(el);
    c.classList.remove('con-error');
    c.querySelector('.error-app').textContent = '';
    if (!form.querySelector('.con-error')) alerta.hidden = true;
  };
  const ponerEstado = (txt, tipo = '') => { estadoUbic.textContent = txt; estadoUbic.className = 'ayuda' + (tipo ? ' ' + tipo : ''); };
  const coords = (lat, lng) => `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;

  // ---------- HU-007: foto ----------
  const abrirFoto = () => inputFoto.click();
  areaFoto.addEventListener('click', abrirFoto);
  areaFoto.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrirFoto(); } });
  inputFoto.addEventListener('change', async () => {
    const archivo = inputFoto.files[0];
    if (!archivo) return;
    try {
      reporte.foto = await EcoUI.leerImagen(archivo);
      $('foto-preview').src = reporte.foto;
      $('foto-preview').hidden = false;
      $('foto-cambiar').hidden = false;
      $('foto-vacio').hidden = true;
      areaFoto.classList.add('con-foto');
      areaFoto.setAttribute('aria-label', 'Foto adjuntada. Toca para cambiarla');
      limpiarError(areaFoto);
    } catch (err) {
      marcarError(areaFoto, err.message);
    } finally { inputFoto.value = ''; }
  });

  // ---------- HU-008: GPS ----------
  const direccionDe = async (lat, lng) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=es`, { signal: ctrl.signal });
      const d = await r.json();
      const a = d.address || {};
      const calle = [a.road || a.pedestrian || a.footway, a.house_number].filter(Boolean).join(' ');
      const zona = a.suburb || a.neighbourhood || a.city_district || a.city;
      return [calle, zona].filter(Boolean).join(', ') || `Punto GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (e) { return `Punto GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`; } finally { clearTimeout(t); }
  };

  const fijar = async (lat, lng, { manual = false, precision = null } = {}) => {
    Object.assign(reporte, { lat, lng, manual });
    inputUbic.value = 'Obteniendo dirección…';
    limpiarError(inputUbic);
    ponerEstado(manual ? 'Ubicación marcada por ti en el mapa ✔' : `Ubicación detectada por GPS ✔${precision ? ` (±${Math.round(precision)} m)` : ''}`, 'ok');
    const dir = await direccionDe(lat, lng);
    if (reporte.lat === lat && reporte.lng === lng) { reporte.direccion = dir; inputUbic.value = dir; }
  };

  const habilitarEscritura = (motivo) => {
    inputUbic.readOnly = false;
    inputUbic.value = '';
    inputUbic.placeholder = 'Escribe la dirección o una referencia';
    ponerEstado(`${motivo} Escribe la dirección o toca "Ajustar" para marcarla en el mapa.`, 'aviso');
  };

  const gps = () => new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new Error('Tu dispositivo no permite obtener la ubicación.')); return; }
    navigator.geolocation.getCurrentPosition(resolve, (err) => reject(new Error({ 1: 'No diste permiso para usar tu ubicación.', 2: 'No pudimos obtener tu ubicación.', 3: 'El GPS tardó demasiado.' }[err.code] || 'No pudimos obtener tu ubicación.')), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  });

  (async () => {
    try { const p = await gps(); await fijar(p.coords.latitude, p.coords.longitude, { precision: p.coords.accuracy }); }
    catch (err) { if (reporte.lat === null) habilitarEscritura(err.message); }
  })();

  inputUbic.addEventListener('input', () => {
    reporte.direccion = inputUbic.value.trim();
    reporte.lat = null; reporte.lng = null; reporte.manual = true;
    if (reporte.direccion) limpiarError(inputUbic);
  });

  // ---------- HU-011: ajustar el pin ----------
  let mapa = null, pin = null, temporal = null;
  const moverPin = (lat, lng) => { temporal = { lat, lng }; if (pin) pin.setLatLng([lat, lng]); $('coords-ajuste').textContent = 'Punto elegido: ' + coords(lat, lng); };
  $('btn-ajustar').addEventListener('click', () => {
    EcoUI.abrirModal('modal-ubicacion');
    const ini = reporte.lat !== null ? { lat: reporte.lat, lng: reporte.lng } : EcoData.CENTRO;
    if (!EcoUI.mapaDisponible()) {
      $('mapa-ajuste').hidden = true; $('ayuda-mapa').hidden = true; $('btn-usar-gps').hidden = true;
      $('direccion-manual-campo').hidden = false;
      $('direccion-manual').value = reporte.direccion;
      return;
    }
    if (!mapa) {
      mapa = L.map('mapa-ajuste').setView([ini.lat, ini.lng], 17);
      EcoUI.capaBase(mapa);
      pin = L.marker([ini.lat, ini.lng], { draggable: true, icon: EcoUI.iconoPin('#1B6B4A', true), title: 'Arrastra el pin' }).addTo(mapa);
      pin.on('dragend', () => { const p = pin.getLatLng(); moverPin(p.lat, p.lng); });
      mapa.on('click', (ev) => moverPin(ev.latlng.lat, ev.latlng.lng));
    } else mapa.setView([ini.lat, ini.lng], 17);
    moverPin(ini.lat, ini.lng);
    setTimeout(() => mapa.invalidateSize(), 300);
  });
  $('btn-usar-gps').addEventListener('click', async () => {
    try { const p = await gps(); moverPin(p.coords.latitude, p.coords.longitude); mapa.setView([p.coords.latitude, p.coords.longitude], 17); }
    catch (err) { $('coords-ajuste').textContent = err.message + ' Marca el punto tocando el mapa.'; }
  });
  $('btn-confirmar-ubic').addEventListener('click', () => {
    if (EcoUI.mapaDisponible() && temporal) fijar(temporal.lat, temporal.lng, { manual: true });
    else {
      const t = $('direccion-manual').value.trim();
      if (!t) { $('direccion-manual').focus(); return; }
      inputUbic.value = t; reporte.direccion = t; reporte.manual = true;
      limpiarError(inputUbic); ponerEstado('Dirección escrita por ti ✔', 'ok');
    }
    EcoUI.cerrarModal('modal-ubicacion');
  });

  form.addEventListener('change', (ev) => { if (ev.target.name === 'categoria') limpiarError(grupoCat); });

  // ---------- HU-010: validar y enviar ----------
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const errores = [];
    if (!reporte.foto) { marcarError(areaFoto, 'Agrega una foto del punto de basura.'); errores.push(areaFoto); }
    const categoria = form.querySelector('input[name="categoria"]:checked');
    const hayUbic = reporte.lat !== null || inputUbic.value.trim() !== '';
    if (!hayUbic || inputUbic.value === 'Obteniendo dirección…' && reporte.lat === null) { marcarError(inputUbic, 'Indica dónde está la basura: activa el GPS, toca "Ajustar" o escribe la dirección.'); errores.push(inputUbic.readOnly ? $('btn-ajustar') : inputUbic); }
    if (!categoria) { marcarError(grupoCat, 'Elige el tipo de residuo.'); errores.push(grupoCat.querySelector('input')); }
    if (errores.length) {
      alerta.textContent = errores.length === 1 ? 'Falta 1 dato para enviar tu reporte.' : `Faltan ${errores.length} datos para enviar tu reporte.`;
      alerta.hidden = false;
      errores[0].focus();
      return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando…';
    setTimeout(() => {
      const { reporte: r, sinFoto } = EcoData.crear({
        foto: reporte.foto, lat: reporte.lat, lng: reporte.lng,
        direccion: reporte.direccion || inputUbic.value.trim(),
        categoria: categoria.value,
        urgencia: form.querySelector('input[name="urgencia"]:checked').value,
        magnitud: form.querySelector('input[name="magnitud"]:checked').value
      }, usuario);
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar reporte';
      if (!r) { alerta.textContent = 'No se pudo guardar el reporte. Inténtalo de nuevo.'; alerta.hidden = false; return; }
      const seg = Math.max(1, Math.round((Date.now() - inicio) / 1000));
      $('texto-conf').textContent = `La municipalidad ya recibió tu reporte. Lo completaste en ${seg < 60 ? seg + ' segundos' : Math.floor(seg / 60) + ' min ' + (seg % 60) + ' s'}.` + (sinFoto ? ' (La foto no se pudo guardar en este dispositivo.)' : '');
      const e = EcoData.escapar;
      $('resumen-conf').innerHTML = `<span><strong>N.° de reporte:</strong> ${e(r.id)}</span><span><strong>Lugar:</strong> ${e(r.direccion)}</span><span><strong>Residuo:</strong> ${e(EcoData.CATEGORIAS[r.categoria])} · ${e(EcoData.MAGNITUDES[r.magnitud])} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])}</span><span><strong>Estado:</strong> ${EcoUI.estadoTag('recibido')}</span>`;
      $('ir-ficha').href = 'ficha.html?id=' + encodeURIComponent(r.id);
      EcoUI.abrirModal('modal-confirmacion');
    }, 500);
  });
  $('otro-reporte').addEventListener('click', () => location.reload());
});
