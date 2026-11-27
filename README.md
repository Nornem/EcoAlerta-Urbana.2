# EcoAlerta Urbana

**Reporta, participa y mejora tu comunidad.**

EcoAlerta Urbana es una plataforma web responsive para el distrito de Chorrillos (Lima, Perú). Los vecinos reportan puntos críticos de basura con foto y ubicación GPS, y la municipalidad los prioriza, los asigna a una cuadrilla y los atiende. Los vecinos y los líderes comunales pueden seguir cada caso hasta que la zona queda limpia.

Es un proyecto del curso **HCI for UX Design** de la Universidad Peruana de Ciencias Aplicadas (UPC), desarrollado por **Alertica Group** y alineado con el **ODS 11: Ciudades y comunidades sostenibles**.

🔗 **Sitio publicado:** https://nornem.github.io/EcoAlerta-Urbana.2/

---

## Cómo funciona

1. **Reportas.** Tomas una foto del punto de basura; la ubicación se detecta sola y eliges el tipo de residuo.
2. **Se prioriza.** La municipalidad ve los reportes ordenados según la urgencia, el tiempo sin atención y los apoyos de los vecinos.
3. **Se limpia.** La cuadrilla atiende el punto y sube la foto de **antes y después**.
4. **Te enteras.** Recibes un aviso cuando tu reporte se resuelve.

Un mismo enlace funciona como **aplicación móvil** (vecino, líder comunal y fiscalizador) y como **sistema web** (coordinador municipal): la interfaz se adapta al tamaño de la pantalla.

## Funcionalidades por rol

| Rol | Qué puede hacer |
|---|---|
| **Vecino** | Reportar con foto, GPS, ajuste del pin en el mapa, tipo de residuo, urgencia y magnitud. Seguir sus reportes con línea de tiempo. Respaldar reportes de otros con "Me suma". Compartir por WhatsApp. Recibir notificaciones y suscribirse a jornadas de limpieza. |
| **Líder comunal** | Lo mismo que el vecino, más **Mi sector**: indicadores de su zona, reportes de más de 24 h sin atención y la lista priorizada para compartir con la junta vecinal. |
| **Fiscalizador** | Ver las órdenes asignadas a su cuadrilla, filtrarlas, abrir la ruta en Google Maps o Waze, verificar o descartar el reporte y cerrarlo con la foto del después. |
| **Coordinador municipal** | Panel con indicadores, **mapa de calor** y alertas de más de 24 h. Bandeja de incidencias ordenada por **prioridad automática** (0 a 100) y asignación a cuadrillas. Gestión de usuarios y roles. |
| **Cualquier persona** | Consultar el **mapa comunitario** y el **portal de transparencia** sin registrarse. |

## Cuentas de prueba

Todas usan la contraseña **`EcoAlerta2026`**.

| Rol | Por dónde se ingresa | Usuario |
|---|---|---|
| Vecino | Bienvenida → *Ingresar como vecino* | `vecino@ecoalerta.com` |
| Líder comunal | Bienvenida → *Ingresar como vecino* | `lider@ecoalerta.com` |
| Fiscalizador | Bienvenida → *Ingresar con credenciales* | `45678912` |
| Coordinador municipal | Bienvenida → *Ingresar con credenciales* | `10203040` |

También puedes crear tu propia cuenta de vecino desde *Crear una cuenta*.

### Prueba del ciclo completo

1. Ingresa como **vecino** y crea un reporte.
2. Cierra sesión, ingresa como **coordinador** y asigna el reporte a la cuadrilla **Alfa** en *Incidencias*.
3. Ingresa como **fiscalizador**: el reporte aparece en *Mis asignaciones*. Verifícalo y ciérralo con una foto.
4. Vuelve a ingresar como **vecino**: verás el aviso en la campana y el antes y después en la ficha del reporte.

## Tecnologías

- **HTML5, CSS3 y JavaScript**, sin frameworks ni proceso de compilación.
- **Diseño responsive y mobile first** con Flexbox, CSS Grid y media queries.
- **[Leaflet](https://leafletjs.com/)** y **OpenStreetMap** para los mapas, y **Nominatim** para convertir coordenadas en direcciones.
- **APIs del navegador:** Geolocation, Notifications, Web Share y `localStorage`.
- **GitHub Pages** para el despliegue.

## Estructura del proyecto

```
index.html                  → redirige a la página de inicio
web_site/
├── index.html              → landing page
├── bienvenida.html         → elección del tipo de acceso
├── login.html              → ingreso y registro de vecinos y líderes
├── login-institucional.html
├── recuperar.html          → recuperación de contraseña
├── transparencia.html      → portal público
├── vecino/                 → reportar, mapa, ficha, mis-reportes, perfil
├── lider/                  → mi-sector
├── fiscalizador/           → asignaciones, cierre
└── municipal/              → panel, incidencias, usuarios
css/
├── estilos.css             → variables de la guía de estilos
├── landing.css             → página de inicio
├── auth.css                → acceso e inicio de sesión
└── app.css                 → pantallas de la aplicación y diseño responsive
js/
├── datos.js                → datos, roles, reglas y cálculo de prioridad
├── ui.js                   → navegación por rol, notificaciones y mapas
└── (un archivo por pantalla)
images/
```

## Guía de estilos

| Color | Hex | Uso |
|---|---|---|
| Verde Hoja | `#1B6B4A` | Color principal y botones |
| Verde Bosque | `#0F4D35` | Encabezados y barra lateral |
| Azul Cívico | `#1F5FA8` | Estado "En atención" y enlaces |
| Ámbar Alerta | `#F2A900` | Estado "Recibido" y urgencia media |
| Rojo Crítico | `#C0392B` | Errores y urgencia alta |

Tipografías: **Poppins** para los títulos e **Inter** para el texto.

## Accesibilidad

- Contraste según WCAG 2.1 AA, y la información no depende solo del color.
- Foco visible al navegar con el teclado. Las ventanas emergentes se cierran con `Esc`.
- Etiquetas en todos los campos. Los mensajes de error y de estado se anuncian a los lectores de pantalla.
- Áreas táctiles de al menos 48 px y textos alternativos en las imágenes.

## Notas importantes

- **No hay servidor.** Los usuarios, reportes y notificaciones se guardan en el `localStorage` del navegador, así que el ciclo completo se prueba en un mismo navegador cambiando de cuenta. Para volver a los datos de ejemplo, ejecuta `EcoData.reiniciar()` en la consola.
- **Funciones simuladas:** el ingreso con Google, el envío del correo de recuperación y el acceso institucional (que valida usuarios precargados) funcionan como demostración.
- **El mapa necesita conexión a internet** para cargar la cartografía. El GPS requiere dar permiso de ubicación en el navegador.

## Ejecutar en local

Clona el repositorio y abre la carpeta con un servidor local. Por ejemplo, con la extensión **Live Server** de VS Code, o con:

```bash
python -m http.server 8000
```

Luego entra a `http://localhost:8000`.

## Equipo

**Alertica Group** · HCI for UX Design (1ASI0784) · UPC · 2026-20
