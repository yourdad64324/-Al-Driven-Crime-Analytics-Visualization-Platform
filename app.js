// App Controller for AI-Driven Crime Analytics Platform

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. State Management ---
  const state = {
    incidents: [...window.CrimeData.incidents],
    criminals: [...window.CrimeData.criminals],
    networkLinks: [...window.CrimeData.networkLinks],
    districts: { ...window.CrimeData.districts },
    
    // UI state
    activeTab: "tab-overview",
    activeMapLayer: "markers", // 'markers' | 'heatmap'
    filters: {
      district: "all",
      crimeType: "all",
      severity: "all",
      status: "all"
    },
    selectedOffenderId: null,
    correlationVariable: "povertyRate", // povertyRate | unemploymentRate | educationIndex
    
    // AI Sliders state
    aiSelectedDistrict: "Bengaluru South",
    aiTimeOfDay: "Night",
    aiSliders: {
      povertyRate: 8.1,
      unemploymentRate: 3.8,
      educationIndex: 92
    }
  };

  // UI elements
  const tabs = document.querySelectorAll(".nav-tabs .tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  
  // Library instances
  let mapInstance = null;
  let markerLayerGroup = null;
  let heatmapLayerInstance = null;
  let networkInstance = null;
  let correlationChartInstance = null;

  // --- 2. System Clock Initialization ---
  function initClock() {
    const clockEl = document.getElementById("system-clock");
    setInterval(() => {
      const now = new Date();
      // Format: YYYY-MM-DD HH:MM:SS
      const pad = (num) => String(num).padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} UTC`;
      clockEl.textContent = formatted;
    }, 1000);
  }

  // --- 3. Overview Dashboard Statistics ---
  function updateDashboardStats() {
    const filtered = getFilteredIncidents();
    
    // Total Crimes
    document.getElementById("stat-total-crimes").textContent = filtered.length;
    
    // AI Anomaly alerts count
    const alerts = window.AiEngine.detectAnomalies();
    document.getElementById("stat-ai-alerts").textContent = alerts.length;
    
    // Recidivism Threat Index (Average risk of at-large suspects)
    const atLargeCriminals = state.criminals.filter(c => c.status === "At Large");
    const avgRecidivism = atLargeCriminals.reduce((acc, curr) => acc + curr.recidivismRisk, 0) / (atLargeCriminals.length || 1);
    document.getElementById("stat-recidivism-index").textContent = `${Math.round(avgRecidivism)}%`;
    
    // Clearance Rate (solved vs total)
    const solvedCount = filtered.filter(inc => inc.status === "Solved").length;
    const clearance = filtered.length > 0 ? (solvedCount / filtered.length) * 100 : 0;
    document.getElementById("stat-clearance-rate").textContent = `${Math.round(clearance)}%`;
  }

  // --- 4. Incident Filter Logic ---
  function getFilteredIncidents() {
    return state.incidents.filter(inc => {
      const matchDistrict = state.filters.district === "all" || inc.district === state.filters.district;
      const matchType = state.filters.crimeType === "all" || inc.type === state.filters.crimeType;
      const matchSeverity = state.filters.severity === "all" || inc.severity === state.filters.severity;
      const matchStatus = state.filters.status === "all" || inc.status === state.filters.status;
      return matchDistrict && matchType && matchSeverity && matchStatus;
    });
  }

  function setupFilters() {
    const selectDistrict = document.getElementById("filter-district");
    const selectCrimeType = document.getElementById("filter-crime-type");
    const selectSeverity = document.getElementById("filter-severity");
    const selectStatus = document.getElementById("filter-status");
    const btnReset = document.getElementById("btn-reset-filters");

    const handleFilterChange = () => {
      state.filters.district = selectDistrict.value;
      state.filters.crimeType = selectCrimeType.value;
      state.filters.severity = selectSeverity.value;
      state.filters.status = selectStatus.value;
      
      // Update label on map header
      const mapLabel = document.getElementById("map-label-district");
      if (state.filters.district === "all") {
        mapLabel.textContent = "Spatio-Temporal Mapping Platform - All Sectors";
      } else {
        mapLabel.textContent = `Spatio-Temporal Mapping Platform - ${state.districts[state.filters.district].name}`;
        // Centering map on district center
        if (mapInstance) {
          mapInstance.setView(state.districts[state.filters.district].center, 12);
        }
      }

      updateDashboardStats();
      renderMap();
    };

    selectDistrict.addEventListener("change", handleFilterChange);
    selectCrimeType.addEventListener("change", handleFilterChange);
    selectSeverity.addEventListener("change", handleFilterChange);
    selectStatus.addEventListener("change", handleFilterChange);

    btnReset.addEventListener("click", () => {
      selectDistrict.value = "all";
      selectCrimeType.value = "all";
      selectSeverity.value = "all";
      selectStatus.value = "all";
      
      state.filters = { district: "all", crimeType: "all", severity: "all", status: "all" };
      
      const mapLabel = document.getElementById("map-label-district");
      mapLabel.textContent = "Spatio-Temporal Mapping Platform - All Sectors";
      
      if (mapInstance) {
        mapInstance.setView([13.5000, 76.2000], 7.5);
      }
      
      updateDashboardStats();
      renderMap();
    });
  }

  // --- 5. Leaflet Map Rendering & Layer Management ---
  function initMap() {
    if (mapInstance) return;

    // Centered in Manhattan, NY
    mapInstance = L.map("map-view", {
      zoomControl: true,
      zoomSnap: 0.5
    }).setView([13.5000, 76.2000], 7.5);

    // CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance);

    markerLayerGroup = L.layerGroup().addTo(mapInstance);
  }

  function renderMap() {
    if (!mapInstance) return;

    // Clear existing overlay graphics
    markerLayerGroup.clearLayers();
    if (heatmapLayerInstance) {
      mapInstance.removeLayer(heatmapLayerInstance);
      heatmapLayerInstance = null;
    }

    const filtered = getFilteredIncidents();

    if (state.activeMapLayer === "markers") {
      // Custom colored glowing circles
      const colorMap = {
        High: "var(--accent-red)",
        Medium: "var(--accent-orange)",
        Low: "var(--accent-cyan)"
      };

      filtered.forEach(inc => {
        const markerColor = colorMap[inc.severity] || "white";
        const iconHtml = `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px ${markerColor};"></div>`;
        
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'glowing-map-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        // Find linked criminal details if any
        const suspectName = inc.offenderId !== "Unknown" 
          ? (state.criminals.find(c => c.id === inc.offenderId)?.name || "Unknown Suspect")
          : "Unidentified Suspect";

        const popupContent = `
          <div style="font-family: var(--font-sans); width: 220px; line-height: 1.4;">
            <h4 style="margin:0 0 4px 0; color: var(--accent-cyan); font-family: var(--font-display); font-size: 0.9rem;">${inc.type} (${inc.severity})</h4>
            <p style="margin: 2px 0; font-size: 0.75rem; font-weight: 600;"><span style="color:var(--text-secondary)">Case:</span> ${inc.id}</p>
            <p style="margin: 2px 0; font-size: 0.75rem;"><span style="color:var(--text-secondary)">Sector:</span> ${inc.district}</p>
            <p style="margin: 2px 0; font-size: 0.75rem;"><span style="color:var(--text-secondary)">Suspect:</span> <span style="color:var(--accent-purple); font-weight:600;">${suspectName}</span></p>
            <p style="margin: 2px 0; font-size: 0.75rem;"><span style="color:var(--text-secondary)">Status:</span> ${inc.status}</p>
            <hr style="border: 0; border-top: 1px solid var(--border-light); margin: 6px 0;"/>
            <p style="margin: 0; font-size: 0.7rem; color: var(--text-secondary); font-style: italic;">"${inc.description}"</p>
          </div>
        `;

        L.marker([inc.lat, inc.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markerLayerGroup);
      });
    } else if (state.activeMapLayer === "heatmap") {
      // Heatmap view using Leaflet-heat
      const heatData = filtered.map(inc => {
        let intensity = 0.4;
        if (inc.severity === "High") intensity = 1.0;
        if (inc.severity === "Medium") intensity = 0.7;
        return [inc.lat, inc.lng, intensity];
      });

      heatmapLayerInstance = L.heatLayer(heatData, {
        radius: 28,
        blur: 18,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.2: 'blue',
          0.4: 'cyan',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(mapInstance);
    }
  }

  function setupMapLayers() {
    const btnMarkers = document.getElementById("map-layer-markers");
    const btnHeatmap = document.getElementById("map-layer-heatmap");

    btnMarkers.addEventListener("click", () => {
      btnMarkers.classList.add("active");
      btnHeatmap.classList.remove("active");
      state.activeMapLayer = "markers";
      renderMap();
    });

    btnHeatmap.addEventListener("click", () => {
      btnHeatmap.classList.add("active");
      btnMarkers.classList.remove("active");
      state.activeMapLayer = "heatmap";
      renderMap();
    });
  }

  // --- 6. AI Predictive Risk & Alerts Log ---
  function updateAiPredictorPanel() {
    const districtKey = state.aiSelectedDistrict;
    const timeOfDay = state.aiTimeOfDay;
    
    // Calculate risk using AI Engine
    const prediction = window.AiEngine.calculatePredictiveRisk(districtKey, timeOfDay, state.aiSliders);
    
    if (!prediction) return;

    // Update Overall Risk Gauge
    const riskVal = prediction.overallRisk;
    document.getElementById("txt-risk-percent").textContent = `${riskVal}%`;
    
    const fillCircle = document.getElementById("gauge-risk-fill");
    // Circumference of r=60 circle is 2 * PI * 60 = 377
    const offset = 377 - (377 * riskVal) / 100;
    fillCircle.style.strokeDashoffset = offset;

    // Update color indicator based on risk severity
    if (riskVal >= 75) {
      fillCircle.style.stroke = "var(--accent-red)";
    } else if (riskVal >= 45) {
      fillCircle.style.stroke = "var(--accent-orange)";
    } else {
      fillCircle.style.stroke = "var(--accent-cyan)";
    }

    // Update Category breakdowns
    document.getElementById("gauge-risk-violent").textContent = `${prediction.breakdown.violent}%`;
    document.getElementById("gauge-risk-property").textContent = `${prediction.breakdown.property}%`;
    document.getElementById("gauge-risk-cyber").textContent = `${prediction.breakdown.cyber}%`;
  }

  function renderAiAlertsLog() {
    const container = document.getElementById("ai-alerts-container");
    container.innerHTML = "";

    const alerts = window.AiEngine.detectAnomalies();
    
    document.getElementById("lbl-active-alerts-count").textContent = `${alerts.length} ACTIVE FLAGS`;

    if (alerts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; color: var(--text-muted); padding: 3rem;">
          <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; margin-bottom: 1rem; display:block; color: var(--accent-green)"></i>
          <span>No cyber anomalies or crime spikes detected in the active ledger.</span>
        </div>
      `;
      return;
    }

    alerts.forEach(alert => {
      const alertItem = document.createElement("div");
      alertItem.className = `alert-item alert-${alert.type}`;
      
      let icon = "fa-triangle-exclamation";
      if (alert.severity === "Critical") icon = "fa-skull-crossbones";
      if (alert.type === "info") icon = "fa-circle-info";

      // Parse timestamp
      const date = new Date(alert.timestamp);
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

      alertItem.innerHTML = `
        <div class="alert-icon">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="alert-content">
          <div class="alert-item-header">
            <span class="alert-item-title">${alert.title}</span>
            <span class="alert-item-time">${alert.severity} [${timeStr}]</span>
          </div>
          <p class="alert-item-desc">${alert.message}</p>
        </div>
      `;
      container.appendChild(alertItem);
    });
  }

  function setupAiPredictorControls() {
    const selDistrict = document.getElementById("ai-district-select");
    const selTime = document.getElementById("ai-time-select");
    const slidePoverty = document.getElementById("slider-poverty");
    const slideUnemp = document.getElementById("slider-unemployment");
    const slideEduc = document.getElementById("slider-education");
    const btnRestore = document.getElementById("btn-reset-ai-sliders");

    const updateSlidersUI = (pov, unemp, edu) => {
      slidePoverty.value = pov;
      document.getElementById("val-poverty").textContent = `${pov}%`;
      state.aiSliders.povertyRate = pov;

      slideUnemp.value = unemp;
      document.getElementById("val-unemployment").textContent = `${unemp}%`;
      state.aiSliders.unemploymentRate = unemp;

      slideEduc.value = edu;
      document.getElementById("val-education").textContent = `${edu}%`;
      state.aiSliders.educationIndex = edu;
    };

    const syncToDistrictBaseline = () => {
      const dist = state.districts[selDistrict.value];
      updateSlidersUI(dist.povertyRate, dist.unemploymentRate, dist.educationIndex);
      updateAiPredictorPanel();
    };

    selDistrict.addEventListener("change", (e) => {
      state.aiSelectedDistrict = e.target.value;
      syncToDistrictBaseline();
    });

    selTime.addEventListener("change", (e) => {
      state.aiTimeOfDay = e.target.value;
      updateAiPredictorPanel();
    });

    slidePoverty.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById("val-poverty").textContent = `${val}%`;
      state.aiSliders.povertyRate = val;
      updateAiPredictorPanel();
    });

    slideUnemp.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById("val-unemployment").textContent = `${val}%`;
      state.aiSliders.unemploymentRate = val;
      updateAiPredictorPanel();
    });

    slideEduc.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      document.getElementById("val-education").textContent = `${val}%`;
      state.aiSliders.educationIndex = val;
      updateAiPredictorPanel();
    });

    btnRestore.addEventListener("click", () => {
      syncToDistrictBaseline();
    });

    // Run baseline initialization
    syncToDistrictBaseline();
  }

  // --- 7. Criminal Syndicate Network Analysis ---
  function initNetworkGraph() {
    const container = document.getElementById("network-canvas");
    
    // Map criminals to vis-network nodes
    const nodesArray = state.criminals.map(c => {
      // Determine node color category based on risk
      let groupColor = "var(--accent-cyan)";
      if (c.recidivismRisk >= 80) groupColor = "var(--accent-purple)";
      else if (c.recidivismRisk < 50) groupColor = "var(--accent-orange)";

      return {
        id: c.id,
        label: c.name.split(" ")[0] + ` '${c.alias}'`, // First name + alias
        shape: 'circularImage',
        image: c.mugshot,
        brokenImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop", // Fallback avatar URL
        color: {
          border: groupColor,
          background: "var(--bg-panel)",
          highlight: {
            border: "var(--accent-cyan)",
            background: "var(--bg-panel-hover)"
          }
        }
      };
    });

    // Map edges
    const edgesArray = state.networkLinks.map(l => {
      return {
        from: l.from,
        to: l.to,
        label: l.label,
        font: { align: 'horizontal', size: 8, strokeWidth: 0, color: '#9ca3af' }
      };
    });

    const data = {
      nodes: new vis.DataSet(nodesArray),
      edges: new vis.DataSet(edgesArray)
    };

    const options = {
      nodes: {
        borderWidth: 3,
        size: 32,
        font: {
          color: '#f3f4f6',
          face: 'Inter',
          size: 11
        }
      },
      edges: {
        color: {
          color: 'rgba(156, 163, 175, 0.25)',
          highlight: 'var(--accent-cyan)',
          hover: 'var(--accent-cyan)'
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.4 }
        },
        width: 1.5,
        smooth: {
          type: 'continuous'
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -1800,
          centralGravity: 0.2,
          springLength: 110,
          springConstant: 0.05
        }
      }
    };

    networkInstance = new vis.Network(container, data, options);

    // Node click handler
    networkInstance.on("click", (params) => {
      if (params.nodes.length > 0) {
        const offenderId = params.nodes[0];
        displayOffenderProfile(offenderId);
      }
    });
  }

  function displayOffenderProfile(offenderId) {
    const criminal = state.criminals.find(c => c.id === offenderId);
    if (!criminal) return;

    state.selectedOffenderId = offenderId;

    // Show details panel, hide placeholder
    document.getElementById("profile-placeholder").style.display = "none";
    const detailCard = document.getElementById("profile-details-card");
    detailCard.style.display = "flex";

    // Populate data
    document.getElementById("dossier-mugshot").src = criminal.mugshot;
    document.getElementById("dossier-name").textContent = criminal.name;
    document.getElementById("dossier-alias").textContent = `Alias: "${criminal.alias}"`;
    document.getElementById("dossier-age").textContent = criminal.age;
    document.getElementById("dossier-gang").textContent = criminal.gangAffiliation;
    document.getElementById("dossier-arrests").textContent = criminal.totalArrests;
    document.getElementById("dossier-main-crime").textContent = criminal.knownCrimes.join(", ");
    document.getElementById("dossier-bio").textContent = criminal.bio;

    // Index numbers
    document.getElementById("dossier-index-behavioral").textContent = `${criminal.riskBreakdown.behavioral}%`;
    document.getElementById("dossier-index-environmental").textContent = `${criminal.riskBreakdown.environmental}%`;
    document.getElementById("dossier-index-historical").textContent = `${criminal.riskBreakdown.historical}%`;

    // Recidivism Badge
    const riskText = document.getElementById("dossier-risk-text");
    const riskBar = document.getElementById("dossier-risk-bar");
    const statusBadge = document.getElementById("dossier-status-badge");

    riskText.textContent = `${criminal.recidivismRisk}%`;
    riskBar.style.width = `${criminal.recidivismRisk}%`;

    // Recidivism risk coloring
    if (criminal.recidivismRisk >= 80) {
      riskText.style.color = "var(--accent-red)";
      riskBar.style.backgroundColor = "var(--accent-red)";
    } else if (criminal.recidivismRisk >= 50) {
      riskText.style.color = "var(--accent-orange)";
      riskBar.style.backgroundColor = "var(--accent-orange)";
    } else {
      riskText.style.color = "var(--accent-green)";
      riskBar.style.backgroundColor = "var(--accent-green)";
    }

    // Status Badge classes
    statusBadge.textContent = criminal.status;
    statusBadge.className = "badge"; // Reset classes
    if (criminal.status === "At Large") {
      statusBadge.classList.add("badge-danger");
    } else if (criminal.status === "Parole") {
      statusBadge.classList.add("badge-warning");
    } else {
      statusBadge.classList.add("badge-success");
    }

    // Populate timeline list of crimes linked to this offender
    const timelineList = document.getElementById("dossier-timeline-list");
    timelineList.innerHTML = "";
    
    const offenderIncidents = state.incidents
      .filter(inc => inc.offenderId === criminal.id)
      .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (offenderIncidents.length === 0) {
      timelineList.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">No open or solved cases logged for this offender.</span>`;
    } else {
      offenderIncidents.forEach(inc => {
        const date = new Date(inc.timestamp);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        const timelineItem = document.createElement("div");
        timelineItem.style.borderLeft = "2px solid rgba(255, 255, 255, 0.1)";
        timelineItem.style.paddingLeft = "8px";
        timelineItem.style.marginBottom = "4px";
        timelineItem.innerHTML = `
          <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:600;">
            <span style="color: var(--accent-cyan)">${inc.type}</span>
            <span style="color: var(--text-muted)">${dateStr}</span>
          </div>
          <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0;">${inc.id} (${inc.district}) - ${inc.status}</p>
        `;
        timelineList.appendChild(timelineItem);
      });
    }
  }

  // --- 8. Socio-Economic Correlation & Metrics ---
  function renderCorrelationChart() {
    const canvas = document.getElementById("correlation-chart-canvas");
    if (!canvas) return;

    if (correlationChartInstance) {
      correlationChartInstance.destroy();
    }

    // Compile correlation data for each district
    const districtKeys = Object.keys(state.districts);
    const dataPoints = districtKeys.map(key => {
      const dist = state.districts[key];
      const crimeCount = state.incidents.filter(inc => inc.district === key).length;
      
      let xVal = 0;
      if (state.correlationVariable === "povertyRate") xVal = dist.povertyRate;
      else if (state.correlationVariable === "unemploymentRate") xVal = dist.unemploymentRate;
      else if (state.correlationVariable === "educationIndex") xVal = dist.educationIndex;

      return {
        x: xVal,
        y: crimeCount,
        label: dist.name
      };
    });

    // Sort by X value to draw line of best fit correctly
    dataPoints.sort((a, b) => a.x - b.x);

    // Calculate linear regression y = mx + c
    const n = dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    dataPoints.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumXY += (p.x * p.y);
      sumXX += (p.x * p.x);
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    // Generate regression line points matching min/max X values
    const minX = dataPoints[0].x;
    const maxX = dataPoints[dataPoints.length - 1].x;
    const regressionLine = [
      { x: minX, y: m * minX + c },
      { x: maxX, y: m * maxX + c }
    ];

    // Calculate R-squared value to display
    const meanY = sumY / n;
    let ssTot = 0, ssRes = 0;
    dataPoints.forEach(p => {
      const fitVal = m * p.x + c;
      ssTot += Math.pow(p.y - meanY, 2);
      ssRes += Math.pow(p.y - fitVal, 2);
    });
    const r2 = 1 - (ssRes / (ssTot || 1));

    // Label configs
    let xLabel = "Poverty Rate (%)";
    if (state.correlationVariable === "unemploymentRate") xLabel = "Unemployment Rate (%)";
    if (state.correlationVariable === "educationIndex") xLabel = "Education Index Rating";

    // Chart.js config
    const config = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Sectors / Districts',
            data: dataPoints,
            backgroundColor: 'rgba(0, 240, 255, 0.7)',
            borderColor: 'var(--accent-cyan)',
            borderWidth: 1,
            pointRadius: 8,
            pointHoverRadius: 10,
            pointStyle: 'circle'
          },
          {
            label: 'AI Linear Regression',
            data: regressionLine,
            type: 'line',
            borderColor: 'rgba(168, 85, 247, 0.6)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f3f4f6',
              font: { family: 'Inter', size: 10 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) {
                  const pt = dataPoints[context.dataIndex];
                  return `${pt.label}: (${xLabel}: ${pt.x}, Crime Count: ${pt.y})`;
                }
                return `Fit Line (Slope: ${m.toFixed(2)})`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel,
              color: '#f3f4f6',
              font: { family: 'Orbitron', size: 11 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af' }
          },
          y: {
            title: {
              display: true,
              text: 'Recorded Incidents Count',
              color: '#f3f4f6',
              font: { family: 'Orbitron', size: 11 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', stepSize: 1 }
          }
        }
      }
    };

    correlationChartInstance = new Chart(canvas, config);

    // Update Insights Text & Table
    updateCorrelationTableAndInsights(m, r2);
  }

  function updateCorrelationTableAndInsights(slope, r2) {
    const tableBody = document.getElementById("correlation-table-body");
    const labelHeader = document.getElementById("th-var-val");
    tableBody.innerHTML = "";

    // Set header text
    let displayLabel = "Poverty Rate";
    if (state.correlationVariable === "unemploymentRate") displayLabel = "Unemployment";
    if (state.correlationVariable === "educationIndex") displayLabel = "Education Rating";
    labelHeader.textContent = displayLabel;

    Object.keys(state.districts).forEach(key => {
      const dist = state.districts[key];
      const count = state.incidents.filter(inc => inc.district === key).length;
      let varValue = dist[state.correlationVariable];

      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="font-weight:600; color:var(--text-primary);">${dist.name}</td>
        <td style="color:var(--accent-cyan); font-family:var(--font-display);">${varValue}${state.correlationVariable !== 'educationIndex' ? '%' : ''}</td>
        <td style="font-family:var(--font-display);">${count} cases</td>
      `;
      tableBody.appendChild(row);
    });

    // Text details
    const textEl = document.getElementById("correlation-analysis-text");
    let relationshipText = "";
    
    if (slope > 0) {
      relationshipText = "positive correlation. Increases in the socio-economic stressor are historically mapped with elevated crime levels.";
    } else {
      relationshipText = "negative correlation. Favorable indicators (like higher education rates) exhibit a mitigating effect on street crime frequencies.";
    }

    textEl.innerHTML = `
      Target Variable: <strong>${displayLabel}</strong><br/>
      Calculated Slope Coefficient: <strong>${slope.toFixed(3)}</strong><br/>
      Model R² Score (Fit Confidence): <strong>${r2.toFixed(3)}</strong><br/>
      <br/>
      The AI regression line shows a <strong>${relationshipText}</strong> with a model fit confidence of <strong>${Math.round(r2 * 100)}%</strong>. This indicates crime densities are heavily driven by localized environmental profiles.
    `;
  }

  function setupCorrelationControls() {
    const btnPoverty = document.getElementById("btn-corr-poverty");
    const btnUnemp = document.getElementById("btn-corr-unemployment");
    const btnEduc = document.getElementById("btn-corr-education");

    const clearActive = () => {
      btnPoverty.classList.remove("active");
      btnUnemp.classList.remove("active");
      btnEduc.classList.remove("active");
    };

    btnPoverty.addEventListener("click", () => {
      clearActive();
      btnPoverty.classList.add("active");
      state.correlationVariable = "povertyRate";
      renderCorrelationChart();
    });

    btnUnemp.addEventListener("click", () => {
      clearActive();
      btnUnemp.classList.add("active");
      state.correlationVariable = "unemploymentRate";
      renderCorrelationChart();
    });

    btnEduc.addEventListener("click", () => {
      clearActive();
      btnEduc.classList.add("active");
      state.correlationVariable = "educationIndex";
      renderCorrelationChart();
    });
  }

  // --- 9. Modal Form Interaction (Report Incident) ---
  function setupIncidentModal() {
    const modal = document.getElementById("modal-report-incident");
    const btnOpen = document.getElementById("btn-open-report");
    const btnClose = document.getElementById("btn-close-modal");
    const btnCancel = document.getElementById("btn-cancel-report");
    const form = document.getElementById("form-report-incident");
    const selectOffender = document.getElementById("rep-offender");
    const selectDistrict = document.getElementById("rep-district");
    const inputLat = document.getElementById("rep-lat");
    const inputLng = document.getElementById("rep-lng");

    // Populate offender options
    selectOffender.innerHTML = `<option value="Unknown">-- Unknown Offender / At Large --</option>`;
    state.criminals.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = `${c.name} (${c.alias})`;
      selectOffender.appendChild(option);
    });

    // Auto-update coordinates based on district selection
    const syncCoordsToSelectedDistrict = () => {
      const distKey = selectDistrict.value;
      const coords = state.districts[distKey].center;
      // Add slight randomized offset so multiple new reports don't land exactly on same spot
      const randomOffset = () => (Math.random() - 0.5) * 0.015;
      inputLat.value = (coords[0] + randomOffset()).toFixed(4);
      inputLng.value = (coords[1] + randomOffset()).toFixed(4);
    };

    selectDistrict.addEventListener("change", syncCoordsToSelectedDistrict);

    btnOpen.addEventListener("click", () => {
      syncCoordsToSelectedDistrict();
      modal.classList.add("active");
    });

    const closeModal = () => {
      modal.classList.remove("active");
      form.reset();
    };

    btnClose.addEventListener("click", closeModal);
    btnCancel.addEventListener("click", closeModal);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Create new incident
      const newInc = {
        id: `INC-2026-${String(state.incidents.length + 1).padStart(3, '0')}`,
        type: document.getElementById("rep-crime-type").value,
        district: selectDistrict.value,
        lat: parseFloat(inputLat.value),
        lng: parseFloat(inputLng.value),
        timestamp: new Date().toISOString(),
        severity: document.getElementById("rep-severity").value,
        offenderId: selectOffender.value,
        status: document.getElementById("rep-status").value,
        description: document.getElementById("rep-desc").value
      };

      // Add to state
      state.incidents.push(newInc);

      // Re-trigger updates
      updateDashboardStats();
      renderMap();
      renderAiAlertsLog();
      
      // If we are currently looking at the correlation chart, redraw it
      if (state.activeTab === "tab-correlation") {
        renderCorrelationChart();
      }

      // Close modal
      closeModal();
      
      // Flash header Core text to show update processed
      const statusText = document.getElementById("status-text");
      statusText.textContent = "CORE SYNCING DATA: SUCCESS";
      statusText.style.color = "var(--accent-cyan)";
      setTimeout(() => {
        statusText.textContent = "SYSTEM CORE: ONLINE";
        statusText.style.color = "var(--accent-green)";
      }, 3000);
    });
  }

  // --- 10. Navigation Tab Event Handling ---
  function setupNavigation() {
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        // Deactivate all tabs
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(tc => tc.classList.remove("active"));

        // Activate selected tab
        tab.classList.add("active");
        const tabId = tab.getAttribute("data-tab");
        const activeContent = document.getElementById(tabId);
        activeContent.classList.add("active");
        state.activeTab = tabId;

        // View-specific trigger redraws (needed for sizing constraints)
        if (tabId === "tab-overview") {
          // Re-render map viewport
          setTimeout(() => {
            if (mapInstance) {
              mapInstance.invalidateSize();
              renderMap();
            }
          }, 150);
        } else if (tabId === "tab-network") {
          // Network graph physics resize
          setTimeout(() => {
            if (networkInstance) {
              networkInstance.fit();
            }
          }, 150);
        } else if (tabId === "tab-correlation") {
          // Chart.js resize
          renderCorrelationChart();
        } else if (tabId === "tab-predictive") {
          // Update predictor gauge
          updateAiPredictorPanel();
          renderAiAlertsLog();
        }
      });
    });
  }

  // --- 11. Live Feed Simulation (Real-time events) ---
  function startLiveFeedSimulation() {
    const crimeTypes = ["Burglary", "Theft", "Assault", "Robbery", "Cybercrime", "Vandalism"];
    const districtsKeys = Object.keys(state.districts);
    const severities = ["Low", "Medium", "High"];
    const statuses = ["Active", "Investigating"];
    const descriptions = {
      "Burglary": [
        "Store break-in detected. Alarm tripped at retail showroom.",
        "Residential housebreaking reported. Valuables missing.",
        "Commercial warehouse security breached. Inventory hijacked."
      ],
      "Theft": [
        "Two-wheeler theft reported from open parking space.",
        "Chain snatching incident by motor riders.",
        "Smartphone stolen from a pedestrian in a crowded market."
      ],
      "Assault": [
        "Street brawl reported near transit hub. Police dispatched.",
        "Altercation escalating to physical violence at commercial shop.",
        "Group clash reported over parking spot argument."
      ],
      "Robbery": [
        "Highway truck interception and extortion reported.",
        "Snatching of cash container from delivery agent under threat.",
        "Armed heist at a local cooperative society branch."
      ],
      "Cybercrime": [
        "OTP spoofing fraud reported by bank customer.",
        "Phishing mail network deployed against local government portal.",
        "Social media account takeover and digital blackmail demand."
      ],
      "Vandalism": [
        "Damaged street lights and public signage reported.",
        "Graffiti spray-painted on metro support pillars.",
        "Toll booth barrier smashed by speed vehicle."
      ]
    };

    const getRandomOffender = () => {
      const includeOffender = Math.random() > 0.4;
      if (!includeOffender) return "Unknown";
      const idx = Math.floor(Math.random() * state.criminals.length);
      return state.criminals[idx].id;
    };

    setInterval(() => {
      const randType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
      const randDistKey = districtsKeys[Math.floor(Math.random() * districtsKeys.length)];
      const randDist = state.districts[randDistKey];
      const randSev = severities[Math.floor(Math.random() * severities.length)];
      const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const descList = descriptions[randType];
      const randDesc = descList[Math.floor(Math.random() * descList.length)];
      
      const randomOffset = () => (Math.random() - 0.5) * 0.025;
      const lat = randDist.center[0] + randomOffset();
      const lng = randDist.center[1] + randomOffset();
      
      const newInc = {
        id: `INC-LIVE-${String(state.incidents.length + 1).padStart(3, '0')}`,
        type: randType,
        district: randDistKey,
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        timestamp: new Date().toISOString(),
        severity: randSev,
        offenderId: getRandomOffender(),
        status: randStatus,
        description: randDesc
      };
      
      state.incidents.push(newInc);
      
      // Update UI components
      updateDashboardStats();
      renderMap();
      renderAiAlertsLog();
      
      if (state.activeTab === "tab-correlation") {
        renderCorrelationChart();
      }
      
      // Flash system status header
      const statusText = document.getElementById("status-text");
      statusText.textContent = `LIVE FEED SYNCED: ${newInc.id}`;
      statusText.style.color = "var(--accent-cyan)";
      statusText.style.textShadow = "0 0 8px var(--accent-cyan)";
      
      setTimeout(() => {
        statusText.textContent = "SYSTEM CORE: ONLINE";
        statusText.style.color = "var(--accent-green)";
        statusText.style.textShadow = "none";
      }, 3500);

    }, 20000); // Trigger every 20 seconds for rapid testing / visual feedback!
  }

  // --- 12. Initial Run Operations ---
  initClock();
  setupNavigation();
  initMap();
  setupMapLayers();
  setupFilters();
  updateDashboardStats();
  renderMap();
  setupAiPredictorControls();
  initNetworkGraph();
  setupCorrelationControls();
  setupIncidentModal();
  startLiveFeedSimulation();
});
