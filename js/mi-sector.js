// js/mi-sector.js
// Vista del líder comunal: indicadores de su sector (HU-043), jornadas (HU-047)
// y resumen para compartir con los vecinos por WhatsApp (HU-021).

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['lider']);
  if (!s) return;
  EcoUI.montarApp({ titulo: 'Mi sector', activo: 'mi-sector' });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;

  const delSector = (r) => r.sector === s.sector;
  const m = EcoData.metricas(delSector);
  $('junta').textContent = (s.junta || 'Junta vecinal') + ' · ' + (s.distrito || 'Chorrillos');
  $('titulo-sector').textContent = s.sector || 'Elige tu sector en tu perfil';

  $('kpis').innerHTML = `
    <div class="kpi kpi--rojo"><span>Reportes abiertos</span><strong>${m.abiertos}</strong><small>${m.enAtencion} en atención</small></div>
    <div class="kpi"><span>Resueltos</span><strong>${m.resueltos}</strong><small>en el sector</small></div>
    <div class="kpi kpi--azul"><span>Tiempo promedio de respuesta</span><strong>${m.promedioHoras !== null ? Math.round(m.promedioHoras) + ' h' : '—'}</strong><small>desde el reporte hasta la limpieza</small></div>
    <div class="kpi kpi--ambar"><span>Más de 24 h sin atención</span><strong>${m.sinAtencion}</strong><small>para reclamar a la municipalidad</small></div>`;

  const abiertos = EcoData.reportes().filter((r) => delSector(r) && (r.estado === 'recibido' || r.estado === 'atencion'))
    .sort((a, b) => EcoData.prioridad(b) - EcoData.prioridad(a));
  $('zonas').innerHTML = abiertos.length ? abiertos.map((r) => {
    const p = EcoData.prioridad(r);
    return `<a class="tarea" href="../vecino/ficha.html?id=${encodeURIComponent(r.id)}">
      <div class="tarea__cab"><span class="prio prio-${EcoData.nivelPrioridad(p)}" aria-label="Prioridad ${p}">${p}</span>${EcoUI.estadoTag(r.estado)}</div>
      <h3>${e(r.direccion)}</h3>
      <p class="reporte__meta">${e(EcoData.CATEGORIAS[r.categoria])} · ${EcoData.totalApoyos(r)} apoyos · hace ${e(EcoData.formatearHoras(EcoData.horasDesde(r.fecha)))}</p>
    </a>`;
  }).join('') : '<p class="vacio">No hay reportes abiertos en tu sector. ¡Buen trabajo!</p>';

  const cats = Object.entries(EcoData.CATEGORIAS).map(([k, t]) => [t, EcoData.reportes().filter((r) => delSector(r) && r.categoria === k && r.estado !== 'descartado').length]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...cats.map((c) => c[1]));
  $('categorias').innerHTML = cats.map(([t, n], i) => `<li><div class="fila"><span>${e(t)}</span><strong>${n}</strong></div><div class="riel"><i style="width:${(n / max) * 100}%;background:${i === 0 ? '#C0392B' : '#1B6B4A'}"></i></div></li>`).join('');

  const pintarJornadas = () => {
    const subs = EcoData.suscripciones(s.usuario);
    const lista = EcoData.jornadas().filter((j) => j.sector === s.sector || j.sector === 'Todos');
    $('jornadas').innerHTML = lista.length ? lista.map((j) => {
      const d = new Date(j.fecha);
      return `<div class="card" style="display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center">
        <div style="background:var(--verde-claro);border-radius:12px;text-align:center;padding:8px 0;color:var(--verde-oscuro)"><small style="font-weight:700">${d.toLocaleDateString('es-PE', { weekday: 'short' }).toUpperCase()}</small><div style="font-family:var(--fuente-titulos);font-size:1.6rem;font-weight:700;line-height:1">${d.getDate()}</div></div>
        <div style="display:grid;gap:4px"><strong>${e(j.titulo)}</strong><span class="ayuda">${e(d.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' }))} · ${e(j.lugar)}</span>
        <button type="button" class="btn btn-sm ${subs.includes(j.id) ? 'btn-activo' : 'btn-secundario'}" data-jornada="${j.id}" aria-pressed="${subs.includes(j.id)}">${subs.includes(j.id) ? '✔ Te avisaremos' : 'Avisarme'}</button></div>
      </div>`;
    }).join('') : '<p class="vacio">No hay jornadas programadas.</p>';
  };
  $('jornadas').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-jornada]');
    if (!b) return;
    EcoUI.toast(EcoData.alternarSuscripcion(s.usuario, b.dataset.jornada) ? 'Te avisaremos antes de la jornada.' : 'Ya no recibirás avisos de esta jornada.');
    pintarJornadas();
  });
  pintarJornadas();

  const top = abiertos.slice(0, 3).map((r, i) => `${i + 1}. ${r.direccion} (${EcoData.CATEGORIAS[r.categoria]}, ${EcoData.ESTADOS[r.estado].texto})`).join('\n');
  const prox = EcoData.jornadas().find((j) => j.sector === s.sector);
  const texto = `📊 Resumen de limpieza · ${s.sector}\n• ${m.abiertos} reportes abiertos (${m.sinAtencion} con más de 24 h sin atención)\n• ${m.resueltos} resueltos\n${top ? '\nPuntos prioritarios:\n' + top + '\n' : ''}${prox ? `\n📅 Próxima jornada: ${prox.titulo}, ${EcoUI.fechaLarga(prox.fecha)} en ${prox.lugar}.\n` : ''}\nSúmate a los reportes en EcoAlerta Urbana: ${new URL(EcoUI.ruta('vecino/mapa.html'), location.href).href}`;
  $('btn-resumen').href = EcoUI.enlaceWhatsApp(texto);
});
