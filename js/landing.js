// js/landing.js
// Página de inicio: menú en celular, cifras reales de la plataforma y validación del formulario de contacto.

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  EcoUI.mostrarFlash();

  // Menú desplegable en pantallas pequeñas
  const boton = $('menu-boton');
  const menu = $('menu-principal');
  boton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', abierto);
  });
  menu.addEventListener('click', (ev) => { if (ev.target.tagName === 'A') { menu.classList.remove('abierto'); boton.setAttribute('aria-expanded', 'false'); } });

  // Cifras calculadas con los reportes registrados
  const m = EcoData.metricas();
  $('hero-datos').innerHTML = `<li><strong>${m.total}</strong><span>reportes registrados</span></li><li><strong>${m.resueltos}</strong><span>puntos ya limpios</span></li><li><strong>${m.promedioHoras !== null ? Math.round(m.promedioHoras) + ' h' : '—'}</strong><span>tiempo promedio de respuesta</span></li>`;

  // Formulario de contacto
  const form = $('form-contacto');
  const campos = [['c-nombre', (v) => v.length >= 3 || 'Escribe tu nombre.'], ['c-email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Ingresa un correo válido.'], ['c-mensaje', (v) => v.length >= 10 || 'El mensaje debe tener al menos 10 caracteres.']];
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let primero = null;
    campos.forEach(([id, regla]) => {
      const i = $(id);
      const r = regla(i.value.trim());
      const c = i.closest('.campo');
      c.classList.toggle('con-error', r !== true);
      c.querySelector('.error-app').textContent = r === true ? '' : r;
      i.setAttribute('aria-invalid', r !== true);
      if (r !== true && !primero) primero = i;
    });
    if (primero) { primero.focus(); return; }
    $('contacto-ok').textContent = `¡Gracias, ${$('c-nombre').value.trim().split(' ')[0]}! Recibimos tu mensaje y te responderemos a tu correo.`;
    $('contacto-ok').hidden = false;
    form.reset();
  });
});
