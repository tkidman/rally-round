/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function openMobileNav() {
  closeNav("seriesMobileNav");
  toggleNav("mobileNav");
}

function openSeriesMobileNav() {
  closeNav("mobileNav");
  toggleNav("seriesMobileNav");
}

function closeNav(navId) {
  const el = document.getElementById(navId);
  if (!el) return;
  el.hidden = true;
  el.classList.remove("isOpen");
}

function toggleNav(navId) {
  const el = document.getElementById(navId);
  if (!el) return;

  const willOpen = el.hidden === true;
  closeNav("mobileNav");
  closeNav("seriesMobileNav");

  el.hidden = !willOpen;
  el.classList.toggle("isOpen", willOpen);
}

function openPopup(id) {
  var popup = document.getElementById(id);
  popup.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function() {
  const table = document.getElementById("tableDrivers");
  const headers = table.querySelectorAll("th");
  let sortOrder = 1;

  sortTableByColumn(table, 0, 1);
  updateHeaderStyles(headers, headers[0], 1);

  headers.forEach((header, index) => {
    header.addEventListener("click", (e) => {
      // Don't sort if clicking on a link inside the header
      if (e.target.closest('a')) {
        return;
      }
      sortTableByColumn(table, index, sortOrder);
      updateHeaderStyles(headers, header, sortOrder);
      sortOrder *= -1;
    });
  });

  function sortTableByColumn(table, columnIndex, order) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((rowA, rowB) => {
      const cellA = getCellValue(rowA.children[columnIndex]);
      const cellB = getCellValue(rowB.children[columnIndex]);

      const isNumberA = !isNaN(cellA);
      const isNumberB = !isNaN(cellB);

      if (cellA === "" && cellB === "") return 0;
      if (cellA === "") return -1 * order;
      if (cellB === "") return 1 * order;

      if (isNumberA && isNumberB) {
        return (parseFloat(cellA) - parseFloat(cellB)) * order;
      } else if (isNumberA) {
        return 1 * order;
      } else if (isNumberB) {
        return -1 * order;
      } else {
        return cellA.localeCompare(cellB) * order;
      }
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  function getCellValue(cell) {
    const img = cell.querySelector("img");
    if (img) {
      return img.alt.toLowerCase();
    }
    const text = cell.innerText.toLowerCase();
    if (text === "=") {
      return "0";
    }
    return text;
  }

  function updateHeaderStyles(headers, sortedHeader, order) {
    headers.forEach(header => {
      header.classList.remove("sorted-asc", "sorted-desc");
    });
    sortedHeader.classList.add(order === 1 ? "sorted-asc" : "sorted-desc");
  }

  initColumnFilter(table);
  initTopScrollbar();
});

function initTopScrollbar() {
  const tableWrapper = document.querySelector(".table-scroll-wrapper");
  const scrollIndicator = document.getElementById("tableScrollIndicator");
  
  if (!tableWrapper || !scrollIndicator) return;

  const table = document.getElementById("tableDrivers");
  if (!table) return;

  function updateScrollbarVisibility() {
    const needsScroll = table.offsetWidth > tableWrapper.clientWidth;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    
    // Don't show on touch devices - let CSS handle it
    if (isTouchDevice) {
      scrollIndicator.style.display = "none";
      return;
    }
    
    scrollIndicator.style.display = needsScroll ? "block" : "none";
    
    if (needsScroll) {
      scrollIndicator.style.setProperty("--table-width", table.offsetWidth + "px");
      // Force reflow to ensure scrollbar appears with absolutely positioned content
      void scrollIndicator.offsetHeight;
    }
  }

  requestAnimationFrame(() => {
    updateScrollbarVisibility();
    updateFadeIndicators();
  });

  // Sync scroll positions with throttling to prevent flickering
  let isScrollingTable = false;
  let isScrollingIndicator = false;
  let scrollTimeout = null;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  function syncTableToIndicator() {
    if (!isScrollingIndicator && scrollIndicator.style.display !== "none") {
      isScrollingTable = true;
      scrollIndicator.scrollLeft = tableWrapper.scrollLeft;
      isScrollingTable = false;
    }
  }

  function syncIndicatorToTable() {
    if (!isScrollingTable) {
      isScrollingIndicator = true;
      tableWrapper.scrollLeft = scrollIndicator.scrollLeft;
      isScrollingIndicator = false;
    }
  }

  function updateFadeIndicators() {
    if (!isTouchDevice) return;

    const scrollLeft = tableWrapper.scrollLeft;
    const scrollWidth = tableWrapper.scrollWidth;
    const clientWidth = tableWrapper.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    const scrollPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

    // Remove mask when scrolled past 80%
    tableWrapper.classList.toggle("scrolled-past-80", scrollPercent > 80);
  }

  // Combined scroll handler for better performance
  function handleTableScroll() {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(() => {
      syncTableToIndicator();
      if (isTouchDevice) {
        updateFadeIndicators();
      }
    });
  }

  tableWrapper.addEventListener("scroll", handleTableScroll, { passive: true });

  scrollIndicator.addEventListener("scroll", () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(syncIndicatorToTable);
  }, { passive: true   });

  const resizeObserver = new ResizeObserver(() => {
    updateScrollbarVisibility();
    if (isTouchDevice) {
      updateFadeIndicators();
    }
  });
  
  resizeObserver.observe(table);
  resizeObserver.observe(tableWrapper);

  if (isTouchDevice) {
    updateFadeIndicators();
  }
}

function initColumnFilter(table) {
  if (!table) return;

  const tableId = table.id || "tableDrivers";
  const pagePath =
    window.location.pathname.split("/").pop() || window.location.pathname;
  const storageKey = `columnFilter_${pagePath}_${tableId}`;
  const headers = table.querySelectorAll("thead th");
  const tbody = table.querySelector("tbody");

  if (headers.length === 0) return;

  let hiddenColumns = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const filterContainer = document.createElement("div");
  filterContainer.className = "column-filter";
  filterContainer.innerHTML = `
    <button class="column-filter__btn" type="button" aria-label="Filter columns">
      <span>Filter Columns</span>
    </button>
    <div class="column-filter__menu">
      <div class="column-filter__items"></div>
      <div class="column-filter__actions">
        <button class="column-filter__action-btn" data-action="show-all">Show All</button>
        <button class="column-filter__action-btn" data-action="close">Close</button>
      </div>
    </div>
  `;

  const scrollIndicator = document.getElementById("tableScrollIndicator");
  const tableWrapper =
    table.closest(".table-scroll-wrapper") || table.parentElement;
  
  if (scrollIndicator) {
    scrollIndicator.parentElement.insertBefore(filterContainer, scrollIndicator);
  } else {
    tableWrapper.parentElement.insertBefore(filterContainer, tableWrapper);
  }

  const filterBtn = filterContainer.querySelector(".column-filter__btn");
  const filterMenu = filterContainer.querySelector(".column-filter__menu");
  const filterItems = filterContainer.querySelector(".column-filter__items");

  const columns = Array.from(headers).map((header, index) => {
    const text = header.textContent.trim();
    const img = header.querySelector("img");
    const link = header.querySelector("a");

    // Get column name from text, image alt, or link text
    let columnName = text;
    if (!columnName && img) {
      columnName = img.alt || img.title || `Column ${index + 1}`;
    }
    if (!columnName && link) {
      columnName = link.textContent.trim();
    }
    if (!columnName) {
      columnName = `Column ${index + 1}`;
    }

    return {
      index,
      name: columnName,
      header: header,
      isHidden: hiddenColumns.includes(index)
    };
  });

  columns.forEach(col => {
    const item = document.createElement("div");
    item.className = "column-filter__item";
    item.innerHTML = `
      <input 
        type="checkbox" 
        class="column-filter__checkbox" 
        id="col-${col.index}" 
        data-column-index="${col.index}"
        ${col.isHidden ? "" : "checked"}
      >
      <label class="column-filter__label" for="col-${col.index}">
        ${col.name || `Column ${col.index + 1}`}
      </label>
    `;
    filterItems.appendChild(item);

    toggleColumn(col.index, !col.isHidden);
  });

  filterBtn.addEventListener("click", e => {
    e.stopPropagation();
    filterMenu.classList.toggle("is-open");
    filterBtn.classList.toggle("is-open");
  });

  document.addEventListener("click", e => {
    if (!filterContainer.contains(e.target)) {
      filterMenu.classList.remove("is-open");
      filterBtn.classList.remove("is-open");
    }
  });

  filterItems.addEventListener("change", e => {
    if (e.target.classList.contains("column-filter__checkbox")) {
      const columnIndex = parseInt(e.target.dataset.columnIndex);
      const isVisible = e.target.checked;
      toggleColumn(columnIndex, isVisible);
      savePreferences();
    }
  });

  filterContainer
    .querySelectorAll(".column-filter__action-btn")
    .forEach(btn => {
      btn.addEventListener("click", e => {
        const action = btn.dataset.action;
        if (action === "show-all") {
          columns.forEach((col, idx) => {
            const checkbox = filterItems.querySelector(`#col-${idx}`);
            if (checkbox) {
              checkbox.checked = true;
              toggleColumn(idx, true);
            }
          });
          savePreferences();
        } else if (action === "close") {
          filterMenu.classList.remove("is-open");
          filterBtn.classList.remove("is-open");
        }
      });
    });

  function toggleColumn(index, isVisible) {
    const header = headers[index];
    if (!header) return;

    if (isVisible) {
      header.classList.remove("hide-column");
    } else {
      header.classList.add("hide-column");
    }

    const rows = tbody.querySelectorAll("tr");
    rows.forEach(row => {
      const cell = row.children[index];
      if (cell) {
        if (isVisible) {
          cell.classList.remove("hide-column");
        } else {
          cell.classList.add("hide-column");
        }
      }
    });

    if (isVisible) {
      hiddenColumns = hiddenColumns.filter(idx => idx !== index);
    } else {
      if (!hiddenColumns.includes(index)) {
        hiddenColumns.push(index);
      }
    }
  }

  function savePreferences() {
    localStorage.setItem(storageKey, JSON.stringify(hiddenColumns));
  }
}
