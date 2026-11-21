// js/mapa.js
// HU-016 mapa comunitario · HU-018 filtros por estado, tipo y fecha · HU-046 acceso sin registro

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.montarApp({ titulo: 'Mapa comunitario', activo: 'mapa' });
  const e = EcoData.escapar;
  const $ = (id) => document.getElementById(id);
  const idDestacado = new URLSearchParams(location.search).get('id');
  if (s && (s.rol === 'vecino' || s.rol === 'lider')) $('fab-reportar').hidden = false;

  // ---------- Filtros ----------
  const chip = (tipo, name, v, t, on = true) => `<label class="chip-op"><input type="${tipo}" name="${name}" value="${v}" ${on ? 'checked' : ''}><span>${t}</span></label>`;
  $('f-estado').insertAdjacentHTML('beforeend', EcoData.ORDEN_ESTADOS.map((k) => chip('checkbox', 'estado', k, EcoData.ESTADOS[k].texto)).join(''));
  $('f-categoria').insertAdjacentHTML('beforeend', Object.entries(EcoData.CATEGORIAS).map(([k, t]) => chip('checkbox', 'categoria', k, t)).join(''));
  $('f-fecha').insertAdjacentHTML('beforeend', [['todo', 'Todas'], ['24', 'Últimas 24 h'], ['168', 'Últimos 7 días'], ['720', 'Últimos 30 días']].map(([v, t], i) => chip('radio', 'fecha', v, t, i === 0)).join(''));
  if (s) $('f-mios').hidden = false;
  if (s && !s.sector) $('f-mios').querySelector('[name="sector"]').closest('label').hidden = true;

  const form = $('form-filtros');
  const leerFiltros = () => {
    const marc = (n) => [...form.querySelectorAll(`input[name="${n}"]:checked`)].map((i) => i.value);
    return { estados: marc('estado'), categorias: marc('categoria'), fecha: marc('fecha')[0] || 'todo', mios: marc('mios').length > 0, sector: marc('sector').length > 0 };
  };
  const filtrar = (f) => EcoData.reportes().filter((r) => typeof r.lat === 'number' && r.estado !== 'descartado'
    && f.estados.includes(r.estado) && f.categorias.includes(r.categoria)
    && (f.fecha === 'todo' || EcoData.horasDesde(r.fecha) <= Number(f.fecha))
    && (!f.mios || (s && r.autor === s.usuario))
    && (!f.sector || (s && r.sector === s.sector)));
  const activos = (f) => (f.estados.length < 3) + (f.categorias.length < 5) + (f.fecha !== 'todo') + f.mios + f.sector;

  $('btn-filtros').addEventListener('click', () => EcoUI.abrirModal('modal-filtros'));
  $('btn-limpiar').addEventListener('click', () => {
    form.querySelectorAll('input[name="estado"], input[name="categoria"]').forEach((i) => { i.checked = true; });
    form.querySelector('input[name="fecha"][value="todo"]').checked = true;
    form.querySelectorAll('input[name="mios"], input[name="sector"]').forEach((i) => { i.checked = false; });
  });

  // ---------- Ficha corta ----------
  const ficha = (r) => `
    <div class="popup-reporte">
      ${r.foto ? `<img src="${e(r.foto)}" alt="Foto del reporte ${e(r.id)}">` : ''}
      <h3>${e(r.direccion)}</h3>
      <p>${e(EcoData.CATEGORIAS[r.categoria])} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])}</p>
      <p>${EcoUI.estadoTag(r.estado)} · ${EcoData.totalApoyos(r)} vecinos se suman</p>
      <p>${e(r.id)} · ${e(EcoData.formatearFecha(r.fecha))}${s && r.autor === s.usuario ? ' · <strong>Tu reporte</strong>' : ''}</p>
      <a class="btn btn-sm btn-primario" href="ficha.html?id=${encodeURIComponent(r.id)}">Ver ficha y apoyar</a>
    </div>`;

  const resumen = (vis, total) => {
    const pend = vis.filter((r) => r.estado !== 'resuelto').length;
    $('resumen').textContent = vis.length ? `${vis.length} de ${total} puntos · ${pend} pendiente${pend === 1 ? '' : 's'}` : 'No hay reportes con estos filtros';
    const n = activos(leerFiltros());
    $('btn-filtros').textContent = n ? `Filtros (${n})` : 'Filtros';
  };

  // ---------- Mapa real ----------
  if (EcoUI.mapaDisponible()) {
    const mapa = L.map('mapa', { zoomControl: false }).setView([EcoData.CENTRO.lat, EcoData.CENTRO.lng], 14);
    L.control.zoom({ position: 'bottomright' }).addTo(mapa);
    EcoUI.capaBase(mapa);
    const capa = L.layerGroup().addTo(mapa);
    const marcadores = {};
    const dibujar = (primera) => {
      const total = EcoData.reportes().filter((r) => typeof r.lat === 'number' && r.estado !== 'descartado').length;
      const vis = filtrar(leerFiltros());
      capa.clearLayers();
      vis.forEach((r) => {
        const mio = s && r.autor === s.usuario;
        marcadores[r.id] = L.marker([r.lat, r.lng], { icon: EcoUI.iconoPin(EcoData.ESTADOS[r.estado].color, mio), title: `${r.direccion}: ${EcoData.ESTADOS[r.estado].texto}`, keyboard: true }).bindPopup(ficha(r)).addTo(capa);
      });
      resumen(vis, total);
      if (primera && idDestacado && marcadores[idDestacado]) { mapa.setView(marcadores[idDestacado].getLatLng(), 17); marcadores[idDestacado].openPopup(); }
      else if (vis.length) mapa.fitBounds(L.latLngBounds(vis.map((r) => [r.lat, r.lng])), { padding: [60, 60], maxZoom: 16 });
    };
    dibujar(true);
    setTimeout(() => mapa.invalidateSize(), 200);
    form.addEventListener('submit', (ev) => { ev.preventDefault(); dibujar(false); EcoUI.cerrarModal('modal-filtros'); });
    return;
  }

  // ---------- Sin conexión al mapa: lista simple ----------
  const lienzo = $('mapa');
  const dibujarLista = () => {
    const total = EcoData.reportes().filter((r) => r.estado !== 'descartado').length;
    const vis = filtrar(leerFiltros());
    resumen(vis, total);
    lienzo.innerHTML = `<div class="mapa-sin-conexion"><div style="max-width:560px;width:100%;display:grid;gap:10px;padding-top:60px">
      <p>No se pudo cargar el mapa (sin conexión). Estos son los reportes:</p>
      ${vis.map((r) => `<div class="card" style="text-align:left">${ficha(r)}</div>`).join('')}</div></div>`;
    lienzo.style.overflowY = 'auto';
  };
  dibujarLista();
  form.addEventListener('submit', (ev) => { ev.preventDefault(); dibujarLista(); EcoUI.cerrarModal('modal-filtros'); });
});
