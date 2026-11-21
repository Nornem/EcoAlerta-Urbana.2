// js/mis-reportes.js
// HU-014: el vecino ve sus reportes y en qué estado están (Recibido → En atención → Resuelto).
// El líder comunal también puede ver los reportes de su sector.

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['vecino', 'lider']);
  if (!s) return;
  EcoUI.montarApp({ titulo: s.rol === 'lider' ? 'Reportes' : 'Mis reportes', activo: 'mis-reportes' });
  const e = EcoData.escapar;
  const $ = (id) => document.getElementById(id);
  let vista = 'mios';
  let estado = 'todos';
  const conNovedad = new Set(EcoData.notificaciones(s.usuario).filter((n) => !n.leida).map((n) => n.reporteId));

  if (s.rol === 'lider') {
    $('pestanas').innerHTML = `<button type="button" role="tab" class="btn btn-sm btn-primario" data-vista="mios" aria-selected="true">Mis reportes</button>
      <button type="button" role="tab" class="btn btn-sm btn-secundario" data-vista="sector" aria-selected="false">De mi sector</button>`;
    $('pestanas').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-vista]');
      if (!b) return;
      vista = b.dataset.vista;
      $('pestanas').querySelectorAll('button').forEach((x) => { const on = x === b; x.className = `btn btn-sm ${on ? 'btn-primario' : 'btn-secundario'}`; x.setAttribute('aria-selected', on); });
      pintar();
    });
  }

  const estados = [['todos', 'Todos'], ['recibido', 'Recibido'], ['atencion', 'En atención'], ['resuelto', 'Resuelto']];
  $('filtro-estado').innerHTML = estados.map(([k, t]) => `<label class="chip-op"><input type="radio" name="est" value="${k}" ${k === 'todos' ? 'checked' : ''}><span>${t}</span></label>`).join('');
  $('filtro-estado').addEventListener('change', (ev) => { estado = ev.target.value; pintar(); });

  const linea = (est) => {
    if (est === 'descartado') return '';
    const idx = EcoData.ORDEN_ESTADOS.indexOf(est);
    return `<div class="timeline">${EcoData.ORDEN_ESTADOS.map((k, i) => `<div class="paso ${est === 'resuelto' || i < idx ? 'hecho' : i === idx ? 'actual estado-paso-' + k : ''}"><i></i>${EcoData.ESTADOS[k].texto}</div>`).join('')}</div>`;
  };

  const tarjeta = (r) => `
    <article class="reporte${conNovedad.has(r.id) ? ' reporte--nuevo' : ''}">
      <div class="reporte__foto" ${r.foto ? `style="background-image:url('${e(r.foto)}')" role="img" aria-label="Foto del reporte ${e(r.id)}"` : ''}>${r.foto ? '' : EcoUI.ICONOS.camera}</div>
      <div class="reporte__info">
        <p class="reporte__meta">${e(r.id)} · ${e(EcoData.formatearFecha(r.fecha))}${conNovedad.has(r.id) ? ' · <strong style="color:#174A85">Novedad</strong>' : ''}</p>
        <h3>${e(r.direccion)}</h3>
        <p class="reporte__meta">${e(EcoData.CATEGORIAS[r.categoria])} · ${EcoData.totalApoyos(r)} apoyos</p>
        <div>${EcoUI.estadoTag(r.estado)}</div>
        ${linea(r.estado)}
        <div class="reporte__acciones"><a class="btn btn-sm btn-secundario" href="ficha.html?id=${encodeURIComponent(r.id)}">Ver detalle</a></div>
      </div>
    </article>`;

  const pintar = () => {
    const base = EcoData.reportes().filter((r) => (vista === 'mios' ? r.autor === s.usuario : r.sector === s.sector)).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const lista = base.filter((r) => estado === 'todos' || r.estado === estado);
    const pend = base.filter((r) => r.estado === 'recibido' || r.estado === 'atencion').length;
    $('resumen').textContent = base.length ? `${base.length} reporte${base.length === 1 ? '' : 's'} · ${pend} pendiente${pend === 1 ? '' : 's'} de solución` : '';
    $('lista').innerHTML = lista.length ? lista.map(tarjeta).join('')
      : base.length ? '<p class="vacio">No hay reportes con ese estado.</p>'
        : `<div class="card vacio"><h2 class="seccion-titulo" style="text-align:center">Aún no tienes reportes</h2><p>Cuando reportes un punto de basura, aquí verás si fue recibido, si está en atención o si ya se resolvió.</p><a class="btn btn-primario" href="reportar.html" style="margin-top:10px">Hacer mi primer reporte</a></div>`;
  };
  pintar();
});
