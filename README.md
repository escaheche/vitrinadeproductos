# Vitrina de productos

Aplicación web mínima para explorar un catálogo de productos de supermercado.

El catálogo proviene de `data/catalog.csv`, con 4.032 productos y precios en pesos chilenos.

---

## Stack

- Backend: FastAPI
- Frontend: HTML, CSS y JavaScript vanilla
- Datos: `data/catalog.csv`
- Deploy: GCP Cloud Run
- Contenedor: Docker

---

## Arquitectura

Todo el sistema está desplegado en un único servicio de GCP Cloud Run.

```text
Usuario
  |
  v
GCP Cloud Run
  |
  |-- frontend estático en /
  |-- API backend en /api
  |-- catalog.csv dentro del contenedor
```

La búsqueda, los filtros y la paginación se realizan en el backend.

El frontend no descarga el catálogo completo.

---

## Estructura

```text
.
├── AGENTS.md
├── README.md
├── Dockerfile
├── deploy.sh
├── docs/
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── VERIFICATION.md
│   ├── DEPLOY.md
│   └── OPENCODE_PROMPTS.md
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       └── main.py
├── data/
│   └── catalog.csv
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```

---

## Requisitos locales

- Python 3.12 o superior
- Docker opcional
- gcloud CLI para deploy
- Cuenta GCP con Cloud Run habilitado

---

## Ejecución local

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

Ejecutar:

```bash
uvicorn app.main:app --app-dir backend --reload --port 8080
```

Abrir:

```text
http://localhost:8080
```

---

## Pruebas locales

Health check:

```bash
curl http://localhost:8080/api/health
```

Productos paginados:

```bash
curl "http://localhost:8080/api/products?page=1&pageSize=24"
```

Búsqueda:

```bash
curl "http://localhost:8080/api/products?search=queso&page=1&pageSize=24"
```

Filtros:

```bash
curl http://localhost:8080/api/products/filters
```

---

## Docker local

Construir:

```bash
docker build -t vitrina-local .
```

Ejecutar:

```bash
docker run --rm -p 8080:8080 vitrina-local
```

Abrir:

```text
http://localhost:8080
```

---

## Deploy en GCP

Definir proyecto:

```bash
export GCP_PROJECT_ID="<TU_PROYECTO_GCP>"
```

Opcional:

```bash
export GCP_REGION="us-central1"
export GCP_SERVICE_NAME="vitrina-mercadona"
```

Dar permisos de ejecución:

```bash
chmod +x deploy.sh
```

Desplegar:

```bash
./deploy.sh
```

El script entregará la URL pública de Cloud Run.

Ejemplo:

```text
https://vitrina-mercadona-xxxx.a.run.app
```

---

## Endpoints

### Health

```text
GET /api/health
```

### Filtros

```text
GET /api/products/filters
```

### Productos

```text
GET /api/products
```

Query params:

```text
search
category
format
page
pageSize
```

Ejemplo:

```text
GET /api/products?search=queso&category=Bodega > Cerveza&page=1&pageSize=24
```

### Detalle de producto

El frontend abre un diálogo de detalle al hacer clic en una tarjeta, consumiendo:

```text
GET /api/products/{id}
```

Devuelve el producto completo, incluyendo `description` y `extractedAt`. Responde `404` si el `id` no existe.

Límites de `GET /api/products`:

```text
page mínimo = 1
pageSize mínimo = 1
pageSize máximo = 96
```

Valores fuera de rango responden `422`.

---

## Documentación

- [Especificación](docs/SPEC.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Verificación](docs/VERIFICATION.md)
- [Deploy](docs/DEPLOY.md)
- [Prompts para OpenCode](docs/OPENCODE_PROMPTS.md)
- [Instrucciones para agente](AGENTS.md)

---

## Fuente de datos

El catálogo se basa en el Dataset de precios y características de productos disponibles en la tienda online de Mercadona, publicado en Zenodo.

Registro original:

```text
zenodo.org/records/17565792
```

DOI:

```text
10.5281/zenodo.17565792
```