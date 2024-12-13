const year = 2024
const releasesMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', "Dec" ]
const rancherPrimeMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
const rancherActionsMonths = [ 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]

const utils = new Utils();
Chart.register(ChartDataLabels)

async function fetchData() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/tashima42/rancher-releases-recap/refs/heads/main/data/rancher-metrics.json'); 
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json(); 
    console.log(data)
    return data
    // ... use the data ...
  } catch (error) {
    console.error('There was a problem fetching the data:', error);
  }
}

function loadRancherReleasesData(rancherReleasesData) {

  const rancherGaReleasesMonths = rancherReleasesData.ga_releases_per_month[year]
  const rancherPreReleasesMonths = rancherReleasesData.pre_releases_per_month[year]

  const gaReleasesPerYear = Object.values(rancherReleasesData.ga_releases_per_year)
  const preReleasesPerYear = Object.values(rancherReleasesData.pre_releases_per_year)
  const releasesYears = Object.keys(rancherReleasesData.ga_releases_per_year)

  const rancherGaReleaseTotal = rancherGaReleasesMonths.reduce((a, b) => a + b, 0)
  const rancherPreReleaseTotal = rancherPreReleasesMonths.reduce((a, b) => a + b, 0)
  const rancherReleaseTotal = rancherGaReleaseTotal + rancherPreReleaseTotal

  setRancherTotals(rancherReleaseTotal, rancherGaReleaseTotal, rancherPreReleaseTotal)

  releasesChart("rancher-ga", releasesMonths, "Rancher GA", rancherGaReleasesMonths, utils.CHART_COLORS.blue, 6, "Release Team starts releasing rancher");
  releasesChart("rancher-pre", releasesMonths,  "Rancher Pre", rancherPreReleasesMonths, utils.CHART_COLORS.red, 6, "Release Team starts releasing rancher")

  releasesOverYears(releasesYears, gaReleasesPerYear, preReleasesPerYear)
}

function setRancherPrimeTotals(releases) {
  const total = document.getElementById("rancher-prime-releases-total")
  total.innerText = releases
}

function setActionsRunsTotals(runs) {
  const totalActions = document.getElementById("rancher-actions-total")
  totalActions.innerText = runs
}

function loadRancherPrimeReleasesData(rancherPrimeReleasesData) {
  const rancherPrimeReleases = rancherPrimeReleasesData.ga_releases_per_month[year].filter((value) => value !== 0)
  const rancherPrimeReleaseTotal = rancherPrimeReleases.reduce((a, b) => a + b, 0)

  setRancherPrimeTotals(rancherPrimeReleaseTotal)

  releasesChart("rancher-prime-compare-months", rancherPrimeMonths, "Rancher Prime", rancherPrimeReleases, utils.CHART_COLORS.yellow, 0, "")
}

function loadActionsData(rancherActionsData) {
  const rancherActionsSuccess = Object.values(rancherActionsData.successful_actions_per_month[year]).filter((value) => value !== 0)
  const rancherActionsFailure = Object.values(rancherActionsData.failed_actions_per_month[year]).filter((value) => value !== 0)
  const rancherActionsTotal = rancherActionsSuccess.map((value, index) => value + rancherActionsFailure[index])

  actionsResults(rancherActionsMonths, rancherActionsTotal, rancherActionsSuccess, rancherActionsFailure, 3, "Self-hosted runners migration")
}



function setRancherTotals(releases, gaReleases, preReleases) {
  const total = document.getElementById("rancher-releases-total")
  total.innerText = releases

  const totalGa = document.getElementById("rancher-ga-total")
  totalGa.innerText = gaReleases

  const totalPre = document.getElementById("rancher-pre-total")
  totalPre.innerText = preReleases
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function releasesChart(id, months, label, data, color, labelIndex, labelMessage) {
  const ctx = document.getElementById(id);

  const config = {
    type: 'bar',
    data: {
      labels: months,
      datasets: [ {
        label,
        data,
        borderColor: color,
        backgroundColor: color,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          formatter: (value, context) => {
            if (context.dataIndex === labelIndex) {
              return labelMessage;
            } 
            return ''; 
          },
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          borderRadius: 4,
          color: 'white',
          font: {
            weight: 'bold'
          },
          padding: 0,
        },
      },
    },
  };

  new Chart(ctx, config);
}

function releasesOverYears(years, ga, pre) {
  const ctx = document.getElementById("rancher-compare-years")

  const config = {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "ga",
          data: ga,
          borderColor: utils.CHART_COLORS.blue,
          backgroundColor: utils.CHART_COLORS.blue,
        },
        {
          label: "pre-release",
          data: pre,
          borderColor: utils.CHART_COLORS.red,
          backgroundColor: utils.CHART_COLORS.red,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          borderRadius: 4,
          color: 'white',
          font: {
            weight: 'bold'
          },
          formatter: Math.round,
          padding: 2,
          align: "top",
          display: "auto",
        },
      },
    }
  }
  
  new Chart(ctx, config)
}

function actionsResults(months, total, success, failure, labelIndex, labelMessage) {
  const ctx = document.getElementById("rancher-actions-results")

  const config = {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: "Total",
          data: total,
          borderColor: utils.CHART_COLORS.blue,
          backgroundColor: utils.CHART_COLORS.blue,
        },
        {
          label: "Success",
          data: success,
          borderColor: utils.CHART_COLORS.green,
          backgroundColor: utils.CHART_COLORS.green,
        },
        {
          label: "Failure",
          data: failure,
          borderColor: utils.CHART_COLORS.red,
          backgroundColor: utils.CHART_COLORS.red,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'top',
          formatter: (value, context) => {
            if (context.dataIndex === labelIndex && context.dataset.label === "Failure") {
              return labelMessage;
            } 
            return value; 
          },
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          borderRadius: 4,
          color: 'white',
          font: {
            weight: 'bold'
          },
          padding: 2,
          display: "auto",
        },
      }
    }
  };
  new Chart(ctx, config)
}


const rancherMouseDiv = document.getElementById("rancher-mouse")

function handleMouse() {
  rancherMouseDiv.onmouseenter = () => drawRancherMouseLogo(rancherMouseDiv)
}

function drawRancherMouseLogo(img) {
  const minViewportWidth = window.scrollX; // Minimum width (left edge)
  const maxViewportWidth = window.scrollX + window.innerWidth; // Maximum width (right edge)

  const minViewportHeight = window.scrollY; // Minimum height is the current scroll position
  const maxViewportHeight = window.scrollY + window.innerHeight; // Maximum height is scroll position plus viewport height

  const x = randInt(minViewportWidth, maxViewportWidth - 100)
  const y = randInt(minViewportHeight, maxViewportHeight)

  img.style.left = x + "px";
  img.style.top = y + "px";
}

function checkViewport() {
  const imgRect = rancherMouseDiv.getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;

  if ( imgRect.right > w || imgRect.bottom > h || imgRect.left < 0 || imgRect.top < 0) {
    drawRancherMouseLogo(rancherMouseDiv);
  }
}

function toggleRancherMouse() {
  drawRancherMouseLogo(rancherMouseDiv)
  rancherMouseDiv.classList.toggle("hidden")
}

// from: https://firefox-source-docs.mozilla.org/performance/scroll-linked_effects.html
var timeoutId = null;
addEventListener("scroll", function() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(checkViewport, 25, parseInt(rancherMouseDiv.style.top));
}, true);

drawRancherMouseLogo(rancherMouseDiv)
handleMouse()

fetchData().then(data => {
  loadRancherReleasesData(data.rancher)
  loadRancherPrimeReleasesData(data.rancher_prime)
  loadActionsData(data.actions)
})

