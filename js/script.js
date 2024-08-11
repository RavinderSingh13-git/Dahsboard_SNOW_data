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
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Render data to the table
            renderTable(jsonData);

            // Generate a chart based on the data
            generateChart(jsonData);
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
            renderTable(sortedData); // Re-render table with sorted data
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

function generateChart(data) {
    const ctx = document.getElementById('chartContainer').getContext('2d');
    
    // Example: Count of items per BU name
    const buNameCounts = {};

    // Assuming the "BU name" column is the 7th column (index 6)
    data.slice(1).forEach(row => {
        const buName = row[6];
        if (buName) {
            buNameCounts[buName] = (buNameCounts[buName] || 0) + 1;
        }
    });

    const buNames = Object.keys(buNameCounts);
    const buCounts = Object.values(buNameCounts);

    const myChart = new Chart(ctx, {
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
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
