// CivicPulse Platform - Core JavaScript Engine
// 1. DEFAULT DATA SEEDING (Unsplash high-fidelity visuals)
const DEFAULT_ISSUES = [
  {
    id: "issue-1",
    title: "Hazardous Pothole on Main Street",
    category: "pothole",
    description: "Large, deep pothole in the middle lane of Main St, right in front of the bakery. Multiple cars have swerved into the opposing lane to avoid it, creating a dangerous hazard.",
    lat: 37.7749,
    lng: -122.4194,
    status: "reported",
    votes: 24,
    voters: [],
    comments: [
      { author: "Alex K.", content: "Almost damaged my alignment here yesterday! Needs quick patching.", date: "2026-06-22" },
      { author: "Sarah M.", content: "Reported this to the hotline last week but nothing happened. Glad to see it on CivicPulse now.", date: "2026-06-23" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop",
    reportedBy: "Alex K.",
    date: "2026-06-22"
  },
  {
    id: "issue-2",
    title: "Major Water Main Pipe Burst",
    category: "leakage",
    description: "Drinking water is bubbling up through the sidewalk cracks on Oak Avenue near the 5th street intersection. Flooding is starting to build up in gutters.",
    lat: 37.7801,
    lng: -122.4120,
    status: "verified",
    votes: 42,
    voters: ["currentUser"],
    comments: [
      { author: "Mark D.", content: "The flow is increasing by the hour. We are losing clean water!", date: "2026-06-23" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=600&auto=format&fit=crop",
    reportedBy: "Mark D.",
    date: "2026-06-23"
  },
  {
    id: "issue-3",
    title: "Flickering/Dead Streetlights in Dark Alley",
    category: "streetlight",
    description: "Three consecutive streetlights are completely dead in the alleyway behind Pine Road retail stores. Extremely dark and unsafe at night.",
    lat: 37.7710,
    lng: -122.4280,
    status: "progress",
    votes: 18,
    voters: [],
    comments: [],
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
    reportedBy: "Jane Doe",
    date: "2026-06-21"
  },
  {
    id: "issue-4",
    title: "Illegal Trash Dumping",
    category: "waste",
    description: "Several bags of construction materials, old paint cans, and broken furniture have been dumped at the edge of the municipal park.",
    lat: 37.7650,
    lng: -122.4050,
    status: "resolved",
    votes: 35,
    voters: [],
    comments: [
      { author: "City Public Works", content: "Clean up team dispatched. Area has been cleared and checked for hazardous chemicals.", date: "2026-06-23" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop",
    reportedBy: "Eliza R.",
    date: "2026-06-20"
  }
];
const DEFAULT_LEADERBOARD = [
  { name: "Marcus Aurelius", points: 840, issuesCount: 12, validations: 34, avatar: "MA", color: "#c084fc" },
  { name: "Sarah Jenkins", points: 620, issuesCount: 8, validations: 22, avatar: "SJ", color: "#22d3ee" },
  { name: "Robert Miller", points: 490, issuesCount: 6, validations: 19, avatar: "RM", color: "#34d399" },
  { name: "David Chen", points: 290, issuesCount: 3, validations: 11, avatar: "DC", color: "#f43f5e" }
];
// 2. STATE INITIALIZATION
let issues = [];
let userProfile = null; // null if not logged in
let leaderboard = [];
// Leaflet Map objects
let mainMapObj = null;
let formMapObj = null;
let mainMarkers = [];
let formMarker = null;
// Chart JS holder
let dashboardChartObj = null;
// Initialize function
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupRouting();
  setupReportingModule();
  setupDashboardCharts();
  setupGlobalActions();
  setupAuthHandlers();
  
  // Render default view lists
  updateStats();
  renderIssuesFeed();
  renderLeaderboard();
  renderAdminQueue();
  
  // Default map init (delayed slightly to handle display loading)
  setTimeout(() => {
    initMainMap();
  }, 100);
});
// 3. STORAGE & DATA SYNC
function loadData() {
  const storedIssues = localStorage.getItem('civicpulse_issues');
  const storedProfile = localStorage.getItem('civicpulse_profile');
  const storedLeaderboard = localStorage.getItem('civicpulse_leaderboard');
  
  if (storedIssues) {
    issues = JSON.parse(storedIssues);
  } else {
    issues = [...DEFAULT_ISSUES];
    localStorage.setItem('civicpulse_issues', JSON.stringify(issues));
  }
  
  if (storedLeaderboard) {
    leaderboard = JSON.parse(storedLeaderboard);
  } else {
    leaderboard = [...DEFAULT_LEADERBOARD];
    localStorage.setItem('civicpulse_leaderboard', JSON.stringify(leaderboard));
  }
  
  if (storedProfile) {
    userProfile = JSON.parse(storedProfile);
    
    // Hide login screen immediately
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.getElementById('app-container');
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (appContainer) appContainer.classList.remove('blur-bg');
    
    // Make sure user is in the leaderboard
    ensureUserInLeaderboard();
    syncProfileDOM();
  } else {
    // Show login overlay
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.getElementById('app-container');
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (appContainer) appContainer.classList.add('blur-bg');
  }
}
function ensureUserInLeaderboard() {
  if (!userProfile) return;
  const userIdx = leaderboard.findIndex(u => u.name === userProfile.name);
  if (userIdx === -1) {
    leaderboard.push({
      name: userProfile.name,
      points: userProfile.points,
      issuesCount: issues.filter(i => i.reportedBy === userProfile.name).length,
      validations: 0,
      avatar: userProfile.avatar,
      color: '#e879f9' // neon magenta
    });
    localStorage.setItem('civicpulse_leaderboard', JSON.stringify(leaderboard));
  }
}
function syncData() {
  localStorage.setItem('civicpulse_issues', JSON.stringify(issues));
  if (userProfile) {
    localStorage.setItem('civicpulse_profile', JSON.stringify(userProfile));
    
    // Find current user in leaderboard and update their score
    const userIdx = leaderboard.findIndex(u => u.name === userProfile.name);
    if (userIdx !== -1) {
      leaderboard[userIdx].points = userProfile.points;
      leaderboard[userIdx].issuesCount = issues.filter(i => i.reportedBy === userProfile.name).length;
      localStorage.setItem('civicpulse_leaderboard', JSON.stringify(leaderboard));
    }
  }
  
  syncProfileDOM();
  updateStats();
  renderLeaderboard();
  renderIssuesFeed();
  renderAdminQueue();
  updateChart();
  
  if (mainMapObj) {
    refreshMapMarkers();
  }
}
function syncProfileDOM() {
  if (!userProfile) return;
  
  document.getElementById('sidebar-points').innerText = userProfile.points;
  document.getElementById('sidebar-avatar').innerText = userProfile.avatar;
  document.getElementById('sidebar-username').innerText = userProfile.name;
  
  // Profile tab updates
  const profileAvatar = document.getElementById('user-profile-avatar');
  const profileLevel = document.getElementById('user-profile-level');
  const profileName = document.getElementById('user-profile-name');
  const progressText = document.getElementById('level-progress-text');
  const progressBar = document.getElementById('level-progress-bar');
  
  if (profileAvatar) profileAvatar.innerText = userProfile.avatar;
  if (profileName) profileName.innerText = userProfile.name;
  
  // XP levels system: level 1 (< 100), level 2 (100 - 250), level 3 (250 - 500), level 4 (500 - 1000)
  let level = 1;
  let minXP = 0;
  let maxXP = 100;
  
  if (userProfile.points >= 1000) {
    level = 5;
    minXP = 1000;
    maxXP = 2500;
  } else if (userProfile.points >= 500) {
    level = 4;
    minXP = 500;
    maxXP = 1000;
  } else if (userProfile.points >= 250) {
    level = 3;
    minXP = 250;
    maxXP = 500;
  } else if (userProfile.points >= 100) {
    level = 2;
    minXP = 100;
    maxXP = 250;
  }
  
  userProfile.level = level;
  if (profileLevel) profileLevel.innerText = `Lvl ${level} Community Contributor`;
  
  const xpInCurrentLvl = userProfile.points - minXP;
  const xpNeededForNext = maxXP - minXP;
  const pct = Math.min(100, Math.max(0, (xpInCurrentLvl / xpNeededForNext) * 100));
  
  if (progressText) progressText.innerText = `${userProfile.points} / ${maxXP} XP`;
  if (progressBar) progressBar.style.width = `${pct}%`;
  
  const statLevel = document.getElementById('stat-level');
  if (statLevel) statLevel.innerText = `Lvl ${level}`;
}
// 4. SIGN IN & SIGN OUT LOGIC
function setupAuthHandlers() {
  const loginForm = document.getElementById('login-form');
  const loginOverlay = document.getElementById('login-overlay');
  const appContainer = document.getElementById('app-container');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('login-username').value.trim();
      const emailInput = document.getElementById('login-email').value.trim();
      
      if (!usernameInput) return;
      
      // Extract initials (e.g. "Jane Doe" -> "JD", "Marcus" -> "M")
      const words = usernameInput.split(' ');
      let initials = words[0].charAt(0).toUpperCase();
      if (words.length > 1) {
        initials += words[words.length - 1].charAt(0).toUpperCase();
      } else {
        initials = usernameInput.substring(0, 2).toUpperCase();
      }
      
      // Create user profile (default 50 points as welcome reward!)
      userProfile = {
        name: usernameInput,
        points: 50,
        level: 1,
        avatar: initials
      };
      
      localStorage.setItem('civicpulse_profile', JSON.stringify(userProfile));
      ensureUserInLeaderboard();
      
      // Animate transition out
      loginOverlay.classList.add('fade-out');
      appContainer.classList.remove('blur-bg');
      
      setTimeout(() => {
        loginOverlay.style.display = 'none';
        loginOverlay.classList.remove('fade-out');
      }, 500);
      
      syncData();
      triggerToast(`Welcome to CivicPulse, ${usernameInput}! (+50 Welcome Points)`, "success");
      
      // Reload maps to ensure layout sizes are fully updated
      setTimeout(() => {
        if (mainMapObj) mainMapObj.invalidateSize();
      }, 200);
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('civicpulse_profile');
        window.location.reload();
      }
    });
  }
}
// 5. ROUTER / NAV SYSTEM
function setupRouting() {
  const navLinks = document.querySelectorAll('.nav-link');
  const viewPanes = document.querySelectorAll('.view-pane');
  const viewTitle = document.getElementById('current-view-title');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetView = link.getAttribute('data-view');
      
      navLinks.forEach(n => n.classList.remove('active'));
      link.classList.add('active');
      
      viewPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `view-${targetView}`) {
          pane.classList.add('active');
        }
      });
      
      // Update Title Bar text
      let titleText = "Overview";
      switch(targetView) {
        case 'dashboard': titleText = "Dashboard Analytics"; break;
        case 'map': 
          titleText = "Interactive Neighborhood Map"; 
          setTimeout(() => {
            if (mainMapObj) mainMapObj.invalidateSize();
          }, 150);
          break;
        case 'feed': titleText = "Community Active Feed"; break;
        case 'report': 
          titleText = "Identify & Report New Issue"; 
          setTimeout(() => {
            initFormMap();
          }, 150);
          break;
        case 'leaderboard': titleText = "Civic Engagement & Leaderboard"; break;
        case 'admin': titleText = "Municipal Action & Dispatch Board"; break;
      }
      viewTitle.innerText = titleText;
    });
  });
  // Short-circuits for secondary buttons
  document.getElementById('top-report-btn').addEventListener('click', () => {
    const reportLink = document.querySelector('.nav-link[data-view="report"]');
    if (reportLink) reportLink.click();
  });
}
// 6. TOAST NOTIFICATIONS
function triggerToast(message, type = 'success') {
  const toast = document.getElementById('toast-notif');
  const icon = document.getElementById('toast-icon');
  const msg = document.getElementById('toast-message');
  
  msg.innerText = message;
  
  if (type === 'success') {
    icon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--success)"></i>';
  } else if (type === 'info') {
    icon.innerHTML = '<i class="fa-solid fa-circle-info" style="color: var(--info)"></i>';
  } else if (type === 'warning') {
    icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--warning)"></i>';
  }
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
// 7. GLOBAL ACTIONS
function setupGlobalActions() {
  document.getElementById('seed-data-btn').addEventListener('click', () => {
    localStorage.removeItem('civicpulse_issues');
    localStorage.removeItem('civicpulse_profile');
    localStorage.removeItem('civicpulse_leaderboard');
    window.location.reload();
  });
}
// 8. DASHBOARD DATA AGGREGATION & CHARTS
function updateStats() {
  const reported = issues.filter(i => i.status === 'reported').length;
  const verified = issues.filter(i => i.status === 'verified' || i.status === 'progress').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  
  document.getElementById('stat-reported').innerText = reported;
  document.getElementById('stat-verified').innerText = verified;
  document.getElementById('stat-resolved').innerText = resolved;
}
function setupDashboardCharts() {
  const ctx = document.getElementById('dashboard-chart').getContext('2d');
  
  // Aggregate initial counts
  const counts = { pothole: 0, leakage: 0, streetlight: 0, waste: 0, infrastructure: 0 };
  issues.forEach(i => {
    if (counts[i.category] !== undefined) counts[i.category]++;
  });
  dashboardChartObj = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Potholes', 'Water Leaks', 'Streetlights', 'Waste', 'Infrastructure'],
      datasets: [
        {
          label: 'Active Concerns',
          data: [counts.pothole, counts.leakage, counts.streetlight, counts.waste, counts.infrastructure],
          backgroundColor: [
            'rgba(251, 191, 36, 0.65)',  // warm amber
            'rgba(56, 189, 248, 0.65)',  // sky blue
            'rgba(168, 85, 247, 0.65)',  // light purple
            'rgba(34, 211, 238, 0.65)',  // neon cyan
            'rgba(244, 63, 94, 0.65)'    // vibrant rose
          ],
          borderColor: [
            '#fbbf24',
            '#38bdf8',
            '#a855f7',
            '#22d3ee',
            '#f43f5e'
          ],
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#cbd5e1',
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: '#cbd5e1',
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        }
      }
    }
  });
}
function updateChart() {
  if (!dashboardChartObj) return;
  const counts = { pothole: 0, leakage: 0, streetlight: 0, waste: 0, infrastructure: 0 };
  issues.forEach(i => {
    if (counts[i.category] !== undefined) counts[i.category]++;
  });
  
  dashboardChartObj.data.datasets[0].data = [
    counts.pothole, counts.leakage, counts.streetlight, counts.waste, counts.infrastructure
  ];
  dashboardChartObj.update();
}
// 9. INTERACTIVE LEAFLET MAP MODULE
function initMainMap() {
  if (mainMapObj) return;
  
  mainMapObj = L.map('main-map').setView([37.7749, -122.4194], 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(mainMapObj);
  
  refreshMapMarkers();
  document.getElementById('map-filter-category').addEventListener('change', refreshMapMarkers);
  document.getElementById('map-filter-status').addEventListener('change', refreshMapMarkers);
}
function refreshMapMarkers() {
  if (!mainMapObj) return;
  
  mainMarkers.forEach(m => mainMapObj.removeLayer(m));
  mainMarkers = [];
  
  const catFilter = document.getElementById('map-filter-category').value;
  const statFilter = document.getElementById('map-filter-status').value;
  
  issues.forEach(issue => {
    if (catFilter !== 'all' && issue.category !== catFilter) return;
    if (statFilter !== 'all' && issue.status !== statFilter) return;
    
    let markerColor = '#a855f7';
    let markerIcon = 'fa-circle-exclamation';
    
    switch(issue.category) {
      case 'pothole': markerColor = '#fbbf24'; markerIcon = 'fa-road'; break;
      case 'leakage': markerColor = '#22d3ee'; markerIcon = 'fa-droplet'; break;
      case 'streetlight': markerColor = '#a855f7'; markerIcon = 'fa-lightbulb'; break;
      case 'waste': markerColor = '#34d399'; markerIcon = 'fa-trash-can'; break;
      case 'infrastructure': markerColor = '#f43f5e'; markerIcon = 'fa-bridge-circle-xmark'; break;
    }
    
    const iconHTML = `<div class="custom-pin" style="background-color: ${markerColor};">
                        <i class="fa-solid ${markerIcon}"></i>
                      </div>`;
                      
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: iconHTML,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
    
    const statusBadges = {
      reported: '<span class="badge-status reported">Reported</span>',
      verified: '<span class="badge-status verified">Verified</span>',
      progress: '<span class="badge-status progress">In Progress</span>',
      resolved: '<span class="badge-status resolved">Resolved</span>'
    };
    
    const popupContent = `
      <div class="map-popup-card">
        <h4 class="map-popup-title">${issue.title}</h4>
        <span class="map-popup-category">${issue.category.toUpperCase()}</span>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">${issue.description.substring(0, 80)}...</p>
        <div class="map-popup-status">
          Status: ${statusBadges[issue.status]}
        </div>
        <div style="margin-top: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.75rem; color: var(--color-text-muted);"><i class="fa-solid fa-thumbs-up"></i> ${issue.votes} Votes</span>
          <button class="btn btn-primary btn-sm" onclick="globalVoteHandler('${issue.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
            Verify / Upvote
          </button>
        </div>
      </div>
    `;
    
    const marker = L.marker([issue.lat, issue.lng], { icon: customIcon })
      .bindPopup(popupContent)
      .addTo(mainMapObj);
      
    mainMarkers.push(marker);
  });
}
window.globalVoteHandler = function(issueId) {
  upvoteIssue(issueId);
};
// 10. FORM SELECTOR MAP
function initFormMap() {
  if (formMapObj) return;
  
  formMapObj = L.map('form-location-map').setView([37.7749, -122.4194], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(formMapObj);
  
  document.getElementById('report-lat').value = 37.7749;
  document.getElementById('report-lng').value = -122.4194;
  
  formMarker = L.marker([37.7749, -122.4194], { draggable: true }).addTo(formMapObj);
  
  formMarker.on('dragend', function(e) {
    const latlng = formMarker.getLatLng();
    document.getElementById('report-lat').value = latlng.lat.toFixed(6);
    document.getElementById('report-lng').value = latlng.lng.toFixed(6);
  });
  
  formMapObj.on('click', function(e) {
    formMarker.setLatLng(e.latlng);
    document.getElementById('report-lat').value = e.latlng.lat.toFixed(6);
    document.getElementById('report-lng').value = e.latlng.lng.toFixed(6);
  });
}
// 11. ACTIVE FEED RENDER & FILTERING
function renderIssuesFeed() {
  const container = document.getElementById('issues-feed-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  const activeCategoryBtn = document.querySelector('#feed-category-filters .filter-btn.active');
  const activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-filter') : 'all';
  const sortVal = document.getElementById('feed-sort-select').value;
  
  let filtered = [...issues];
  if (activeCategory !== 'all') {
    filtered = filtered.filter(i => i.category === activeCategory);
  }
  
  if (sortVal === 'votes') {
    filtered.sort((a, b) => b.votes - a.votes);
  } else if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortVal === 'status') {
    const weights = { reported: 1, verified: 2, progress: 3, resolved: 4 };
    filtered.sort((a, b) => weights[a.status] - weights[b.status]);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-secondary);">
        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-text-muted);"></i>
        <p>No issues found matching this filter.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(issue => {
    const card = document.createElement('div');
    card.className = 'glass-card issue-card';
    
    const statusLabels = {
      reported: 'Reported',
      verified: 'Verified',
      progress: 'In Progress',
      resolved: 'Resolved'
    };
    
    const isVoted = issue.voters.includes('currentUser');
    
    card.innerHTML = `
      <div class="issue-card-image-wrapper">
        <img src="${issue.imageUrl}" class="issue-card-image" alt="${issue.title}">
        <span class="issue-card-badge ${issue.status}">${statusLabels[issue.status]}</span>
      </div>
      
      <div class="issue-card-content">
        <div class="issue-card-meta">
          <span>By ${issue.reportedBy}</span>
          <span>${issue.date}</span>
        </div>
        <h4 class="issue-card-title">${issue.title}</h4>
        <p class="issue-card-desc">${issue.description}</p>
        
        <div class="issue-card-actions">
          <div class="action-vote-container">
            <button class="vote-btn ${isVoted ? 'active' : ''}" data-id="${issue.id}">
              <i class="fa-solid fa-thumbs-up"></i>
            </button>
            <span class="vote-count">${issue.votes} upvotes</span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="openCommentModal('${issue.id}')">
            <i class="fa-solid fa-comments"></i> ${issue.comments.length} Comments
          </button>
        </div>
      </div>
    `;
    
    card.querySelector('.vote-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      upvoteIssue(issue.id);
    });
    
    container.appendChild(card);
  });
}
function upvoteIssue(issueId) {
  if (!userProfile) {
    triggerToast("Please sign in to verify community issues.", "warning");
    return;
  }
  
  const issue = issues.find(i => i.id === issueId);
  if (!issue) return;
  
  const userIndex = issue.voters.indexOf('currentUser');
  if (userIndex === -1) {
    issue.voters.push('currentUser');
    issue.votes++;
    userProfile.points += 10;
    triggerToast("Upvoted! Civic Score increased (+10 pts)", "success");
    
    if (issue.status === 'reported' && issue.votes >= 5) {
      issue.status = 'verified';
      triggerToast("Issue status updated to verified due to community support!", "info");
    }
  } else {
    issue.voters.splice(userIndex, 1);
    issue.votes--;
    userProfile.points = Math.max(0, userProfile.points - 10);
    triggerToast("Vote removed.", "info");
  }
  
  syncData();
}
window.openCommentModal = function(issueId) {
  if (!userProfile) {
    triggerToast("Please sign in to comment on issues.", "warning");
    return;
  }
  
  const issue = issues.find(i => i.id === issueId);
  if (!issue) return;
  
  const commentText = prompt(`Comments for "${issue.title}":\n\n${
    issue.comments.map(c => `${c.author} (${c.date}): ${c.content}`).join('\n\n')
  }\n\nType your comment:`);
  
  if (commentText && commentText.trim() !== "") {
    issue.comments.push({
      author: userProfile.name,
      content: commentText.trim(),
      date: new Date().toISOString().split('T')[0]
    });
    userProfile.points += 5;
    triggerToast("Comment added! Civic Score increased (+5 pts)", "success");
    syncData();
  }
};
// Setup Feed Filtering DOM bindings
document.querySelectorAll('#feed-category-filters .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#feed-category-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderIssuesFeed();
  });
});
document.getElementById('feed-sort-select').addEventListener('change', renderIssuesFeed);
// 12. REPORT ISSUE & MOCK AI SCANNER
function setupReportingModule() {
  const uploadZone = document.getElementById('report-upload-zone');
  const mediaInput = document.getElementById('report-media-input');
  const previewContainer = document.getElementById('media-preview-container');
  const previewImg = document.getElementById('media-preview-img');
  const removeBtn = document.getElementById('remove-media-btn');
  const aiScanner = document.getElementById('ai-scanner');
  const aiLoading = document.getElementById('ai-scanner-loading');
  const aiResults = document.getElementById('ai-scanner-results');
  const reportForm = document.getElementById('issue-report-form');
  
  uploadZone.addEventListener('click', () => mediaInput.click());
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });
  
  mediaInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleUploadedFile(e.target.files[0]);
    }
  });
  
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mediaInput.value = "";
    previewImg.src = "";
    previewContainer.style.display = "none";
    uploadZone.style.display = "flex";
    aiScanner.style.display = "none";
  });
  
  function handleUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      previewImg.src = event.target.result;
      uploadZone.style.display = "none";
      previewContainer.style.display = "block";
      
      triggerAiScanner(file.name);
    };
    reader.readAsDataURL(file);
  }
  
  function triggerAiScanner(filename) {
    aiScanner.style.display = "block";
    aiScanner.classList.add('scanning');
    aiLoading.style.display = "block";
    aiResults.style.display = "none";
    
    const fn = filename.toLowerCase();
    let predictedCat = "pothole";
    let categorySelectVal = "pothole";
    
    if (fn.includes("water") || fn.includes("leak") || fn.includes("pipe") || fn.includes("flood")) {
      predictedCat = "Water Leakage";
      categorySelectVal = "leakage";
    } else if (fn.includes("light") || fn.includes("lamp") || fn.includes("dark") || fn.includes("street")) {
      predictedCat = "Streetlight Malfunction";
      categorySelectVal = "streetlight";
    } else if (fn.includes("trash") || fn.includes("waste") || fn.includes("garbage") || fn.includes("dump")) {
      predictedCat = "Waste / Trash dumping";
      categorySelectVal = "waste";
    } else if (fn.includes("bench") || fn.includes("park") || fn.includes("broken") || fn.includes("road")) {
      predictedCat = "Public Infrastructure";
      categorySelectVal = "infrastructure";
    }
    
    setTimeout(() => {
      aiScanner.classList.remove('scanning');
      aiLoading.style.display = "none";
      aiResults.style.display = "block";
      
      document.getElementById('ai-pred-category').innerText = predictedCat;
      document.getElementById('ai-confidence-fill').style.width = "94%";
      document.getElementById('ai-confidence-text').innerText = "94% Confidence";
      
      document.getElementById('report-category').value = categorySelectVal;
      
      triggerToast("AI Scanner processed image: suggested category is " + predictedCat, "info");
    }, 2000);
  }
  
  reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!userProfile) {
      triggerToast("Please sign in to report issues.", "warning");
      return;
    }
    
    const title = document.getElementById('report-title').value.trim();
    const category = document.getElementById('report-category').value;
    const description = document.getElementById('report-description').value.trim();
    const lat = parseFloat(document.getElementById('report-lat').value);
    const lng = parseFloat(document.getElementById('report-lng').value);
    
    let imageSrc = previewImg.src;
    if (!imageSrc || imageSrc === "") {
      switch(category) {
        case 'pothole': imageSrc = "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop"; break;
        case 'leakage': imageSrc = "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=600&auto=format&fit=crop"; break;
        case 'streetlight': imageSrc = "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop"; break;
        case 'waste': imageSrc = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop"; break;
        default: imageSrc = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&auto=format&fit=crop";
      }
    }
    
    const newIssue = {
      id: "issue-" + Date.now(),
      title: title,
      category: category,
      description: description,
      lat: lat,
      lng: lng,
      status: "reported",
      votes: 1,
      voters: ["currentUser"],
      comments: [],
      imageUrl: imageSrc,
      reportedBy: userProfile.name,
      date: new Date().toISOString().split('T')[0]
    };
    
    issues.push(newIssue);
    userProfile.points += 50;
    
    triggerToast("Issue reported successfully! Earned +50 Civic XP", "success");
    
    reportForm.reset();
    previewImg.src = "";
    previewContainer.style.display = "none";
    uploadZone.style.display = "flex";
    aiScanner.style.display = "none";
    
    syncData();
    
    const feedLink = document.querySelector('.nav-link[data-view="feed"]');
    if (feedLink) feedLink.click();
  });
  
  document.getElementById('cancel-report-btn').addEventListener('click', () => {
    reportForm.reset();
    previewImg.src = "";
    previewContainer.style.display = "none";
    uploadZone.style.display = "flex";
    aiScanner.style.display = "none";
    
    const dashboardLink = document.querySelector('.nav-link[data-view="dashboard"]');
    if (dashboardLink) dashboardLink.click();
  });
}
// 13. CIVIC LEADERBOARD RENDER
function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  leaderboard.sort((a, b) => b.points - a.points);
  
  leaderboard.forEach((user, idx) => {
    const tr = document.createElement('tr');
    const rankClass = idx < 3 ? `top-3 rank-${idx + 1}` : '';
    const rankDisplay = idx < 3 ? `<i class="fa-solid fa-medal"></i>` : idx + 1;
    
    const isSelf = userProfile && user.name === userProfile.name;
    
    tr.innerHTML = `
      <td class="rank-cell ${rankClass}">${rankDisplay}</td>
      <td>
        <div class="leaderboard-user">
          <div class="leaderboard-avatar" style="background: ${user.color || '#3b82f6'}">${user.avatar}</div>
          <span style="font-weight: 600;">${user.name}</span>
          ${isSelf ? '<span class="badge-status progress" style="font-size: 0.65rem; padding: 0.15rem 0.35rem; margin-left: 0.5rem;">You</span>' : ''}
        </div>
      </td>
      <td>${user.issuesCount}</td>
      <td>${user.validations}</td>
      <td style="font-weight: 700; color: var(--secondary);">${user.points} pts</td>
    `;
    
    tbody.appendChild(tr);
  });
}
// 14. MUNICIPAL ADMIN WORKFLOW
function renderAdminQueue() {
  const tbody = document.getElementById('admin-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  issues.forEach(issue => {
    const tr = document.createElement('tr');
    
    const statusBadges = {
      reported: '<span class="badge-status reported">Reported</span>',
      verified: '<span class="badge-status verified">Verified</span>',
      progress: '<span class="badge-status progress">In Progress</span>',
      resolved: '<span class="badge-status resolved">Resolved</span>'
    };
    
    let actionsHTML = '';
    
    if (issue.status === 'reported') {
      actionsHTML = `<button class="btn btn-secondary btn-sm" onclick="adminChangeStatus('${issue.id}', 'verified')">Verify</button>`;
    } else if (issue.status === 'verified') {
      actionsHTML = `<button class="btn btn-primary btn-sm" onclick="adminChangeStatus('${issue.id}', 'progress')">Dispatch Crew</button>`;
    } else if (issue.status === 'progress') {
      actionsHTML = `<button class="btn btn-primary btn-sm" onclick="adminChangeStatus('${issue.id}', 'resolved')" style="background-color: var(--success); border-color: var(--success);">Mark Resolved</button>`;
    } else {
      actionsHTML = `<span style="font-size: 0.8rem; color: var(--color-text-muted); font-style: italic;">No actions remaining</span>`;
    }
    
    tr.innerHTML = `
      <td style="font-weight: 600;">${issue.title}</td>
      <td style="text-transform: capitalize;">${issue.category}</td>
      <td>${issue.votes} reports</td>
      <td>${statusBadges[issue.status]}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          ${actionsHTML}
        </div>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}
window.adminChangeStatus = function(issueId, newStatus) {
  const issue = issues.find(i => i.id === issueId);
  if (!issue) return;
  
  issue.status = newStatus;
  
  if (newStatus === 'resolved') {
    if (userProfile && issue.reportedBy === userProfile.name) {
      userProfile.points += 100;
      triggerToast("Your reported issue has been RESOLVED! Received +100 Civic XP!", "success");
    } else {
      triggerToast("Issue marked as Resolved. Notification dispatched to reporter.", "success");
    }
  } else {
    triggerToast("Issue updated to " + newStatus, "info");
  }
  
  syncData();
};
