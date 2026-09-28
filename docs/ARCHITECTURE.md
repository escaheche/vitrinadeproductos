# Arquitectura

## Decisión principal

La aplicación completa se despliega en un único servicio de GCP Cloud Run.

Este servicio sirve:

- frontend estático desde `/`
- backend API desde `/api`

No se usa GitHub Pages.

No se separan frontend y backend en servicios distintos.

---

## Diagrama

```text
Repositorio Git
  |
  | push
  v
OpenCode / desarrollador
  |
  | gcloud run deploy
  v
GCP Cloud Run
  |
  |-- FastAPI
  |-- frontend estático
  |-- data/catalog.csv
```

---

## Componentes

### Frontend

Aplicación simple en HTML, CSS y JavaScript.

Responsabilidades:

- mostrar grilla de productos,
- mostrar estados loading, success, empty y error,
- enviar búsqueda, filtros y paginación al backend,
- renderizar solamente la página recibida.

No debe:

- descargar el catálogo completo,
- filtrar todo el catálogo localmente,
- calcular paginación completa localmente.

### Backend

API FastAPI.

Responsabilidades:

- cargar `data/catalog.csv` al iniciar,
- exponer `/api/health`,
- exponer `/api/products/filters`,
- exponer `/api/products`,
- exponer opcionalmente `/api/products/{id}`,
- realizar búsqueda,
- realizar filtros,
- realizar paginación.

### Datos

El archivo `data/catalog.csv` se incluye dentro de la imagen Docker.

Se carga en memoria al iniciar el servicio.

No se usa base de datos.

---

## Decisiones

### Un solo Cloud Run

Motivos:

- reduce complejidad,
- evita CORS,
- evita configuración separada de frontend,
- evita GitHub Pages,
- permite cumplir el desafío con poca infraestructura.

### CSV en memoria

Motivos:

- el catálogo tiene 4.032 productos,
- el tamaño es manejable,
- evita base de datos,
- simplifica despliegue.

### FastAPI

Motivos:

- simple,
- rápido de implementar,
- permite validar query params,
- fácil de ejecutar con Uvicorn.

### Frontend vanilla

Motivos:

- el desafío pide coherencia, no sofisticación,
- evita builds,
- evita dependencias innecesarias,
- facilita servir archivos estáticos desde Cloud Run.

---

## Supuestos

- La cuenta GCP permite desplegar Cloud Run.
- El usuario ya hizo `gcloud auth login`.
- El catálogo no cambia durante la ejecución.
- Las imágenes remotas pueden cargarse desde el navegador.
- No se requiere alta concurrencia.

---

## Limitaciones aceptadas

- El catálogo se actualiza solo al hacer redeploy.
- No hay persistencia de estado.
- No hay autenticación.
- No hay caché avanzada.
- No hay observabilidad avanzada.

---

## Alternativas descartadas

### GitHub Pages + Cloud Run

Descartada porque agrega CORS, configuración de URL y separación innecesaria.

### Cloud Storage estático + Cloud Run

Descartada porque agrega complejidad sin beneficio para este desafío.

### Base de datos

Descartada porque el catálogo es estático y pequeño.

### Next.js / React

Descartado para mantener la solución simple y coherente con el problema.