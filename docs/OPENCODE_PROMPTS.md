# Prompts para OpenCode

Estos prompts se pueden pegar en OpenCode para guiar el desarrollo.

---

## Prompt 1: Crear estructura base

```text
Crea la estructura base del proyecto siguiendo AGENTS.md, README.md y docs/SPEC.md.

No inventes requisitos adicionales.

Verifica que existan estos archivos:

- AGENTS.md
- README.md
- docs/SPEC.md
- docs/ARCHITECTURE.md
- docs/VERIFICATION.md
- docs/DEPLOY.md
- Dockerfile
- deploy.sh
- .gitignore
- .dockerignore
- .gcloudignore

Si falta alguno, créalo.

No agregues frameworks ni funcionalidades fuera del alcance definido en AGENTS.md.
```

---

## Prompt 2: Implementar backend

```text
Implementa el backend FastAPI siguiendo AGENTS.md y docs/SPEC.md.

Requisitos:

- Cargar data/catalog.csv al iniciar.
- Exponer GET /api/health.
- Exponer GET /api/products/filters.
- Exponer GET /api/products.
- Exponer GET /api/products/{id} si es necesario para detalle.
- La búsqueda, filtros y paginación deben realizarse en backend.
- No incluir description en el listado de productos.
- No inventar datos.
- Crear backend/requirements.txt.
- Dejar la app lista para ejecutar con:
  uvicorn app.main:app --app-dir backend --reload --port 8080
```

---

## Prompt 3: Implementar frontend

```text
Implementa el frontend siguiendo AGENTS.md y docs/SPEC.md.

Requisitos:

- Usar HTML, CSS y JavaScript vanilla.
- Servir los archivos desde frontend/.
- Consumir rutas relativas /api/products y /api/products/filters.
- No descargar el catálogo completo.
- Enviar search, category, format, page y pageSize como query params.
- Mostrar estados loading, success, empty y error.
- Incluir paginación.
- Incluir búsqueda.
- Incluir filtro por categoría.
- Incluir filtro por formato.
- No usar frameworks.
- No inventar datos.
```

---

## Prompt 4: Verificación local

```text
Verifica la aplicación localmente.

Ejecuta:

uvicorn app.main:app --app-dir backend --reload --port 8080

Luego verifica:

curl http://localhost:8080/api/health
curl "http://localhost:8080/api/products?page=1&pageSize=24"
curl "http://localhost:8080/api/products?search=queso&page=1&pageSize=24"
curl http://localhost:8080/api/products/filters

Si alguna verificación falla, corrige el código y vuelve a verificar.

No hagas commit hasta que las verificaciones pasen.
```

---

## Prompt 5: Commit y push

```text
Guarda los cambios en Git.

Reglas:

- No commitear .env, secretos, .venv, __pycache__, data/source/.
- Usar mensaje de commit convencional.
- Actualizar documentación si corresponde.

Ejecuta:

git status
git add -A
git commit -m "feat: implementación inicial de vitrina en Cloud Run"
git push

Si no existe remote, informa que falta configurar origin.
```

---

## Prompt 6: Deploy en GCP

```text
Despliega la aplicación en GCP Cloud Run.

Antes:

- Verifica que GCP_PROJECT_ID esté definida.
- Verifica que exista Dockerfile.
- Verifica que exista deploy.sh.
- Verifica que data/catalog.csv exista.

Ejecuta:

./deploy.sh

Cuando termine, verifica el health check remoto usando la URL entregada.

Si el deploy falla, muestra el error y no marques la tarea como completada.
```

---

## Prompt 7: Corrección de deploy

```text
El deploy en GCP falló.

Revisa:

1. Salida de gcloud.
2. Dockerfile.
3. backend/requirements.txt.
4. Ejecución local con Docker:
   docker build -t vitrina-local .
   docker run --rm -p 8080:8080 vitrina-local
5. Logs de Cloud Run:
   gcloud logging read "resource.type=cloud_run_revision" --limit=50

Corrige el problema, verifica localmente y vuelve a ejecutar ./deploy.sh.
```