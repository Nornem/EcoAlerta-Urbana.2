// js/perfil.js
// HU-002 perfil con distrito y junta vecinal · HU-041 preferencia de notificaciones · HU-047 suscripción a jornadas

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['vecino', 'lider']);
  if (!s) return;
  EcoUI.montarApp({ titulo: 'Mi perfil', activo: 'perfil' });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;

  $('p-nombre').value = s.nombre;
  $('p-correo').value = s.usuario;
  $('p-sector').innerHTML = '<option value="">Elige tu sector</option>' + EcoData.SECTORES.map((x) => `<option ${x === s.sector ? 'selected' : ''}>${x}</option>`).join('');
  $('p-notif').checked = s.notificaciones !== false;
  $('rol-actual').innerHTML = `Ingresaste como <strong>${e(EcoData.ROLES[s.rol])}</strong>${s.junta ? ' de la ' + e(s.junta) : ''}.`;

  const campoErr = (id, msg) => { const c = $(id).closest('.campo'); c.classList.toggle('con-error', !!msg); c.querySelector('.error-app').textContent = msg || ''; };

  $('form-perfil').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const nombre = $('p-nombre').value.trim();
    const sector = $('p-sector').value;
    campoErr('p-nombre', nombre.length < 3 ? 'Escribe tu nombre (mínimo 3 letras).' : '');
    campoErr('p-sector', sector ? '' : 'Elige tu sector.');
    if (nombre.length < 3) { $('p-nombre').focus(); return; }
    if (!sector) { $('p-sector').focus(); return; }
    EcoData.actualizarUsuario(s.id, { nombre, sector, distrito: $('p-distrito').value, notificaciones: $('p-notif').checked });
    EcoUI.toast('Tus datos se guardaron.');
    pintarJornadas();
  });

  // Permiso de notificaciones del navegador (para avisos fuera de la app)
  const btnPermiso = $('btn-permiso');
  const estadoPermiso = () => {
    if (!('Notification' in window)) { btnPermiso.hidden = true; return; }
    if (Notification.permission === 'granted') { btnPermiso.textContent = 'Avisos permitidos en este dispositivo ✔'; btnPermiso.disabled = true; }
  };
  estadoPermiso();
  btnPermiso.addEventListener('click', async () => {
    const r = await Notification.requestPermission();
    EcoUI.toast(r === 'granted' ? 'Listo: te avisaremos aunque no tengas la app abierta.' : 'No se activaron los avisos del navegador.', r === 'granted' ? 'ok' : 'aviso');
    estadoPermiso();
  });

  $('btn-cerrar').addEventListener('click', EcoUI.salir);

  const pintarJornadas = () => {
    const u = EcoData.sesion();
    const subs = EcoData.suscripciones(u.usuario);
    const lista = EcoData.jornadas().filter((j) => j.sector === 'Todos' || j.sector === u.sector || subs.includes(j.id));
    $('jornadas').innerHTML = lista.length ? lista.map((j) => `
      <div class="card" style="display:grid;gap:4px">
        <strong>${e(j.titulo)}</strong>
        <span class="ayuda">${e(EcoUI.fechaLarga(j.fecha))} · ${e(j.lugar)}</span>
        <button type="button" class="btn btn-sm ${subs.includes(j.id) ? 'btn-activo' : 'btn-secundario'}" data-jornada="${j.id}" aria-pressed="${subs.includes(j.id)}">${subs.includes(j.id) ? '✔ Te avisaremos' : 'Avisarme'}</button>
      </div>`).join('') : '<p class="vacio">No hay jornadas programadas para tu sector.</p>';
  };
  $('jornadas').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-jornada]');
    if (!b) return;
    const on = EcoData.alternarSuscripcion(s.usuario, b.dataset.jornada);
    EcoUI.toast(on ? 'Te avisaremos antes de la jornada.' : 'Ya no recibirás avisos de esta jornada.');
    pintarJornadas();
  });
  pintarJornadas();
});
