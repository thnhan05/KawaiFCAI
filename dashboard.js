// Dashboard Application JS

// Tab Navigation Logic
document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', function() {
        // Handle visual active state in sidebar
        document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
        this.classList.add('active');
        
        // Hide all tabs
        document.querySelectorAll('.dashboard-grid').forEach(tab => tab.style.display = 'none');
        
        // Show corresponding tab based on ID mapped to content
        const linkId = this.getAttribute('id');
        if (linkId === 'nav-dashboard') {
            document.getElementById('dashboard-tab').style.display = 'grid';
        } else if (linkId === 'nav-spectrum') {
            document.getElementById('spectrum-tab').style.display = 'grid';
            if (window.spectrumChart) window.spectrumChart.update();
        } else if (linkId === 'nav-roi') {
            document.getElementById('roi-tab').style.display = 'grid';
            if (window.roiChart) window.roiChart.update();
        }
    });
});

// Chart.js Quality Summary
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('qualityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Accepted', 'Rejected (Bruise)', 'Rejected (Fungi)'],
                datasets: [{
                    data: [91.8, 6.2, 2.0],
                    backgroundColor: [
                        '#2ecc71',
                        '#e74c3c',
                        '#9b59b6'
                    ],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Populate Recent Conveyor Logs Table
    const tableBody = document.getElementById('logTableBody');
    if (tableBody) {
        const dummyLogs = [
            { time: "14:32:01", id: "SPL-0892", brix: "12.1%", ripe: "Stage 4", pest: "Safe", fungi: "Negative", dmg: "61.0%", status: "Rejected" },
            { time: "14:31:58", id: "SPL-0891", brix: "13.4%", ripe: "Stage 3", pest: "Safe", fungi: "Negative", dmg: "2.1%", status: "Accepted" },
            { time: "14:31:55", id: "SPL-0890", brix: "11.2%", ripe: "Stage 4", pest: "Warning", fungi: "Negative", dmg: "5.5%", status: "Accepted" },
            { time: "14:31:52", id: "SPL-0889", brix: "14.0%", ripe: "Stage 5", pest: "Safe", fungi: "Positive", dmg: "18.2%", status: "Rejected" },
            { time: "14:31:49", id: "SPL-0888", brix: "12.8%", ripe: "Stage 3", pest: "Safe", fungi: "Negative", dmg: "1.0%", status: "Accepted" }
        ];

        let htmlRows = '';
        dummyLogs.forEach(row => {
            const statusClass = row.status === 'Accepted' ? 'safe' : 'danger';
            htmlRows += `
                <tr>
                    <td>${row.time}</td>
                    <td><strong>${row.id}</strong></td>
                    <td>${row.brix}</td>
                    <td>${row.ripe}</td>
                    <td>${row.pest}</td>
                    <td>${row.fungi}</td>
                    <td>${row.dmg}</td>
                    <td><span class="status-badge ${statusClass}">${row.status}</span></td>
                </tr>
            `;
        });
        tableBody.innerHTML = htmlRows;
    }

    // Interactive Spectrum Chart
    const ctxSpectrum = document.getElementById('spectrumLiveChart');
    if (ctxSpectrum) {
        // Create initial wavelength labels array (400nm to 1000nm)
        const labels = Array.from({length: 61}, (_, i) => 400 + (i * 10));
        
        window.spectrumChart = new Chart(ctxSpectrum, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Intensity at [119, 154]',
                    data: labels.map(w => Math.max(0.05, 0.2 + Math.sin(w / 50) * 0.15 + (Math.random() * 0.05))), // Simulated bruised curve
                    borderColor: '#00B4D8',
                    backgroundColor: 'rgba(0, 180, 216, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400 },
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 0.6,
                        title: { display: true, text: 'Intensity' }
                    },
                    x: {
                        title: { display: true, text: 'Wavelength (nm)' }
                    }
                }
            }
        });

        // Set up interactive click on the camera feed image
        const cameraFeed = document.getElementById('spectrum-camera-feed');
        if (cameraFeed) {
            cameraFeed.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate percentage based positioning
                const xPct = (x / rect.width) * 100;
                const yPct = (y / rect.height) * 100;
                
                // Move crosshair
                const crosshair = document.getElementById('spectrum-crosshair');
                crosshair.style.left = `${xPct}%`;
                crosshair.style.top = `${yPct}%`;
                
                // Real coordinate mapping simulation (e.g. 500x500 image space)
                const realX = Math.round((x / rect.width) * 500);
                const realY = Math.round((y / rect.height) * 500);
                
                // Update indicator text
                const pxInfo = document.getElementById('spectrum-pixel-info');
                const randomIntensity = (0.2 + Math.random() * 0.3).toFixed(3);
                pxInfo.style.left = `${Math.min(xPct + 5, 80)}%`;
                pxInfo.style.top = `${Math.max(yPct - 15, 0)}%`;
                pxInfo.innerHTML = `[X,Y] [${realX} ${realY}]<br>[Intensity] ${randomIntensity}`;
                
                document.getElementById('spectrum-chart-title').innerText = `Pixel [${realX}, ${realY}] Spectrum (Wavelength nm)`;
                
                // Generate simulated spectrum logic: 
                // If clicked near center/left (bruise area), generate classic bruised curve.
                // Else generate healthy (high reflection) curve.
                const isBruise = xPct > 30 && xPct < 70 && yPct > 30 && yPct < 70;
                
                const newData = labels.map(w => {
                    if (isBruise) {
                        return Math.max(0.05, 0.15 + Math.sin(w / 40) * 0.1 + (Math.random() * 0.05));
                    } else {
                        return Math.max(0.1, 0.3 + Math.sin(w / 60) * 0.2 + (Math.random() * 0.02));
                    }
                });
                
                window.spectrumChart.data.datasets[0].data = newData;
                window.spectrumChart.data.datasets[0].borderColor = isBruise ? '#e74c3c' : '#2ecc71';
                window.spectrumChart.data.datasets[0].backgroundColor = isBruise ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)';
                window.spectrumChart.data.datasets[0].label = isBruise ? `Bruised Tissue [${realX}, ${realY}]` : `Healthy Tissue [${realX}, ${realY}]`;
                window.spectrumChart.update();
            });
        }
    }
});
