const revealItems = document.querySelectorAll(".reveal");
const countTargets = document.querySelectorAll("[data-count]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const formatMoney = (value) => `+$${Math.round(value).toLocaleString("en-US")}`;

const animateCount = (node) => {
  const finalValue = Number(node.dataset.count);
  const duration = 1450;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    node.textContent = formatMoney(finalValue * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.55 }
);

countTargets.forEach((target) => countObserver.observe(target));

const header = document.querySelector(".site-header");
let lastScrollY = window.scrollY;

window.addEventListener(
  "scroll",
  () => {
    const current = window.scrollY;
    header.style.opacity = current > 80 && current > lastScrollY ? "0.72" : "1";
    header.style.transform = current > 80 && current > lastScrollY ? "translateY(-10px)" : "translateY(0)";
    lastScrollY = current;
  },
  { passive: true }
);

const chartData = {
  all: {
    labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [1450, 1980, 1320, 2420, 2170, 2960, 1860, 3310, 2680, 3840, 2210, 2330],
    sales: [5, 7, 5, 9, 8, 11, 7, 12, 10, 14, 8, 9],
    period: "Jul 2025 — Jun 2026",
    trend: "+18.4%"
  },
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [680, 1240, 920, 1680, 1120, 2140, 1760],
    sales: [2, 4, 3, 5, 4, 7, 6],
    period: "Jul 7 — Jul 13",
    trend: "+12.8%"
  },
  "1m": {
    labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28"],
    values: [740, 1180, 960, 1540, 1280, 1920, 1470, 2210, 1840, 2460],
    sales: [2, 4, 3, 5, 4, 6, 5, 7, 6, 8],
    period: "Jun 14 — Jul 13",
    trend: "+21.6%"
  },
  "6m": {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    values: [1860, 3310, 2680, 3840, 2210, 2960],
    sales: [7, 12, 10, 14, 8, 11],
    period: "Feb — Jul 2026",
    trend: "+16.2%"
  },
  "1y": {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    values: [1180, 1540, 2240, 1900, 2860, 2380, 3120, 2670, 3560, 2940, 4100, 3380],
    sales: [4, 6, 8, 7, 10, 9, 11, 10, 13, 11, 15, 12],
    period: "Aug 2025 — Jul 2026",
    trend: "+24.7%"
  }
};

const chart = document.querySelector("#profit-chart");
const chartBars = document.querySelector("#chart-bars");
const chartTotal = document.querySelector("#chart-total");
const chartTrend = document.querySelector("#chart-trend");
const chartPeriod = document.querySelector("#chart-period");
const tooltipDate = document.querySelector("#tooltip-date");
const tooltipValue = document.querySelector("#tooltip-value");
const tooltipSales = document.querySelector("#tooltip-sales");
const tabs = document.querySelectorAll(".time-tabs button");

const inspectBar = (bar, label, value, sales) => {
  const barBox = bar.getBoundingClientRect();
  const chartBox = chart.getBoundingClientRect();
  const x = barBox.left - chartBox.left + barBox.width / 2;
  const barTop = bar.querySelector(".chart-bar-visual").getBoundingClientRect().top - chartBox.top;
  const tooltipX = Math.max(76, Math.min(chartBox.width - 76, x));

  chart.style.setProperty("--cursor-x", `${x}px`);
  chart.style.setProperty("--tooltip-y", `${Math.max(6, barTop - 88)}px`);
  chart.querySelector(".chart-tooltip").style.left = `${tooltipX}px`;
  tooltipDate.textContent = label;
  tooltipValue.textContent = formatMoney(value);
  tooltipSales.textContent = `${sales} ${sales === 1 ? "sale" : "sales"}`;
  chart.classList.add("is-inspecting");
};

const renderChart = (range) => {
  const data = chartData[range];
  const maxValue = Math.max(...data.values) * 1.08;
  const total = data.values.reduce((sum, value) => sum + value, 0);

  chartBars.style.setProperty("--bar-count", data.values.length);
  chartBars.replaceChildren();
  chartTotal.textContent = formatMoney(total);
  chartTrend.textContent = data.trend;
  chartPeriod.textContent = data.period;
  chart.setAttribute("aria-label", `${data.period}. Total net profit ${formatMoney(total)}.`);

  data.values.forEach((value, index) => {
    const bar = document.createElement("button");
    const label = data.labels[index];
    const sales = data.sales[index];
    const height = Math.max(8, (value / maxValue) * 100);

    bar.className = "chart-bar-item";
    bar.type = "button";
    bar.setAttribute("aria-label", `${label}: ${formatMoney(value)}, ${sales} sales`);
    bar.style.setProperty("--bar-height", `${height}%`);
    bar.style.setProperty("--bar-delay", `${index * 42}ms`);
    bar.innerHTML = `<span class="chart-bar-visual"></span><span class="chart-bar-label">${label}</span>`;
    bar.addEventListener("mouseenter", () => inspectBar(bar, label, value, sales));
    bar.addEventListener("focus", () => inspectBar(bar, label, value, sales));
    bar.addEventListener("click", () => inspectBar(bar, label, value, sales));
    chartBars.appendChild(bar);
  });
};

chart.addEventListener("mouseleave", () => chart.classList.remove("is-inspecting"));
chart.addEventListener("focusout", (event) => {
  if (!chart.contains(event.relatedTarget)) {
    chart.classList.remove("is-inspecting");
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-pressed", "true");
    chart.classList.remove("is-inspecting");
    renderChart(tab.dataset.range);
  });
});

renderChart("all");
