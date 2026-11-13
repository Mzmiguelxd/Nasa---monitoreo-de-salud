# Modelo de riesgo

Cada sistema recibe un puntaje de 0 a 100 que resulta de sumar los puntos de sus factores. El cálculo está en `js/risk.js`.

| Puntaje | Nivel | Qué significa |
| --- | --- | --- |
| 0 a 34 | En rango | Sin acción |
| 35 a 64 | Vigilar | Seguir la contramedida del sistema |
| 65 a 100 | Actuar | Salta la alerta con la acción prioritaria |

## Factores por sistema

**Corazón y circulación:** frecuencia en reposo, variabilidad cardíaca, presión sistólica, saturación de oxígeno, palpitaciones reportadas y un valor fijo por desacondicionamiento en microgravedad.

**Huesos y músculo:** pérdida de densidad ósea respecto de la línea base, minutos de ejercicio que faltan hoy (meta de 150), dolor lumbar reportado y un valor fijo por falta de carga.

**Defensas e inmunidad:** radiación acumulada frente a un límite de carrera de 600 mSv, tasa de radiación actual, horas de sueño, temperatura y síntomas de piel o congestión.

**Mente y conducta:** horas de sueño, ánimo, estrés, tiempo medio de reacción, CO₂ de cabina, dolor de cabeza, visión borrosa y días de aislamiento.

## Proyección

- Hueso: pérdida de 1,5 % mensual sin ejercicio, reducida hasta 78 % con cumplimiento total del plan de resistencia.
- Radiación: 1,1 mSv por día en tránsito, hasta 30 % menos al pasar de 8 a 16 horas diarias en la zona blindada, más 25 mSv por tormenta solar.

## Advertencia

Los pesos, umbrales y tasas son aproximaciones elegidas para el prototipo a partir de órdenes de magnitud publicados. Deben calibrarse con datos reales y validación médica antes de cualquier uso operativo.
