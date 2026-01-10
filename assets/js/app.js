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
  const popup = document.getElementById(id);
  if (!popup) return;
  popup.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function() {
  const table = document.getElementById("tableDrivers");
  if (!table) return;

  const headers = table.querySelectorAll("th");
  if (headers.length === 0) return;

  const WORST_STATUS = { dnf: 1, dns: 2, "n/a": 3 };

  function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return null;
    const trimmed = timeStr.trim();
    const isNegative = trimmed.startsWith("-");
    const cleanTime = trimmed.replace(/^[+-]/, "");
    const parts = cleanTime.split(":");

    if (parts.length === 3) {
      const hours = parseFloat(parts[0]);
      const minutes = parseFloat(parts[1]);
      const seconds = parseFloat(parts[2]);
      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return isNegative ? -totalSeconds : totalSeconds;
      }
    }
    return null;
  }

  function getCellValue(cell) {
    const img = cell.querySelector("img");
    if (img) {
      return img.alt.toLowerCase();
    }
    const text = cell.textContent.toLowerCase().trim();
    if (text === "=") {
      return "0";
    }
    return text;
  }

  function sortTableByColumn(table, columnIndex, order) {
    const tbody = table.querySelector("tbody");
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const headers = table.querySelectorAll("thead th");
    const header = headers[columnIndex];
    const isTimeColumn =
      header &&
      (header.classList.contains("th-ps") ||
        header.classList.contains("th-total") ||
        header.classList.contains("th-diff"));
    const isDiffColumn = header && header.classList.contains("th-diff");
    const isPsPointsColumn =
      header && header.classList.contains("th-ps-points");
    const isPointsColumn = header && header.classList.contains("th-points");
    const isTotalPointsColumn =
      header && header.classList.contains("th-total-points");

    let psTimeColumnIndex = -1;
    if (isPsPointsColumn) {
      headers.forEach((h, idx) => {
        if (h.classList.contains("th-ps")) {
          psTimeColumnIndex = idx;
        }
      });
    }

    let totalTimeColumnIndex = -1;
    if (isPointsColumn || isTotalPointsColumn) {
      headers.forEach((h, idx) => {
        if (h.classList.contains("th-total")) {
          totalTimeColumnIndex = idx;
        }
      });
    }

    function compareByTimeColumn(rowA, rowB, timeColumnIndex, sortOrder) {
      if (timeColumnIndex < 0) return null;
      const timeCellA = rowA.children[timeColumnIndex];
      const timeCellB = rowB.children[timeColumnIndex];
      if (!timeCellA || !timeCellB) return null;

      const timeValueA = getCellValue(timeCellA);
      const timeValueB = getCellValue(timeCellB);
      const timeA = parseTime(timeValueA);
      const timeB = parseTime(timeValueB);

      if (timeA !== null && timeB !== null) {
        return (timeA - timeB) * -sortOrder;
      }
      if (timeA !== null && timeB === null) return -1 * sortOrder;
      if (timeA === null && timeB !== null) return 1 * sortOrder;
      return null;
    }

    rows.sort((rowA, rowB) => {
      const cellElementA = rowA.children[columnIndex];
      const cellElementB = rowB.children[columnIndex];

      if (!cellElementA || !cellElementB) {
        if (!cellElementA && !cellElementB) return 0;
        return !cellElementA ? 1 : -1;
      }

      const cellA = getCellValue(cellElementA);
      const cellB = getCellValue(cellElementB);

      // For PS points, points, and total points columns, don't return early for empty cells - we'll sort by time
      if (!isPsPointsColumn && !isPointsColumn && !isTotalPointsColumn) {
        if (cellA === "" && cellB === "") return 0;
        if (cellA === "") return -1 * order;
        if (cellB === "") return 1 * order;
      }

      if (cellA === "--" || cellB === "--") {
        if (cellA === "--" && cellB === "--") return 0;
        return cellA === "--" ? order : -order;
      }

      const statusA = WORST_STATUS[cellA];
      const statusB = WORST_STATUS[cellB];

      if (statusA !== undefined || statusB !== undefined) {
        if (statusA !== undefined && statusB !== undefined) {
          return (statusA - statusB) * order;
        }
        return statusA !== undefined ? -1 * order : 1 * order;
      }

      let timeA = null;
      let timeB = null;
      if (isTimeColumn) {
        timeA = parseTime(cellA);
        timeB = parseTime(cellB);
      }

      if (timeA !== null && timeB !== null) {
        const timeOrder = isDiffColumn ? -order : order;
        return (timeA - timeB) * timeOrder;
      }

      const numA = Number(cellA);
      const numB = Number(cellB);
      const isNumberA =
        cellA !== "" && Number.isFinite(numA) && /^-?\d*\.?\d+$/.test(cellA);
      const isNumberB =
        cellB !== "" && Number.isFinite(numB) && /^-?\d*\.?\d+$/.test(cellB);

      if (isNumberA && isNumberB) {
        const primarySort = (numA - numB) * order;
        if (primarySort === 0) {
          if (isPsPointsColumn) {
            const timeSort = compareByTimeColumn(
              rowA,
              rowB,
              psTimeColumnIndex,
              order
            );
            if (timeSort !== null) return timeSort;
          }
          if (isPointsColumn || isTotalPointsColumn) {
            const timeSort = compareByTimeColumn(
              rowA,
              rowB,
              totalTimeColumnIndex,
              order
            );
            if (timeSort !== null) return timeSort;
          }
        }
        return primarySort;
      } else if (isNumberA) {
        // In ascending: empty (0 points) comes before number; in descending: number comes before empty
        return 1 * order;
      } else if (isNumberB) {
        return -1 * order;
      } else {
        if (isPsPointsColumn) {
          const timeSort = compareByTimeColumn(
            rowA,
            rowB,
            psTimeColumnIndex,
            order
          );
          if (timeSort !== null) return timeSort;
        }
        if (isPointsColumn || isTotalPointsColumn) {
          const timeSort = compareByTimeColumn(
            rowA,
            rowB,
            totalTimeColumnIndex,
            order
          );
          if (timeSort !== null) return timeSort;
        }
        // Fallback to string comparison for non-numeric, non-time columns
        // or when secondary time sorting is unavailable
        if (cellA === "" && cellB === "") return 0;
        return (
          cellA.localeCompare(cellB, undefined, {
            numeric: true,
            sensitivity: "base"
          }) * order
        );
      }
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  function updateHeaderStyles(headers, sortedHeader, order) {
    headers.forEach(header => {
      header.classList.remove("sorted-asc", "sorted-desc");
    });
    sortedHeader.classList.add(order === 1 ? "sorted-asc" : "sorted-desc");
  }

  function shouldDefaultToDescending(header) {
    if (!header) return false;
    return (
      header.classList.contains("th-diff") ||
      header.classList.contains("th-sr") ||
      header.classList.contains("th-leg") ||
      header.classList.contains("th-ps-points") ||
      header.classList.contains("th-total-points") ||
      header.classList.contains("th-points") ||
      header.classList.contains("th-location")
    );
  }

  let currentSortedColumn = 0;
  const initialHeader = headers[0];
  let currentSortOrder = shouldDefaultToDescending(initialHeader) ? -1 : 1;

  sortTableByColumn(table, 0, currentSortOrder);
  updateHeaderStyles(headers, headers[0], currentSortOrder);

  headers.forEach((header, index) => {
    header.addEventListener("click", e => {
      if (e.target.closest("a")) {
        return;
      }

      if (index === currentSortedColumn) {
        currentSortOrder *= -1;
      } else {
        currentSortedColumn = index;
        currentSortOrder = shouldDefaultToDescending(header) ? -1 : 1;
      }

      sortTableByColumn(table, index, currentSortOrder);
      updateHeaderStyles(headers, header, currentSortOrder);
    });
  });

  initColumnFilter(table);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initTopScrollbar();
    });
  });
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

    if (isTouchDevice) {
      scrollIndicator.style.display = "none";
      return;
    }

    scrollIndicator.style.display = needsScroll ? "block" : "none";

    if (needsScroll) {
      scrollIndicator.style.setProperty(
        "--table-width",
        table.offsetWidth + "px"
      );
      void scrollIndicator.offsetHeight;
    }
  }

  requestAnimationFrame(() => {
    updateScrollbarVisibility();
    updateFadeIndicators();
  });

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

    const needsScroll = table.offsetWidth > tableWrapper.clientWidth;
    tableWrapper.classList.toggle("is-scrollable", needsScroll);

    if (needsScroll) {
      const scrollLeft = tableWrapper.scrollLeft;
      const scrollWidth = tableWrapper.scrollWidth;
      const clientWidth = tableWrapper.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const scrollPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

      tableWrapper.classList.toggle("scrolled-past-80", scrollPercent > 80);
    } else {
      tableWrapper.classList.remove("scrolled-past-80");
    }
  }

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

  scrollIndicator.addEventListener(
    "scroll",
    () => {
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
      scrollTimeout = requestAnimationFrame(syncIndicatorToTable);
    },
    { passive: true }
  );

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
    scrollIndicator.parentElement.insertBefore(
      filterContainer,
      scrollIndicator
    );
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
