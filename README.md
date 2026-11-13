# Centinela

Software de monitoreo de salud para tripulaciones en misiones de larga duración. Recopila indicadores, calcula el riesgo de cuatro sistemas del cuerpo y le dice al astronauta qué hacer, sin depender de una respuesta inmediata de Tierra.

## El problema

En una misión a Marte la tripulación está expuesta a radiación, aislamiento, gravedad alterada y un entorno cerrado. Eso provoca cambios inmunológicos, pérdida ósea, eventos cardiovasculares y problemas de salud conductual. Una consulta a Tierra puede tardar más de media hora en ir y volver, así que la detección temprana recae en el propio astronauta.

## Qué hace

| Paso | Función |
| --- | --- |
| Recopilar | Signos vitales en vivo con trazo de ECG, CO₂ de cabina, radiación, densidad ósea, sueño y un chequeo diario de ánimo, estrés y síntomas |
| Evaluar | Cuatro índices de riesgo de 0 a 100 (mente y conducta, corazón y circulación, defensas e inmunidad, huesos y músculo) con los factores que los componen |
| Actuar | Lista priorizada de acciones; al marcarlas como hechas los indicadores responden |
| Anticipar | Proyección de densidad ósea y radiación acumulada hasta el regreso según ejercicio, horas blindado y tormentas solares |
| Ensayar | Simulador de emergencias: tormenta solar, falla del depurador de CO₂, falta de sueño y taquicardia |
| Consultar | Oficial médico de a bordo con motor de reglas local que funciona sin enlace |

También incluye una prueba de reflejos de cinco intentos para detectar fatiga y una bitácora que se guarda en el navegador.

## Cómo ejecutarlo

Abre `index.html` en un navegador. No requiere instalación ni servidor.

Para servirlo en red local:

```
npx serve .
```

## Estructura

```
centinela/
├── index.html
├── css/
│   ├── tokens.css        colores y tipografías, modo claro y oscuro
│   ├── base.css          estilos generales, cabecera y navegación
│   ├── estado.css        vista principal: figura, índices, acciones, signos
│   ├── vistas.css        autochequeo, proyección y oficial médico
│   └── responsive.css    adaptación a pantallas pequeñas
├── js/
│   ├── utils.js          utilidades de DOM y formato
│   ├── config.js         valores base, escenarios, sistemas y rangos
│   ├── state.js          estado de la aplicación y guardado local
│   ├── risk.js           cálculo de riesgo y reglas de acción
│   ├── services.js       sonido, voz y conexión con el asistente
│   ├── ui.js             construcción y actualización de la interfaz
│   ├── simulation.js     simulación de sensores
│   ├── pvt.js            prueba de reflejos
│   ├── projection.js     modelo y gráficos de proyección
│   ├── assistant.js      oficial médico
│   ├── ecg.js            trazo de ECG
│   └── main.js           rutas e inicio
└── docs/
    └── modelo-de-riesgo.md
```

## Tecnologías

HTML5, CSS3 con variables y Grid, JavaScript sin frameworks, SVG, Canvas 2D, Web Audio API, Web Speech API y localStorage.

## Limitaciones

- Los sensores son simulados. La arquitectura separa la simulación (`simulation.js`) del cálculo (`risk.js`) para poder conectar sensores reales.
- Los umbrales y pesos del modelo de riesgo y la proyección son simplificaciones de un prototipo, no valores clínicos validados. Ver `docs/modelo-de-riesgo.md`.
- No es un dispositivo médico.

## Uso de inteligencia artificial

El código y los textos de este prototipo se generaron con ayuda de Claude (Anthropic) y fueron revisados por el equipo.

## Equipo

Perú

| Integrante | Usuario | Rol |
| --- | --- | --- |
| Miguel Ángel Portal López | @loxware | Líder del equipo |
| Joseph Mariano Henriquez Alfaro | @jojoalfz | |
| Joseph Iván Merino Rojas | @josephmr | |
| Diego José Díaz Peralta | @diandres | |
| Eduardo Fidel Cisneros Isuiza | @eduardo_cis | |
| Darwin Dionicio | @eldarwin | |
