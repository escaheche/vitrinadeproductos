# Verificación

Este documento describe verificaciones repetibles para comprobar que la aplicación funciona.

---

## Verificación local

Ejecutar:

```bash
uvicorn app.main:app --app-dir backend --reload --port 8080
```

Abrir:

```text
http://localhost:8080
```

---

## Health check local

```bash
curl http://localhost:8080/api/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "products": 4032
}
```

---

## Filtros

```bash
curl http://localhost:8080/api/products/filters
```

Resultado esperado:

JSON con arreglos `categories` y `formats`, ambos sin duplicados y ordenados.

---

## Productos paginados

```bash
curl "http://localhost:8080/api/products?page=1&pageSize=24"
```

Resultado esperado:

JSON con:

```text
items
total
page
pageSize
totalPages
```

El arreglo `items` debe tener como máximo 24 productos.

---

## Búsqueda

```bash
curl "http://localhost:8080/api/products?search=queso&page=1&pageSize=24"
```

Resultado esperado:

Productos que coincidan con la búsqueda.

---

## Filtro por categoría

Ejemplo:

```bash
curl "http://localhost:8080/api/products?category=Bodega%20%3E%20Cerveza&page=1&pageSize=24"
```

Resultado esperado:

Solo productos de esa categoría.

---

## Verificación Docker

Construir:

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

## Detalle de producto

```bash
curl http://localhost:8080/api/products/10043
```

Resultado esperado:

JSON con el producto completo, incluyendo `description` y `extractedAt`.

Producto inexistente:

```bash
curl -i http://localhost:8080/api/products/999999
```

Resultado esperado:

```text
HTTP/1.1 404 Not Found
```

## Límites de paginación

```bash
curl "http://localhost:8080/api/products?pageSize=96"
```

Debe devolver como máximo 96 items.

```bash
curl -i "http://localhost:8080/api/products?pageSize=500"
```

Resultado esperado:

```text
HTTP/1.1 422 Unprocessable Entity
```

## Verificación frontend

| Caso | Acción | Resultado esperado |
|---|---|---|
| Carga inicial | Abrir la app | Se muestra loading |
| Éxito | API responde con productos | Se muestra grilla |
| Vacío | Buscar texto inexistente | Se muestra estado vacío |
| Error | Detener backend o usar URL inválida | Se muestra error con reintento |
| Búsqueda | Escribir texto | La app consulta backend y actualiza resultados |
| Filtro categoría | Elegir categoría | La app consulta backend y actualiza resultados |
| Filtro formato | Elegir formato | La app consulta backend y actualiza resultados |
| Paginación | Cambiar página | La app consulta backend y muestra nueva página |
| Detalle | Click en una tarjeta | Se abre el diálogo con la descripción del producto |

---

## Verificación de deploy

Después de desplegar:

```bash
./deploy.sh
```

El script debe imprimir la URL del servicio.

Verificar health check remoto:

```bash
curl https://<TU_URL_CLOUD_RUN>/api/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "products": 4032
}
```

---

## Evidencia recomendada

Guardar o mostrar:

- salida de `curl /api/health`,
- salida de `curl /api/products?search=queso`,
- URL pública de Cloud Run,
- captura de la grilla,
- captura del estado vacío,
- captura del estado error si es posible.

---

## Resultados verificados

Verificación local con Uvicorn y verificación con la imagen Docker, el 28 de septiembre de 2026:

| Verificación | Resultado |
|---|---|
| `/api/health` | `{"status":"ok","products":4032}` |
| `/api/products?page=1&pageSize=24` | `items=24`, `total=4032`, `totalPages=168` |
| Campos de cada item del listado | Solo los 10 campos definidos, sin `description` |
| `/api/products?search=queso` | `items=24`, `total=362` |
| `/api/products?category=Bodega > Cerveza` | `total=48`, todos de esa categoría |
| `/api/products?format=Lata` | `total=73`, todos con ese formato |
| `/api/products?search=zzzqqqxxx` | `items=0`, `total=0` |
| `/api/products/filters` | 149 categorías y 252 formatos, sin duplicados y ordenados |
| `/api/products/10043` | Producto completo con `description` y `extractedAt` |
| `/api/products/999999` | `404` |
| `/api/products?pageSize=96` | 96 items |
| `/api/products?pageSize=500` | `422` |
| `/`, `/index.html`, `/styles.css`, `/app.js` | `200` |
| `docker build` + `docker run` | Mismos resultados que en local |
| Frontend (navegador) | Loading, success, empty y error con reintento; búsqueda, filtros, paginación y detalle consultan el backend |

Producción, 28 de septiembre de 2026, en `https://vitrina-mercadona-931735187757.us-central1.run.app`:

| Verificación remota | Resultado |
|---|---|
| `/api/health` | `{"status":"ok","products":4032}` |
| `/api/products?page=1&pageSize=24` | `items=24`, `total=4032`, `totalPages=168` |
| `/api/products/filters` | 149 categorías y 252 formatos |
| `/api/products/10043` | `200`, producto completo |
| `/`, `/index.html`, `/styles.css`, `/app.js` | `200` |
