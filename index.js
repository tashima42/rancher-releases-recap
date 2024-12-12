const releasesYears = [ '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024' ]
const gaReleasesPerYear = [ 1, 25, 16, 37, 27, 34, 27, 20, 13, 15, 26 ]
const preReleasesPerYear = [ 0, 3, 13, 5, 93, 190, 167, 130, 115, 71, 200 ]
const rancherGaReleasesMonths = [1,3,3,0,2,2,3,2,2,3,5,0]
const rancherPreReleasesMonths = [11,15,22,1,19,11,28,21,17,26,26,3]
const rancherPrimeReleasesMonths = [0,0,0,0,0,0,0,4,2,3,4,0]
const rancherReleaseTotal = 226
const rancherGaReleaseTotal = 26
const rancherPreReleaseTotal = 200
const rancherPrimeReleaseTotal = 13
const rancherActionsMonths = [ 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
const rancherActionsTotal = [110, 236, 237, 303, 216, 86]
const rancherActionsSuccess = [47, 139, 165, 240, 112, 64]
const rancherActionsFailure = [63, 97, 72, 63, 104, 22]

const utils = new Utils();
Chart.register(ChartDataLabels)

function releasesChart(id, label, data, color, labelIndex, labelMessage) {
  const ctx = document.getElementById(id);

  const labels = utils.months({count: 12});

  const config = {
    type: 'bar',
    data: {
      labels: labels,
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
            return ''; 
          },
        },
      }
    }
  };
  new Chart(ctx, config)
}

function totals() {
  const total = document.getElementById("rancher-releases-total")
  const totalGa = document.getElementById("rancher-ga-total")
  const totalPre = document.getElementById("rancher-pre-total")

  total.innerText = rancherReleaseTotal
  totalGa.innerText = rancherGaReleaseTotal
  totalPre.innerText = rancherPreReleaseTotal

  const totalPrime = document.getElementById("rancher-prime-releases-total")

  totalPrime.innerText = rancherPrimeReleaseTotal
}

totals()
releasesChart("rancher-ga", "Rancher GA", rancherGaReleasesMonths, utils.CHART_COLORS.blue, 6, "Release Team starts releasing rancher");
releasesChart("rancher-pre", "Rancher Pre", rancherPreReleasesMonths, utils.CHART_COLORS.red, 6, "Release Team starts releasing rancher")

releasesChart("rancher-prime-compare-months", "Rancher Prime", rancherPrimeReleasesMonths, utils.CHART_COLORS.yellow, 0, "")

actionsResults(rancherActionsMonths, rancherActionsTotal, rancherActionsSuccess, rancherActionsFailure, 3, "Self-hosted runners migration")

releasesOverYears(releasesYears, gaReleasesPerYear, preReleasesPerYear)

