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

const utils = new Utils();

function releasesChart(id, label, data, color) {
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
        legend: { display: false }
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
releasesChart("rancher-ga", "Rancher GA", rancherGaReleasesMonths, utils.CHART_COLORS.blue);
releasesChart("rancher-pre", "Rancher Pre", rancherPreReleasesMonths, utils.CHART_COLORS.red)
releasesChart("rancher-prime-compare-months", "Rancher Prime", rancherPrimeReleasesMonths, utils.CHART_COLORS.yellow)

releasesOverYears(releasesYears, gaReleasesPerYear, preReleasesPerYear)

