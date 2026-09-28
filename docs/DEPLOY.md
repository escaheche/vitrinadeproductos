# Deploy en GCP

Este proyecto se despliega completamente en GCP Cloud Run.

No se usa GitHub Pages.

---

## Requisitos

- Cuenta GCP.
- Proyecto GCP creado.
- `gcloud` instalado.
- Sesión iniciada:

```bash
gcloud auth login
```

- Docker instalado para pruebas locales.

---

## Variables recomendadas

Definir:

```bash
export GCP_PROJECT_ID="<TU_PROYECTO_GCP>"
```

Opcional:

```bash
export GCP_REGION="us-central1"
export GCP_SERVICE_NAME="vitrina-mercadona"
```

Si no defines región, el script usa `us-central1`.

Si no defines nombre de servicio, el script usa `vitrina-mercadona`.

---

## Primera vez

Habilitar APIs:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

Dar permisos al script:

```bash
chmod +x deploy.sh
```

---

## Deploy normal

Desde la raíz del proyecto:

```bash
./deploy.sh
```

El script hace:

1. define proyecto,
2. habilita APIs si es necesario,
3. construye y despliega con Cloud Build,
4. obtiene la URL pública,
5. verifica `/api/health`.

---

## Resultado esperado

El script debería imprimir algo como:

```text
https://vitrina-mercadona-xxxx.a.run.app
```

Y luego mostrar:

```json
{
  "status": "ok",
  "products": 4032
}
```

---

## Actualizar README

Después del primer deploy exitoso, actualizar `README.md` con la URL real:

```text
https://vitrina-mercadona-xxxx.a.run.app
```

---

## Flujo Git + Deploy

Para un cambio normal:

```bash
git add -A
git commit -m "feat: descripción del cambio"
git push
./deploy.sh
```

Si el deploy falla:

1. Leer error de `gcloud`.
2. Verificar logs:

```bash
gcloud logging read "resource.type=cloud_run_revision" --limit=50
```

3. No marcar la tarea como completada hasta que health check remoto responda.

---

## Configuración recomendada Cloud Run

Para mantener costos bajos:

```text
--memory=512Mi
--cpu=1
--min-instances=0
--max-instances=1
--allow-unauthenticated
```

Esto permite que el servicio escale a cero cuando no recibe tráfico.