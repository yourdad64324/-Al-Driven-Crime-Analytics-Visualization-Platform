// Mock Data Registry for the AI-Driven Crime Analytics Platform
// Coordinates are centered around Karnataka, India (focusing on Bengaluru, Mysuru, Mangaluru, Hubballi)

const CrimeData = {
  districts: {
    "Bengaluru Central": {
      name: "Bengaluru Central Division",
      povertyRate: 9.8,        // percentage
      unemploymentRate: 4.2,   // percentage
      educationIndex: 88,      // 0-100 rating
      medianIncome: 750000,    // INR per annum
      population: 4500000,
      center: [12.9716, 77.5946]
    },
    "Bengaluru South": {
      name: "Bengaluru South (Tech Corridor)",
      povertyRate: 8.1,
      unemploymentRate: 3.8,
      educationIndex: 92,
      medianIncome: 950000,
      population: 3200000,
      center: [12.9304, 77.6101]
    },
    "Mysuru Division": {
      name: "Mysuru Heritage Division",
      povertyRate: 15.2,
      unemploymentRate: 6.4,
      educationIndex: 79,
      medianIncome: 480000,
      population: 1200000,
      center: [12.2958, 76.6394]
    },
    "Mangaluru Coast": {
      name: "Mangaluru Coastal Division",
      povertyRate: 11.5,
      unemploymentRate: 5.2,
      educationIndex: 85,
      medianIncome: 550000,
      population: 800000,
      center: [12.9141, 74.8560]
    },
    "Hubballi Hub": {
      name: "Hubballi-Dharwad Transit Division",
      povertyRate: 22.4,
      unemploymentRate: 9.8,
      educationIndex: 64,
      medianIncome: 350000,
      population: 1500000,
      center: [15.3647, 75.1240]
    }
  },

  criminals: [
    {
      id: "C001",
      name: "Kiran 'Slick' Gowda",
      alias: "Slick Kiran",
      age: 34,
      gangAffiliation: "Deccan Syndicate",
      recidivismRisk: 88,
      status: "At Large",
      totalArrests: 14,
      knownCrimes: ["Robbery", "Assault", "Burglary"],
      riskBreakdown: { behavioral: 92, environmental: 75, historical: 96 },
      mugshot: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      bio: "Active since 2018. Gang leader for tactical commercial burglaries and highway robberies. Operates in Bengaluru and Hubballi."
    },
    {
      id: "C002",
      name: "Elena 'Cipher' Rao",
      alias: "Cipher Elena",
      age: 28,
      gangAffiliation: "Silicon Cyber Syndicate",
      recidivismRisk: 42,
      status: "Parole",
      totalArrests: 3,
      knownCrimes: ["Cybercrime", "Theft"],
      riskBreakdown: { behavioral: 35, environmental: 40, historical: 52 },
      mugshot: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      bio: "Former tech lead at an IT firm in Electronic City. Convicted of digital banking API extortion and large scale phishing."
    },
    {
      id: "C003",
      name: "Dinesh 'Apex' Reddy",
      alias: "Apex Dinesh",
      age: 41,
      gangAffiliation: "Deccan Syndicate",
      recidivismRisk: 95,
      status: "At Large",
      totalArrests: 22,
      knownCrimes: ["Assault", "Robbery", "Vandalism"],
      riskBreakdown: { behavioral: 98, environmental: 88, historical: 99 },
      mugshot: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      bio: "High-ranking chief of protection racket and sand-smuggling networks in border areas. High propensity for violence."
    },
    {
      id: "C004",
      name: "Raju 'Rusty' Nayak",
      alias: "Rusty Raju",
      age: 26,
      gangAffiliation: "Deccan Syndicate",
      recidivismRisk: 75,
      status: "Custody",
      totalArrests: 8,
      knownCrimes: ["Theft", "Vandalism", "Burglary"],
      riskBreakdown: { behavioral: 68, environmental: 82, historical: 76 },
      mugshot: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
      bio: "Kiran Gowda's primary wheelman. Arrested during a failed jewellery shop robbery in Jayanagar, Bengaluru."
    },
    {
      id: "C005",
      name: "Sophia 'Phantom' D'Souza",
      alias: "Phantom Sophia",
      age: 31,
      gangAffiliation: "Silicon Cyber Syndicate",
      recidivismRisk: 58,
      status: "At Large",
      totalArrests: 5,
      knownCrimes: ["Cybercrime", "Theft"],
      riskBreakdown: { behavioral: 55, environmental: 48, historical: 70 },
      mugshot: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      bio: "Financial strategist specializing in laundering funds through shell companies and untraceable accounts. Active in Mangaluru port logistics."
    },
    {
      id: "C006",
      name: "Vijay 'Anvil' Shetty",
      alias: "Anvil Vijay",
      age: 45,
      gangAffiliation: "None",
      recidivismRisk: 64,
      status: "Parole",
      totalArrests: 9,
      knownCrimes: ["Assault", "Vandalism"],
      riskBreakdown: { behavioral: 80, environmental: 35, historical: 77 },
      mugshot: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
      bio: "Independent enforcer hired for real-estate intimidation, land grabbing disputes, and toll gate extortion."
    },
    {
      id: "C007",
      name: "Lokesh 'Buster' Gowda",
      alias: "Buster Lokesh",
      age: 22,
      gangAffiliation: "Deccan Syndicate",
      recidivismRisk: 81,
      status: "At Large",
      totalArrests: 6,
      knownCrimes: ["Vandalism", "Theft", "Assault"],
      riskBreakdown: { behavioral: 89, environmental: 85, historical: 68 },
      mugshot: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop",
      bio: "Younger cousin of Kiran Gowda. Recruit for local extortion, two-wheeler thefts, and fleet hijackings."
    },
    {
      id: "C008",
      name: "Dr. Anand 'Architect' Rao",
      alias: "The Architect",
      age: 52,
      gangAffiliation: "Silicon Cyber Syndicate",
      recidivismRisk: 30,
      status: "Custody",
      totalArrests: 2,
      knownCrimes: ["Cybercrime"],
      riskBreakdown: { behavioral: 15, environmental: 30, historical: 45 },
      mugshot: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      bio: "Mastermind of ransomware grids attacking tech businesses and coordinating crypto-mules. Arrested in Whitefield, Bengaluru."
    }
  ],

  networkLinks: [
    { from: "C003", to: "C001", type: "Leader-Lieutenant", label: "Directs Operations" },
    { from: "C001", to: "C004", type: "Accomplice", label: "Frequent Partner" },
    { from: "C001", to: "C007", type: "Family-Accomplice", label: "Cousin / Recruiter" },
    { from: "C003", to: "C006", type: "Hired Help", label: "Land Enforcement Contracts" },
    { from: "C005", to: "C008", type: "Colleague", label: "Digital Laundering Link" },
    { from: "C002", to: "C005", type: "Colleague", label: "Malware Deployment Partners" },
    { from: "C008", to: "C002", type: "Mentor", label: "Cyber Recruiter" },
    { from: "C001", to: "C002", type: "Cross-Group Link", label: "Crypto Exchange Handler" }
  ],

  incidents: [
    {
      id: "INC-2026-001",
      type: "Burglary",
      district: "Bengaluru South",
      lat: 12.9254,
      lng: 77.6188,
      timestamp: "2026-06-02T22:15:00Z",
      severity: "High",
      offenderId: "C001",
      status: "Solved",
      description: "High-end corporate office break-in in Koramangala. 15 laptops and confidential files stolen. Skylight breach."
    },
    {
      id: "INC-2026-002",
      type: "Cybercrime",
      district: "Bengaluru Central",
      lat: 12.9735,
      lng: 77.5915,
      timestamp: "2026-06-03T09:30:00Z",
      severity: "Medium",
      offenderId: "C002",
      status: "Solved",
      description: "Spear-phishing scam targeting executive accounts of a public-sector bank on MG Road. API keys compromised."
    },
    {
      id: "INC-2026-003",
      type: "Robbery",
      district: "Hubballi Hub",
      lat: 15.3610,
      lng: 75.1290,
      timestamp: "2026-06-05T01:45:00Z",
      severity: "High",
      offenderId: "C003",
      status: "Investigating",
      description: "Highway robbery. Lorry hijacked carrying industrial logistics. Suspects armed with knives. Fled towards Dharwad."
    },
    {
      id: "INC-2026-004",
      type: "Theft",
      district: "Bengaluru Central",
      lat: 12.9682,
      lng: 77.5861,
      timestamp: "2026-06-06T14:20:00Z",
      severity: "Low",
      offenderId: "C004",
      status: "Solved",
      description: "Chain snatching incident near Cubbon Park. Suspect chased and apprehended by traffic police."
    },
    {
      id: "INC-2026-005",
      type: "Cybercrime",
      district: "Bengaluru South",
      lat: 12.9345,
      lng: 77.6212,
      timestamp: "2026-06-07T11:00:00Z",
      severity: "High",
      offenderId: "C005",
      status: "Active",
      description: "Ransomware blockade on the server grid of an e-commerce firm in HSR Layout. Demand of 12 BTC."
    },
    {
      id: "INC-2026-006",
      type: "Assault",
      district: "Mysuru Division",
      lat: 12.3012,
      lng: 76.6434,
      timestamp: "2026-06-08T23:10:00Z",
      severity: "High",
      offenderId: "C006",
      status: "Solved",
      description: "Violent clash at a real estate registration site. Lethal intimidation and assault. Suspect arrested."
    },
    {
      id: "INC-2026-007",
      type: "Vandalism",
      district: "Hubballi Hub",
      lat: 15.3780,
      lng: 75.1110,
      timestamp: "2026-06-09T03:00:00Z",
      severity: "Low",
      offenderId: "C007",
      status: "Investigating",
      description: "Smashing of surveillance cameras and damage to state highway toll booths during a strike."
    },
    {
      id: "INC-2026-008",
      type: "Burglary",
      district: "Bengaluru South",
      lat: 12.9132,
      lng: 77.5995,
      timestamp: "2026-06-11T20:30:00Z",
      severity: "Medium",
      offenderId: "C004",
      status: "Solved",
      description: "Residential villa break-in in JP Nagar. Locked safe cracked using gas torches. Gold and cash stolen."
    },
    {
      id: "INC-2026-009",
      type: "Theft",
      district: "Bengaluru Central",
      lat: 12.9788,
      lng: 77.6010,
      timestamp: "2026-06-12T17:40:00Z",
      severity: "Low",
      offenderId: "C001",
      status: "Investigating",
      description: "Two-wheeler theft wave. SUV stolen from a commercial basement parking on Infantry Road."
    },
    {
      id: "INC-2026-010",
      type: "Cybercrime",
      district: "Bengaluru South",
      lat: 12.9822,
      lng: 77.7482,
      timestamp: "2026-06-13T12:00:00Z",
      severity: "High",
      offenderId: "C008",
      status: "Solved",
      description: "Aadhaar fraud and SIM spoofing setup operating out of a tech park in Whitefield. Over 50 accounts drained."
    },
    {
      id: "INC-2026-011",
      type: "Assault",
      district: "Hubballi Hub",
      lat: 15.3525,
      lng: 75.1412,
      timestamp: "2026-06-14T02:00:00Z",
      severity: "Medium",
      offenderId: "C003",
      status: "Active",
      description: "Aggressive confrontation at a transport yard. Threats made with local weapons. Truckers union dispute."
    },
    {
      id: "INC-2026-012",
      type: "Vandalism",
      district: "Mangaluru Coast",
      lat: 12.9021,
      lng: 74.8611,
      timestamp: "2026-06-15T04:15:00Z",
      severity: "Low",
      offenderId: "C007",
      status: "Solved",
      description: "Port office windows broken. Anti-industrial slogans sprayed on warehouse walls."
    },
    {
      id: "INC-2026-013",
      type: "Robbery",
      district: "Bengaluru Central",
      lat: 12.9525,
      lng: 77.5822,
      timestamp: "2026-06-15T21:40:00Z",
      severity: "High",
      offenderId: "C006",
      status: "Investigating",
      description: "Armed robbery of a petrol bunk cashier near Lalbagh. Cash pouch seized at gunpoint."
    },
    {
      id: "INC-2026-014",
      type: "Burglary",
      district: "Mangaluru Coast",
      lat: 12.9230,
      lng: 74.8490,
      timestamp: "2026-06-16T19:00:00Z",
      severity: "Medium",
      offenderId: "C001",
      status: "Active",
      description: "Seafood cold-storage warehouse breached. High-value marine export inventory removed."
    },
    {
      id: "INC-2026-015",
      type: "Theft",
      district: "Bengaluru South",
      lat: 12.9295,
      lng: 77.6072,
      timestamp: "2026-06-17T08:15:00Z",
      severity: "Low",
      offenderId: "C004",
      status: "Active",
      description: "Parcel theft wave from apartment complexes. Culprit spotted stealing Amazon deliveries from lobbies."
    },
    {
      id: "INC-2026-016",
      type: "Cybercrime",
      district: "Mangaluru Coast",
      lat: 12.8999,
      lng: 74.8520,
      timestamp: "2026-06-18T10:45:00Z",
      severity: "Medium",
      offenderId: "C005",
      status: "Investigating",
      description: "Smuggling documentation fraud. Custom import clearance systems manipulated remotely via malware."
    },
    {
      id: "INC-2026-017",
      type: "Assault",
      district: "Hubballi Hub",
      lat: 15.3890,
      lng: 75.1320,
      timestamp: "2026-06-18T23:55:00Z",
      severity: "High",
      offenderId: "C003",
      status: "Active",
      description: "Armed conflict between rivalry illegal sand extraction gangs. Gunshots fired. 2 injured."
    },
    {
      id: "INC-2026-018",
      type: "Burglary",
      district: "Bengaluru Central",
      lat: 12.9651,
      lng: 77.6080,
      timestamp: "2026-06-19T02:30:00Z",
      severity: "High",
      offenderId: "C001",
      status: "Investigating",
      description: "Electronics showroom broken into on Brigade Road. CCTV cables severed. Mobile stock cleared."
    },
    {
      id: "INC-2026-019",
      type: "Theft",
      district: "Mysuru Division",
      lat: 12.2835,
      lng: 76.6499,
      timestamp: "2026-06-19T13:10:00Z",
      severity: "Low",
      offenderId: "C007",
      status: "Solved",
      description: "Bicycle theft from Mysuru Palace tourist parking block. Caught by local security staff."
    },
    {
      id: "INC-2026-020",
      type: "Vandalism",
      district: "Bengaluru South",
      lat: 12.9410,
      lng: 77.6140,
      timestamp: "2026-06-20T01:20:00Z",
      severity: "Low",
      offenderId: "C006",
      status: "Investigating",
      description: "Shattered windows and paint thrown on public bus shelters near Ejipura."
    }
  ]
};

// Expose globally for browser
window.CrimeData = CrimeData;
