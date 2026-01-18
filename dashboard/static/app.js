// Multiagent Admin Dashboard JS

const API_BASE = '/admin';

// Tab navigation
// Tab navigation
document.querySelectorAll('.nav-menu .nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Handle click on icon or span inside anchor
        const target = e.target.closest('.nav-item');
        const tab = target.dataset.tab;

        // Update active link
        document.querySelectorAll('.nav-menu .nav-item').forEach(l => l.classList.remove('active'));
        target.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab).classList.add('active');

        // Update header title
        const titles = {
            overview: 'Dashboard Overview',
            config: 'System Configuration',
            metrics: 'Performance Metrics',
            audit: 'Audit Trails'
        };
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = titles[tab];

        // Update breadcrumbs
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (breadcrumbs) breadcrumbs.textContent = `Dashboard / ${titles[tab]}`;
    });
});

// Fetch wrapper with auth
async function fetchWithAuth(url) {
    // Hardcoded for demo/preview since there is no login page yet
    const token = 'admin';
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Fetch config
async function loadConfig() {
    try {
        const res = await fetchWithAuth(`${API_BASE}/config`);
        const data = await res.json();

        document.getElementById('cfg-version').value = data.version;

        const featuresDiv = document.getElementById('cfg-features');
        featuresDiv.innerHTML = data.features
            .map(f => `<span class="tag">${f}</span>`)
            .join('');
    } catch (err) {
        console.error('Failed to load config:', err);
    }
}

// Fetch metrics
async function loadMetrics() {
    try {
        const res = await fetchWithAuth(`${API_BASE}/metrics`);
        const data = await res.json();

        document.getElementById('stat-requests').textContent = data.requests_total.toLocaleString();
        document.getElementById('stat-tokens').textContent = data.tokens_used.toLocaleString();
        document.getElementById('stat-sessions').textContent = data.active_sessions;
        document.getElementById('stat-latency').textContent = `${data.avg_latency_ms || 0}ms`;
    } catch (err) {
        console.error('Failed to load metrics:', err);
    }
}

// Fetch audit logs
async function loadAuditLogs() {
    const userId = document.getElementById('filter-user').value;
    const action = document.getElementById('filter-action').value;

    let url = `${API_BASE}/audit?limit=50`;
    if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;

    try {
        const res = await fetchWithAuth(url);
        const entries = await res.json();

        const tbody = document.getElementById('audit-body');
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No audit entries found</td></tr>';
            return;
        }

        tbody.innerHTML = entries.map(e => `
            <tr>
                <td>${e.timestamp}</td>
                <td>${e.user_id}</td>
                <td>${e.action}</td>
                <td>${e.resource}</td>
                <td><span class="outcome-${e.outcome.toLowerCase()}">${e.outcome}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load audit logs:', err);
    }
}

// Event listeners
document.getElementById('btn-refresh')?.addEventListener('click', loadAuditLogs);

// Initial load
loadConfig();
loadMetrics();

// Auto-refresh metrics every 30s
setInterval(loadMetrics, 30000);
