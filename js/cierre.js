// js/cierre.js
// HU-035: el fiscalizador cierra el reporte con la foto "después".
// Al cerrar, el vecino recibe la notificación de resuelto (HU-041).

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['fiscalizador']);
  if (!s) return;
  EcoUI.montarApp({ titulo: 'Cierre con evidencia', volver: 'fiscalizador/asignaciones.html' });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;
  const r = EcoData.buscar(new URLSearchParams(location.search).get('id'));
  if (!r || r.cuadrilla !== s.cuadrilla) { document.querySelector('main').innerHTML = '<div class="card vacio">Este reporte no está asignado a tu cuadrilla. <a class="btn-link" href="asignaciones.html">Volver</a></div>'; return; }
  if (!r.validado) { EcoUI.flash('Primero verifica el reporte en sitio.', 'aviso'); location.replace('asignaciones.html'); return; }

  $('resumen').innerHTML = `<p class="reporte__meta">${e(r.id)} · ${e(EcoData.CATEGORIAS[r.categoria])} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])}</p><h2 class="pagina-titulo" style="margin:0">${e(r.direccion)}</h2>${r.nota ? `<p class="ayuda">Nota del coordinador: ${e(r.nota)}</p>` : ''}`;
  if (r.foto) $('foto-antes').src = r.foto; else $('foto-antes').alt = 'El vecino no adjuntó foto';

  let despues = null;
  const area = $('area-despues');
  const err = (id, msg) => {
    const c = $(id).closest('.campo');
    c.classList.toggle('con-error', !!msg);
    c.querySelector('.error-app').textContent = msg || '';
    if (!document.querySelector('#form-cierre .con-error')) $('alerta').hidden = true;
  };
  const abrir = () => $('input-despues').click();
  area.addEventListener('click', abrir);
  area.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(); } });
  $('input-despues').addEventListener('change', async (ev) => {
    try {
      despues = await EcoUI.leerImagen(ev.target.files[0]);
      $('prev-despues').src = despues; $('prev-despues').hidden = false; $('vacio-despues').hidden = true;
      area.classList.add('con-foto');
      err('input-despues', '');
    } catch (x) { err('input-despues', x.message); }
  });
  $('conforme').addEventListener('change', () => err('conforme', ''));

  $('form-cierre').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const faltan = [];
    if (!despues) { err('input-despues', 'Adjunta la foto de la zona limpia para cerrar el reporte.'); faltan.push(area); }
    if (!$('conforme').checked) { err('conforme', 'Confirma que la zona quedó limpia.'); faltan.push($('conforme')); }
    if (faltan.length) { $('alerta').textContent = 'Completa la evidencia para cerrar el reporte.'; $('alerta').hidden = false; faltan[0].focus(); return; }
    EcoData.cerrar(r.id, despues, $('obs').value.trim());
    EcoUI.flash(`Reporte ${r.id} cerrado. Se notificó al vecino.`);
    location.href = 'asignaciones.html';
  });
});
