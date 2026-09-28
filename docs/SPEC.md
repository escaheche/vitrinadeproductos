# Especificación

## Objetivo

Construir una vitrina web funcional mínima para explorar el catálogo de productos contenido en `data/catalog.csv`.

La aplicación debe mostrar únicamente información disponible en los datos.

No se deben inventar campos, valores, categorías, precios, formatos, imágenes ni descripciones.

---

## Datos

Archivo:

```text
data/catalog.csv
```

Cantidad de productos:

```text
4.032
```

Idioma:

```text
español
```

Moneda:

```text
CLP
```

Columnas:

```text
id
name
description
format
category
price
priceUnit
originalPrice
currency
imageUrl
productUrl
extractedAt
```

Campos principales para grilla:

```text
id
name
category
format
price
priceUnit
currency
imageUrl
productUrl
```

Campo para detalle:

```text
description
```

---

## Comportamientos funcionales

### Carga inicial

Al abrir la aplicación:

1. Se muestra un estado de carga.
2. El frontend consulta `/api/products`.
3. El backend devuelve la primera página de productos.
4. Si la respuesta es exitosa, se muestra la grilla.

### Búsqueda

La búsqueda se realiza en backend.

El frontend envía:

```text
search
```

El backend busca coincidencias en campos de datos reales.

No se debe descargar el catálogo completo para buscar en frontend.

### Filtros

El frontend consulta:

```text
GET /api/products/filters
```

para obtener opciones disponibles.

Los filtros mínimos son:

```text
category
format
```

Los filtros se aplican en backend.

### Paginación

La paginación se realiza en backend.

Parámetros:

```text
page
pageSize
```

Valores por defecto:

```text
page = 1
pageSize = 24
```

El backend devuelve:

```text
items
total
page
pageSize
totalPages
```

---

## Estados de UI

La aplicación debe manejar cuatro estados.

### Loading

Se muestra mientras se espera respuesta de la API.

### Success

Se muestra cuando la API responde correctamente con productos.

### Empty

Se muestra cuando la API responde correctamente pero no hay productos para la búsqueda/filtro actual.

### Error

Se muestra cuando falla la conexión, la API responde con error o hay un error inesperado.

Debe incluir botón de reintento.

---

## API

### `GET /api/health`

Respuesta:

```json
{
  "status": "ok",
  "products": 4032
}
```

### `GET /api/products/filters`

Respuesta:

```json
{
  "categories": [],
  "formats": []
}
```

### `GET /api/products`

Query params:

```text
search
category
format
page
pageSize
```

Respuesta:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 24,
  "totalPages": 1
}
```

### `GET /api/products/{id}`

Opcional si el mockup muestra detalle.

Respuesta:

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

---

## Requisitos no funcionales

- La app debe poder ejecutarse localmente.
- La app debe poder desplegarse en GCP Cloud Run.
- El frontend no debe usar frameworks.
- El backend debe ser simple.
- No se debe usar base de datos.
- La app debe funcionar sin CORS porque frontend y backend comparten origen.
- La app debe ser liviana.
- La app debe poder verificarse con comandos simples.

---

## Fuera de alcance

No forman parte de esta etapa:

- carrito,
- compra,
- pagos,
- administración de productos,
- login,
- registros de usuario,
- edición de catálogo,
- panel interno,
- analítica avanzada,
- recomendaciones,
- despliegue multi-región.