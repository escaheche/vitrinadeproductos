FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY frontend ./frontend
COPY data/catalog.csv ./data/catalog.csv

ENV PORT=8080

EXPOSE 8080

CMD exec uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT