/* exported toggleControlledNav, openPopup */
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

// Scroll the current event's flag into view, or the latest on non-results pages.
function scrollSecondaryNavToCurrent() {
  const nav = document.querySelector(".secondaryNav");
  if (!nav || nav.scrollWidth <= nav.clientWidth) return;

  const items = Array.from(nav.querySelectorAll(".secondaryNav__item"));
  const page = window.location.pathname.split("/").pop();
  let target = items.find(item => item.getAttribute("href") === "./" + page);
  if (target) {
    target.setAttribute("aria-current", "page");
  } else {
    const enabled = items.filter(item => !item.style.pointerEvents);
    target = enabled[enabled.length - 1];
  }
  if (!target) return;

  // scroll only the nav row horizontally (scrollIntoView would also scroll the page)
  const navRect = nav.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  nav.scrollLeft +=
    targetRect.left - navRect.left - (navRect.width - targetRect.width) / 2;
}

window.addEventListener("load", scrollSecondaryNavToCurrent);

document.addEventListener("DOMContentLoaded", function () {
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

  const headers = table.querySelectorAll("thead th");
  const tbody = table.querySelector("tbody");

  if (!headers.length) return;

  const hiddenColumns = new Set();

  // Cache rows once for better performance
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // Find the pre-rendered filter container
  const tableWrapper =
    table.closest(".table-scroll-wrapper") || table.parentElement;
  const filterContainer =
    tableWrapper.parentElement.querySelector(".column-chips");

  if (!filterContainer) {
    console.warn("Column filter container not found in template");
    return;
  }

  const filterItems = filterContainer.querySelector(".column-chips__items");

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
    rows.forEach(row =>
      row.children[index]?.classList.toggle("hide-column", !isVisible)
    );

    isVisible ? hiddenColumns.delete(index) : hiddenColumns.add(index);
  };

  // One chip toggles every column belonging to an idea. Labels come from the headers.
  const GROUPS = {
    "driver-results": [
      { key: "ps", classes: ["th-ps"] },
      { key: "diff", classes: ["th-diff"] },
      { key: "sr", classes: ["th-sr"] },
      {
        key: "points-detail",
        label: "Points detail",
        // Total points always stays: it is the answer the page exists to give.
        classes: ["th-ps-points", "th-stage-points", "th-leg", "th-points"]
      }
    ],
    standings: [
      { key: "nat", classes: ["th-nat"] },
      { key: "change", label: "Change", classes: ["th-change"] },
      { key: "points", classes: ["th-points"] }
    ]
  };

  const headerList = Array.from(headers);
  const groups = (GROUPS[getPageType()] || [])
    .map(group => {
      const indices = headerList
        .map((header, index) =>
          group.classes.some(cls => header.classList.contains(cls)) ? index : -1
        )
        .filter(index => index >= 0);
      return { ...group, indices };
    })
    .filter(group => group.indices.length > 0)
    .map(group => ({
      ...group,
      label: group.label || getColumnName(headerList[group.indices[0]], 0)
    }));

  // Car logo and model live in the driver cell, so they toggle by class not column index.
  const hasCar = !!table.querySelector(".td-driver__car");
  let carHidden = false;

  const applyCar = () => {
    table.classList.toggle("hide-car", carHidden);
  };

  const isGroupVisible = group =>
    group.indices.some(index => !hiddenColumns.has(index));

  const renderChips = () => {
    filterItems.textContent = "";
    const fragment = document.createDocumentFragment();

    groups.forEach(group => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "column-chip";
      chip.dataset.group = group.key;
      chip.textContent = group.label;
      chip.setAttribute("aria-pressed", String(isGroupVisible(group)));
      chip.classList.toggle("is-off", !isGroupVisible(group));
      fragment.appendChild(chip);
    });

    if (hasCar) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "column-chip";
      chip.dataset.group = "car";
      chip.textContent = "Car";
      chip.setAttribute("aria-pressed", String(!carHidden));
      chip.classList.toggle("is-off", carHidden);
      fragment.appendChild(chip);
    }

    filterItems.appendChild(fragment);
  };

  filterItems.addEventListener("click", e => {
    const chip = e.target.closest(".column-chip");
    if (!chip) return;

    if (chip.dataset.group === "car") {
      carHidden = !carHidden;
      applyCar();
      renderChips();
      return;
    }

    const group = groups.find(g => g.key === chip.dataset.group);
    if (!group) return;

    const makeVisible = !isGroupVisible(group);
    group.indices.forEach(index => toggleColumn(index, makeVisible));
    renderChips();
  });

  if (!groups.length && !hasCar) {
    filterContainer.remove();
    return;
  }

  renderChips();
  applyCar();
}
