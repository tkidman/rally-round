/* eslint-disable */
const NAVS = ["mobileNav", "seriesMobileNav"];
function closeNav(navId) {
  const el = document.getElementById(navId);
  if (!el) return;
  el.hidden = true;
  el.classList.remove("isOpen");
}

function toggleControlledNav(button) {
  const navId = button.getAttribute("aria-controls");
  const nav = document.getElementById(navId);
  if (!nav) return;

  const willOpen = nav.hidden === true;

  NAVS.forEach(closeNav);

  nav.hidden = !willOpen;
  nav.classList.toggle("isOpen", willOpen);
}

function openPopup(id) {
  const popup = document.getElementById(id);
  if (!popup) return;
  popup.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function() {
  const table = document.getElementById("tableDrivers");
  if (!table) return;

  // Apply column filters FIRST - before any other operations
  initColumnFilter(table);

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

  let currentSortedColumn = null;
  let currentSortOrder = 1;
  
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

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  // Simple rAF scheduler to coalesce repeated calls
  const raf = (() => {
    let id = 0;
    return fn => {
      if (id) cancelAnimationFrame(id);
      id = requestAnimationFrame(() => {
        id = 0;
        fn();
      });
    };
  })();

  function measure() {
    const tableWidth = table.offsetWidth;
    const wrapperWidth = tableWrapper.clientWidth;
    const needsScroll = tableWidth > wrapperWidth;

    return {
      needsScroll,
      tableWidth,
      wrapperWidth,
      scrollLeft: tableWrapper.scrollLeft,
      scrollWidth: tableWrapper.scrollWidth,
      clientWidth: tableWrapper.clientWidth
    };
  }

  function updateScrollbarVisibility(m) {
    if (isTouchDevice) {
      scrollIndicator.style.display = "none";
      return;
    }

    scrollIndicator.style.display = m.needsScroll ? "block" : "none";

    if (m.needsScroll) {
      scrollIndicator.style.setProperty("--table-width", `${m.tableWidth}px`);
      void scrollIndicator.offsetHeight;
    }
  }

  function updateFadeIndicators(m) {
    if (!isTouchDevice) return;

    tableWrapper.classList.toggle("is-scrollable", m.needsScroll);

    if (!m.needsScroll) {
      tableWrapper.classList.remove("scrolled-past-80");
      return;
    }

    const maxScroll = m.scrollWidth - m.clientWidth;
    const scrollPercent = maxScroll > 0 ? (m.scrollLeft / maxScroll) * 100 : 0;
    tableWrapper.classList.toggle("scrolled-past-80", scrollPercent > 80);
  }

  // Prevent scroll event ping-pong
  let isSyncingFromIndicator = false;
  let isSyncingFromTable = false;

  function syncTableToIndicator() {
    if (isSyncingFromIndicator || scrollIndicator.style.display === "none")
      return;
    isSyncingFromTable = true;
    scrollIndicator.scrollLeft = tableWrapper.scrollLeft;
    isSyncingFromTable = false;
  }

  function syncIndicatorToTable() {
    if (isSyncingFromTable) return;
    isSyncingFromIndicator = true;
    tableWrapper.scrollLeft = scrollIndicator.scrollLeft;
    isSyncingFromIndicator = false;
  }

  function updateAll() {
    const m = measure();
    updateScrollbarVisibility(m);
    updateFadeIndicators(m);
    syncTableToIndicator();
  }

  requestAnimationFrame(updateAll);

  tableWrapper.addEventListener(
    "scroll",
    () =>
      raf(() => {
        syncTableToIndicator();
        updateFadeIndicators(measure());
      }),
    { passive: true }
  );

  scrollIndicator.addEventListener("scroll", () => raf(syncIndicatorToTable), {
    passive: true
  });

  const resizeObserver = new ResizeObserver(() => raf(updateAll));
  resizeObserver.observe(table);
  resizeObserver.observe(tableWrapper);

  if (isTouchDevice) updateFadeIndicators(measure());
}

function initColumnFilter(table) {
  if (!table) return;

  const tableId = table.id || "tableDrivers";

  // Detect page type to share filter preferences across similar pages
  const getPageType = () => {
    const pathname = window.location.pathname;
    const filename = pathname.split("/").pop() || pathname;
    
    if (filename.includes("-driver-results.html")) {
      return "driver-results";
    }
    if (filename.includes("-standings.html")) {
      return "standings";
    }
    return pathname.replace(/\//g, "_") || "root";
  };

  const storageKey = `columnFilter_${getPageType()}_${tableId}`;
  const headers = table.querySelectorAll("thead th");
  const tbody = table.querySelector("tbody");

  if (!headers.length) return;

  // Load and sanitize: convert to Set and filter out invalid indices
  let hiddenColumns;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    hiddenColumns = new Set(
      stored.filter(
        idx => typeof idx === "number" && idx >= 0 && idx < headers.length
      )
    );
  } catch (e) {
    hiddenColumns = new Set();
  }

  // Cache rows once for better performance
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // Find the pre-rendered filter container
  const tableWrapper = table.closest(".table-scroll-wrapper") || table.parentElement;
  const filterContainer = tableWrapper.parentElement.querySelector(".column-filter");
  
  if (!filterContainer) {
    console.warn("Column filter container not found in template");
    return;
  }

  const filterBtn = filterContainer.querySelector(".column-filter__btn");
  const filterMenu = filterContainer.querySelector(".column-filter__menu");
  const filterItems = filterContainer.querySelector(".column-filter__items");

  const getColumnName = (header, index) => {
    const text = header.textContent.trim();
    if (text) return text;

    const img = header.querySelector("img");
    const imgText = img?.alt || img?.title;
    if (imgText) return imgText;

    const linkText = header.querySelector("a")?.textContent.trim();
    if (linkText) return linkText;

    // Handle empty th-change header (position change indicator)
    if (header.classList.contains("th-change")) {
      return "Change";
    }

    return `Column ${index + 1}`;
  };

  const toggleColumn = (index, isVisible) => {
    const header = headers[index];
    if (!header) return;

    header.classList.toggle("hide-column", !isVisible);
    rows.forEach(row => row.children[index]?.classList.toggle("hide-column", !isVisible));

    isVisible ? hiddenColumns.delete(index) : hiddenColumns.add(index);
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...hiddenColumns]));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  };

  // Batch filter item creation using DocumentFragment
  const fragment = document.createDocumentFragment();
  headers.forEach((header, index) => {
    const isVisible = !hiddenColumns.has(index);

    const item = document.createElement("div");
    item.className = "column-filter__item";
    item.innerHTML = `
      <input 
        type="checkbox" 
        class="column-filter__checkbox" 
        id="col-${index}" 
        data-column-index="${index}"
        ${isVisible ? "checked" : ""}
      >
      <label class="column-filter__label" for="col-${index}">
        ${getColumnName(header, index)}
      </label>
    `;
    fragment.appendChild(item);
  });
  filterItems.appendChild(fragment);

  // Apply all column visibility changes IMMEDIATELY (synchronously)
  // This prevents FOUC - we want columns hidden before first paint
  headers.forEach((header, index) => {
    const isVisible = !hiddenColumns.has(index);
    toggleColumn(index, isVisible);
  });

  const preloadStyle = document.getElementById('filter-preload');
  if (preloadStyle) {
    preloadStyle.remove();
  }

  filterBtn.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = filterMenu.classList.toggle("is-open");
    filterBtn.classList.toggle("is-open", isOpen);
  });

  document.addEventListener("click", e => {
    if (!filterContainer.contains(e.target)) {
      filterMenu.classList.remove("is-open");
      filterBtn.classList.remove("is-open");
    }
  });

  filterItems.addEventListener("change", e => {
    if (e.target.classList.contains("column-filter__checkbox")) {
      toggleColumn(parseInt(e.target.dataset.columnIndex), e.target.checked);
      savePreferences();
    }
  });

  filterContainer.addEventListener("click", e => {
    const btn = e.target.closest(".column-filter__action-btn");
    if (!btn) return;

    if (btn.dataset.action === "show-all") {
      filterItems.querySelectorAll(".column-filter__checkbox").forEach((checkbox, idx) => {
        checkbox.checked = true;
        toggleColumn(idx, true);
      });
      savePreferences();
    } else if (btn.dataset.action === "close") {
      filterMenu.classList.remove("is-open");
      filterBtn.classList.remove("is-open");
    }
  });
}
