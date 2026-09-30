// AI & Predictive Risk Scoring Engine for the Crime Analytics Platform

const AiEngine = {
  // Simulates a predictive risk score model
  calculatePredictiveRisk: function(districtKey, timeOfDay, socioFactorsOverride = null) {
    const data = window.CrimeData;
    if (!data || !data.districts[districtKey]) return null;

    const district = data.districts[districtKey];
    
    // Extract parameters
    const poverty = socioFactorsOverride ? parseFloat(socioFactorsOverride.povertyRate) : district.povertyRate;
    const unemployment = socioFactorsOverride ? parseFloat(socioFactorsOverride.unemploymentRate) : district.unemploymentRate;
    const education = socioFactorsOverride ? parseFloat(socioFactorsOverride.educationIndex) : district.educationIndex;
    
    // Historical crime density based on count of incidents in this district
    const districtIncidents = data.incidents.filter(inc => inc.district === districtKey).length;
    const densityFactor = Math.min((districtIncidents / 10) * 25, 30); // Max 30 points from density

    // Calculate base socio-economic threat score
    const povertyWeight = 0.8;
    const unemploymentWeight = 1.2;
    const educationWeight = 0.4; // inverted (higher education = lower risk)
    
    let baseSocioRisk = (poverty * povertyWeight) + (unemployment * unemploymentWeight) + ((100 - education) * educationWeight);
    baseSocioRisk = Math.min(baseSocioRisk, 50); // Max 50 points from socio-economic factors

    // Temporal weight
    let temporalWeight = 5; // default day
    if (timeOfDay === "Night" || timeOfDay === "Late Night") {
      temporalWeight = 20;
    } else if (timeOfDay === "Evening") {
      temporalWeight = 12;
    }

    // Combine factors
    let totalRisk = baseSocioRisk + densityFactor + temporalWeight;
    
    // Bound risk between 5% and 98%
    totalRisk = Math.max(5, Math.min(Math.round(totalRisk), 98));

    // Calculate breakdown by crime category
    // Cybercrime is negatively correlated with poverty/unemployment but positively with education/income
    const incomeFactor = district.medianIncome / 150000;
    
    const violentRisk = Math.round(totalRisk * 0.9 * (poverty / 15));
    const propertyRisk = Math.round(totalRisk * 1.1 * (unemployment / 6));
    const cyberRisk = Math.round((40 + (education * 0.3) + (incomeFactor * 20)) * (timeOfDay === "Day" ? 1.2 : 0.8));

    return {
      districtName: district.name,
      overallRisk: totalRisk,
      breakdown: {
        violent: Math.min(Math.max(violentRisk, 5), 95),
        property: Math.min(Math.max(propertyRisk, 5), 95),
        cyber: Math.min(Math.max(cyberRisk, 5), 95)
      },
      confidence: 89, // percentage
      factors: [
        { name: "Socio-Economic Index", contribution: Math.round(baseSocioRisk) },
        { name: "Historical Density Trend", contribution: Math.round(densityFactor) },
        { name: "Temporal Factor (" + timeOfDay + ")", contribution: temporalWeight }
      ]
    };
  },

  // Scans database for spatio-temporal anomalies and repeat offender alerts
  detectAnomalies: function() {
    const data = window.CrimeData;
    if (!data) return [];

    const alerts = [];
    const now = new Date("2026-06-20T17:00:00Z"); // Set simulation clock anchor

    // 1. Spatio-temporal cluster detection (Spike in certain crime types per district)
    const districtCrimeCounts = {};
    data.incidents.forEach(inc => {
      const key = `${inc.district}-${inc.type}`;
      if (!districtCrimeCounts[key]) {
        districtCrimeCounts[key] = [];
      }
      districtCrimeCounts[key].push(new Date(inc.timestamp));
    });

    for (const key in districtCrimeCounts) {
      const dates = districtCrimeCounts[key].sort((a, b) => b - a);
      // Count crimes within 10 days of each other
      if (dates.length >= 3) {
        const spanDays = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
        if (spanDays <= 15) {
          const [district, type] = key.split("-");
          alerts.push({
            id: `ANOM-${district}-${type}`,
            severity: "High",
            type: "danger",
            title: `Micro-Spike: ${type} in ${district}`,
            message: `Detected ${dates.length} incidents of ${type} in the ${district} sector within ${Math.ceil(spanDays)} days. High likelihood of coordinated activity.`,
            timestamp: dates[0].toISOString()
          });
        }
      }
    }

    // 2. High Recidivism Offender Activity Alert
    data.criminals.forEach(criminal => {
      if (criminal.recidivismRisk >= 80 && criminal.status === "At Large") {
        // Find if this criminal has been linked to recent active cases
        const activeLinkedCases = data.incidents.filter(inc => inc.offenderId === criminal.id && inc.status === "Active");
        if (activeLinkedCases.length >= 1) {
          alerts.push({
            id: `OFFENDER-${criminal.id}`,
            severity: "Critical",
            type: "danger",
            title: `High-Risk Recidivist Active: ${criminal.name}`,
            message: `${criminal.name} (Risk: ${criminal.recidivismRisk}%, Status: At Large) is linked to ${activeLinkedCases.length} open investigation(s). Immediate surveillance recommended.`,
            timestamp: new Date().toISOString()
          });
        } else {
          alerts.push({
            id: `OFFENDER-WARN-${criminal.id}`,
            severity: "Medium",
            type: "warning",
            title: `Recidivism Threat: ${criminal.name}`,
            message: `Offender ${criminal.alias} is categorized at extreme risk of re-offending. Gang affiliation: ${criminal.gangAffiliation}.`,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // 3. Socio-Economic Anomaly (E.g. District with low average crime having a high severity incident)
    data.incidents.forEach(inc => {
      const distInfo = data.districts[inc.district];
      if (distInfo && distInfo.povertyRate < 15 && inc.severity === "High" && inc.status === "Active") {
        alerts.push({
          id: `SE-ANOM-${inc.id}`,
          severity: "Medium",
          type: "info",
          title: `Low-Probability Threat Event`,
          message: `Incident ${inc.id} (${inc.type}) classified as High Severity in ${inc.district} (low poverty sector). Uncharacteristic trend marker.`,
          timestamp: inc.timestamp
        });
      }
    });

    // Sort alerts by severity (Critical/High first, then Medium/Low)
    const severityRank = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
    return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }
};

window.AiEngine = AiEngine;
