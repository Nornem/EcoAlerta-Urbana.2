// js/panel.js
// Panel del coordinador municipal:
// HU-024 mapa de calor con la densidad de reportes · HU-030 alertas de reportes con más de 24 h sin atención

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['coordinador']);
  if (!s) return;
  EcoUI.montarPanel({ activo: 'panel', titulo: 'Panel de control', subtitulo: 'Distrito de Chorrillos · datos al ' + new Date().toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;
  const m = EcoData.metricas();

  $('kpis').innerHTML = `
    <div class="kpi"><span>Reportes abiertos</span><strong>${m.abiertos}</strong><small>${m.enAtencion} en atención</small></div>
    <div class="kpi kpi--rojo"><span>Urgencia alta abiertos</span><strong>${m.altas}</strong><small>Priorizar hoy</small></div>
    <div class="kpi kpi--rojo"><span>Más de 24 h sin atención</span><strong>${m.sinAtencion}</strong><small>Requieren acción</small></div>
    <div class="kpi kpi--azul"><span>Tiempo promedio de respuesta</span><strong>${m.promedioHoras !== null ? Math.round(m.promedioHoras) + ' h' : '—'}</strong><small>Meta: 24 h</small></div>`;

  // ---------- HU-030 ----------
  const alertas = EcoData.sinAtencion24h().sort((a, b) => EcoData.horasDesde(a.fecha) < EcoData.horasDesde(b.fecha) ? 1 : -1);
  $('banner').innerHTML = alertas.length ? `${EcoUI.ICONOS.alert}<span>${alertas.length} reporte${alertas.length === 1 ? '' : 's'} supera${alertas.length === 1 ? '' : 'n'} 24 h sin atención</span>` : '✔ Ningún reporte supera las 24 h sin atención';
  if (!alertas.length) $('banner').style.cssText = 'background:var(--verde-claro);color:var(--verde-oscuro)';
  $('alertas').innerHTML = alertas.length ? alertas.map((r) => `
    <div class="alerta-item">
      <div class="alerta-item__cab"><span>${e(r.id)} · ${e(r.sector)}</span><span class="chip-horas">${Math.round(EcoData.horasDesde(r.fecha))} h</span></div>
      <h3>${e(r.direccion)}</h3>
      <p class="reporte__meta">${e(EcoData.CATEGORIAS[r.categoria])} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])} · ${EcoData.totalApoyos(r)} apoyos</p>
      <div class="acciones--fila"><a class="btn btn-sm btn-primario" href="incidencias.html?asignar=${encodeURIComponent(r.id)}">Asignar cuadrilla</a><a class="btn btn-sm btn-secundario" href="../vecino/ficha.html?id=${encodeURIComponent(r.id)}">Ver detalle</a></div>
    </div>`).join('') : '<p class="vacio">Todo al día.</p>';

  // ---------- HU-024 ----------
  $('f-cat').insertAdjacentHTML('beforeend', Object.entries(EcoData.CATEGORIAS).map(([k, t]) => `<label class="chip-op"><input type="checkbox" name="cat" value="${k}" checked><span>${t}</span></label>`).join(''));
  const abiertos = () => {
    const cats = [...document.querySelectorAll('input[name="cat"]:checked')].map((i) => i.value);
    return EcoData.reportes().filter((r) => typeof r.lat === 'number' && (r.estado === 'recibido' || r.estado === 'atencion') && cats.includes(r.categoria));
  };
  if (!EcoUI.mapaDisponible()) { $('mapa-calor').innerHTML = '<div class="mapa-sin-conexion">No se pudo cargar el mapa (sin conexión).</div>'; return; }
  const mapa = L.map('mapa-calor').setView([EcoData.CENTRO.lat, EcoData.CENTRO.lng], 14);
  EcoUI.capaBase(mapa);
  const capa = L.layerGroup().addTo(mapa);
  const dibujar = () => {
    capa.clearLayers();
    const lista = abiertos();
    // El calor se construye superponiendo círculos semitransparentes: donde hay más reportes, el color se intensifica.
    lista.forEach((r) => {
      const peso = EcoData.prioridad(r) / 100;
      [[420, '#F7E27A', 0.18], [260, '#F2A900', 0.22], [130, '#C0392B', 0.18 + peso * 0.25]].forEach(([rad, color, op]) => {
        L.circle([r.lat, r.lng], { radius: rad, stroke: false, fillColor: color, fillOpacity: op, interactive: false }).addTo(capa);
      });
      L.circleMarker([r.lat, r.lng], { radius: 6, color: '#fff', weight: 2, fillColor: EcoData.ESTADOS[r.estado].color, fillOpacity: 1 })
        .bindPopup(`<div class="popup-reporte"><h3>${e(r.direccion)}</h3><p>${e(EcoData.CATEGORIAS[r.categoria])} · prioridad ${EcoData.prioridad(r)}</p><p>${EcoUI.estadoTag(r.estado)}</p><a class="btn btn-sm btn-primario" href="incidencias.html?asignar=${encodeURIComponent(r.id)}">Gestionar</a></div>`).addTo(capa);
    });
    if (lista.length) mapa.fitBounds(L.latLngBounds(lista.map((r) => [r.lat, r.lng])), { padding: [40, 40], maxZoom: 15 });
  };
  dibujar();
  document.getElementById('f-cat').addEventListener('change', dibujar);
  setTimeout(() => mapa.invalidateSize(), 200);
});
