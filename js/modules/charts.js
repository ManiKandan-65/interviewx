/* ==========================================================================
   INTERVIEWX — SVG CHART & GRAPH RENDERER
   ========================================================================== */

const ChartRenderer = {
    
    /**
     * Render SVG Circular Progress Dial
     */
    renderCircularDial(elementId, percentage, colorClass = 'cyan') {
        const el = document.getElementById(elementId);
        if (!el) return;

        const radius = 15.9155;
        const dashArray = `${percentage}, 100`;

        el.innerHTML = `
            <svg viewBox="0 0 36 36" class="circular-chart ${colorClass}">
                <path class="circle-bg" d="M18 2.0845 a ${radius} ${radius} 0 0 1 0 31.831 a ${radius} ${radius} 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="${dashArray}" d="M18 2.0845 a ${radius} ${radius} 0 0 1 0 31.831 a ${radius} ${radius} 0 0 1 0 -31.831"/>
                <text x="18" y="20.35" class="percentage">${percentage}%</text>
            </svg>
        `;
    },

    /**
     * Render Topic Score Bars List
     */
    renderTopicBars(containerId, topicStats) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const topics = Object.keys(topicStats);
        if (topics.length === 0) {
            container.innerHTML = `<div class="empty-list-placeholder">No topic performance data logged yet.</div>`;
            return;
        }

        let html = '';
        topics.forEach(tKey => {
            const stat = topicStats[tKey];
            const colorClass = stat.avgScore >= 75 ? 'cyan' : (stat.avgScore >= 50 ? 'purple' : 'red');
            html += `
                <div class="skill-row mb-3">
                    <div class="skill-meta mb-1">
                        <span>${stat.topic} (${stat.attempts} attempts)</span>
                        <strong class="font-${colorClass}">${stat.avgScore}%</strong>
                    </div>
                    <div class="progress-bar-md">
                        <div class="progress-fill ${colorClass}" style="width: ${stat.avgScore}%"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};
