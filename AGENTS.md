# AGENTS.md

## Proyecto

Este proyecto es una vitrina web mínima para explorar un catálogo de productos de supermercado.

El catálogo está en:

```text
data/catalog.csv
```

Contiene 4.032 productos con nombres, descripciones, categorías, formatos, precios en CLP, imágenes y URLs.

El proyecto corresponde al desafío Full Stack Etapa 1.

---

## Objetivo del agente

El agente debe implementar, verificar, commitear y desplegar una aplicación funcional mínima.

La aplicación debe permitir:

- listar productos paginados,
- buscar productos,
- filtrar productos,
- ver estados de carga, vacío y error,
- consumir únicamente datos reales del catálogo.

---

## Arquitectura obligatoria

La aplicación debe correr completamente en GCP Cloud Run.

No usar GitHub Pages.

La arquitectura es:

```text
Usuario
  |
  v
GCP Cloud Run
  |
  |-- sirve frontend estático desde /
  |-- sirve backend API desde /api
  |-- lee data/catalog.csv
```

El mismo servicio Cloud Run debe servir:

- `frontend/index.html`
- `frontend/styles.css`
- `frontend/app.js`
- endpoints `/api/...`

---

## Stack obligatorio

Backend:

- Python
- FastAPI
- Uvicorn
- CSV cargado en memoria

Frontend:

- HTML
- CSS
- JavaScript vanilla
- Sin frameworks
- Sin build step

Infraestructura:

- Docker
- GCP Cloud Run
- Git/GitHub

---

## Alcance permitido

La aplicación solo debe incluir:

- grilla de productos,
- búsqueda,
- filtros por categoría y formato,
- paginación,
- estados de carga, vacío y error,
- health check,
- endpoint de filtros,
- endpoint de productos,
- endpoint de detalle de producto, opcional si el mockup lo requiere.

---

## Fuera de alcance

No implementar:

- carrito,
- checkout,
- pagos,
- login,
- panel de administración,
- edición de productos,
- base de datos,
- colas,
- microservicios,
- autenticación,
- CORS complejo,
- despliegues separados de frontend y backend,
- GitHub Pages.

---

## Reglas de datos

- Usar únicamente datos de `data/catalog.csv`.
- No inventar campos.
- No inventar precios.
- No inventar imágenes.
- No inventar categorías.
- No inventar formatos.
- No inventar descripciones.
- Si falta un dato, mostrar vacío, guion o fallback visual, pero nunca inventar contenido.
- Los precios ya están en CLP. No convertirlos.
- Las categorías deben usarse exactamente como vienen en el CSV.
- Los formatos deben usarse exactamente como vienen en CSV.

---

## API obligatoria

### `GET /api/health`

Debe responder:

```json
{
  "status": "ok",
  "products": 4032
}
```

El número `products` debe ser la cantidad real de productos cargados desde el CSV.

---

### `GET /api/products/filters`

Debe devolver opciones disponibles para filtrar.

Respuesta esperada:

```json
{
  "categories": [],
  "formats": []
}
```

Las categorías y formatos deben provenir del CSV, ordenados alfabéticamente y sin duplicados.

---

### `GET /api/products`

Debe aceptar estos query params:

```text
search
category
format
page
pageSize
```

Valores por defecto recomendados:

```text
page = 1
pageSize = 24
```

Límite recomendado:

```text
pageSize máximo = 96
```

La búsqueda, los filtros y la paginación deben resolverse en backend.

Respuesta esperada:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 24,
  "totalPages": 1
}
```

Cada item debe incluir solamente campos necesarios para la grilla:

```text
id
name
category
format
price
priceUnit
originalPrice
currency
imageUrl
productUrl
```

No incluir `description` en el listado para no hacer pesada la respuesta.

---

### `GET /api/products/{id}`

Opcional si el mockup muestra detalle.

Debe devolver:

```json
{
  "id": "",
  "name": "",
  "description": "",
  "category": "",
  "format": "",
  "price": 0,
  "priceUnit": "",
  "originalPrice": 0,
  "currency": "CLP",
  "imageUrl": "",
  "productUrl": ""
}
```

Si el producto no existe, responder 404.

---

## Estados obligatorios del frontend

El frontend debe manejar cuatro estados:

1. `loading`
2. `success`
3. `empty`
4. `error`

Comportamientos:

- Al abrir la app, mostrar loading mientras consulta `/api/products`.
- Si la API responde con productos, mostrar grilla.
- Si la API responde sin productos, mostrar estado vacío.
- Si la API falla, mostrar error con botón de reintento.
- Si hay búsqueda/filtro sin resultados, mostrar estado vacío.
- El frontend nunca debe descargar todo el catálogo completo.
- El frontend debe pedir solamente la página actual al backend.

---

## Flujo de trabajo del agente

Para cada cambio, el agente debe seguir este orden:

1. Leer este archivo.
2. Leer `docs/SPEC.md`.
3. Leer `docs/ARCHITECTURE.md`.
4. Implementar el cambio mínimo solicitado.
5. Verificar localmente.
6. Actualizar documentación si cambió comportamiento.
7. Hacer commit en Git.
8. Hacer push si existe remote.
9. Si corresponde, desplegar en GCP usando `./deploy.sh`.

---

## Comandos locales

Crear entorno virtual:

```bash
python -m venv .venv
source .venv/bin/activate
```

En Windows:

```bash
.venv\Scripts\activate
```

Instalar dependencias:

```bash
pip install -r backend/requirements.txt
```

Ejecutar backend y frontend localmente:

```bash
uvicorn app.main:app --app-dir backend --reload --port 8080
```

Abrir:

```text
http://localhost:8080
```

Verificar API local:

```bash
curl http://localhost:8080/api/health
curl "http://localhost:8080/api/products?search=queso&page=1&pageSize=24"
curl http://localhost:8080/api/products/filters
```

---

## Prueba con Docker

Construir imagen:

```bash
docker build -t vitrina-local .
```

Ejecutar:

```bash
docker run --rm -p 8080:8080 vitrina-local
```

Verificar:

```bash
curl http://localhost:8080/api/health
```

---

## Reglas de Git

Rama principal:

```text
main
```

Formato de commits:

```text
feat: descripción
fix: descripción
docs: descripción
chore: descripción
refactor: descripción
test: descripción
```

Ejemplos:

```text
feat: backend con búsqueda, filtros y paginación
feat: frontend con estados loading, empty y error
docs: actualizar instrucciones de deploy
fix: corregir carga de catalog.csv
```

Reglas:

- No hacer commits con secretos.
- No subir archivos `.env`.
- No subir `data/source/`.
- No subir `node_modules`, `.venv`, `__pycache__`.
- Si cambia un comportamiento, actualizar `docs/SPEC.md` o `docs/VERIFICATION.md`.
- Antes de hacer push, verificar que la app funciona localmente.

---

## Flujo de despliegue en GCP

El agente debe usar:

```bash
./deploy.sh
```

Antes de desplegar, debe verificar:

1. Que existe `Dockerfile`.
2. Que existe `deploy.sh`.
3. Que existe `data/catalog.csv`.
4. Que `gcloud` está autenticado.
5. Que la variable `GCP_PROJECT_ID` está definida.

Verificar cuenta activa:

```bash
gcloud auth list
```

Verificar proyecto:

```bash
gcloud config get-value project
```

Si falta proyecto, definir:

```bash
export GCP_PROJECT_ID="<TU_PROYECTO_GCP>"
```

Desplegar:

```bash
./deploy.sh
```

Después del deploy, verificar health check.

Si el deploy entrega una URL como:

```text
https://vitrina-mercadona-xxxx.a.run.app
```

Verificar:

```bash
curl https://vitrina-mercadona-xxxx.a.run.app/api/health
```

---

## Prohibiciones

El agente no debe:

- editar manualmente archivos fuera del flujo normal,
- agregar frameworks pesados sin justificación,
- agregar base de datos,
- agregar autenticación,
- agregar pagos,
- agregar carrito,
- usar GitHub Pages,
- dejar búsqueda/filtros/paginación en frontend,
- descargar catálogo completo en frontend,
- inventar datos,
- hacer push si las pruebas locales fallan,
- hacer deploy si el health check local falla,
- guardar secretos en Git.

---

## Definition of Done

Un cambio está completo cuando:

1. La app funciona localmente.
2. `/api/health` responde correctamente.
3. `/api/products` responde con paginación.
4. `/api/products/filters` responde categorías y formatos.
5. El frontend muestra loading, success, empty y error.
6. La búsqueda funciona.
7. Los filtros funcionan.
8. La paginación funciona.
9. La documentación relevante está actualizada.
10. Hay commit en Git.
11. Hay push si existe remote.
12. Si se pidió deploy, Cloud Run responde correctamente.