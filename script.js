document.addEventListener('DOMContentLoaded', () => {
    console.log("AgroPULSE initialized.");

    let sensorChart;

    // Navbar Interaction Logic & Progression System
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const mainWrapper = document.querySelector('.main-wrapper');

    window.unlockedSections = {
        home: true,
        insights: false,
        recommended: false,
        crops: false,
        sell: false,
        "become-seller": true
    };

    window.unlockSection = function(id) {
        window.unlockedSections[id] = true;
        updateNavLocks();
    };

    function updateNavLocks() {
        navLinks.forEach(l => {
            const href = l.getAttribute('href');
            if (!href.startsWith('#')) {
                l.style.pointerEvents = 'auto';
                l.style.opacity = '1';
                l.style.cursor = 'pointer';
                return;
            }
            const id = href.substring(1);
            if (!window.unlockedSections[id]) {
                l.style.pointerEvents = 'none';
                l.style.opacity = '0.4';
                l.style.cursor = 'not-allowed';
            } else {
                l.style.pointerEvents = 'auto';
                l.style.opacity = '1';
                l.style.cursor = 'pointer';
            }
        });
    }

    window.switchTab = function(targetId) {
        if (!window.unlockedSections[targetId]) return;

        // Hide all sections strictly
        sections.forEach(sec => {
            sec.style.display = 'none';
        });

        if (targetId === 'home') {
            if (mainWrapper) mainWrapper.style.display = 'none';
        } else {
            if (mainWrapper) mainWrapper.style.display = '';
        }

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block'; 
            
            targetSection.style.opacity = '0';
            targetSection.style.transition = 'opacity 0.4s ease-in-out';
            setTimeout(() => {
                targetSection.style.opacity = '1';
                if (targetId === 'insights' && sensorChart) {
                    sensorChart.resize();
                }
            }, 10);
        }

        navLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href') === `#${targetId}`) {
                l.classList.add('active');
            }
        });
        
        window.scrollTo(0, 0);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href.startsWith('#')) return; // Allow external links to work naturally
            
            e.preventDefault(); 
            const targetId = href.substring(1);
            window.switchTab(targetId);
        });
    });

    const btnStartGrowing = document.getElementById('btnStartGrowing');
    if (btnStartGrowing) {
        btnStartGrowing.addEventListener('click', () => {
            window.unlockSection('insights');
            window.switchTab('insights');
        });
    }

    window.switchTab('home');
    updateNavLocks();

    switchTab('home');

    const btnMoveFurther = document.getElementById('btnMoveFurther');
    if (btnMoveFurther) {
        btnMoveFurther.addEventListener('click', () => {
            window.unlockSection('recommended');
            window.switchTab('recommended');
        });
    }

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

        // Filter Buttons Logic
        const filterBtns = document.querySelectorAll('.graph-header .filter-btn');
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked
                    btn.classList.add('active');

                    // Generate mock data based on range
                    const range = btn.getAttribute('data-range');
                    let numPoints = 7;
                    let labelPrefix = '';
                    
                    if (range === '1h') { numPoints = 4; labelPrefix = 'Min'; }
                    else if (range === '6h') { numPoints = 6; labelPrefix = 'Hr'; }
                    else if (range === '24h') { numPoints = 8; labelPrefix = 'Hr'; }
                    else if (range === '7d') { numPoints = 7; labelPrefix = 'Day'; }
                    else { numPoints = 7; labelPrefix = 'Time'; }

                    const mockLabels = [];
                    const mockHumidity = [];
                    const mockMoisture = [];
                    const mockTemp = [];

                    for (let i = 1; i <= numPoints; i++) {
                        mockLabels.push(`${labelPrefix} ${i}`);
                        mockHumidity.push(45 + Math.random() * 20);
                        mockMoisture.push(40 + Math.random() * 20);
                        mockTemp.push(25 + Math.random() * 10);
                    }

                    sensorChart.data.labels = mockLabels;
                    sensorChart.data.datasets[0].data = mockHumidity;
                    sensorChart.data.datasets[1].data = mockMoisture;
                    sensorChart.data.datasets[2].data = mockTemp;
                    sensorChart.update();
                });
            });
        }
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
    // Field Setup Flow Logic                //
    // ------------------------------------- //
    const imageUploadArea = document.getElementById('imageUploadArea');
    const fieldImageInput = document.getElementById('fieldImageInput');
    const imageThumbnails = document.getElementById('imageThumbnails');
    const btnConnectDevice = document.getElementById('btnConnectDevice');
    const connectionStatusText = document.getElementById('connectionStatusText');
    const fieldMappingBox = document.getElementById('fieldMappingBox');
    const simulatedMapArea = document.getElementById('simulatedMapArea');
    const btnMoveToNextPoint = document.getElementById('btnMoveToNextPoint');
    const analysisCompletedText = document.getElementById('analysisCompletedText');
    const statisticalDataSection = document.getElementById('statisticalDataSection');
    const fieldSetupFlow = document.getElementById('fieldSetupFlow');
    const fieldSizeInput = document.getElementById('fieldSizeInput');

    let uploadedImages = [];
    const angleLabels = ["Front side", "Back side", "Left side", "Right side"];
    const imageCountFeedback = document.getElementById('imageCountFeedback');
    const imageUploadError = document.getElementById('imageUploadError');

    // Initialize button styling (Faded state)
    if (btnConnectDevice) {
        btnConnectDevice.style.opacity = '0.5';
        btnConnectDevice.style.transition = 'all 0.3s ease';
    }

    function updateImageUI() {
        if (!imageThumbnails) return;
        imageThumbnails.innerHTML = '';
        
        uploadedImages.slice(0, 4).forEach((src, i) => {
            // Safe removal handling by setting data-index
            imageThumbnails.innerHTML += `
                <div style="position: relative; width: 80px; flex-shrink: 0; text-align: center;">
                    <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(163,230,53,0.4); position: relative;">
                        <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div class="remove-img-btn" onclick="removeImage(${i})" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.3);">✕</div>
                    </div>
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.8); display: block; margin-top: 6px; font-weight: 500;">${angleLabels[i]}</span>
                </div>
            `;
        });

        const count = uploadedImages.length;
        if (imageCountFeedback) {
            if (count >= 4) {
                imageCountFeedback.innerHTML = `All field angles captured ✔`;
                imageCountFeedback.style.color = '#A3E635';
                imageCountFeedback.style.textShadow = '0 0 10px rgba(163,230,53,0.3)';
                if (imageUploadArea) {
                    imageUploadArea.style.borderStyle = 'solid';
                    imageUploadArea.style.borderColor = '#A3E635';
                    imageUploadArea.style.background = 'rgba(163,230,53,0.05)';
                    imageUploadArea.querySelector('span:last-child').innerText = `4 photos added`;
                }
                if (btnConnectDevice) {
                    btnConnectDevice.style.opacity = '1';
                }
                if (imageUploadError) imageUploadError.style.display = 'none';
            } else {
                imageCountFeedback.innerHTML = `${count} / 4 images uploaded`;
                imageCountFeedback.style.color = 'rgba(255,255,255,0.7)';
                imageCountFeedback.style.textShadow = 'none';
                if (imageUploadArea) {
                    imageUploadArea.style.borderStyle = 'dashed';
                    imageUploadArea.style.borderColor = 'rgba(163, 230, 53, 0.4)';
                    imageUploadArea.style.background = 'rgba(255,255,255,0.05)';
                    imageUploadArea.querySelector('span:last-child').innerText = `Tap to upload photos`;
                }
                if (btnConnectDevice) {
                    btnConnectDevice.style.opacity = '0.5';
                }
            }
        }
    }

    // Global helper for inline onclick
    window.removeImage = function(idx) {
        uploadedImages.splice(idx, 1);
        updateImageUI();
    };

    if (imageUploadArea && fieldImageInput) {
        imageUploadArea.addEventListener('click', () => {
            fieldImageInput.click();
        });

        fieldImageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            
            // Limit to max 4 total
            const slotsLeft = 4 - uploadedImages.length;
            const filesToAdd = files.slice(0, slotsLeft);
            
            filesToAdd.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    uploadedImages.push(ev.target.result);
                    updateImageUI();
                };
                reader.readAsDataURL(file);
            });
            // Reset input
            fieldImageInput.value = '';
        });
    }

    if (btnConnectDevice) {
        btnConnectDevice.addEventListener('click', () => {
            if (uploadedImages.length < 4 || !fieldSizeInput.value.trim()) {
                if (imageUploadError) {
                    imageUploadError.style.display = 'block';
                    // Shake animation effect
                    imageUploadError.style.transform = 'translateX(-5px)';
                    setTimeout(() => imageUploadError.style.transform = 'translateX(5px)', 100);
                    setTimeout(() => imageUploadError.style.transform = 'translateX(-5px)', 200);
                    setTimeout(() => imageUploadError.style.transform = 'translateX(0)', 300);
                }
                return;
            }
            if (imageUploadError) imageUploadError.style.display = 'none';
            
            btnConnectDevice.style.display = 'none';
            connectionStatusText.style.display = 'block';
            
            // Blinking Connecting
            connectionStatusText.innerText = 'Connecting...';
            connectionStatusText.style.color = '#fff';

            let dots = 0;
            const blinkInterval = setInterval(() => {
                dots = (dots + 1) % 4;
                connectionStatusText.innerText = 'Connecting' + '.'.repeat(dots);
            }, 500);

            setTimeout(() => {
                clearInterval(blinkInterval);
                connectionStatusText.innerText = 'Connected Successfully';
                connectionStatusText.style.color = '#A3E635';
                connectionStatusText.style.textShadow = '0 0 10px rgba(163,230,53,0.5)';
                
                setTimeout(() => {
                    startFieldMapping();
                }, 1000);
            }, 2500);
        });
    }

    function startFieldMapping() {
        if (!fieldMappingBox) return;
        
        fieldMappingBox.style.display = 'block';
        fieldMappingBox.style.opacity = '0';
        fieldMappingBox.style.transition = 'opacity 0.4s ease';
        setTimeout(() => fieldMappingBox.style.opacity = '1', 10);

        simulatedMapArea.innerHTML = '';
        mapPoints = [];
        currentActivePoint = 0;

        // 5 Fixed points: 4 corners + center
        const fixedPositions = [
            {top: 20, left: 20, label: "NW"},
            {top: 20, left: 80, label: "NE"},
            {top: 80, left: 20, label: "SW"},
            {top: 80, left: 80, label: "SE"},
            {top: 50, left: 50, label: "Center"}
        ];

        fixedPositions.forEach((pos, i) => {
            const pt = document.createElement('div');
            pt.style.cssText = `
                position: absolute;
                top: ${pos.top}%;
                left: ${pos.left}%;
                width: 24px;
                height: 24px;
                background: rgba(255,255,255,0.3);
                border: 2px solid rgba(255,255,255,0.8);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.4s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: transparent;
                z-index: 2;
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
            `;
            
            // Optional label
            const label = document.createElement('span');
            label.innerText = pos.label;
            label.style.cssText = `
                position: absolute;
                top: -22px;
                left: 50%;
                transform: translateX(-50%);
                color: #ffffff;
                font-size: 0.8rem;
                font-weight: bold;
                white-space: nowrap;
                text-shadow: 0 1px 4px rgba(0,0,0,0.8);
            `;
            pt.appendChild(label);
            
            simulatedMapArea.appendChild(pt);
            mapPoints.push(pt);
        });
        
        // Start automatic simulation
        activateNextPoint();
    }

    function activateNextPoint() {
        const feedbackText = document.getElementById('analysisFeedbackText');
        const btnScrollToStats = document.getElementById('btnScrollToStats');
        
        if (currentActivePoint >= mapPoints.length) {
            // All completed
            if (feedbackText) {
                feedbackText.innerText = "Analysis Completed ✨";
                feedbackText.style.color = "#A3E635";
            }
            if (btnScrollToStats) {
                btnScrollToStats.style.display = 'inline-block';
            }
            // Zoom out slightly
            simulatedMapArea.style.transform = 'scale(1)';
            
            // Unlock next section
            window.unlockSection('recommended');
            return;
        }

        const pt = mapPoints[currentActivePoint];
        
        // Zoom slightly to active point
        simulatedMapArea.style.transform = `scale(1.05)`;

        // Turn RED (Active)
        pt.style.background = 'rgba(255, 75, 43, 0.6)';
        pt.style.borderColor = '#ff4b2b';
        pt.style.boxShadow = '0 0 20px rgba(255,75,43,0.8)';
        
        if (feedbackText) {
            feedbackText.innerText = `Analyzing area: ${pt.querySelector('span').innerText}...`;
            feedbackText.style.color = '#ff4b2b';
        }

        setTimeout(() => {
            // Turn GREEN (Completed)
            pt.style.background = 'rgba(163, 230, 53, 0.6)';
            pt.style.borderColor = '#A3E635';
            pt.style.boxShadow = '0 0 15px rgba(163,230,53,0.6)';
            pt.innerHTML += '✔'; // Add checkmark
            pt.style.color = '#000';
            
            if (feedbackText) {
                feedbackText.innerText = `Area analyzed successfully`;
                feedbackText.style.color = '#A3E635';
            }
            
            currentActivePoint++;
            
            // Wait slightly before next point
            setTimeout(() => {
                activateNextPoint();
            }, 800);
            
        }, 1200); // 1.2s analysis per point
    }

    const btnScrollToStats = document.getElementById('btnScrollToStats');
    if (btnScrollToStats) {
        btnScrollToStats.addEventListener('click', () => {
            // STEP 1: Reveal sensor section smoothly
            const readingsSection = document.querySelector('.sensor-content > .readings-section');
            const graphSection = document.querySelector('.graph-section');
            if (readingsSection) {
                readingsSection.classList.remove('hidden');
                readingsSection.style.opacity = 0;
                setTimeout(() => { readingsSection.style.opacity = 1; readingsSection.style.transition = 'opacity 0.5s ease'; }, 10);
            }
            if (graphSection) {
                graphSection.classList.remove('hidden');
                graphSection.style.opacity = 0;
                setTimeout(() => { graphSection.style.opacity = 1; graphSection.style.transition = 'opacity 0.5s ease'; }, 10);
            }

            // STEP 2: Scroll to the statistical data section smoothly
            const statisticalDataSection = document.getElementById('statisticalDataSection');
            if (statisticalDataSection) {
                setTimeout(() => {
                    statisticalDataSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50); // slight delay to ensure display renders before calculating scroll position
            }
        });
    }

    // ------------------------------------- //
    // Interactive Fertilize Plant           //
    // ------------------------------------- //
    const startFertBtn = document.getElementById('startFertilizeBtn');
    const fertPlant = document.getElementById('fertPlant');
    const waterDrops = document.getElementById('waterDrops');

    if (startFertBtn && fertPlant && waterDrops) {
        startFertBtn.addEventListener('click', () => {
            window.unlockSection('sell');
            
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

    // ------------------------------------- //
    // Recommended Crops Logic               //
    // ------------------------------------- //
    const cropCountInput = document.getElementById('cropCountInput');
    const cropSuggestionsContainer = document.getElementById('cropSuggestionsContainer');
    const customCropSection = document.getElementById('customCropSection');
    const btnContinueCustom = document.getElementById('btnContinueCustom');
    const btnGoSuggested = document.getElementById('btnGoSuggested');

    const recommendedCropsData = [
        { name: "Wheat", icon: "🌾" }, { name: "Rice", icon: "🍚" },
        { name: "Maize", icon: "🌽" }, { name: "Cotton", icon: "🧶" },
        { name: "Soybean", icon: "🌱" }, { name: "Mustard", icon: "🌼" },
        { name: "Potato", icon: "🥔" }, { name: "Tomato", icon: "🍅" },
        { name: "Onion", icon: "🧅" }, { name: "Barley", icon: "🌾" },
        { name: "Millets", icon: "🌾" }
    ];

    if (cropCountInput) {
        cropCountInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) {
                cropSuggestionsContainer.style.display = 'none';
                customCropSection.style.display = 'none';
                return;
            }
            if (val > 10) val = 10;
            
            // Clear existing
            cropSuggestionsContainer.innerHTML = '';
            const customInputsContainer = document.getElementById('customInputsContainer');
            if (customInputsContainer) customInputsContainer.innerHTML = '';
            
            // Generate suggested cards (Show N crops)
            for (let i = 0; i < val && i < recommendedCropsData.length; i++) {
                const crop = recommendedCropsData[i];
                const card = document.createElement('div');
                card.className = 'sensor-card glass-panel crop-suggestion-card';
                card.style.cursor = 'pointer';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                card.innerHTML = `
                    <div class="sensor-header" style="justify-content: space-between; margin-bottom: 5px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.5rem;">${crop.icon}</span>
                            <h4 style="color: #fff; font-size: 1.2rem; margin: 0;">${crop.name}</h4>
                        </div>
                        <div class="selection-indicator" style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; transition: all 0.2s;"></div>
                    </div>
                    <div class="sensor-data" style="margin-top: 15px;">
                        <span class="confidence-badge" style="background: rgba(163, 230, 53, 0.1); border: 1px solid rgba(163, 230, 53, 0.3); color: #A3E635; font-size: 0.75rem; padding: 4px 10px; box-shadow: none;">Low input • High yield</span>
                    </div>
                `;
                
                // Toggle selection logic
                card.addEventListener('click', () => {
                    card.classList.toggle('selected-crop');
                    const indicator = card.querySelector('.selection-indicator');
                    if (card.classList.contains('selected-crop')) {
                        card.style.borderColor = '#A3E635';
                        card.style.background = 'rgba(163, 230, 53, 0.15)';
                        indicator.style.borderColor = '#A3E635';
                        indicator.style.background = '#A3E635';
                        indicator.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    } else {
                        card.style.borderColor = ''; 
                        card.style.background = ''; 
                        indicator.style.borderColor = 'rgba(255,255,255,0.3)';
                        indicator.style.background = 'transparent';
                        indicator.innerHTML = '';
                    }
                });
                
                cropSuggestionsContainer.appendChild(card);
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    setTimeout(() => {
                        card.style.opacity = '';
                        card.style.transform = '';
                    }, 400);
                }, 50 * i + 10);
            }

            // Generate N custom input boxes
            for (let i = 0; i < val; i++) {
                const inputWrap = document.createElement('div');
                inputWrap.className = 'date-field';
                inputWrap.style.opacity = '0';
                inputWrap.style.transform = 'translateY(20px)';
                inputWrap.style.transition = 'all 0.3s ease';
                
                inputWrap.innerHTML = `
                    <div class="date-wrapper">
                        <span class="date-icon mic-btn" style="pointer-events: auto; cursor: pointer; z-index: 10;" title="Click to speak">🎤</span>
                        <input type="text" class="date-input custom-crop-input" placeholder="Enter crop name...">
                    </div>
                `;
                
                if (customInputsContainer) customInputsContainer.appendChild(inputWrap);
                
                // Bind Speech API to this specific input
                const mic = inputWrap.querySelector('.mic-btn');
                const inp = inputWrap.querySelector('.custom-crop-input');
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                
                if (SpeechRecognition && mic && inp) {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = false;
                    recognition.interimResults = false;
                    
                    mic.addEventListener('click', () => {
                        try {
                            recognition.start();
                            mic.style.opacity = '0.5';
                            mic.innerText = '🎙️';
                        } catch(e) {}
                    });
                    
                    recognition.onresult = (event) => {
                        inp.value = event.results[0][0].transcript;
                        mic.style.opacity = '1';
                        mic.innerText = '🎤';
                    };
                    
                    recognition.onerror = () => {
                        mic.style.opacity = '1';
                        mic.innerText = '🎤';
                    };
                    
                    recognition.onend = () => {
                        mic.style.opacity = '1';
                        mic.innerText = '🎤';
                    };
                } else if (mic) {
                    mic.addEventListener('click', () => alert("Speech recognition is not supported in your browser."));
                }
                
                setTimeout(() => {
                    inputWrap.style.opacity = '1';
                    inputWrap.style.transform = 'translateY(0)';
                    setTimeout(() => {
                        inputWrap.style.opacity = '';
                        inputWrap.style.transform = '';
                    }, 400);
                }, 50 * i + 10);
            }
            
            // Show containers
            cropSuggestionsContainer.style.display = 'grid'; // matches .sensor-grid
            customCropSection.style.display = 'block';
            
            // Smooth fade in for custom section
            customCropSection.style.opacity = '0';
            customCropSection.style.transition = 'opacity 0.4s ease';
            setTimeout(() => customCropSection.style.opacity = '1', 10);
        });
    }

    // Action Buttons logic
    const cropSelectionError = document.getElementById('cropSelectionError');
    const recommendedCropsModule = document.getElementById('recommended-crops-module');
    const cropResultsModule = document.getElementById('cropResultsModule');
    const btnBackToSelection = document.getElementById('btnBackToSelection');

    function proceedWithCrops(cropsArray) {
        if (!cropsArray || cropsArray.length === 0) {
            if (cropSelectionError) cropSelectionError.style.display = 'block';
            return;
        }
        if (cropSelectionError) cropSelectionError.style.display = 'none';

        // Unlock Crops section upon crop selection
        window.unlockSection('crops');

        // Hide selection UI and show results
        if (recommendedCropsModule) {
            recommendedCropsModule.style.opacity = '0';
            setTimeout(() => {
                recommendedCropsModule.style.display = 'none';
                populateResults(cropsArray);
                if (cropResultsModule) {
                    cropResultsModule.style.display = 'block';
                    setTimeout(() => {
                        cropResultsModule.style.opacity = '1';
                    }, 50);
                }
            }, 300);
        }
    }

    function populateResults(cropsArray) {
        const rawMaterialsContainer = document.getElementById('rawMaterialsContainer');
        const fertilizersContainer = document.getElementById('fertilizersContainer');
        const sellersContainer = document.getElementById('sellersContainer');
        
        const cropString = cropsArray.join(', ');

        const cropsTabsContainer = document.getElementById('cropsTabsContainer');
        if (cropsTabsContainer && cropsArray.length > 0) {
            cropsTabsContainer.innerHTML = '';
            cropsArray.forEach((crop, idx) => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn' + (idx === 0 ? ' active' : '');
                btn.style.fontSize = '1rem';
                btn.style.padding = '10px 25px';
                btn.innerText = crop;
                btn.onclick = () => {
                    Array.from(cropsTabsContainer.children).forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    updateCropDashboard(crop);
                };
                cropsTabsContainer.appendChild(btn);
            });
            // Init first crop
            updateCropDashboard(cropsArray[0]);
        }

        // Populate Raw Materials
        if (rawMaterialsContainer) {
            rawMaterialsContainer.innerHTML = '';
            cropsArray.forEach((crop, i) => {
                rawMaterialsContainer.innerHTML += `
                    <div class="sensor-card glass-panel" style="padding: 15px; opacity: 0; transform: translateY(15px); animation: fadeUp 0.4s ease forwards ${i * 0.1}s;">
                        <h5 style="color: #A3E635; font-size: 1.05rem; margin: 0 0 8px 0;">${crop}</h5>
                        <ul style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.5; padding-left: 18px; margin: 0;">
                            <li>Seeds: 20 kg/acre</li>
                            <li>Water req: Medium</li>
                            <li>Soil: Loamy, drained</li>
                            <li>Tools: Basic</li>
                        </ul>
                    </div>
                `;
            });
        }

        // Populate Fertilizers
        if (fertilizersContainer) {
            fertilizersContainer.innerHTML = `
                <div class="sensor-card glass-panel" style="padding: 15px; opacity: 0; transform: translateY(15px); animation: fadeUp 0.4s ease forwards 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h5 style="color: #fff; font-size: 1rem; margin: 0;">Urea</h5>
                        <span class="confidence-badge" style="background: rgba(163, 230, 53, 0.1); border: 1px solid rgba(163, 230, 53, 0.3); color: #A3E635; padding: 3px 8px; font-size: 0.75rem;">50kg/acre</span>
                    </div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin: 0;">Applies to: ${cropString}</p>
                </div>
                <div class="sensor-card glass-panel" style="padding: 15px; opacity: 0; transform: translateY(15px); animation: fadeUp 0.4s ease forwards 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h5 style="color: #fff; font-size: 1rem; margin: 0;">DAP</h5>
                        <span class="confidence-badge" style="background: rgba(163, 230, 53, 0.1); border: 1px solid rgba(163, 230, 53, 0.3); color: #A3E635; padding: 3px 8px; font-size: 0.75rem;">30kg/acre</span>
                    </div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin: 0;">Applies to: ${cropString}</p>
                </div>
            `;
        }

        // Populate Sellers
        if (sellersContainer) {
            const sellersData = [
                { name: "Ramesh Agro Store", location: "Bhopal", phone: "9876543210" },
                { name: "Kisan Suvidha Kendra", location: "Indore", phone: "9876543211" },
                { name: "Green Earth Fertilizers", location: "Ujjain", phone: "9876543212" },
                { name: "AgriTech Solutions", location: "Sehore", phone: "9876543213" },
                { name: "Modern Farm Supplies", location: "Vidisha", phone: "9876543214" }
            ];
            sellersContainer.innerHTML = '';
            sellersData.forEach((seller, i) => {
                sellersContainer.innerHTML += `
                    <a href="tel:${seller.phone}" style="text-decoration: none; display: block; outline: none; opacity: 0; transform: translateY(15px); animation: fadeUp 0.4s ease forwards ${0.4 + (i * 0.1)}s;">
                        <div class="sensor-card glass-panel" style="background: rgba(0, 0, 0, 0.4); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease;">
                            <div>
                                <h5 style="color: #fff; font-size: 1.05rem; margin: 0 0 5px 0;">${seller.name}</h5>
                                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin: 0;">📍 ${seller.location}</p>
                            </div>
                            <div style="background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.4); padding: 8px 12px; border-radius: 50px; display: flex; align-items: center; gap: 6px;">
                                <span style="font-size: 0.9rem;">📞</span> <span style="color: #A3E635; font-weight: 500; font-size: 0.9rem;">${seller.phone}</span>
                            </div>
                        </div>
                    </a>
                `;
            });
        }
    }

    if (btnContinueCustom && btnGoSuggested) {
        btnContinueCustom.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.custom-crop-input');
            const customVals = Array.from(inputs).map(inp => inp.value.trim()).filter(v => v);
            
            // Logic Priority: If user fills custom boxes → use those crops
            // We use proceedWithCrops which enforces at least 1
            proceedWithCrops(customVals);
        });

        btnGoSuggested.addEventListener('click', () => {
            const selected = document.querySelectorAll('.selected-crop h4');
            const suggestedVals = Array.from(selected).map(el => el.innerText);
            proceedWithCrops(suggestedVals);
        });
    }

    if (btnBackToSelection) {
        btnBackToSelection.addEventListener('click', () => {
            if (cropResultsModule && recommendedCropsModule) {
                cropResultsModule.style.opacity = '0';
                setTimeout(() => {
                    cropResultsModule.style.display = 'none';
                    recommendedCropsModule.style.display = 'block';
                    setTimeout(() => {
                        recommendedCropsModule.style.opacity = '1';
                    }, 50);
                }, 300);
            }
        });
    }

    const btnScrollToCrops = document.getElementById('btnScrollToCrops');
    if (btnScrollToCrops) {
        btnScrollToCrops.addEventListener('click', () => {
            window.switchTab('crops');
        });
    }

    const btnSellYourCrop = document.getElementById('btnSellYourCrop');
    if (btnSellYourCrop) {
        btnSellYourCrop.addEventListener('click', () => {
            window.unlockSection('sell');
            window.switchTab('sell');
        });
    }

    window.updateCropDashboard = function(cropName) {
        const detailDate = document.getElementById('detailDate');
        const detailDays = document.getElementById('detailDays');
        const detailProgress = document.getElementById('detailProgress');
        const valN = document.getElementById('val-n');
        const valP = document.getElementById('val-p');
        const valK = document.getElementById('val-k');
        const totalFertText = document.getElementById('totalFertilizerText');
        const fillN = document.querySelector('.fill.nitrogen');
        const fillP = document.querySelector('.fill.phosphorus');
        const fillK = document.querySelector('.fill.potassium');
        const journeyLineFill = document.getElementById('journeyLineFill');
        
        let cropLen = cropName.length;
        
        // Dynamic NPK
        let n = 30 + (cropLen * 2.5);
        let p = 15 + (cropLen * 1.5);
        let k = 20 + (cropLen * 2);
        
        if (valN) valN.innerText = n.toFixed(1) + " kg";
        if (valP) valP.innerText = p.toFixed(1) + " kg";
        if (valK) valK.innerText = k.toFixed(1) + " kg";
        if (totalFertText) totalFertText.innerText = (n + p + k).toFixed(1) + " kg/acre";
        
        if (fillN) fillN.style.width = Math.min(100, n) + "%";
        if (fillP) fillP.style.width = Math.min(100, p) + "%";
        if (fillK) fillK.style.width = Math.min(100, k) + "%";

        // Dynamic Journey
        let totalLife = 60 + (cropLen * 8);
        let sownDaysAgo = 15 + (cropLen * 2);
        
        let sownDateObj = new Date();
        sownDateObj.setDate(sownDateObj.getDate() - sownDaysAgo);
        
        if (detailDate) detailDate.innerText = sownDateObj.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
        if (detailDays) detailDays.innerText = totalLife + " days";
        if (detailProgress) detailProgress.innerText = sownDaysAgo + " / " + totalLife + " days";
        
        // Progress stage line
        let pct = (sownDaysAgo / totalLife) * 100;
        if (journeyLineFill) journeyLineFill.style.width = pct + "%";
    }

    // ===================================== //
    // Sell Your Crop Section Logic          //
    // ===================================== //
    const industryRequestsContainer = document.getElementById('industryRequestsContainer');
    const messageDialogOverlay = document.getElementById('messageDialogOverlay');
    const btnCancelMessage = document.getElementById('btnCancelMessage');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const cropAmountInput = document.getElementById('cropAmountInput');
    const dialogIndustryName = document.getElementById('dialogIndustryName');

    let currentIndustryRow = null;

    const industriesData = [
        { name: "Global Agro Foods", location: "Mumbai", crops: ["Wheat", "Rice"], status: "pending" },
        { name: "Green Valley Organics", location: "Pune", crops: ["Tomato"], status: "pending" },
        { name: "National Grain Corp", location: "Delhi", crops: ["Maize", "Wheat", "Barley"], status: "pending" },
        { name: "Fresh Harvest Distributors", location: "Nashik", crops: ["Onion", "Tomato", "Potato"], status: "pending" }
    ];

    // Sync from localStorage
    function syncLocalStorageRequests() {
        const storedBuyerRequests = JSON.parse(localStorage.getItem('buyerRequests') || '[]');
        // We avoid duplicating existing stored requests by tracking them
        storedBuyerRequests.forEach(req => {
            const exists = industriesData.find(ind => ind.id === req.id);
            if (!exists) {
                industriesData.unshift({
                    id: req.id,
                    name: req.buyerName + " (Direct)",
                    location: req.location,
                    crops: [req.crop],
                    status: "pending",
                    timestamp: req.timestamp
                });
            }
        });
    }

    function renderIndustryRequests() {
        if (!industryRequestsContainer) return;
        syncLocalStorageRequests();
        industryRequestsContainer.innerHTML = '';
        
        industriesData.forEach((ind, index) => {
            if (ind.status === 'rejected') return;
            
            const row = document.createElement('div');
            row.className = 'glass-panel';
            row.style.cssText = 'padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; transition: all 0.3s ease;';
            
            const cropListText = ind.crops.length > 1 ? `[${ind.crops.join(', ')}]` : ind.crops[0];

            let rightSideHTML = '';
            if (ind.status === 'responded') {
                rightSideHTML = `<span style="color: #A3E635; font-weight: bold; background: rgba(163,230,53,0.1); padding: 8px 16px; border-radius: 50px;">✓ Responded (Data Attached)</span>`;
            } else {
                rightSideHTML = `
                    <div style="flex: 1; min-width: 150px; max-width: 200px; height: 10px; background: rgba(255,255,255,0.05); border-radius: 50px;"></div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-reject" data-index="${index}" style="padding: 10px 20px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.borderColor='#ff4b2b'; this.style.color='#ff4b2b';" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.color='#fff';">Reject</button>
                        <button class="btn-message" data-index="${index}" style="padding: 10px 20px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.borderColor='#A3E635'; this.style.color='#A3E635';" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.color='#fff';">Message</button>
                    </div>
                `;
            }

            row.innerHTML = `
                <div style="flex: 1; min-width: 250px;">
                    <h4 style="color: #fff; margin: 0 0 5px 0; font-size: 1.15rem;">${ind.name} <span style="font-size: 0.85rem; color: rgba(255,255,255,0.6); font-weight: normal;">📍 ${ind.location}</span></h4>
                    <span style="color: #A3E635; font-size: 0.95rem;">Interest: ${ind.name} ${cropListText}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 20px; flex: 2; justify-content: flex-end; flex-wrap: wrap;">
                    ${rightSideHTML}
                </div>
            `;
            industryRequestsContainer.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                industriesData[idx].status = 'rejected';
                renderIndustryRequests();
            });
        });

        document.querySelectorAll('.btn-message').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                currentIndustryRow = idx;
                dialogIndustryName.innerText = "Message to: " + industriesData[idx].name;
                cropAmountInput.value = '';
                messageDialogOverlay.style.display = 'flex';
                setTimeout(() => { messageDialogOverlay.style.opacity = '1'; }, 10);
            });
        });
    }

    if (btnCancelMessage && messageDialogOverlay) {
        btnCancelMessage.addEventListener('click', () => {
            messageDialogOverlay.style.opacity = '0';
            setTimeout(() => { messageDialogOverlay.style.display = 'none'; }, 300);
        });
    }

    if (btnSendMessage && messageDialogOverlay && cropAmountInput) {
        btnSendMessage.addEventListener('click', () => {
            if (!cropAmountInput.value.trim()) return;
            industriesData[currentIndustryRow].status = 'responded';
            
            // Update localStorage to trigger "approved" status in Industrial portal
            const targetId = industriesData[currentIndustryRow].id;
            if (targetId) {
                const storedBuyerRequests = JSON.parse(localStorage.getItem('buyerRequests') || '[]');
                const idx = storedBuyerRequests.findIndex(r => r.id === targetId);
                if (idx !== -1) {
                    storedBuyerRequests[idx].status = 'approved';
                    storedBuyerRequests[idx].quantity = cropAmountInput.value.trim();
                    localStorage.setItem('buyerRequests', JSON.stringify(storedBuyerRequests));
                }
            }

            messageDialogOverlay.style.opacity = '0';
            setTimeout(() => { 
                messageDialogOverlay.style.display = 'none'; 
                renderIndustryRequests();
            }, 300);
        });
        
        cropAmountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnSendMessage.click();
            }
        });
    }

    // Listen for storage events (e.g. from the buyer flow in new tab)
    window.addEventListener('storage', (e) => {
        if (e.key === 'buyerRequests') {
            renderIndustryRequests();
        }
    });

    renderIndustryRequests();

});


document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(".hero-section");
  if (hero) hero.style.display = "block";
});
