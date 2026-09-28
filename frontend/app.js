(function () {
  "use strict";

  var API = "/api";
  var PAGE_SIZE = 24;

  var state = {
    search: "",
    category: "",
    format: "",
    page: 1,
    pageSize: PAGE_SIZE
  };

  var el = {
    grid: document.getElementById("product-grid"),
    resultCount: document.getElementById("result-count"),
    eyebrow: document.getElementById("catalog-eyebrow"),
    search: document.getElementById("search"),
    category: document.getElementById("category-filter"),
    format: document.getElementById("format-filter"),
    pagination: document.getElementById("pagination"),
    prev: document.getElementById("prev-page"),
    next: document.getElementById("next-page"),
    pages: document.getElementById("pages"),
    dialog: document.getElementById("product-dialog"),
    dialogClose: document.getElementById("dialog-close"),
    detailImage: document.getElementById("detail-image"),
    detailId: document.getElementById("detail-id"),
    detailTitle: document.getElementById("detail-title"),
    detailDescription: document.getElementById("detail-description"),
    detailList: document.getElementById("detail-list"),
    detailPrice: document.getElementById("detail-price"),
    detailCurrency: document.getElementById("detail-currency"),
    detailOriginalPrice: document.getElementById("detail-original-price"),
    detailExtractedAt: document.getElementById("detail-extracted-at"),
    detailSource: document.getElementById("detail-source")
  };

  var listRequest = null;
  var detailRequest = null;
  var searchTimer = null;

  function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (typeof value === "number" && Number.isInteger(value)) {
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return new Intl.NumberFormat("es-ES").format(value);
  }

  function buildQuery() {
    var params = new URLSearchParams();
    if (state.search) params.set("search", state.search);
    if (state.category) params.set("category", state.category);
    if (state.format) params.set("format", state.format);
    params.set("page", String(state.page));
    params.set("pageSize", String(state.pageSize));
    return params.toString();
  }

  function setBusy(busy) {
    el.grid.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function hidePagination() {
    el.pagination.hidden = true;
    el.pages.innerHTML = "";
  }

  function renderState(kind, title, message, actionLabel) {
    hidePagination();
    setBusy(false);

    var box = document.createElement("div");
    box.className = "inline-state" + (kind === "error" ? " error" : kind === "empty" ? " empty" : "");

    var icon = document.createElement("div");
    icon.className = kind === "loading" ? "state-icon spinner" : "state-icon";
    if (kind !== "loading") {
      icon.textContent = kind === "error" ? "!" : "0";
    }
    box.appendChild(icon);

    var heading = document.createElement("strong");
    heading.textContent = title;
    box.appendChild(heading);

    var text = document.createElement("p");
    text.textContent = message;
    box.appendChild(text);

    if (actionLabel) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = actionLabel;
      button.addEventListener("click", function () {
        loadProducts();
      });
      box.appendChild(button);
    }

    el.grid.replaceChildren(box);
  }

  function renderLoading() {
    hidePagination();
    el.resultCount.textContent = "Cargando…";
    renderState("loading", "Cargando productos", "Estamos consultando el catálogo.");
    setBusy(true);
  }

  function renderError(message) {
    el.resultCount.textContent = "Error al cargar";
    renderState("error", "No pudimos cargar el catálogo", message, "Reintentar");
  }

  function renderEmpty() {
    el.resultCount.textContent = "Sin resultados";
    renderState(
      "empty",
      "Sin resultados",
      "No encontramos productos con la búsqueda o los filtros seleccionados."
    );
  }

  function imageFallback(node) {
    node.addEventListener("error", function () {
      node.removeAttribute("src");
      node.alt = "Sin imagen disponible";
      node.parentNode.classList.add("no-image");
    });
  }

  function buildCard(item, index) {
    var card = document.createElement("article");
    card.className = "product-card";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "card-button";

    var imageWrap = document.createElement("span");
    imageWrap.className = "image-wrap";
    if (item.imageUrl) {
      var image = document.createElement("img");
      image.src = item.imageUrl;
      image.alt = item.name;
      image.loading = "lazy";
      image.decoding = "async";
      imageFallback(image);
      imageWrap.appendChild(image);
    }

    var indexBadge = document.createElement("span");
    indexBadge.className = "card-index";
    indexBadge.textContent = item.id;
    imageWrap.appendChild(indexBadge);

    var copy = document.createElement("span");
    copy.className = "card-copy";

    var type = document.createElement("p");
    type.className = "card-type";
    type.textContent = item.category || "—";
    copy.appendChild(type);

    var name = document.createElement("strong");
    name.textContent = item.name || "—";
    copy.appendChild(name);

    var meta = document.createElement("p");
    meta.className = "card-meta";
    var formatText = document.createTextNode(item.format || "Sin formato");
    var separator = document.createElement("i");
    separator.textContent = "·";
    var priceText = document.createTextNode(
      (item.price === null || item.price === undefined ? "—" : formatPrice(item.price) + " " + (item.currency || "")) +
        (item.priceUnit ? " " + item.priceUnit : "")
    );
    meta.appendChild(formatText);
    meta.appendChild(separator);
    meta.appendChild(priceText);
    copy.appendChild(meta);

    var link = document.createElement("span");
    link.className = "view-link";
    var linkLabel = document.createElement("span");
    linkLabel.textContent = "Ver detalle";
    var arrow = document.createElement("span");
    arrow.textContent = "→";
    link.appendChild(linkLabel);
    link.appendChild(arrow);
    copy.appendChild(link);

    button.appendChild(imageWrap);
    button.appendChild(copy);
    button.addEventListener("click", function () {
      openDetail(item.id);
    });

    card.appendChild(button);
    card.style.order = String(index);
    return card;
  }

  function pageWindow(current, total) {
    if (total <= 7) {
      var all = [];
      for (var i = 1; i <= total; i += 1) all.push(i);
      return all;
    }
    var start = Math.max(1, Math.min(current - 1, total - 4));
    var end = Math.min(total, start + 4);
    var pages = [];
    for (var p = start; p <= end; p += 1) pages.push(p);
    if (start > 1) pages.unshift("…");
    if (end < total) pages.push("…");
    return pages;
  }

  function renderPagination(data) {
    if (data.totalPages <= 1) {
      hidePagination();
      return;
    }

    el.pagination.hidden = false;
    el.prev.disabled = data.page <= 1;
    el.next.disabled = data.page >= data.totalPages;
    el.pages.replaceChildren();

    pageWindow(data.page, data.totalPages).forEach(function (entry) {
      if (entry === "…") {
        var gap = document.createElement("span");
        gap.textContent = "…";
        el.pages.appendChild(gap);
        return;
      }
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = String(entry);
      if (entry === data.page) {
        button.className = "active";
        button.setAttribute("aria-current", "page");
      } else {
        button.addEventListener("click", function () {
          state.page = entry;
          loadProducts();
        });
      }
      el.pages.appendChild(button);
    });
  }

  function renderSuccess(data) {
    setBusy(false);
    var total = data.total;
    el.eyebrow.textContent = "VITRINA / " + formatPrice(total) + " PRODUCTOS";
    var from = total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
    var to = Math.min(data.page * data.pageSize, total);
    el.resultCount.textContent = "Mostrando " + from + "-" + to + " de " + formatPrice(total);

    var cards = data.items.map(buildCard);
    el.grid.replaceChildren.apply(el.grid, cards);
    renderPagination(data);
  }

  function loadProducts() {
    if (listRequest) {
      listRequest.abort();
    }
    renderLoading();

    listRequest = new AbortController();
    var controller = listRequest;

    fetch(API + "/products?" + buildQuery(), {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("El servidor respondió con estado " + response.status + ".");
        }
        return response.json();
      })
      .then(function (data) {
        if (controller.signal.aborted) return;
        if (!data.items || data.items.length === 0) {
          renderEmpty();
          return;
        }
        renderSuccess(data);
      })
      .catch(function (error) {
        if (error && error.name === "AbortError") return;
        renderError(error && error.message ? error.message : "Error inesperado.");
      });
  }

  function loadFilters() {
    return fetch(API + "/products/filters", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No se pudieron cargar los filtros.");
        }
        return response.json();
      })
      .then(function (data) {
        (data.categories || []).forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          el.category.appendChild(option);
        });
        (data.formats || []).forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          el.format.appendChild(option);
        });
      })
      .catch(function () {
        el.category.disabled = true;
        el.format.disabled = true;
      });
  }

  function detailRow(label, value) {
    var wrapper = document.createElement("div");
    var term = document.createElement("dt");
    term.textContent = label;
    var definition = document.createElement("dd");
    definition.textContent = value || "—";
    wrapper.appendChild(term);
    wrapper.appendChild(definition);
    el.detailList.appendChild(wrapper);
  }

  function openDetail(productId) {
    if (detailRequest) {
      detailRequest.abort();
    }
    detailRequest = new AbortController();
    var controller = detailRequest;

    el.detailId.textContent = "PRODUCTO #" + productId;
    el.detailTitle.textContent = "Cargando…";
    el.detailDescription.textContent = "";
    el.detailList.replaceChildren();
    el.detailPrice.textContent = "—";
    el.detailCurrency.textContent = "";
    el.detailOriginalPrice.textContent = "—";
    el.detailExtractedAt.textContent = "";
    el.detailImage.removeAttribute("src");
    el.detailSource.hidden = true;
    if (typeof el.dialog.showModal === "function") {
      el.dialog.showModal();
    }

    fetch(API + "/products/" + encodeURIComponent(productId), {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No se pudo cargar el detalle del producto.");
        }
        return response.json();
      })
      .then(function (product) {
        if (controller.signal.aborted) return;
        var currency = product.currency || "";
        var price = product.price === null || product.price === undefined ? null : formatPrice(product.price);
        var original = product.originalPrice === null || product.originalPrice === undefined ? null : formatPrice(product.originalPrice);

        el.detailTitle.textContent = product.name || "—";
        el.detailDescription.textContent = product.description || "";
        detailRow("Categoría", product.category);
        detailRow("Formato", product.format);
        detailRow("Unidad de precio", product.priceUnit);
        detailRow("Identificador", product.id);
        el.detailPrice.textContent = price === null ? "—" : price;
        el.detailCurrency.textContent = currency ? "Moneda: " + currency : "";
        el.detailOriginalPrice.textContent = original === null ? "—" : original + (currency ? " " + currency : "");
        el.detailExtractedAt.textContent = product.extractedAt ? "Datos extraídos: " + product.extractedAt : "";
        if (product.imageUrl) {
          el.detailImage.src = product.imageUrl;
          el.detailImage.alt = product.name || "";
          imageFallback(el.detailImage);
        }
        if (product.productUrl) {
          el.detailSource.href = product.productUrl;
          el.detailSource.hidden = false;
        }
      })
      .catch(function (error) {
        if (error && error.name === "AbortError") return;
        el.detailTitle.textContent = "No se pudo cargar el producto";
        el.detailDescription.textContent = error && error.message ? error.message : "Error inesperado.";
      });
  }

  el.search.addEventListener("input", function () {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(function () {
      state.search = el.search.value.trim();
      state.page = 1;
      loadProducts();
    }, 300);
  });

  el.category.addEventListener("change", function () {
    state.category = el.category.value;
    state.page = 1;
    loadProducts();
  });

  el.format.addEventListener("change", function () {
    state.format = el.format.value;
    state.page = 1;
    loadProducts();
  });

  el.prev.addEventListener("click", function () {
    if (state.page > 1) {
      state.page -= 1;
      loadProducts();
    }
  });

  el.next.addEventListener("click", function () {
    state.page += 1;
    loadProducts();
  });

  el.dialogClose.addEventListener("click", function () {
    el.dialog.close();
  });

  el.dialog.addEventListener("close", function () {
    if (detailRequest) {
      detailRequest.abort();
      detailRequest = null;
    }
  });

  el.dialog.addEventListener("click", function (event) {
    if (event.target === el.dialog) {
      el.dialog.close();
    }
  });

  renderLoading();
  loadFilters();
  loadProducts();
})();
