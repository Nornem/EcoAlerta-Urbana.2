// js/datos.js
// "Base de datos" de EcoAlerta Urbana para el prototipo.
// No hay servidor: todo se guarda en el localStorage del navegador.
// Así, lo que hace un rol (vecino, coordinador, fiscalizador) lo ve el otro en el mismo dispositivo.

const EcoData = (() => {
  const VERSION = 'v2';
  const K = {
    usuarios: `eco_${VERSION}_usuarios`,
    reportes: `eco_${VERSION}_reportes`,
    notifs: `eco_${VERSION}_notificaciones`,
    jornadas: `eco_${VERSION}_jornadas`,
    subs: `eco_${VERSION}_suscripciones`,
    sesion: `eco_${VERSION}_sesion`
  };

  // ---------- Catálogos ----------
  const CATEGORIAS = {
    organico: 'Residuos orgánicos',
    plastico: 'Plástico',
    escombros: 'Escombros / Obra',
    toxico: 'Residuos tóxicos',
    domesticos: 'Residuos domésticos'
  };

  const ESTADOS = {
    recibido: { texto: 'Recibido', clase: 'estado-recibido', color: '#F2A900' },
    atencion: { texto: 'En atención', clase: 'estado-atencion', color: '#1F5FA8' },
    resuelto: { texto: 'Resuelto', clase: 'estado-resuelto', color: '#1B6B4A' },
    descartado: { texto: 'Descartado', clase: 'estado-descartado', color: '#7A8790' }
  };
  const ORDEN_ESTADOS = ['recibido', 'atencion', 'resuelto'];

  const URGENCIAS = { baja: 'Baja', media: 'Media', alta: 'Alta' };
  const MAGNITUDES = { bolsa: 'Bolsa', contenedor: 'Contenedor', camion: 'Camión' };

  const ROLES = {
    vecino: 'Vecino',
    lider: 'Líder comunal',
    fiscalizador: 'Fiscalizador',
    coordinador: 'Coordinador municipal'
  };

  const SECTORES = [
    'Sector 1 · Matellini',
    'Sector 2 · Las Delicias',
    'Sector 3 · Villa',
    'Sector 4 · Los Cedros',
    'Sector 5 · La Campiña'
  ];

  const CUADRILLAS = [
    { id: 'alfa', nombre: 'Cuadrilla Alfa', estado: 'Disponible' },
    { id: 'beta', nombre: 'Cuadrilla Beta', estado: 'En ruta' },
    { id: 'camion07', nombre: 'Camión 07', estado: 'Disponible' }
  ];

  const CENTRO = { lat: -12.1712, lng: -77.0185 }; // Chorrillos, Lima

  // ---------- Utilidades ----------
  const leer = (clave, porDefecto) => {
    try {
      const v = localStorage.getItem(clave);
      return v ? JSON.parse(v) : porDefecto;
    } catch (e) { return porDefecto; }
  };
  const escribir = (clave, valor) => {
    try { localStorage.setItem(clave, JSON.stringify(valor)); return true; }
    catch (e) { console.warn('No se pudo guardar', clave, e); return false; }
  };
  const haceHoras = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
  const horasDesde = (iso) => (Date.now() - new Date(iso)) / 3600000;
  const escapar = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const formatearFecha = (iso) => {
    const min = Math.round((Date.now() - new Date(iso)) / 60000);
    if (min < 1) return 'Hace un momento';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `Hace ${h} h`;
    const d = Math.round(h / 24);
    if (d < 7) return `Hace ${d} día${d === 1 ? '' : 's'}`;
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };
  const formatearHoras = (h) => (h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : `${Math.round(h)} h`);

  // ---------- Datos de ejemplo ----------
  const FOTO1 = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=70';
  const FOTO2 = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=70';

  const usuariosEjemplo = () => [
    { id: 'u1', usuario: 'vecino@ecoalerta.com', password: 'EcoAlerta2026', nombre: 'Vecino de Prueba', rol: 'vecino', distrito: 'Chorrillos', sector: 'Sector 5 · La Campiña', notificaciones: true },
    { id: 'u2', usuario: 'lider@ecoalerta.com', password: 'EcoAlerta2026', nombre: 'Carlos Ramírez', rol: 'lider', distrito: 'Chorrillos', sector: 'Sector 5 · La Campiña', junta: 'Junta Vecinal La Campiña', notificaciones: true },
    { id: 'u3', usuario: '45678912', password: 'EcoAlerta2026', nombre: 'Zulema Ruiz', rol: 'fiscalizador', cuadrilla: 'alfa' },
    { id: 'u4', usuario: '10203040', password: 'EcoAlerta2026', nombre: 'Ing. Jhonatan Palacios', rol: 'coordinador' },
    { id: 'u5', usuario: 'maria.torres@ecoalerta.com', password: 'EcoAlerta2026', nombre: 'María Elena Torres', rol: 'vecino', distrito: 'Chorrillos', sector: 'Sector 1 · Matellini', notificaciones: true }
  ];

  const R = (o) => ({ apoyos: [], apoyosBase: 0, magnitud: 'bolsa', foto: null, fotoDespues: null, cuadrilla: null, nota: '', validado: false, autor: 'otro@ecoalerta.com', historial: [], ...o });

  const reportesEjemplo = () => [
    R({ id: 'EA-0101', autor: 'vecino@ecoalerta.com', estado: 'atencion', categoria: 'escombros', urgencia: 'alta', magnitud: 'camion', direccion: 'Jr. Las Gardenias 210', sector: 'Sector 5 · La Campiña', lat: -12.1689, lng: -77.0122, fecha: haceHoras(29), foto: FOTO1, apoyosBase: 7, cuadrilla: 'alfa', asignadoEn: haceHoras(3), validado: true }),
    R({ id: 'EA-0098', autor: 'vecino@ecoalerta.com', estado: 'resuelto', categoria: 'organico', urgencia: 'media', magnitud: 'contenedor', direccion: 'Parque Los Pinos', sector: 'Sector 5 · La Campiña', lat: -12.1735, lng: -77.0141, fecha: haceHoras(150), foto: FOTO2, apoyosBase: 4, cuadrilla: 'beta', asignadoEn: haceHoras(140), cerradoEn: haceHoras(118), validado: true, fotoDespues: null }),
    R({ id: 'EA-0099', autor: 'vecino@ecoalerta.com', estado: 'recibido', categoria: 'plastico', urgencia: 'baja', magnitud: 'bolsa', direccion: 'Av. Guardia Civil cdra. 8', sector: 'Sector 5 · La Campiña', lat: -12.1662, lng: -77.0104, fecha: haceHoras(5), apoyosBase: 1 }),
    R({ id: 'EA-0094', estado: 'recibido', categoria: 'toxico', urgencia: 'alta', magnitud: 'bolsa', direccion: 'Av. Huaylas cdra. 15', sector: 'Sector 2 · Las Delicias', lat: -12.1781, lng: -77.0232, fecha: haceHoras(38), apoyosBase: 12 }),
    R({ id: 'EA-0090', estado: 'recibido', categoria: 'organico', urgencia: 'alta', magnitud: 'contenedor', direccion: 'Exteriores del mercado Matellini', sector: 'Sector 1 · Matellini', lat: -12.1838, lng: -77.0115, fecha: haceHoras(31), apoyosBase: 9 }),
    R({ id: 'EA-0085', estado: 'recibido', categoria: 'domesticos', urgencia: 'media', magnitud: 'bolsa', direccion: 'Esquina Defensores del Morro y Huaylas', sector: 'Sector 2 · Las Delicias', lat: -12.1767, lng: -77.0201, fecha: haceHoras(27), apoyosBase: 4 }),
    R({ id: 'EA-0079', estado: 'recibido', categoria: 'plastico', urgencia: 'media', magnitud: 'bolsa', direccion: 'Malecón Grau, bajada de Agua Dulce', sector: 'Sector 4 · Los Cedros', lat: -12.1622, lng: -77.0289, fecha: haceHoras(25), apoyosBase: 3 }),
    R({ id: 'EA-0102', estado: 'atencion', categoria: 'escombros', urgencia: 'media', magnitud: 'camion', direccion: 'Av. Huaylas 1500', sector: 'Sector 2 · Las Delicias', lat: -12.1802, lng: -77.0175, fecha: haceHoras(20), apoyosBase: 2, cuadrilla: 'alfa', asignadoEn: haceHoras(2) }),
    R({ id: 'EA-0081', estado: 'atencion', categoria: 'plastico', urgencia: 'baja', magnitud: 'bolsa', direccion: 'Playa Agua Dulce, ingreso 2', sector: 'Sector 4 · Los Cedros', lat: -12.1598, lng: -77.0331, fecha: haceHoras(12), apoyosBase: 1, cuadrilla: 'beta', asignadoEn: haceHoras(4) }),
    R({ id: 'EA-0076', estado: 'resuelto', categoria: 'domesticos', urgencia: 'media', magnitud: 'contenedor', direccion: 'Jr. San Pedro cdra. 3', sector: 'Sector 3 · Villa', lat: -12.1905, lng: -77.0062, fecha: haceHoras(80), apoyosBase: 5, cuadrilla: 'alfa', asignadoEn: haceHoras(70), cerradoEn: haceHoras(52), validado: true }),
    R({ id: 'EA-0072', estado: 'resuelto', categoria: 'escombros', urgencia: 'alta', magnitud: 'camion', direccion: 'Pasaje Los Laureles', sector: 'Sector 5 · La Campiña', lat: -12.1718, lng: -77.0096, fecha: haceHoras(100), apoyosBase: 6, cuadrilla: 'camion07', asignadoEn: haceHoras(96), cerradoEn: haceHoras(80), validado: true }),
    R({ id: 'EA-0070', estado: 'recibido', categoria: 'escombros', urgencia: 'alta', magnitud: 'camion', direccion: 'Parque Los Pinos, lado norte', sector: 'Sector 5 · La Campiña', lat: -12.1729, lng: -77.0150, fecha: haceHoras(40), apoyosBase: 9 }),
    R({ id: 'EA-0068', estado: 'atencion', categoria: 'organico', urgencia: 'alta', magnitud: 'contenedor', direccion: 'Av. Prolongación Paseo de la República', sector: 'Sector 3 · Villa', lat: -12.1873, lng: -77.0128, fecha: haceHoras(9), apoyosBase: 3, cuadrilla: 'alfa', asignadoEn: haceHoras(1) }),
    R({ id: 'EA-0065', estado: 'descartado', categoria: 'domesticos', urgencia: 'baja', magnitud: 'bolsa', direccion: 'Calle Bolognesi cdra. 2', sector: 'Sector 1 · Matellini', lat: -12.1851, lng: -77.0153, fecha: haceHoras(60), motivoDescarte: 'El punto ya estaba limpio al llegar la cuadrilla.' })
  ];

  const proximoSabado = (semanas = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7) + semanas * 7);
    d.setHours(8, 0, 0, 0);
    return d.toISOString();
  };
  const jornadasEjemplo = () => [
    { id: 'J1', titulo: 'Limpieza y recojo de enseres', fecha: proximoSabado(), lugar: 'Parque Los Pinos', sector: 'Sector 5 · La Campiña' },
    { id: 'J2', titulo: 'Recojo especial de desmonte', fecha: proximoSabado(1), lugar: 'Av. Huaylas cdras. 12 a 16', sector: 'Sector 2 · Las Delicias' },
    { id: 'J3', titulo: 'Campaña de desinsectación', fecha: proximoSabado(2), lugar: 'Todo el distrito', sector: 'Todos' }
  ];

  // ---------- Inicialización ----------
  const iniciar = () => {
    if (!leer(K.usuarios)) escribir(K.usuarios, usuariosEjemplo());
    if (!leer(K.reportes)) escribir(K.reportes, reportesEjemplo());
    if (!leer(K.jornadas)) escribir(K.jornadas, jornadasEjemplo());
    if (!leer(K.notifs)) escribir(K.notifs, []);
    if (!leer(K.subs)) escribir(K.subs, {});
  };
  const reiniciar = () => { Object.values(K).forEach((k) => localStorage.removeItem(k)); iniciar(); };
  iniciar();

  // ---------- Usuarios y sesión (HU-001, HU-003, HU-004, HU-005) ----------
  const usuarios = () => leer(K.usuarios, []);
  const guardarUsuarios = (l) => escribir(K.usuarios, l);
  const buscarUsuario = (usuario) => usuarios().find((u) => u.usuario.toLowerCase() === String(usuario).trim().toLowerCase());

  const autenticar = (usuario, password) => {
    const u = buscarUsuario(usuario);
    return u && u.password === password ? u : null;
  };

  const registrar = ({ nombre, usuario, password, distrito, sector }) => {
    if (buscarUsuario(usuario)) return { error: 'Ya existe una cuenta con ese correo.' };
    const nuevo = { id: 'u' + Date.now(), usuario: usuario.trim().toLowerCase(), password, nombre: nombre.trim(), rol: 'vecino', distrito: distrito || 'Chorrillos', sector: sector || '', notificaciones: true };
    guardarUsuarios([...usuarios(), nuevo]);
    return { usuario: nuevo };
  };

  const actualizarUsuario = (id, cambios) => {
    const lista = usuarios().map((u) => (u.id === id ? { ...u, ...cambios } : u));
    guardarUsuarios(lista);
    const s = sesion();
    if (s && s.id === id) escribir(K.sesion, { ...s, ...cambios });
    return lista.find((u) => u.id === id);
  };

  const cambiarPassword = (usuario, nueva) => {
    const u = buscarUsuario(usuario);
    if (!u) return false;
    actualizarUsuario(u.id, { password: nueva });
    return true;
  };

  const iniciarSesion = (u) => { const { password, ...datos } = u; escribir(K.sesion, datos); return datos; };
  const sesion = () => {
    const s = leer(K.sesion, null);
    if (!s) return null;
    const u = usuarios().find((x) => x.id === s.id); // refleja cambios de rol hechos por el administrador
    if (!u) return null;
    const { password, ...datos } = u;
    return datos;
  };
  const cerrarSesion = () => localStorage.removeItem(K.sesion);

  // ---------- Reportes ----------
  const reportes = () => leer(K.reportes, []);
  const guardarReportes = (l) => escribir(K.reportes, l);
  const buscar = (id) => reportes().find((r) => r.id === id);
  const actualizar = (id, cambios, evento) => {
    const lista = reportes().map((r) => {
      if (r.id !== id) return r;
      const historial = evento ? [...(r.historial || []), { fecha: new Date().toISOString(), texto: evento }] : r.historial;
      return { ...r, ...cambios, historial };
    });
    guardarReportes(lista);
    return lista.find((r) => r.id === id);
  };

  const siguienteId = () => {
    const n = reportes().map((r) => parseInt(String(r.id).replace(/\D/g, ''), 10) || 0);
    return 'EA-' + String(Math.max(100, ...n) + 1).padStart(4, '0');
  };

  const crear = (datos, autor) => {
    const nuevo = R({
      ...datos,
      id: siguienteId(),
      autor: autor ? autor.usuario : 'anonimo',
      sector: datos.sector || (autor && autor.sector) || 'Sin sector',
      estado: 'recibido',
      fecha: new Date().toISOString(),
      historial: [{ fecha: new Date().toISOString(), texto: 'Reporte recibido' }]
    });
    const lista = [...reportes(), nuevo];
    if (guardarReportes(lista)) return { reporte: nuevo, sinFoto: false };
    lista[lista.length - 1] = { ...nuevo, foto: null };
    if (guardarReportes(lista)) return { reporte: lista[lista.length - 1], sinFoto: true };
    return { reporte: null };
  };

  // HU-017: respaldar ("Me suma") un reporte existente, una vez por usuario
  const totalApoyos = (r) => (r.apoyosBase || 0) + (r.apoyos || []).length;
  const alternarApoyo = (id, usuario) => {
    const r = buscar(id);
    if (!r) return null;
    const ya = (r.apoyos || []).includes(usuario);
    const apoyos = ya ? r.apoyos.filter((a) => a !== usuario) : [...(r.apoyos || []), usuario];
    return actualizar(id, { apoyos });
  };

  // HU-025: puntaje de prioridad (0-100) para ordenar automáticamente
  const prioridad = (r) => {
    const base = { alta: 45, media: 28, baja: 12 }[r.urgencia] || 20;
    const tiempo = Math.min(horasDesde(r.fecha), 48) * 0.6;           // hasta 29 pts
    const apoyo = Math.min(totalApoyos(r), 15) * 1.2;                  // hasta 18 pts
    const riesgo = r.categoria === 'toxico' ? 8 : 0;
    return Math.min(100, Math.round(base + tiempo + apoyo + riesgo));
  };
  const nivelPrioridad = (p) => (p >= 70 ? 'alta' : p >= 45 ? 'media' : 'baja');

  // HU-030: reportes abiertos con más de 24 h sin atención
  const sinAtencion24h = () => reportes().filter((r) => r.estado === 'recibido' && horasDesde(r.fecha) > 24);

  // ---------- Notificaciones (HU-041) ----------
  const notificaciones = (usuario) => leer(K.notifs, []).filter((n) => n.para === usuario).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const notificar = (para, texto, reporteId) => {
    if (!para || para === 'anonimo') return;
    const l = leer(K.notifs, []);
    l.push({ id: 'n' + Date.now() + Math.random().toString(16).slice(2, 6), para, texto, reporteId, fecha: new Date().toISOString(), leida: false });
    escribir(K.notifs, l);
  };
  const marcarLeidas = (usuario) => escribir(K.notifs, leer(K.notifs, []).map((n) => (n.para === usuario ? { ...n, leida: true } : n)));

  // ---------- Flujo municipal ----------
  // HU-026: asignar a cuadrilla
  const asignar = (id, cuadrilla, nota) => {
    const c = CUADRILLAS.find((x) => x.id === cuadrilla);
    const r = actualizar(id, { estado: 'atencion', cuadrilla, nota: nota || '', asignadoEn: new Date().toISOString() }, `Asignado a ${c ? c.nombre : cuadrilla}`);
    if (r) notificar(r.autor, `Tu reporte ${r.id} (${r.direccion}) está en atención: fue asignado a ${c ? c.nombre : 'una cuadrilla'}.`, r.id);
    return r;
  };
  // HU-036: validar en sitio o descartar
  const validar = (id) => actualizar(id, { validado: true }, 'Reporte verificado en sitio');
  const descartar = (id, motivo) => {
    const r = actualizar(id, { estado: 'descartado', motivoDescarte: motivo }, `Descartado: ${motivo}`);
    if (r) notificar(r.autor, `Tu reporte ${r.id} fue revisado y descartado: ${motivo}`, r.id);
    return r;
  };
  // HU-035: cerrar con foto "después"
  const cerrar = (id, fotoDespues, observaciones) => {
    const r = actualizar(id, { estado: 'resuelto', fotoDespues, observaciones: observaciones || '', cerradoEn: new Date().toISOString(), validado: true }, 'Zona saneada con evidencia');
    if (r) notificar(r.autor, `¡Tu reporte ${r.id} (${r.direccion}) fue resuelto! La zona ya está limpia.`, r.id);
    return r;
  };

  // ---------- Jornadas (HU-047) ----------
  const jornadas = () => leer(K.jornadas, []).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const suscripciones = (usuario) => (leer(K.subs, {})[usuario] || []);
  const alternarSuscripcion = (usuario, jornadaId) => {
    const s = leer(K.subs, {});
    const lista = s[usuario] || [];
    s[usuario] = lista.includes(jornadaId) ? lista.filter((x) => x !== jornadaId) : [...lista, jornadaId];
    escribir(K.subs, s);
    return s[usuario].includes(jornadaId);
  };

  // ---------- Métricas (HU-043, HU-044) ----------
  const tiempoRespuesta = (r) => (r.cerradoEn ? (new Date(r.cerradoEn) - new Date(r.fecha)) / 3600000 : null);
  const metricas = (filtro = () => true) => {
    const l = reportes().filter(filtro).filter((r) => r.estado !== 'descartado');
    const resueltos = l.filter((r) => r.estado === 'resuelto');
    const tiempos = resueltos.map(tiempoRespuesta).filter((x) => x !== null);
    const promedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : null;
    return {
      total: l.length,
      abiertos: l.filter((r) => r.estado !== 'resuelto').length,
      resueltos: resueltos.length,
      enAtencion: l.filter((r) => r.estado === 'atencion').length,
      promedioHoras: promedio,
      menos24: tiempos.length ? Math.round((tiempos.filter((t) => t <= 24).length / tiempos.length) * 100) : null,
      altas: l.filter((r) => r.estado !== 'resuelto' && r.urgencia === 'alta').length,
      sinAtencion: l.filter((r) => r.estado === 'recibido' && horasDesde(r.fecha) > 24).length
    };
  };

  return {
    CATEGORIAS, ESTADOS, ORDEN_ESTADOS, URGENCIAS, MAGNITUDES, ROLES, SECTORES, CUADRILLAS, CENTRO,
    escapar, formatearFecha, formatearHoras, horasDesde, reiniciar,
    usuarios, buscarUsuario, autenticar, registrar, actualizarUsuario, cambiarPassword, iniciarSesion, sesion, cerrarSesion,
    reportes, buscar, actualizar, crear, totalApoyos, alternarApoyo, prioridad, nivelPrioridad, sinAtencion24h,
    notificaciones, notificar, marcarLeidas, asignar, validar, descartar, cerrar,
    jornadas, suscripciones, alternarSuscripcion, tiempoRespuesta, metricas
  };
})();
