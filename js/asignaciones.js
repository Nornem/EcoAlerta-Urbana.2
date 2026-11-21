// js/asignaciones.js
// Fiscalizador en campo:
// HU-033 recibir las órdenes asignadas · HU-027 filtrar por estado y categoría
// HU-034 abrir la ruta en Google Maps o Waze · HU-036 verificar o descartar el reporte

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['fiscalizador']);
  if (!s) return;
  EcoUI.montarApp({ titulo: 'Mis asignaciones', activo: 'asignaciones' });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;
  const cuadrilla = EcoData.CUADRILLAS.find((c) => c.id === s.cuadrilla);
  $('cuadrilla').textContent = `${s.nombre} · ${cuadrilla ? cuadrilla.nombre : 'Sin cuadrilla'}`;

  // Estados de trabajo del fiscalizador
  const etapa = (r) => (r.estado === 'resuelto' ? 'saneado' : r.validado ? 'proceso' : 'pendiente');
  const ETAPAS = { pendiente: 'Pendiente', proceso: 'En proceso', saneado: 'Saneado' };
  let filtroEstado = 'pendiente';
  let actual = null;

  $('filtro-estado').innerHTML = [['todos', 'Todos'], ...Object.entries(ETAPAS)].map(([k, t]) => `<label class="chip-op"><input type="radio" name="etapa" value="${k}" ${k === filtroEstado ? 'checked' : ''}><span>${t}&nbsp;<b data-n="${k}"></b></span></label>`).join('');
  $('filtro-cat').innerHTML = '<option value="">Todos los tipos</option>' + Object.entries(EcoData.CATEGORIAS).map(([k, t]) => `<option value="${k}">${t}</option>`).join('');
  $('filtro-estado').addEventListener('change', (ev) => { filtroEstado = ev.target.value; pintar(); });
  $('filtro-cat').addEventListener('change', pintar);

  const MOTIVOS = ['El punto ya estaba limpio', 'Ubicación incorrecta', 'Reporte duplicado', 'La foto no corresponde'];
  $('motivos').insertAdjacentHTML('beforeend', MOTIVOS.map((m) => `<label class="chip-op"><input type="radio" name="motivo" value="${m}"><span>${m}</span></label>`).join(''));

  function pintar() {
    const mios = EcoData.reportes().filter((r) => r.cuadrilla === s.cuadrilla && r.estado !== 'descartado')
      .sort((a, b) => EcoData.prioridad(b) - EcoData.prioridad(a));
    const hoy = mios.filter((r) => etapa(r) !== 'saneado');
    $('kpis').innerHTML = `<div class="kpi kpi--rojo"><span>Por atender</span><strong>${hoy.length}</strong><small>${hoy.filter((r) => r.urgencia === 'alta').length} de urgencia alta</small></div>
      <div class="kpi"><span>Saneados</span><strong>${mios.length - hoy.length}</strong><small>con evidencia</small></div>`;
    Object.keys(ETAPAS).concat('todos').forEach((k) => {
      const n = k === 'todos' ? mios.length : mios.filter((r) => etapa(r) === k).length;
      const b = document.querySelector(`[data-n="${k}"]`);
      if (b) b.textContent = `(${n})`;
    });
    const cat = $('filtro-cat').value;
    const lista = mios.filter((r) => (filtroEstado === 'todos' || etapa(r) === filtroEstado) && (!cat || r.categoria === cat));
    $('lista').innerHTML = lista.length ? lista.map((r) => {
      const p = EcoData.prioridad(r);
      const destino = typeof r.lat === 'number' ? `${r.lat},${r.lng}` : encodeURIComponent(r.direccion + ', Chorrillos, Lima');
      const et = etapa(r);
      return `<article class="tarea">
        <div class="tarea__cab"><span class="prio prio-${EcoData.nivelPrioridad(p)}" aria-label="Prioridad ${p}">${p}</span><span class="etiqueta-estado ${et === 'saneado' ? 'estado-resuelto' : et === 'proceso' ? 'estado-atencion' : 'estado-recibido'}">${ETAPAS[et]}</span></div>
        <h3>${e(r.direccion)}</h3>
        <p class="reporte__meta">${e(r.id)} · ${e(EcoData.CATEGORIAS[r.categoria])} · ${e(EcoData.MAGNITUDES[r.magnitud])} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])}</p>
        ${r.nota ? `<p class="alerta alerta-info" style="padding:8px 10px;font-size:0.85rem">Nota del coordinador: ${e(r.nota)}</p>` : ''}
        ${et !== 'saneado' ? `<div class="acciones--fila">
          <a class="btn btn-sm btn-secundario" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${destino}">${EcoUI.ICONOS.nav}Google Maps</a>
          <a class="btn btn-sm btn-secundario" target="_blank" rel="noopener" href="${typeof r.lat === 'number' ? `https://waze.com/ul?ll=${r.lat},${r.lng}&navigate=yes` : `https://waze.com/ul?q=${destino}`}">Waze</a>
        </div>
        <div class="acciones--fila">
          ${et === 'pendiente' ? `<button type="button" class="btn btn-sm btn-primario" data-validar="${r.id}" style="flex:1">Verificar en sitio</button>` : `<a class="btn btn-sm btn-primario" href="cierre.html?id=${encodeURIComponent(r.id)}" style="flex:1">Cerrar con evidencia</a>`}
        </div>` : `<a class="btn btn-sm btn-secundario" href="../vecino/ficha.html?id=${encodeURIComponent(r.id)}">Ver antes y después</a>`}
      </article>`;
    }).join('') : '<p class="vacio">No tienes tareas con este filtro.</p>';
  }

  $('lista').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-validar]');
    if (!b) return;
    actual = EcoData.buscar(b.dataset.validar);
    $('val-info').innerHTML = `<strong>${e(actual.direccion)}</strong><br>${e(EcoData.CATEGORIAS[actual.categoria])} · reportado ${e(EcoData.formatearFecha(actual.fecha).toLowerCase())}`;
    $('val-foto').hidden = !actual.foto;
    if (actual.foto) $('val-foto').src = actual.foto;
    document.querySelectorAll('input[name="motivo"]').forEach((i) => { i.checked = false; });
    $('err-motivo').textContent = '';
    EcoUI.abrirModal('modal-validar');
  });
  $('btn-confirmar').addEventListener('click', () => {
    EcoData.validar(actual.id);
    EcoUI.cerrarModal('modal-validar');
    EcoUI.toast('Reporte verificado. Ahora puedes cerrarlo con la foto final.');
    filtroEstado = 'proceso';
    document.querySelector('input[name="etapa"][value="proceso"]').checked = true;
    pintar();
  });
  $('btn-descartar').addEventListener('click', () => {
    const m = document.querySelector('input[name="motivo"]:checked');
    if (!m) { $('err-motivo').textContent = 'Elige un motivo para descartar el reporte.'; document.querySelector('input[name="motivo"]').focus(); return; }
    EcoData.descartar(actual.id, m.value);
    EcoUI.cerrarModal('modal-validar');
    EcoUI.toast('Reporte descartado. Se avisó al vecino.', 'aviso');
    pintar();
  });
  pintar();
});
