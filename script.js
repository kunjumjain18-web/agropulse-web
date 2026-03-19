document.addEventListener('DOMContentLoaded', () => {
    console.log("AgroPULSE initialized.");

    let sensorChart;

    // Navbar Interaction Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Click behavior
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Scroll behavior (Bonus)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Section is active when 50% visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const ctx = document.getElementById('sensorCanvas');
    if (ctx) {
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30'],
                datasets: [
                    {
                        label: 'Humidity %',
                        data: [50, 52, 51, 54, 53, 55, 53.1],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Moisture %',
                        data: [48, 49, 48.5, 49.5, 50, 51, 50.2],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Temperature °C',
                        data: [28, 28.5, 29, 29.2, 29.5, 29.8, 29.6],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: false // Using custom HTML legend
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    }
                }
            }
        });
    }

    // Smart Plant Logic
    const simulationBtn = document.getElementById('simulationButton');
    const plantState = document.getElementById('plantState');
    const moistureValue = document.getElementById('moistureValue');
    const waterOverlay = document.getElementById('waterOverlay');

    // Assess current data
    const assessDataState = () => {
        if (!plantState || !moistureValue) return;
        const currentMoisture = parseFloat(moistureValue.innerText) || 50;
        
        // Define Thresholds
        if (currentMoisture < 40) {
            plantState.setAttribute('data-state', 'sad');
        } else {
            plantState.setAttribute('data-state', 'happy');
        }
    };

    // Initialize plant on load based on static data
    assessDataState();

    let animationTimeout;

    if (simulationBtn) {
        simulationBtn.addEventListener('click', () => {
            if (!plantState) return;

            // Optional: trigger pulse end
            simulationBtn.classList.add('active');
            
            clearTimeout(animationTimeout);
            const currentState = plantState.getAttribute('data-state');

            if (currentState === 'happy') {
                // Play Dance
                plantState.classList.add('dance');
                animationTimeout = setTimeout(() => {
                    plantState.classList.remove('dance');
                    simulationBtn.classList.remove('active');
                }, 2000);
            } else if (currentState === 'sad') {
                // Play Cry
                plantState.setAttribute('data-state', 'crying');
                if (waterOverlay) waterOverlay.classList.add('active');
                
                animationTimeout = setTimeout(() => {
                    // Revert back to sad data-state after tears finish (optional UX)
                    plantState.setAttribute('data-state', 'sad');
                    if (waterOverlay) waterOverlay.classList.remove('active');
                    simulationBtn.classList.remove('active');
                }, 4000); // 4 seconds of crying animation
            }
        });
    }

    // Crop Hub Interactive Logic
    const crops = [
        "Wheat (गेहूं)", "Rice (चावल)", "Maize (मक्का)", "Sugarcane (गन्ना)", 
        "Cotton (कपास)", "Soybean (सोयाबीन)", "Mustard (सरसों)", "Potato (आलू)", 
        "Tomato (टमाटर)", "Onion (प्याज)", "Barley (जौ)", "Millets (बाजरा)", 
        "Gram (चना)", "Peas (मटर)", "Groundnut (मूंगफली)"
    ];

    const cropDropdown = document.getElementById('cropDropdown');
    const dropdownSelected = document.getElementById('dropdownSelected');
    const dropdownList = document.getElementById('dropdownList');
    const sowingDateInput = document.getElementById('sowingDate');
    const startCropJourneyBtn = document.getElementById('startCropJourneyBtn');
    
    const cropJourneySection = document.getElementById('cropJourneySection');
    const fertigationHistorySection = document.getElementById('fertigationHistorySection');

    // Populate drop down natively
    if (cropDropdown && dropdownSelected && dropdownList) {
        crops.forEach(crop => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerText = crop;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownSelected.innerText = crop;
                dropdownSelected.classList.add('has-value');
                cropDropdown.classList.remove('open');
            });
            dropdownList.appendChild(item);
        });

        // Toggle drop down
        dropdownSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            cropDropdown.classList.toggle('open');
        });

        // Close when clicking safely outside
        document.addEventListener('click', (e) => {
            if (!cropDropdown.contains(e.target)) {
                cropDropdown.classList.remove('open');
            }
        });
    }

    // Process selection expanding into journey
    if (startCropJourneyBtn) {
        startCropJourneyBtn.addEventListener('click', () => {
            const selectedCrop = dropdownSelected.innerText;
            const selectedDate = sowingDateInput.value;

            if (selectedCrop === "Select your crop" || !selectedDate) {
                alert("Please select a crop and sowing date first.");
                return;
            }

            // Remove hidden
            cropJourneySection.classList.remove('hidden');
            fertigationHistorySection.classList.remove('hidden');

            // Apply data parameters to tracker view
            document.getElementById('detailName').innerText = selectedCrop;
            document.getElementById('detailDate').innerText = new Date(selectedDate).toDateString();
            
            let daysPassed = Math.floor((new Date() - new Date(selectedDate)) / (1000 * 60 * 60 * 24));
            if (daysPassed < 0) daysPassed = 0;
            document.getElementById('detailDays').innerText = daysPassed + " days";

            document.getElementById('detailStage').innerText = "Vegetative (Stage 2)";
            document.getElementById('detailStageProgress').innerText = "24 / 45 Days";
            
            setTimeout(() => {
                const fillBar = document.getElementById('cropProgressFill');
                const fillText = document.getElementById('cropProgressText');
                if (fillBar && fillText) {
                    fillBar.style.width = "53%";
                    fillText.innerText = "53%";
                }
            }, 300);

            // Fetch History Data block mock
            const historyList = document.getElementById('historyList');
            if (historyList) {
                historyList.innerHTML = `
                    <div class="history-item glass-panel">
                        <span class="history-time">Today, 08:30 AM</span>
                        <span class="history-status">Fertigation completed</span>
                    </div>
                    <div class="history-item glass-panel">
                        <span class="history-time">Yesterday, 18:45 PM</span>
                        <span class="history-status" style="color: #4FC3F7;">Fertigation started</span>
                    </div>
                    <div class="history-item glass-panel">
                        <span class="history-time">16 Mar, 07:15 AM</span>
                        <span class="history-status">Fertigation cycle run</span>
                    </div>
                `;
            }

            // Slide viewport comfortably into the populated data
            cropJourneySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Fertilize Hub Logic
    const startFertilizeBtn = document.getElementById('startFertilizeBtn');
    if (startFertilizeBtn) {
        startFertilizeBtn.addEventListener('click', () => {
            startFertilizeBtn.classList.add('pulse');
            setTimeout(() => startFertilizeBtn.classList.remove('pulse'), 500);
            
            // Add custom logic such as deploying commands to the backend via websockets, 
            // downloading CSV hooks, mapping notifications, etc.
        });
    }

    // Scroll Animations Observer
    const fxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it contains NPK fills, map the width transitions now that it's visible
                const fills = entry.target.querySelectorAll('.fill');
                fills.forEach(fill => {
                    const val = parseFloat(fill.getAttribute('data-value'));
                    if (val && fill.classList.contains('nitrogen')) fill.style.width = (val / 50 * 100) + '%';
                    if (val && fill.classList.contains('phosphorus')) fill.style.width = (val / 50 * 100) + '%';
                    if (val && fill.classList.contains('potassium')) fill.style.width = (val / 50 * 100) + '%';
                });
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-up').forEach(el => fxObserver.observe(el));

    // ------------------------------------- //
    // Interactive Fertilize Plant           //
    // ------------------------------------- //
    const startFertBtn = document.getElementById('startFertilizeBtn');
    const fertPlant = document.getElementById('fertPlant');
    const waterDrops = document.getElementById('waterDrops');

    if (startFertBtn && fertPlant && waterDrops) {
        startFertBtn.addEventListener('click', () => {
            waterDrops.classList.remove('hidden', 'watering');
            
            // Force reflow to restart animation instantly if mashed multiple times
            void waterDrops.offsetWidth; 
            
            waterDrops.classList.add('watering');
            
            setTimeout(() => {
                fertPlant.classList.remove('plant-grow-bounce');
                void fertPlant.offsetWidth;
                fertPlant.classList.add('plant-grow-bounce');
                
                setTimeout(() => {
                    waterDrops.classList.add('hidden');
                    fertPlant.classList.remove('plant-grow-bounce');
                }, 1500);
            }, 800);
        });
    }

});
