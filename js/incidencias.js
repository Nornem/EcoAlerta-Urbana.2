// js/incidencias.js
// HU-025: incidencias ordenadas automáticamente por prioridad · HU-026: asignar a una cuadrilla

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['coordinador']);
  if (!s) return;
  EcoUI.montarPanel({ activo: 'incidencias', titulo: 'Incidencias', subtitulo: 'Ordenadas automáticamente por prioridad' });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;
  const params = new URLSearchParams(location.search);
  let tab = 'recibido';
  let seleccion = params.get('asignar');
  if (seleccion) { const r = EcoData.buscar(seleccion); if (r) tab = r.estado; }

  const TABS = [['recibido', 'Pendientes'], ['atencion', 'En atención'], ['resuelto', 'Resueltas'], ['descartado', 'Descartadas']];
  const pintarTabs = () => {
    const l = EcoData.reportes();
    $('tabs').innerHTML = TABS.map(([k, t]) => `<label class="chip-op"><input type="radio" name="tab" value="${k}" ${k === tab ? 'checked' : ''}><span>${t} (${l.filter((r) => r.estado === k).length})</span></label>`).join('');
  };
  $('tabs').addEventListener('change', (ev) => { tab = ev.target.value; pintar(); });
  $('f-cat').innerHTML = '<option value="">Todos</option>' + Object.entries(EcoData.CATEGORIAS).map(([k, t]) => `<option value="${k}">${t}</option>`).join('');
  $('f-sector').innerHTML = '<option value="">Todos</option>' + EcoData.SECTORES.map((x) => `<option>${x}</option>`).join('');
  $('f-cat').addEventListener('change', pintar);
  $('f-sector').addEventListener('change', pintar);
  $('cuadrillas').insertAdjacentHTML('beforeend', EcoData.CUADRILLAS.map((c) => {
    const carga = EcoData.reportes().filter((r) => r.cuadrilla === c.id && r.estado === 'atencion').length;
    return `<div class="cuadrilla-op"><input type="radio" name="cuadrilla" id="cq-${c.id}" value="${c.id}"><label for="cq-${c.id}"><span><strong>${c.nombre}</strong><br><small>${c.estado} · ${carga} tarea${carga === 1 ? '' : 's'} en curso</small></span></label></div>`;
  }).join(''));

  function pintar() {
    pintarTabs();
    const cat = $('f-cat').value, sec = $('f-sector').value;
    const lista = EcoData.reportes().filter((r) => r.estado === tab && (!cat || r.categoria === cat) && (!sec || r.sector === sec))
      .map((r) => ({ r, p: EcoData.prioridad(r) })).sort((a, b) => b.p - a.p);
    $('filas').innerHTML = lista.length ? lista.map(({ r, p }) => {
      const h = EcoData.horasDesde(r.fecha);
      const cq = EcoData.CUADRILLAS.find((c) => c.id === r.cuadrilla);
      const accion = r.estado === 'recibido' ? 'Asignar' : r.estado === 'atencion' ? 'Reasignar' : 'Ver';
      return `<tr class="${r.id === seleccion ? 'seleccionada' : ''}">
        <td data-et="Prioridad"><span class="prio prio-${EcoData.nivelPrioridad(p)}">${p}</span></td>
        <td data-et="Ticket"><strong>${e(r.id)}</strong></td>
        <td data-et="Ubicación">${e(r.direccion)}<br><small class="ayuda">${e(r.sector)}</small></td>
        <td data-et="Tipo">${e(EcoData.CATEGORIAS[r.categoria])}</td>
        <td data-et="Tiempo"${h > 24 && r.estado === 'recibido' ? ' style="color:var(--rojo-critico);font-weight:700"' : ''}>${e(EcoData.formatearHoras(h))}</td>
        <td data-et="Apoyos">${EcoData.totalApoyos(r)}</td>
        <td data-et="Cuadrilla">${cq ? e(cq.nombre) : '—'}</td>
        <td>${accion === 'Ver' ? `<a class="btn btn-sm btn-secundario" href="../vecino/ficha.html?id=${encodeURIComponent(r.id)}">Ver</a>` : `<button type="button" class="btn btn-sm btn-primario" data-sel="${r.id}">${accion}</button>`}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="8" class="vacio">No hay incidencias con estos filtros.</td></tr>';
    pintarPanel();
  }

  function pintarPanel() {
    const r = seleccion && EcoData.buscar(seleccion);
    const editable = r && (r.estado === 'recibido' || r.estado === 'atencion');
    $('asig-vacio').hidden = !!editable;
    $('form-asignar').hidden = !editable;
    if (!editable) return;
    $('asig-info').innerHTML = `<strong>${e(r.id)} · ${e(r.direccion)}</strong><span class="ayuda">${e(EcoData.CATEGORIAS[r.categoria])} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])} · ${e(EcoData.formatearHoras(EcoData.horasDesde(r.fecha)))} · prioridad ${EcoData.prioridad(r)}</span>`;
    $('asig-foto').hidden = !r.foto;
    if (r.foto) $('asig-foto').src = r.foto;
    document.querySelectorAll('input[name="cuadrilla"]').forEach((i) => { i.checked = i.value === r.cuadrilla; });
    $('nota').value = r.nota || '';
    $('err-cuadrilla').textContent = '';
  }

  $('filas').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-sel]');
    if (!b) return;
    seleccion = b.dataset.sel;
    pintar();
    $('panel-asignar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const primera = document.querySelector('input[name="cuadrilla"]');
    if (primera) primera.focus();
  });

  $('form-asignar').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const c = document.querySelector('input[name="cuadrilla"]:checked');
    if (!c) { $('err-cuadrilla').textContent = 'Elige la cuadrilla que atenderá la incidencia.'; document.querySelector('input[name="cuadrilla"]').focus(); return; }
    const r = EcoData.asignar(seleccion, c.value, $('nota').value.trim());
    EcoUI.toast(`${r.id} asignado a ${EcoData.CUADRILLAS.find((x) => x.id === c.value).nombre}. Ahora está "En atención".`);
    tab = 'atencion';
    pintar();
  });

  pintar();
});
