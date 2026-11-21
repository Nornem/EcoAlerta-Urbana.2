// js/usuarios.js
// HU-005: el administrador municipal asigna roles; cada página revisa el rol antes de mostrarse (EcoUI.proteger).

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.proteger(['coordinador']);
  if (!s) return;
  EcoUI.montarPanel({ activo: 'usuarios', titulo: 'Usuarios y roles', subtitulo: 'Controla a qué secciones accede cada persona' });
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;

  const detalle = (u) => (u.rol === 'fiscalizador' ? (EcoData.CUADRILLAS.find((c) => c.id === u.cuadrilla) || {}).nombre || 'Sin cuadrilla' : u.rol === 'coordinador' ? 'Municipalidad de Chorrillos' : u.sector || 'Sin sector');

  const pintar = () => {
    const q = $('buscar').value.trim().toLowerCase();
    const lista = EcoData.usuarios().filter((u) => !q || (u.nombre + ' ' + u.usuario).toLowerCase().includes(q));
    $('filas').innerHTML = lista.map((u) => {
      const yo = u.id === s.id;
      return `<tr>
        <td data-et="Nombre"><strong>${e(u.nombre)}</strong>${yo ? ' <span class="ayuda">(tú)</span>' : ''}</td>
        <td data-et="Usuario">${e(u.usuario)}</td>
        <td data-et="Rol"><label class="sr-only" for="rol-${u.id}">Rol de ${e(u.nombre)}</label>
          <select id="rol-${u.id}" data-rol="${u.id}" ${yo ? 'disabled title="No puedes cambiar tu propio rol"' : ''} style="min-height:40px;padding:6px 10px">
            ${Object.entries(EcoData.ROLES).map(([k, t]) => `<option value="${k}" ${k === u.rol ? 'selected' : ''}>${t}</option>`).join('')}
          </select></td>
        <td data-et="Sector o cuadrilla">${e(detalle(u))}</td>
        <td>${yo ? '' : `<button type="button" class="btn btn-sm btn-primario" data-guardar="${u.id}">Guardar</button>`}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="5" class="vacio">No se encontraron usuarios.</td></tr>';
  };

  $('buscar').addEventListener('input', pintar);
  $('filas').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-guardar]');
    if (!b) return;
    const id = b.dataset.guardar;
    const rol = document.querySelector(`[data-rol="${id}"]`).value;
    const cambios = { rol };
    if (rol === 'fiscalizador') cambios.cuadrilla = (EcoData.usuarios().find((u) => u.id === id) || {}).cuadrilla || 'beta';
    const u = EcoData.actualizarUsuario(id, cambios);
    EcoUI.toast(`${u.nombre} ahora es ${EcoData.ROLES[rol]}. Su acceso se actualizó.`);
    pintar();
  });
  pintar();
});
