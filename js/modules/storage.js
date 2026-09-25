/* ==========================================================================
   INTERVIEWX — LOCALSTORAGE STORAGE MANAGER
   ========================================================================== */

const StorageManager = {
    KEYS: {
        PROFILE: 'interviewx_profile',
        HISTORY: 'interviewx_history',
        MISTAKES: 'interviewx_mistakes',
        TOPICS: 'interviewx_topic_stats',
        STREAK: 'interviewx_streak_data',
        CHECKLIST: 'interviewx_checklist_data',
        ACHIEVEMENTS: 'interviewx_achievements',
        THEME: 'interviewx_theme_pref'
    },

    safeParse(data, fallback) {
        if (!data) return fallback;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.warn("StorageManager: JSON parse error, returning fallback", e);
            return fallback;
        }
    },

    safeSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("StorageManager: Failed to save to localStorage", e);
        }
    },

    // --- CANDIDATE PROFILE ---
    getProfile() {
        const data = localStorage.getItem(this.KEYS.PROFILE);
        return this.safeParse(data, {
            name: 'Alex Mercer',
            experience: '1-3 Years',
            role: 'Software Engineer',
            customRole: '',
            companyType: 'Product-Based',
            theme: 'dark'
        });
    },

    saveProfile(profile) {
        this.safeSet(this.KEYS.PROFILE, profile);
    },

    // --- INTERVIEW HISTORY ---
    getHistory() {
        const data = localStorage.getItem(this.KEYS.HISTORY);
        return this.safeParse(data, []);
    },

    saveSession(session) {
        const history = this.getHistory();
        const newSession = {
            id: 'sess_' + Date.now(),
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            ...session
        };
        history.unshift(newSession);
        this.safeSet(this.KEYS.HISTORY, history);

        // Update Topic Performance Stats
        if (session.topicBreakdown) {
            Object.keys(session.topicBreakdown).forEach(topic => {
                const topicData = session.topicBreakdown[topic];
                this.updateTopicPerformance(topic, topicData.score, topicData.confidence || 75);
            });
        }

        // Update streak
        this.updateStreak();

        return newSession;
    },

    // --- TOPIC PERFORMANCE & WEAK TOPIC DETECTION ---
    getTopicStats() {
        const data = localStorage.getItem(this.KEYS.TOPICS);
        return this.safeParse(data, {});
    },

    updateTopicPerformance(topic, score, confidence) {
        const stats = this.getTopicStats();
        if (!stats[topic]) {
            stats[topic] = {
                topic: topic,
                attempts: 0,
                totalScore: 0,
                avgScore: 0,
                confidence: 0,
                history: [],
                lastTested: new Date().toISOString()
            };
        }

        stats[topic].attempts += 1;
        stats[topic].totalScore += score;
        stats[topic].avgScore = Math.round(stats[topic].totalScore / stats[topic].attempts);
        stats[topic].confidence = Math.round((stats[topic].confidence + confidence) / 2);
        stats[topic].history.push({ date: new Date().toISOString(), score: score });
        stats[topic].lastTested = new Date().toISOString();

        this.safeSet(this.KEYS.TOPICS, stats);
    },

    getWeakTopics() {
        const stats = this.getTopicStats();
        const weakList = [];
        Object.keys(stats).forEach(topic => {
            if (stats[topic].avgScore < 60) {
                weakList.push(stats[topic]);
            }
        });
        return weakList.sort((a, b) => a.avgScore - b.avgScore);
    },

    // --- MISTAKE VAULT ---
    getMistakeVault() {
        const data = localStorage.getItem(this.KEYS.MISTAKES);
        return this.safeParse(data, []);
    },

    saveMistake(mistake) {
        const vault = this.getMistakeVault();
        const existingIndex = vault.findIndex(m => m.questionId === mistake.questionId);

        if (existingIndex >= 0) {
            vault[existingIndex].retries += 1;
            vault[existingIndex].lastFailedDate = new Date().toISOString();
            vault[existingIndex].userAnswer = mistake.userAnswer;
            vault[existingIndex].score = mistake.score;
        } else {
            vault.push({
                id: 'mst_' + Date.now(),
                questionId: mistake.questionId,
                question: mistake.question,
                topic: mistake.topic,
                category: mistake.category,
                userAnswer: mistake.userAnswer,
                expectedAnswer: mistake.expectedAnswer,
                sampleAnswer: mistake.sampleAnswer || '',
                hint: mistake.hint || '',
                explanation: mistake.explanation || '',
                score: mistake.score,
                date: new Date().toISOString(),
                retries: 1,
                status: 'needs-review' // 'needs-review', 'frequent', 'improved'
            });
        }

        this.safeSet(this.KEYS.MISTAKES, vault);
    },

    updateMistakeStatus(mistakeId, newStatus) {
        const vault = this.getMistakeVault();
        const item = vault.find(m => m.id === mistakeId);
        if (item) {
            item.status = newStatus;
            this.safeSet(this.KEYS.MISTAKES, vault);
        }
    },

    // --- STREAK TRACKER ---
    getStreak() {
        const data = localStorage.getItem(this.KEYS.STREAK);
        return this.safeParse(data, { currentStreak: 0, lastActiveDate: null });
    },

    updateStreak() {
        const streakData = this.getStreak();
        const today = new Date().toDateString();

        if (!streakData.lastActiveDate) {
            streakData.currentStreak = 1;
            streakData.lastActiveDate = today;
        } else {
            const lastDate = new Date(streakData.lastActiveDate);
            const currentDate = new Date(today);
            const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streakData.currentStreak += 1;
                streakData.lastActiveDate = today;
            } else if (diffDays > 1) {
                streakData.currentStreak = 1;
                streakData.lastActiveDate = today;
            }
        }
        this.safeSet(this.KEYS.STREAK, streakData);
        return streakData.currentStreak;
    },

    // --- COMPANY CHECKLIST STATE ---
    getChecklistState() {
        const data = localStorage.getItem(this.KEYS.CHECKLIST);
        return this.safeParse(data, {});
    },

    saveChecklistState(itemText, isChecked) {
        const state = this.getChecklistState();
        state[itemText] = isChecked;
        this.safeSet(this.KEYS.CHECKLIST, state);
    },

    // --- THEME PREFERENCE ---
    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    },

    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
        } catch (e) {
            console.error("StorageManager: Failed to save theme", e);
        }
    },

    // --- BACKUP & DATA RESET ---
    exportData() {
        const exportObj = {
            profile: this.getProfile(),
            history: this.getHistory(),
            mistakes: this.getMistakeVault(),
            topics: this.getTopicStats(),
            streak: this.getStreak(),
            checklist: this.getChecklistState()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `InterviewX_Backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    clearData() {
        localStorage.removeItem(this.KEYS.PROFILE);
        localStorage.removeItem(this.KEYS.HISTORY);
        localStorage.removeItem(this.KEYS.MISTAKES);
        localStorage.removeItem(this.KEYS.TOPICS);
        localStorage.removeItem(this.KEYS.STREAK);
        localStorage.removeItem(this.KEYS.CHECKLIST);
        localStorage.removeItem(this.KEYS.ACHIEVEMENTS);
    }
};
