// js/bienvenida.js
// Si ya hay una sesión abierta, se ofrece continuar con el rol actual.
document.addEventListener('DOMContentLoaded', () => {
  EcoUI.mostrarFlash();
  const s = EcoData.sesion();
  if (!s) return;
  const aviso = document.createElement('div');
  aviso.className = 'alerta alerta-info';
  aviso.style.marginBottom = '18px';
  aviso.innerHTML = `Ya iniciaste sesión como <strong>${EcoData.escapar(s.nombre)}</strong> (${EcoData.ROLES[s.rol]}). <a href="${EcoUI.inicioPorRol(s.rol)}" style="text-decoration:underline">Continuar</a> · <button type="button" class="btn-link" id="cerrar">Cerrar sesión</button>`;
  document.querySelector('.roles').before(aviso);
  document.getElementById('cerrar').addEventListener('click', () => { EcoData.cerrarSesion(); location.reload(); });
});
