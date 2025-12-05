// Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    // Set default dates (Current Month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('startDate').valueAsDate = firstDay;
    document.getElementById('endDate').valueAsDate = lastDay;

    // Initialize
    loadDashboardData();

    // Event Listeners
    document.getElementById('filterBtn').addEventListener('click', loadDashboardData);

    // Hide Loader
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
    }, 800);
});

let shiftChart = null;
let statusChart = null;

async function loadDashboardData() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const token = localStorage.getItem('token');

    if (!start || !end) {
        showToast('Selecione as datas para filtrar', 'warning');
        return;
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Fetch Stats
        const statsRes = await fetch('http://localhost:8080/api/reports/reservation-stats', { headers });
        const stats = await statsRes.json();

        // Fetch Occupancy
        const occupancyRes = await fetch(`http://localhost:8080/api/reports/occupancy?start=${start}&end=${end}`, { headers });
        const occupancy = await occupancyRes.json();

        // Fetch Usage by Shift
        const shiftRes = await fetch(`http://localhost:8080/api/reports/usage-by-shift?start=${start}&end=${end}`, { headers });
        const shifts = await shiftRes.json();

        // Update UI
        updateStats(stats, occupancy);
        updateCharts(shifts, stats);

        showToast('Dados atualizados com sucesso', 'success');

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Erro ao carregar dados do dashboard', 'error');
    }
}

function updateStats(stats, occupancy) {
    // Animate numbers
    animateValue('totalReservations', 0, stats.total, 1000);
    animateValue('activeReservations', 0, stats.active, 1000);
    animateValue('cancelledReservations', 0, stats.cancelled, 1000);

    // Occupancy
    const rateElement = document.getElementById('occupancyRate');
    rateElement.textContent = `${occupancy.occupancyRate}%`;
}

function updateCharts(shifts, stats) {
    // Shift Chart
    const shiftCtx = document.getElementById('shiftChart').getContext('2d');

    if (shiftChart) shiftChart.destroy();

    shiftChart = new Chart(shiftCtx, {
        type: 'doughnut',
        data: {
            labels: ['Manhã', 'Tarde', 'Noite'],
            datasets: [{
                data: [shifts['Manhã'], shifts['Tarde'], shifts['Noite']],
                backgroundColor: ['#FFCE56', '#36A2EB', '#4BC0C0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Status Chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(statusCtx, {
        type: 'bar',
        data: {
            labels: ['Ativas', 'Canceladas', 'Concluídas'],
            datasets: [{
                label: 'Reservas',
                data: [stats.active, stats.cancelled, stats.completed || 0],
                backgroundColor: ['#2ecc71', '#e74c3c', '#3498db'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../../index.html';
}
