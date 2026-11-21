// js/ficha.js
// Ficha del reporte: estado, fotos antes/después, historial,
// HU-017 respaldar ("Me suma") y HU-021 compartir por WhatsApp.

document.addEventListener('DOMContentLoaded', () => {
  const s = EcoUI.montarApp({ titulo: 'Ficha del reporte', volver: 'vecino/mapa.html' });
  const e = EcoData.escapar;
  const id = new URLSearchParams(location.search).get('id');
  const main = document.getElementById('contenido');

  const pintar = () => {
    const r = EcoData.buscar(id);
    if (!r) { main.innerHTML = '<div class="card vacio">No encontramos este reporte. <a class="btn-link" href="mapa.html">Volver al mapa</a></div>'; return; }
    const mio = s && r.autor === s.usuario;
    const apoyado = s && (r.apoyos || []).includes(s.usuario);
    const total = EcoData.totalApoyos(r);
    const idx = EcoData.ORDEN_ESTADOS.indexOf(r.estado);
    const pasos = EcoData.ORDEN_ESTADOS.map((k, i) => {
      const clase = r.estado === 'resuelto' || i < idx ? 'hecho' : i === idx ? `actual estado-paso-${k}` : '';
      return `<div class="paso ${clase}"><i></i>${EcoData.ESTADOS[k].texto}</div>`;
    }).join('');
    const fotos = r.fotoDespues
      ? `<div class="ficha-fotos"><figure><img class="ficha-foto" src="${e(r.foto || '')}" alt="Antes: foto del vecino"><figcaption>ANTES</figcaption></figure><figure><img class="ficha-foto" src="${e(r.fotoDespues)}" alt="Después: zona limpia"><figcaption>DESPUÉS</figcaption></figure></div>`
      : r.foto ? `<img class="ficha-foto" src="${e(r.foto)}" alt="Foto del reporte ${e(r.id)}">` : '';

    main.innerHTML = `
      ${fotos}
      <div class="card" style="margin-top:12px;display:grid;gap:6px">
        <p class="reporte__meta">${e(r.id)} · ${e(EcoData.formatearFecha(r.fecha))} · ${e(r.sector || '')}${mio ? ' · <strong>Tu reporte</strong>' : ''}</p>
        <h2 class="pagina-titulo" style="margin:0">${e(r.direccion)}</h2>
        <p style="margin:0">${e(EcoData.CATEGORIAS[r.categoria])} · ${e(EcoData.MAGNITUDES[r.magnitud] || '')} · Urgencia ${e(EcoData.URGENCIAS[r.urgencia])}</p>
        <div>${EcoUI.estadoTag(r.estado)}</div>
        ${r.estado === 'descartado' ? `<p class="alerta alerta-info">Motivo: ${e(r.motivoDescarte || 'Revisado por el fiscalizador.')}</p>` : `<div class="timeline" aria-label="Seguimiento del reporte">${pasos}</div>`}
      </div>

      ${r.estado !== 'resuelto' && r.estado !== 'descartado' ? `
      <div class="apoyo-caja" style="margin-top:12px" aria-live="polite">
        <strong id="txt-apoyos">${total} vecino${total === 1 ? '' : 's'} se ${total === 1 ? 'suma' : 'suman'} a este reporte</strong>
        <span>Más apoyos elevan su prioridad para la municipalidad.</span>
      </div>` : ''}

      <div class="acciones">
        ${r.estado !== 'resuelto' && r.estado !== 'descartado' && !mio && (!s || s.rol === 'vecino' || s.rol === 'lider') ? `<button type="button" class="btn ${apoyado ? 'btn-activo' : 'btn-primario'}" id="btn-suma" aria-pressed="${apoyado}">${EcoUI.ICONOS.heart}${apoyado ? 'Te sumaste · quitar apoyo' : 'Me suma · también me afecta'}</button>` : ''}
        <a class="btn btn-whatsapp" id="btn-wa" target="_blank" rel="noopener">${EcoUI.ICONOS.share}Compartir por WhatsApp</a>
        ${navigator.share ? '<button type="button" class="btn btn-secundario" id="btn-compartir">Compartir de otra forma</button>' : ''}
        ${typeof r.lat === 'number' ? `<a class="btn btn-secundario" href="mapa.html?id=${encodeURIComponent(r.id)}">Ver en el mapa</a>` : ''}
      </div>

      ${(r.historial || []).length ? `<h3 class="seccion-titulo">Historial</h3><ul class="historial">${r.historial.slice().reverse().map((h) => `<li>${e(h.texto)}<span>${e(EcoData.formatearFecha(h.fecha))}</span></li>`).join('')}</ul>` : ''}`;

    const texto = r.estado === 'resuelto'
      ? `✅ ¡Se limpió el punto de basura en ${r.direccion}! Gracias a los reportes de los vecinos en EcoAlerta Urbana. ${EcoUI.urlFicha(r.id)}`
      : `⚠️ Punto de basura en ${r.direccion} (${EcoData.CATEGORIAS[r.categoria]}). Ya somos ${total} vecinos reportándolo. Súmate para que lo atiendan pronto: ${EcoUI.urlFicha(r.id)}`;
    document.getElementById('btn-wa').href = EcoUI.enlaceWhatsApp(texto);
    const bc = document.getElementById('btn-compartir');
    if (bc) bc.addEventListener('click', () => navigator.share({ title: 'EcoAlerta Urbana', text: texto }).catch(() => {}));

    const bs = document.getElementById('btn-suma');
    if (bs) bs.addEventListener('click', () => {
      if (!s) {
        EcoUI.flash('Inicia sesión para sumarte al reporte.', 'aviso');
        location.href = '../login.html?next=' + encodeURIComponent('vecino/ficha.html?id=' + r.id);
        return;
      }
      const act = EcoData.alternarApoyo(r.id, s.usuario);
      EcoUI.toast((act.apoyos || []).includes(s.usuario) ? '¡Gracias! Tu apoyo eleva la prioridad del reporte.' : 'Quitaste tu apoyo.');
      pintar();
      const nb = document.getElementById('btn-suma');
      if (nb) nb.focus();
    });
  };
  pintar();
});
