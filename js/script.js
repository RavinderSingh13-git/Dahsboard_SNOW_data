let tableData = [];

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
             /////////// Re-render table with sorted data
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

    // Return the header row and sorted rows
    return [header, ...sortedRows];
}

document.getElementById('btn-bar-chart').addEventListener('click', function() {
    generateChart('bar');
});

document.getElementById('btn-pie-chart').addEventListener('click', function() {
    generateChart('pie');
});

function generateChart(type) {
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    
    const buNameCounts = {};

    // Assuming "BU name" is in the 7th column (index 6)
    tableData.slice(1).forEach(row => {
        const buName = row[6];
        if (buName) {
            buNameCounts[buName] = (buNameCounts[buName] || 0) + 1;
        }
    });

    const buNames = Object.keys(buNameCounts);
    const buCounts = Object.values(buNameCounts);

    // Hide all charts initially
    document.getElementById('barChart').style.display = 'none';
    document.getElementById('pieChart').style.display = 'none';

    if (type === 'bar') {
        document.getElementById('barChart').style.display = 'block';
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: buNames,
                datasets: [{
                    label: '# of Products by BU',
                    data: buCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.raw;
                            }
                        }
                    }
                },
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
                labels: buNames,
                datasets: [{
                    label: '# of Products by BU',
                    data: buCounts,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.raw;
                            }
                        }
                    }
                }
            }
        });
    }
}
