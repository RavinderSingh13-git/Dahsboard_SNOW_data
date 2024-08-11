let tableData = [];
let marketData = [];

document.getElementById('input-excel').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Assuming the first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert sheet to JSON
            tableData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Render data to the table
            renderTable(tableData);

            // Show the chart type selection buttons
            document.querySelector('.btn-chart-container').style.display = 'block';

            // Show the market file upload button
            document.getElementById('input-market-excel').style.display = 'block';
        };
        
        reader.readAsArrayBuffer(file);
    }
});

document.getElementById('input-market-excel').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Assuming the first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert sheet to JSON
            marketData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        };
        
        reader.readAsArrayBuffer(file);
    }
});

function renderTable(data) {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('dataTable');

    // Clear existing data
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    // Initialize sorting state
    let sortOrder = 'asc'; // default sort order
    let currentColumnIndex = -1;

    // Create header row with sorting buttons
    data[0].forEach((header, index) => {
        const th = document.createElement('th');
        th.innerHTML = `${header} <i class="sort-button fas fa-sort"></i>`;
        
        // Add click event to header for sorting
        th.addEventListener('click', () => {
            if (currentColumnIndex === index) {
                // Toggle sort order
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

    // Create data rows
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

function sortTableByColumn(data, columnIndex, order) {
    const header = data[0]; // Keep the header row
    const rows = data.slice(1); // Exclude the header row

    // Sort data based on the selected column and order
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

function hideAllCharts() {
    document.getElementById('barChart').style.display = 'none';
    document.getElementById('pieChart').style.display = 'none';
    document.getElementById('marketChart').style.display = 'none';
}

document.getElementById('btn-bar-chart').addEventListener('click', function() {
    hideAllCharts();
    generateChart('bar');
});

document.getElementById('btn-pie-chart').addEventListener('click', function() {
    hideAllCharts();
    generateChart('pie');
});

document.getElementById('btn-compare-market').addEventListener('click', function() {
    hideAllCharts();
    compareWithMarket();
});

function generateChart(type) {
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    
    const manufacturerCounts = {};

    tableData.slice(1).forEach(row => {
        const manufacturer = row[1]; // Assuming Manufacturer is in the 2nd column (index 1)
        if (manufacturer) {
            manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
        }
    });

    const manufacturers = Object.keys(manufacturerCounts);
    const counts = Object.values(manufacturerCounts);

    // Hide all charts initially
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

function compareWithMarket() {
    const ctxMarket = document.getElementById('marketChart').getContext('2d');
    
    if (marketData.length === 0) {
        alert('Please upload market data file first.');
        return;
    }

    // Process market data
    const marketManufacturerCounts = {};
    const manufacturerIndexMarket = marketData[0].indexOf('Manufacturer');

    marketData.slice(1).forEach(row => {
        const manufacturer = row[manufacturerIndexMarket];
        if (manufacturer) {
            marketManufacturerCounts[manufacturer] = marketManufacturerCounts[manufacturer] || { count: 0 };
            marketManufacturerCounts[manufacturer].count += 1;
        }
    });

    const userManufacturerCounts = {};
    const manufacturerIndexUser = tableData[0].indexOf('Manufacturer');

    tableData.slice(1).forEach(row => {
        const manufacturer = row[manufacturerIndexUser];
        if (manufacturer) {
            userManufacturerCounts[manufacturer] = userManufacturerCounts[manufacturer] || { count: 0 };
            userManufacturerCounts[manufacturer].count += 1;
        }
    });

    const allManufacturers = Array.from(new Set([...Object.keys(userManufacturerCounts), ...Object.keys(marketManufacturerCounts)]));
    const userCounts = allManufacturers.map(name => userManufacturerCounts[name]?.count || 0);
    const marketCounts = allManufacturers.map(name => marketManufacturerCounts[name]?.count || 0);

    // Hide all charts initially
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
