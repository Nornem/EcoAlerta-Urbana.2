// js/transparencia.js
// HU-044: indicador público del tiempo promedio de respuesta · HU-046: portal sin registro

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const e = EcoData.escapar;
  const m = EcoData.metricas();
  const META = 24;

  $('kpis').innerHTML = `
    <div class="kpi kpi--azul"><span>Tiempo promedio de respuesta</span><strong>${m.promedioHoras !== null ? Math.round(m.promedioHoras) + ' h' : '—'}</strong><small>Meta municipal: ${META} h</small></div>
    <div class="kpi"><span>Reportes resueltos</span><strong>${m.resueltos}</strong><small>de ${m.total} recibidos</small></div>
    <div class="kpi kpi--ambar"><span>Resueltos en menos de 24 h</span><strong>${m.menos24 !== null ? m.menos24 + ' %' : '—'}</strong><small>del total resuelto</small></div>
    <div class="kpi kpi--rojo"><span>Más de 24 h sin atención</span><strong>${m.sinAtencion}</strong><small>reportes esperando</small></div>`;

  // Gráfico: 5 meses de demostración + mes actual calculado
  const hoy = new Date();
  const mes = (k) => new Date(hoy.getFullYear(), hoy.getMonth() - k, 1).toLocaleDateString('es-PE', { month: 'short' }).replace('.', '');
  const serie = [[mes(5), 52], [mes(4), 47], [mes(3), 44], [mes(2), 40], [mes(1), 37], [mes(0), m.promedioHoras !== null ? Math.round(m.promedioHoras) : 0]];
  const max = 60;
  $('barras').innerHTML = `<div class="meta-linea" style="bottom:${(META / max) * 85}%"><span>Meta ${META} h</span></div>` +
    serie.map(([t, v], i) => `<div class="barra-col${i === serie.length - 1 ? ' actual' : ''}"><b>${v} h</b><i style="height:${(v / max) * 85}%"></i></div>`).join('');
  $('barras-etq').innerHTML = serie.map(([t]) => `<span>${e(t)}</span>`).join('');
  $('tabla-graf').querySelector('tbody').innerHTML = serie.map(([t, v]) => `<tr><td>${e(t)}</td><td>${v}</td></tr>`).join('');

  // Ranking por sector
  const sectores = EcoData.SECTORES.map((sec) => {
    const mm = EcoData.metricas((r) => r.sector === sec);
    return { sec, abiertos: mm.abiertos, prom: mm.promedioHoras };
  }).sort((a, b) => b.abiertos - a.abiertos);
  const tope = Math.max(1, ...sectores.map((x) => x.abiertos));
  $('ranking').innerHTML = sectores.map((x, i) => `<li><div class="fila"><span><strong>${i + 1}.</strong> ${e(x.sec)}</span><span><strong>${x.abiertos}</strong> abiertos · ${x.prom !== null ? Math.round(x.prom) + ' h prom.' : 'sin cierres'}</span></div><div class="riel"><i style="width:${(x.abiertos / tope) * 100}%;background:${i < 2 ? '#C0392B' : '#F2A900'}"></i></div></li>`).join('');
});
