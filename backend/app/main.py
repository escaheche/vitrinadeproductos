from __future__ import annotations

import csv
import os
import unicodedata
from pathlib import Path
from typing import Optional, Union

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[2]
CATALOG_PATH = Path(os.environ.get("CATALOG_PATH") or BASE_DIR / "data" / "catalog.csv")
FRONTEND_DIR = BASE_DIR / "frontend"

DEFAULT_PAGE_SIZE = 24
MAX_PAGE_SIZE = 96
DEFAULT_CURRENCY = "CLP"

LIST_FIELDS = (
    "id",
    "name",
    "category",
    "format",
    "price",
    "priceUnit",
    "originalPrice",
    "currency",
    "imageUrl",
    "productUrl",
)


class ProductListItem(BaseModel):
    id: str
    name: str
    category: str
    format: str
    price: Optional[Union[int, float]]
    priceUnit: str
    originalPrice: Optional[Union[int, float]]
    currency: str
    imageUrl: str
    productUrl: str


class ProductDetail(ProductListItem):
    description: str
    extractedAt: str


class ProductListResponse(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    pageSize: int
    totalPages: int


class FiltersResponse(BaseModel):
    categories: list[str]
    formats: list[str]


class HealthResponse(BaseModel):
    status: str
    products: int


def _clean(value: Optional[str]) -> str:
    return (value or "").strip()


def _to_number(raw: Optional[str]) -> Optional[Union[int, float]]:
    text = _clean(raw)
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    if not text:
        return None
    try:
        value = float(text)
    except ValueError:
        return None
    return int(value) if value.is_integer() else value


def _normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text)
    stripped = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return " ".join(stripped.lower().split())


def _load_catalog() -> list[dict]:
    if not CATALOG_PATH.is_file():
        raise RuntimeError(f"No se encontró el catálogo en {CATALOG_PATH}")

    rows: list[dict] = []
    with CATALOG_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for raw_row in csv.DictReader(handle):
            product_id = _clean(raw_row.get("id"))
            if not product_id:
                continue
            rows.append(
                {
                    "id": product_id,
                    "name": _clean(raw_row.get("name")),
                    "description": _clean(raw_row.get("description")),
                    "category": _clean(raw_row.get("category")),
                    "format": _clean(raw_row.get("format")),
                    "price": _to_number(raw_row.get("price")),
                    "priceUnit": _clean(raw_row.get("priceUnit")),
                    "originalPrice": _to_number(raw_row.get("originalPrice")),
                    "currency": _clean(raw_row.get("currency")) or DEFAULT_CURRENCY,
                    "imageUrl": _clean(raw_row.get("imageUrl")),
                    "productUrl": _clean(raw_row.get("productUrl")),
                    "extractedAt": _clean(raw_row.get("extractedAt")),
                    "searchIndex": _normalize(
                        " ".join(
                            (
                                _clean(raw_row.get("name")),
                                _clean(raw_row.get("description")),
                                _clean(raw_row.get("category")),
                                _clean(raw_row.get("format")),
                            )
                        )
                    ),
                    "categoryKey": _normalize(_clean(raw_row.get("category"))),
                    "formatKey": _normalize(_clean(raw_row.get("format"))),
                }
            )
    return rows


CATALOG = _load_catalog()
CATALOG_BY_ID = {row["id"]: row for row in CATALOG}
CATEGORIES = sorted({row["category"] for row in CATALOG if row["category"]})
FORMATS = sorted({row["format"] for row in CATALOG if row["format"]})

app = FastAPI(title="Vitrina de productos", version="1.0.0")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", products=len(CATALOG))


@app.get("/api/products/filters", response_model=FiltersResponse)
def filters() -> FiltersResponse:
    return FiltersResponse(categories=CATEGORIES, formats=FORMATS)


@app.get("/api/products", response_model=ProductListResponse)
def list_products(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    format: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
) -> ProductListResponse:
    results = CATALOG

    term = _normalize(_clean(search))
    if term:
        tokens = term.split()
        results = [row for row in results if all(token in row["searchIndex"] for token in tokens)]

    category_key = _normalize(_clean(category))
    if category_key:
        results = [row for row in results if row["categoryKey"] == category_key]

    format_key = _normalize(_clean(format))
    if format_key:
        results = [row for row in results if row["formatKey"] == format_key]

    total = len(results)
    total_pages = max(1, -(-total // pageSize))
    start = (page - 1) * pageSize
    page_items = results[start : start + pageSize]

    return ProductListResponse(
        items=[{field: row[field] for field in LIST_FIELDS} for row in page_items],
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages,
    )


@app.get("/api/products/{product_id}", response_model=ProductDetail)
def product_detail(product_id: str) -> ProductDetail:
    row = CATALOG_BY_ID.get(_clean(product_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return ProductDetail(**{field: row[field] for field in (*LIST_FIELDS, "description", "extractedAt")})


if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
