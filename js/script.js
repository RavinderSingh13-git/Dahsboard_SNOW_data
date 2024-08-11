let tableData = [];
let marketData = [];

// Handle file input for user's Excel data
document.getElementById('input-excel').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            tableData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            renderTable(tableData);
            document.querySelector('.btn-chart-container').style.display = 'block';
            document.getElementById('input-market-excel').style.display = 'block';
        };
        
        reader.readAsArrayBuffer(file);
    }
});

// Handle file input for market Excel data
document.getElementById('input-market-excel').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            marketData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        };
        
        reader.readAsArrayBuffer(file);
    }
});

// Render table data
function renderTable(data) {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('dataTable');
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    let sortOrder = 'asc';
    let currentColumnIndex = -1;

    data[0].forEach((header, index) => {
        const th = document.createElement('th');
        th.innerHTML = `${header} <i class="sort-button fas fa-sort"></i>`;
        th.addEventListener('click', () => {
            if (currentColumnIndex === index) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortOrder = 'asc';
                currentColumnIndex = index;
            }
            const sortedData = sortTableByColumn(data, index, sortOrder);
            renderTable(sortedData);
        });
        tableHeader.appendChild(th);
    });

    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.innerText = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Sort table data by column
function sortTableByColumn(data, columnIndex, order) {
    const header = data[0];
    const rows = data.slice(1);
    const sortedRows = rows.sort((a, b) => {
        const cellA = a[columnIndex];
        const cellB = b[columnIndex];
        if (order === 'asc') {
            return (cellA > cellB) ? 1 : (cellA < cellB) ? -1 : 0;
        } else {
            return (cellA < cellB) ? 1 : (cellA > cellB) ? -1 : 0;
        }
    });
    return [header, ...sortedRows];
}

// Generate chart based on the selected type
document.getElementById('btn-bar-chart').addEventListener('click', function() {
    generateChart('bar');
});

document.getElementById('btn-pie-chart').addEventListener('click', function() {
    generateChart('pie');
});

document.getElementById('btn-compare-market').addEventListener('click', function() {
    compareWithMarket();
});

// Generate chart for user data
function generateChart(type) {
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    const buNameCounts = {};

    tableData.slice(1).forEach(row => {
        const manufacturer = row[1]; // Assuming "Manufacturer" is in the 2nd column (index 1)
        if (manufacturer) {
            buNameCounts[manufacturer] = (buNameCounts[manufacturer] || 0) + 1;
        }
    });

    const manufacturers = Object.keys(buNameCounts);
    const counts = Object.values(buNameCounts);

    document.getElementById('barChart').style.display = 'none';
    document.getElementById('pieChart').style.display = 'none';

    if (type === 'bar') {
        document.getElementById('barChart').style.display = 'block';
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: manufacturers,
                datasets: [{
                    label: 'Manufacturer Count',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else if (type === 'pie') {
        document.getElementById('pieChart').style.display = 'block';
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: manufacturers,
                datasets: [{
                    label: 'Manufacturer Distribution',
                    data: counts,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                    borderWidth: 1
                }]
            }
        });
    }
}

// Compare user data with market data
function compareWithMarket() {
    const ctxMarket = document.getElementById('marketChart').getContext('2d');

    if (marketData.length === 0) {
        alert('Please upload market data file first.');
        return;
    }

    const userBuNameCounts = {};
    const marketBuNameCounts = {};

    const manufacturerIndexUser = tableData[0].indexOf('Manufacturer');
    const manufacturerIndexMarket = marketData[0].indexOf('Manufacturer');

    tableData.slice(1).forEach(row => {
        const manufacturer = row[manufacturerIndexUser];
        if (manufacturer) {
            userBuNameCounts[manufacturer] = (userBuNameCounts[manufacturer] || 0) + 1;
        }
    });

    marketData.slice(1).forEach(row => {
        const manufacturer = row[manufacturerIndexMarket];
        if (manufacturer) {
            marketBuNameCounts[manufacturer] = (marketBuNameCounts[manufacturer] || 0) + 1;
        }
    });

    const allManufacturers = Array.from(new Set([...Object.keys(userBuNameCounts), ...Object.keys(marketBuNameCounts)]));
    const userCounts = allManufacturers.map(name => userBuNameCounts[name] || 0);
    const marketCounts = allManufacturers.map(name => marketBuNameCounts[name] || 0);

    document.getElementById('barChart').style.display = 'none';
    document.getElementById('pieChart').style.display = 'none';
    document.getElementById('marketChart').style.display = 'block';

    new Chart(ctxMarket, {
        type: 'bar',
        data: {
            labels: allManufacturers,
            datasets: [
                {
                    label: 'User Data',
                    data: userCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Market Data',
                    data: marketCounts,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
