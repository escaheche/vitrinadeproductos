#!/usr/bin/env bash

set -euo pipefail

: "${GCP_PROJECT_ID:?Debes definir GCP_PROJECT_ID. Ejemplo: export GCP_PROJECT_ID=tu-proyecto}"

GCP_REGION="${GCP_REGION:-us-central1}"
GCP_SERVICE_NAME="${GCP_SERVICE_NAME:-vitrina-mercadona}"

echo "Proyecto: $GCP_PROJECT_ID"
echo "Región: $GCP_REGION"
echo "Servicio: $GCP_SERVICE_NAME"

gcloud config set project "$GCP_PROJECT_ID"

echo "Habilitando APIs necesarias..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --quiet || true

echo "Desplegando en Cloud Run..."
gcloud run deploy "$GCP_SERVICE_NAME" \
  --source=. \
  --region="$GCP_REGION" \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=1 \
  --quiet

URL="$(gcloud run services describe "$GCP_SERVICE_NAME" --region="$GCP_REGION" --format='value(status.url)')"

echo ""
echo "Deploy completado."
echo "URL: $URL"
echo ""
echo "Verificando health check..."

curl -sf "$URL/api/health"

echo ""
echo "Health check correcto."