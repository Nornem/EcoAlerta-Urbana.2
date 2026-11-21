// js/ui.js
// Piezas de interfaz compartidas: rutas, sesión por rol, navegación, avisos y ventanas.

const EcoUI = (() => {
  const base = () => document.body.dataset.base || '';
  const ruta = (p) => base() + p;
  const e = EcoData.escapar;

  // Íconos de trazo lineal (estilo Lucide)
  const svg = (d) => `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONOS = {
    map: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    user: svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    chart: svg('<path d="M3 3v18h18"/><path d="M7 16V9M12 16V5M17 16v-4"/>'),
    clipboard: svg('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'),
    logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>'),
    bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    back: svg('<path d="m15 18-6-6 6-6"/>'),
    grid: svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'),
    alert: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'),
    users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
    globe: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
    camera: svg('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),
    share: svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>'),
    heart: svg('<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'),
    nav: svg('<polygon points="3 11 22 2 13 21 11 13 3 11"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>')
  };

  const NAV = {
    vecino: [['vecino/mapa.html', 'Mapa', 'map', 'mapa'], ['vecino/reportar.html', 'Reportar', 'plus', 'reportar'], ['vecino/mis-reportes.html', 'Mis reportes', 'list', 'mis-reportes'], ['vecino/perfil.html', 'Perfil', 'user', 'perfil']],
    lider: [['lider/mi-sector.html', 'Mi sector', 'chart', 'mi-sector'], ['vecino/mapa.html', 'Mapa', 'map', 'mapa'], ['vecino/reportar.html', 'Reportar', 'plus', 'reportar'], ['vecino/mis-reportes.html', 'Reportes', 'list', 'mis-reportes'], ['vecino/perfil.html', 'Perfil', 'user', 'perfil']],
    fiscalizador: [['fiscalizador/asignaciones.html', 'Asignaciones', 'clipboard', 'asignaciones'], ['vecino/mapa.html', 'Mapa', 'map', 'mapa'], ['#salir', 'Salir', 'logout', 'salir']],
    coordinador: [['municipal/panel.html', 'Panel de control', 'grid', 'panel'], ['municipal/incidencias.html', 'Incidencias', 'alert', 'incidencias'], ['municipal/usuarios.html', 'Usuarios y roles', 'users', 'usuarios'], ['vecino/mapa.html', 'Mapa comunitario', 'map', 'mapa'], ['transparencia.html', 'Transparencia', 'globe', 'transparencia']]
  };

  const inicioPorRol = (rol) => ({
    vecino: 'vecino/mapa.html',
    lider: 'lider/mi-sector.html',
    fiscalizador: 'fiscalizador/asignaciones.html',
    coordinador: 'municipal/panel.html'
  }[rol] || 'bienvenida.html');

  // Reemplaza <span data-icono="x"> por el ícono SVG correspondiente
  const pintarIconos = (raiz = document) => raiz.querySelectorAll('[data-icono]').forEach((el) => {
    if (ICONOS[el.dataset.icono]) el.innerHTML = ICONOS[el.dataset.icono];
  });

  // ---------- Mensajes entre páginas ----------
  const flash = (msg, tipo = 'ok') => sessionStorage.setItem('eco_flash', JSON.stringify({ msg, tipo }));
  const mostrarFlash = () => {
    const f = sessionStorage.getItem('eco_flash');
    if (f) { sessionStorage.removeItem('eco_flash'); const { msg, tipo } = JSON.parse(f); toast(msg, tipo); }
  };

  // ---------- Toasts ----------
  const toast = (msg, tipo = 'ok', ms = 4200) => {
    let zona = document.getElementById('toast-zona');
    if (!zona) {
      zona = document.createElement('div');
      zona.id = 'toast-zona';
      zona.className = 'toast-zona';
      zona.setAttribute('role', 'status');
      zona.setAttribute('aria-live', 'polite');
      document.body.appendChild(zona);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${tipo}`;
    t.textContent = msg;
    zona.appendChild(t);
    setTimeout(() => { t.classList.add('saliendo'); setTimeout(() => t.remove(), 300); }, ms);
  };

  // ---------- Ventanas (modales) ----------
  let ultimoFoco = null;
  const abrirModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    ultimoFoco = document.activeElement;
    m.classList.add('activo');
    m.setAttribute('aria-hidden', 'false');
    const foco = m.querySelector('[autofocus], button, a, input, select, textarea');
    if (foco) setTimeout(() => foco.focus(), 50);
  };
  const cerrarModal = (id) => {
    const m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m) return;
    m.classList.remove('activo');
    m.setAttribute('aria-hidden', 'true');
    if (ultimoFoco) ultimoFoco.focus();
  };
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') document.querySelectorAll('.modal-overlay.activo').forEach((m) => cerrarModal(m));
  });
  document.addEventListener('click', (ev) => {
    const cerrar = ev.target.closest('[data-cerrar-modal]');
    if (cerrar) cerrarModal(cerrar.closest('.modal-overlay'));
    if (ev.target.classList && ev.target.classList.contains('modal-overlay')) cerrarModal(ev.target);
  });

  // ---------- Sesión y acceso por rol (HU-005) ----------
  const salir = () => {
    EcoData.cerrarSesion();
    flash('Cerraste sesión.');
    location.href = ruta('bienvenida.html');
  };

  const proteger = (roles) => {
    const s = EcoData.sesion();
    if (!s) {
      flash('Inicia sesión para continuar.', 'aviso');
      const institucional = roles.every((r) => r === 'fiscalizador' || r === 'coordinador');
      location.replace(ruta(institucional ? 'login-institucional.html' : 'login.html') + '?next=' + encodeURIComponent(location.pathname.split('/web_site/')[1] || ''));
      return null;
    }
    if (!roles.includes(s.rol)) {
      flash(`Tu rol (${EcoData.ROLES[s.rol]}) no tiene acceso a esa sección.`, 'aviso');
      location.replace(ruta(inicioPorRol(s.rol)));
      return null;
    }
    return s;
  };

  // ---------- Cabecera y navegación de la app (vecino, líder, fiscalizador) ----------
  const montarApp = ({ titulo, activo, volver } = {}) => {
    const s = EcoData.sesion();
    const header = document.createElement('header');
    header.className = 'app-top';
    const conCampana = s && (s.rol === 'vecino' || s.rol === 'lider');
    header.innerHTML = `
      <div class="app-top__izq">
        ${volver ? `<a class="icon-btn" href="${ruta(volver)}" aria-label="Volver">${ICONOS.back}</a>` : `<a class="app-top__marca" href="${ruta('index.html')}" aria-label="Ir a la página de inicio"><img src="${ruta('../images/LogoEcoAlerta.png')}" alt="" width="34" height="34"></a>`}
        <h1 class="app-top__titulo">${e(titulo || 'EcoAlerta')}</h1>
      </div>
      <div class="app-top__der">
        ${conCampana ? `<button type="button" class="icon-btn" id="btn-campana" aria-label="Notificaciones">${ICONOS.bell}<span class="badge" id="badge-notif" hidden>0</span></button>` : ''}
        ${s ? `<span class="app-top__usuario">${e(s.nombre.split(' ')[0])} · ${e(EcoData.ROLES[s.rol])}</span><button type="button" class="icon-btn" id="btn-salir" aria-label="Cerrar sesión">${ICONOS.logout}</button>` : `<a class="btn btn-sm btn-primario" href="${ruta('bienvenida.html')}">Ingresar</a>`}
      </div>`;
    document.body.prepend(header);

    if (s && NAV[s.rol] && s.rol !== 'coordinador') {
      const nav = document.createElement('nav');
      nav.className = 'app-nav';
      nav.setAttribute('aria-label', 'Navegación principal');
      nav.innerHTML = NAV[s.rol].map(([href, txt, ico, clave]) => `
        <a href="${href.startsWith('#') ? '#' : ruta(href)}" class="app-nav__item${clave === activo ? ' activo' : ''}" ${clave === activo ? 'aria-current="page"' : ''} ${href === '#salir' ? 'data-salir' : ''}>
          ${ICONOS[ico]}<span>${txt}</span></a>`).join('');
      header.after(nav);
      nav.querySelectorAll('[data-salir]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); salir(); }));
      document.body.classList.add('con-nav');
    } else if (s && s.rol === 'coordinador') {
      const nav = document.createElement('nav');
      nav.className = 'app-nav app-nav--simple';
      nav.innerHTML = `<a class="app-nav__item" href="${ruta('municipal/panel.html')}">${ICONOS.grid}<span>Volver al panel</span></a>`;
      header.after(nav);
      document.body.classList.add('con-nav');
    }

    const bs = document.getElementById('btn-salir');
    if (bs) bs.addEventListener('click', salir);
    if (conCampana) iniciarNotificaciones(s);
    pintarIconos();
    mostrarFlash();
    return s;
  };

  // ---------- Panel municipal (coordinador) ----------
  const montarPanel = ({ activo, titulo, subtitulo }) => {
    const s = EcoData.sesion();
    const alertas = EcoData.sinAtencion24h().length;
    const aside = document.createElement('aside');
    aside.className = 'panel-lateral';
    aside.innerHTML = `
      <div class="panel-lateral__marca"><img src="${ruta('../images/LogoEcoAlerta.png')}" alt="" width="34" height="34"><div><strong>EcoAlerta</strong><span>Gestión municipal</span></div></div>
      <nav aria-label="Menú del panel municipal">
        ${NAV.coordinador.map(([href, txt, ico, clave]) => `<a href="${ruta(href)}" class="panel-lateral__item${clave === activo ? ' activo' : ''}" ${clave === activo ? 'aria-current="page"' : ''}>${ICONOS[ico]}<span>${txt}</span>${clave === 'incidencias' && alertas ? `<span class="badge badge-rojo" aria-label="${alertas} con más de 24 horas">${alertas}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="panel-lateral__usuario">
        <span class="avatar">${e(s.nombre.replace('Ing. ', '').split(' ').map((p) => p[0]).slice(0, 2).join(''))}</span>
        <div><strong>${e(s.nombre)}</strong><span>${e(EcoData.ROLES[s.rol])}</span></div>
        <button type="button" class="icon-btn icon-btn--claro" id="btn-salir" aria-label="Cerrar sesión">${ICONOS.logout}</button>
      </div>`;
    document.body.prepend(aside);
    const cab = document.querySelector('.panel-cabecera');
    if (cab) cab.insertAdjacentHTML('afterbegin', `<div><h1>${e(titulo)}</h1>${subtitulo ? `<p>${e(subtitulo)}</p>` : ''}</div>`);
    document.getElementById('btn-salir').addEventListener('click', salir);
    pintarIconos();
    mostrarFlash();
  };

  // ---------- Notificaciones del vecino (HU-041) y avisos de jornadas (HU-047) ----------
  const iniciarNotificaciones = (s) => {
    const badge = document.getElementById('badge-notif');
    const pintar = () => {
      const sinLeer = EcoData.notificaciones(s.usuario).filter((n) => !n.leida).length;
      badge.hidden = sinLeer === 0;
      badge.textContent = sinLeer;
    };
    pintar();

    // Avisar lo nuevo una vez por sesión del navegador
    const vistas = JSON.parse(sessionStorage.getItem('eco_notif_vistas') || '[]');
    const nuevas = EcoData.notificaciones(s.usuario).filter((n) => !n.leida && !vistas.includes(n.id));
    nuevas.slice(0, 2).forEach((n) => {
      toast('🔔 ' + n.texto, 'info', 6000);
      if ('Notification' in window && Notification.permission === 'granted' && s.notificaciones !== false) {
        try { new Notification('EcoAlerta Urbana', { body: n.texto, icon: ruta('../images/LogoEcoAlerta.png') }); } catch (err) { /* navegador sin soporte */ }
      }
    });
    sessionStorage.setItem('eco_notif_vistas', JSON.stringify([...vistas, ...nuevas.map((n) => n.id)]));

    // Recordatorio de jornadas suscritas que ocurren en los próximos 3 días
    if (!sessionStorage.getItem('eco_jornadas_avisadas')) {
      const subs = EcoData.suscripciones(s.usuario);
      EcoData.jornadas().filter((j) => subs.includes(j.id)).forEach((j) => {
        const dias = (new Date(j.fecha) - Date.now()) / 86400000;
        if (dias >= 0 && dias <= 3) toast(`📅 Recordatorio: ${j.titulo}, ${fechaLarga(j.fecha)} en ${j.lugar}.`, 'info', 7000);
      });
      sessionStorage.setItem('eco_jornadas_avisadas', '1');
    }

    // Ventana con la lista de notificaciones
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-notificaciones';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="tit-notif">
      <div class="modal__cab"><h2 id="tit-notif">Notificaciones</h2><button type="button" class="icon-btn" data-cerrar-modal aria-label="Cerrar">✕</button></div>
      <div class="modal__cuerpo" id="lista-notif"></div></div>`;
    document.body.appendChild(modal);
    document.getElementById('btn-campana').addEventListener('click', () => {
      const lista = EcoData.notificaciones(s.usuario);
      document.getElementById('lista-notif').innerHTML = lista.length
        ? lista.map((n) => `<a class="notif${n.leida ? '' : ' notif--nueva'}" href="${ruta('vecino/ficha.html?id=' + encodeURIComponent(n.reporteId))}"><strong>${e(n.texto)}</strong><span>${e(EcoData.formatearFecha(n.fecha))}</span></a>`).join('')
        : '<p class="vacio">Aún no tienes notificaciones. Te avisaremos cuando tus reportes cambien de estado.</p>';
      abrirModal('modal-notificaciones');
      EcoData.marcarLeidas(s.usuario);
      pintar();
    });
  };

  // ---------- Utilidades de presentación ----------
  const estadoTag = (estado) => {
    const x = EcoData.ESTADOS[estado];
    return `<span class="etiqueta-estado ${x.clase}">${x.texto}</span>`;
  };
  const fechaLarga = (iso) => new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + new Date(iso).toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });

  const urlFicha = (id) => {
    const absoluta = new URL(ruta('vecino/ficha.html?id=' + encodeURIComponent(id)), location.href);
    return absoluta.href;
  };

  // HU-021: compartir por WhatsApp (o con el menú de compartir del celular)
  const enlaceWhatsApp = (texto) => 'https://wa.me/?text=' + encodeURIComponent(texto);

  const leerImagen = (archivo, maxLado = 900, calidad = 0.72) => new Promise((resolve, reject) => {
    if (!archivo || !archivo.type.startsWith('image/')) { reject(new Error('El archivo debe ser una imagen (JPG o PNG).')); return; }
    if (archivo.size > 15 * 1024 * 1024) { reject(new Error('La imagen pesa más de 15 MB.')); return; }
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));
      img.onload = () => {
        const k = Math.min(1, maxLado / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', calidad));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });

  const mapaDisponible = () => typeof window.L !== 'undefined';
  const capaBase = (mapa) => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(mapa);
  const iconoPin = (color, mio) => L.divIcon({ className: '', html: `<div class="pin-eco${mio ? ' pin-mio' : ''}" style="background:${color}"></div>`, iconSize: mio ? [26, 26] : [22, 22], iconAnchor: mio ? [13, 26] : [11, 22], popupAnchor: [0, -24] });

  return {
    ICONOS, pintarIconos, ruta, inicioPorRol, flash, mostrarFlash, toast, abrirModal, cerrarModal, proteger, salir,
    montarApp, montarPanel, estadoTag, fechaLarga, urlFicha, enlaceWhatsApp, leerImagen, mapaDisponible, capaBase, iconoPin
  };
})();
