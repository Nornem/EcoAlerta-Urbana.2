// js/auth.js
// Acceso: inicio de sesión y registro del vecino (HU-001), acceso institucional (HU-003)
// y recuperación de contraseña (HU-004). Cada rol entra a sus propias pantallas (HU-005).

document.addEventListener('DOMContentLoaded', () => {
  const modo = document.body.dataset.modo;
  const alerta = document.getElementById('alert-message');
  const params = new URLSearchParams(location.search);
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  EcoUI.mostrarFlash();

  // ---------- Utilidades ----------
  const mostrarAlerta = (msg, tipo) => { alerta.textContent = msg; alerta.className = `alert-message ${tipo}`; };
  const ocultarAlerta = () => { alerta.textContent = ''; alerta.className = 'alert-message hidden'; };
  const error = (input, msg) => {
    const g = input.closest('.form-group');
    g.classList.add('has-error');
    g.querySelector('.error-text').textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  };
  const limpiar = (input) => {
    const g = input.closest('.form-group');
    g.classList.remove('has-error');
    g.querySelector('.error-text').textContent = '';
    input.removeAttribute('aria-invalid');
  };
  const validar = (input, reglas = {}) => {
    const v = input.value.trim();
    if (!v) { error(input, 'Este campo es obligatorio.'); return false; }
    if (reglas.email && !emailRx.test(v)) { error(input, 'Ingresa un correo válido (ejemplo@dominio.com).'); return false; }
    if (reglas.min && v.length < reglas.min) { error(input, `Debe tener al menos ${reglas.min} caracteres.`); return false; }
    limpiar(input);
    return true;
  };
  const enfocarPrimerError = (form) => { const x = form.querySelector('[aria-invalid="true"]'); if (x) x.focus(); };

  // Mostrar u ocultar contraseña
  document.querySelectorAll('[data-ver]').forEach((b) => b.addEventListener('click', () => {
    const i = document.getElementById(b.dataset.ver);
    const ver = i.type === 'password';
    i.type = ver ? 'text' : 'password';
    b.textContent = ver ? 'Ocultar' : 'Ver';
    b.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
  }));

  // Redirección según el rol (o a la página que pidió iniciar sesión)
  const entrar = (u) => {
    EcoData.iniciarSesion(u);
    const destino = params.get('next') || EcoUI.inicioPorRol(u.rol);
    mostrarAlerta(`¡Hola, ${u.nombre.split(' ')[0]}! Ingresando…`, 'success');
    setTimeout(() => { location.href = destino; }, 700);
  };

  // ======================= VECINO =======================
  if (modo === 'vecino') {
    const tabIn = document.getElementById('tab-ingresar');
    const tabReg = document.getElementById('tab-registro');
    const panelIn = document.getElementById('panel-ingresar');
    const panelReg = document.getElementById('panel-registro');
    const mostrarTab = (reg) => {
      tabIn.setAttribute('aria-selected', String(!reg));
      tabReg.setAttribute('aria-selected', String(reg));
      panelIn.hidden = reg;
      panelReg.hidden = !reg;
      ocultarAlerta();
    };
    tabIn.addEventListener('click', () => mostrarTab(false));
    tabReg.addEventListener('click', () => mostrarTab(true));
    if (params.get('tab') === 'registro') mostrarTab(true);

    // Sectores del distrito
    const sel = document.getElementById('reg-sector');
    sel.innerHTML = '<option value="">Elige tu sector</option>' + EcoData.SECTORES.map((s) => `<option>${s}</option>`).join('');

    const email = document.getElementById('login-email');
    const pass = document.getElementById('login-pass');
    [email, pass].forEach((i) => i.addEventListener('input', () => { if (i.closest('.has-error')) validar(i, i === email ? { email: true } : {}); }));

    document.getElementById('form-login').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const ok = [validar(email, { email: true }), validar(pass)].every(Boolean);
      if (!ok) { mostrarAlerta('Corrige los campos marcados para ingresar.', 'error'); enfocarPrimerError(ev.target); return; }
      const u = EcoData.autenticar(email.value, pass.value);
      if (!u) { mostrarAlerta('Correo o contraseña incorrectos.', 'error'); error(pass, 'Revisa tu contraseña.'); pass.focus(); return; }
      if (u.rol === 'fiscalizador' || u.rol === 'coordinador') { mostrarAlerta('Esta cuenta es institucional. Usa el acceso institucional.', 'error'); return; }
      entrar(u);
    });

    document.querySelector('[data-google]').addEventListener('click', () => {
      // Simulación de Google: crea la cuenta la primera vez
      let u = EcoData.buscarUsuario('google.vecino@gmail.com');
      if (!u) u = EcoData.registrar({ nombre: 'Vecino Google', usuario: 'google.vecino@gmail.com', password: 'google-' + Date.now(), sector: 'Sector 5 · La Campiña' }).usuario;
      entrar(u);
    });

    const rNombre = document.getElementById('reg-nombre');
    const rEmail = document.getElementById('reg-email');
    const rPass = document.getElementById('reg-pass');
    document.getElementById('form-registro').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const okSector = !!sel.value;
      if (!okSector) error(sel, 'Elige tu sector para recibir información de tu zona.'); else limpiar(sel);
      const ok = [validar(rNombre, { min: 3 }), validar(rEmail, { email: true }), okSector, validar(rPass, { min: 8 })].every(Boolean);
      if (!ok) { mostrarAlerta('Completa los campos marcados.', 'error'); enfocarPrimerError(ev.target); return; }
      const r = EcoData.registrar({ nombre: rNombre.value, usuario: rEmail.value, password: rPass.value, sector: sel.value });
      if (r.error) { error(rEmail, r.error); mostrarAlerta(r.error, 'error'); rEmail.focus(); return; }
      EcoUI.flash('¡Tu cuenta fue creada! Ya puedes reportar.');
      entrar(r.usuario);
    });
  }

  // ======================= INSTITUCIONAL =======================
  if (modo === 'institucional') {
    const cod = document.getElementById('inst-codigo');
    const pass = document.getElementById('inst-pass');
    document.getElementById('form-inst').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const ok = [validar(cod), validar(pass)].every(Boolean);
      if (!ok) { mostrarAlerta('Completa tus credenciales.', 'error'); enfocarPrimerError(ev.target); return; }
      const u = EcoData.autenticar(cod.value, pass.value);
      if (!u) { mostrarAlerta('Código o contraseña incorrectos.', 'error'); error(pass, 'Revisa tu contraseña.'); pass.focus(); return; }
      if (u.rol !== 'fiscalizador' && u.rol !== 'coordinador') { mostrarAlerta('Esta cuenta no es institucional. Usa el acceso vecinal.', 'error'); return; }
      entrar(u);
    });
  }

  // ======================= RECUPERAR =======================
  if (modo === 'recuperar') {
    if (params.get('inst')) document.getElementById('volver-login').href = 'login-institucional.html';
    const usuario = document.getElementById('rec-usuario');
    const fSol = document.getElementById('form-solicitar');
    const fNueva = document.getElementById('form-nueva');
    const correo = document.getElementById('correo-simulado');
    let cuenta = null;

    fSol.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!validar(usuario)) { usuario.focus(); return; }
      cuenta = EcoData.buscarUsuario(usuario.value);
      // Por seguridad, el mensaje no confirma si la cuenta existe
      mostrarAlerta('Si la cuenta existe, enviamos un enlace de recuperación a su correo.', 'success');
      if (cuenta) correo.hidden = false;
    });
    document.getElementById('abrir-enlace').addEventListener('click', () => {
      fSol.hidden = true;
      correo.hidden = true;
      fNueva.hidden = false;
      ocultarAlerta();
      document.getElementById('nueva-pass').focus();
    });
    fNueva.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const p1 = document.getElementById('nueva-pass');
      const p2 = document.getElementById('nueva-pass2');
      let ok = validar(p1, { min: 8 }) && validar(p2);
      if (ok && p1.value !== p2.value) { error(p2, 'Las contraseñas no coinciden.'); ok = false; }
      if (!ok) { enfocarPrimerError(fNueva); return; }
      EcoData.cambiarPassword(cuenta.usuario, p1.value);
      const inst = cuenta.rol === 'fiscalizador' || cuenta.rol === 'coordinador';
      EcoUI.flash('Contraseña actualizada. Ingresa con tu nueva contraseña.');
      location.href = inst ? 'login-institucional.html' : 'login.html';
    });
  }
});
