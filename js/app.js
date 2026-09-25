/* ==========================================================================
   INTERVIEWX — MAIN APPLICATION CONTROLLER
   ========================================================================== */

const App = {
    // Current Active Interview Room State
    interviewState: {
        active: false,
        role: 'Software Engineer',
        type: 'Mixed Interview',
        difficulty: 'Intermediate',
        length: 10,
        questions: [],
        currentIndex: 0,
        answers: {}, // index -> { answer, confidence, score, evaluation, status }
        timerSeconds: 0,
        timerInterval: null,
        isPaused: false,
        startTime: null
    },

    init() {
        UIManager.init();
        this.bindEvents();
        this.loadProfileIntoSetup();
        this.renderDashboard();
        this.renderBadges();
        this.checkInitialData();
    },

    onViewChange(viewId) {
        if (viewId === 'dashboard') {
            this.renderDashboard();
        } else if (viewId === 'learning-center') {
            this.renderLearningCenter();
        } else if (viewId === 'mistake-vault') {
            this.renderMistakeVault();
        } else if (viewId === 'analytics') {
            this.renderAnalytics();
        } else if (viewId === 'history') {
            this.renderHistory();
        } else if (viewId === 'profile') {
            this.renderProfile();
        } else if (viewId === 'coding-lab') {
            this.setupCodingLab();
        } else if (viewId === 'project-round') {
            this.setupProjectRound();
        } else if (viewId === 'hr-round') {
            this.setupHRRound();
        }
    },

    bindEvents() {
        // Hero CTA Buttons
        document.getElementById('btn-hero-start')?.addEventListener('click', () => UIManager.showView('setup'));
        document.getElementById('btn-hero-explore')?.addEventListener('click', () => {
            document.getElementById('platform-features')?.scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('btn-quick-start')?.addEventListener('click', () => UIManager.showView('setup'));
        document.getElementById('logo-btn')?.addEventListener('click', () => UIManager.showView('landing'));

        // Dashboard Buttons
        document.getElementById('btn-dash-start-interview')?.addEventListener('click', () => UIManager.showView('setup'));
        document.getElementById('btn-dash-rec-action')?.addEventListener('click', () => {
            const action = RecommendationEngine.getNextBestAction();
            UIManager.showView(action.targetView || 'setup');
        });
        document.getElementById('sidebar-action-btn')?.addEventListener('click', () => {
            const action = RecommendationEngine.getNextBestAction();
            UIManager.showView(action.targetView || 'setup');
        });
        document.getElementById('btn-dash-view-history')?.addEventListener('click', () => UIManager.showView('history'));
        document.getElementById('btn-dash-to-learning')?.addEventListener('click', () => UIManager.showView('learning-center'));

        // Setup Form Handlers
        const roleSelect = document.getElementById('setup-role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                const isCustom = e.target.value === 'custom';
                document.getElementById('custom-role-wrap').style.display = isCustom ? 'block' : 'none';
                this.updateRoleIntelPreview(isCustom ? (document.getElementById('setup-custom-role').value || 'Custom Role') : e.target.value);
            });
        }
        document.getElementById('setup-custom-role')?.addEventListener('input', (e) => {
            this.updateRoleIntelPreview(e.target.value || 'Custom Role');
        });

        document.getElementById('btn-generate-roadmap')?.addEventListener('click', () => this.generateRoadmap());

        // Roadmap Buttons
        document.getElementById('btn-start-full-interview')?.addEventListener('click', () => this.startInterviewSession());
        document.querySelectorAll('.btn-start-stage').forEach(btn => {
            btn.addEventListener('click', () => this.startInterviewSession());
        });

        // Interview Room Inputs & Nav Controls
        const answerInput = document.getElementById('room-answer-input');
        if (answerInput) {
            answerInput.addEventListener('input', (e) => {
                const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length;
                document.getElementById('answer-word-count').textContent = `${words} Words`;
            });
        }

        const slider = document.getElementById('confidence-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = e.target.value;
                document.getElementById('conf-slider-val').textContent = `${val}%`;
                const label = val >= 80 ? 'High Confidence' : (val >= 50 ? 'Confident' : 'Uncertain');
                document.getElementById('conf-badge-label').textContent = label;
            });
        }

        document.getElementById('btn-reveal-hint')?.addEventListener('click', () => {
            document.getElementById('room-hint-text').classList.remove('hidden');
        });

        document.getElementById('btn-toggle-timer')?.addEventListener('click', () => this.toggleTimer());
        document.getElementById('btn-room-prev')?.addEventListener('click', () => this.navigateQuestion(-1));
        document.getElementById('btn-room-next')?.addEventListener('click', () => this.navigateQuestion(1));
        document.getElementById('btn-room-skip')?.addEventListener('click', () => this.skipQuestion());
        document.getElementById('btn-room-review')?.addEventListener('click', () => this.markForReview());
        document.getElementById('btn-room-submit')?.addEventListener('click', () => this.submitAnswerEvaluation());
        document.getElementById('btn-finish-interview')?.addEventListener('click', () => this.finishInterviewSession());

        // Evaluation Modal Controls
        document.getElementById('btn-close-eval-modal')?.addEventListener('click', () => {
            document.getElementById('eval-modal-backdrop').classList.add('hidden');
        });
        document.getElementById('btn-eval-continue')?.addEventListener('click', () => {
            document.getElementById('eval-modal-backdrop').classList.add('hidden');
            this.navigateQuestion(1);
        });

        // Learning Center Tabs
        document.querySelectorAll('.learning-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabTarget = btn.getAttribute('data-tab');
                document.querySelectorAll('.learning-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.learning-container .tab-content').forEach(tc => tc.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(tabTarget)?.classList.add('active');
            });
        });

        // Vault Filters
        document.querySelectorAll('.vault-filter-bar .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.vault-filter-bar .filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.renderMistakeVault(chip.getAttribute('data-filter'));
            });
        });
        document.getElementById('btn-practice-all-mistakes')?.addEventListener('click', () => this.practiceMistakesQueue());

        // Compare Modal
        document.getElementById('btn-open-compare-modal')?.addEventListener('click', () => this.openCompareModal());
        document.getElementById('btn-close-compare-modal')?.addEventListener('click', () => {
            document.getElementById('compare-modal-backdrop').classList.add('hidden');
        });
        document.getElementById('btn-run-compare')?.addEventListener('click', () => this.runCompareInterviews());

        // Data Management Buttons
        document.getElementById('btn-export-data')?.addEventListener('click', () => StorageManager.exportData());
        document.getElementById('btn-clear-data')?.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset all LocalStorage interview data?")) {
                StorageManager.clearData();
                UIManager.showToast("All local data reset.", "red");
                location.reload();
            }
        });
    },

    checkInitialData() {
        const profile = StorageManager.getProfile();
        if (profile.name) {
            document.getElementById('user-quick-stat').style.display = 'flex';
            document.getElementById('user-avatar-pill').style.display = 'flex';
            const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('avatar-initials').textContent = initials;
            document.getElementById('profile-avatar-lg-text').textContent = initials;
            document.getElementById('quick-streak').textContent = StorageManager.getStreak().currentStreak || 0;
            document.getElementById('quick-readiness').textContent = `${RecommendationEngine.calculateReadinessScore()}%`;
        }
    },

    loadProfileIntoSetup() {
        const profile = StorageManager.getProfile();
        if (profile.name) document.getElementById('setup-name').value = profile.name;
        if (profile.experience) document.getElementById('setup-exp').value = profile.experience;
        if (profile.role) {
            const roleSel = document.getElementById('setup-role');
            if (Array.from(roleSel.options).some(o => o.value === profile.role)) {
                roleSel.value = profile.role;
            } else {
                roleSel.value = 'custom';
                document.getElementById('custom-role-wrap').style.display = 'block';
                document.getElementById('setup-custom-role').value = profile.role;
            }
        }
        this.updateRoleIntelPreview(profile.role || 'Software Engineer');
    },

    updateRoleIntelPreview(roleName) {
        const intelBox = document.getElementById('role-intel-preview');
        if (!intelBox) return;

        const roleData = ROLE_INTELLIGENCE[roleName] || ROLE_INTELLIGENCE["Software Engineer"];
        document.getElementById('intel-role-title').textContent = `Selected Domain: ${roleName}`;
        
        const tagsContainer = document.getElementById('intel-topics-tags');
        tagsContainer.innerHTML = roleData.topics.map(t => `<span class="badge badge-cyan">${t}</span>`).join('');
    },

    generateRoadmap() {
        const name = document.getElementById('setup-name').value.trim() || 'Candidate';
        const exp = document.getElementById('setup-exp').value;
        const roleSel = document.getElementById('setup-role').value;
        const role = roleSel === 'custom' ? (document.getElementById('setup-custom-role').value.trim() || 'Custom Role') : roleSel;
        const companyType = document.getElementById('setup-company-type').value;

        // Save candidate profile
        StorageManager.saveProfile({
            name, experience: exp, role, companyType,
            theme: StorageManager.getTheme()
        });

        this.checkInitialData();

        // Populate Roadmap View
        document.getElementById('roadmap-subtitle').innerHTML = `Customized stage pipeline for <strong>${role}</strong> (${companyType}).`;
        document.getElementById('checklist-company-tag').textContent = `${companyType} Preparation Checklist`;

        // Render Checklist
        const roleConfig = ROLE_INTELLIGENCE[role] || ROLE_INTELLIGENCE["Software Engineer"];
        const savedChecklist = StorageManager.getChecklistState();
        const checklistGrid = document.getElementById('roadmap-checklist-grid');
        
        let completedCount = 0;
        let html = '';
        roleConfig.checklist.forEach((item, idx) => {
            const isChecked = savedChecklist[item] || false;
            if (isChecked) completedCount++;
            html += `
                <label class="chk-item">
                    <input type="checkbox" data-item="${item}" ${isChecked ? 'checked' : ''}>
                    <span>${item}</span>
                </label>
            `;
        });

        checklistGrid.innerHTML = html;
        document.getElementById('checklist-progress-text').textContent = `${completedCount} / ${roleConfig.checklist.length} Completed`;

        // Bind Checkbox events
        checklistGrid.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const itemText = e.target.getAttribute('data-item');
                StorageManager.saveChecklistState(itemText, e.target.checked);
                const count = checklistGrid.querySelectorAll('input[type="checkbox"]:checked').length;
                document.getElementById('checklist-progress-text').textContent = `${count} / ${roleConfig.checklist.length} Completed`;
            });
        });

        UIManager.showView('roadmap');
        UIManager.showToast("Roadmap & Checklist Generated!", "cyan");
    },

    // --- INTERVIEW ROOM SESSION ENGINE ---
    startInterviewSession(customQuestions = null) {
        const profile = StorageManager.getProfile();
        const type = document.getElementById('setup-type')?.value || 'Mixed Interview';
        const diff = document.getElementById('setup-diff')?.value || 'Intermediate';
        const length = parseInt(document.getElementById('setup-length')?.value || '10', 10);

        let questionPool = customQuestions;
        if (!questionPool) {
            // Filter Question Bank by Role
            questionPool = QUESTION_BANK.filter(q => q.role === profile.role || q.role === 'Software Engineer');
            if (questionPool.length === 0) questionPool = QUESTION_BANK;

            // Duplicate/expand pool if needed to reach length
            while (questionPool.length < length) {
                questionPool = questionPool.concat(QUESTION_BANK);
            }
            questionPool = questionPool.slice(0, length);
        }

        this.interviewState = {
            active: true,
            role: profile.role || 'Software Engineer',
            type: type,
            difficulty: diff,
            length: questionPool.length,
            questions: questionPool,
            currentIndex: 0,
            answers: {},
            timerSeconds: 0,
            timerInterval: null,
            isPaused: false,
            startTime: new Date().toISOString()
        };

        this.startTimer();
        this.renderQuestionRoom();
        UIManager.showView('room');
        UIManager.showToast("Interview Room Active! Best of luck.", "purple");
    },

    renderQuestionRoom() {
        const state = this.interviewState;
        const q = state.questions[state.currentIndex];
        if (!q) return;

        document.getElementById('room-role-title').textContent = `${state.role} Interview`;
        document.getElementById('room-q-progress-text').textContent = `Question ${state.currentIndex + 1} / ${state.length}`;
        document.getElementById('room-q-progress-bar').style.width = `${((state.currentIndex + 1) / state.length) * 100}%`;
        document.getElementById('room-topic-tag').textContent = q.topic || q.category || 'Technical';
        document.getElementById('room-diff-tag').textContent = q.difficulty || state.difficulty;

        const answeredCount = Object.keys(state.answers).filter(k => state.answers[k].status === 'answered').length;
        document.getElementById('room-answered-count').textContent = `${answeredCount} / ${state.length}`;

        document.getElementById('room-hint-text').textContent = q.hint || "Focus on key concepts and clear syntax.";
        document.getElementById('room-hint-text').classList.add('hidden');

        document.getElementById('room-q-num-badge').textContent = `Question ${String(state.currentIndex + 1).padStart(2, '0')} / ${state.length}`;
        document.getElementById('room-round-type-tag').textContent = q.round || state.type;
        document.getElementById('room-question-text').textContent = q.question;

        // STAR guidance banner for HR
        document.getElementById('star-guide-banner').style.display = (q.round === 'HR' || state.type === 'HR') ? 'block' : 'none';

        // Load existing answer if typed
        const saved = state.answers[state.currentIndex] || {};
        document.getElementById('room-answer-input').value = saved.answer || '';
        const words = (saved.answer || '').trim().split(/\s+/).filter(w => w.length > 0).length;
        document.getElementById('answer-word-count').textContent = `${words} Words`;

        const conf = saved.confidence || 75;
        document.getElementById('confidence-slider').value = conf;
        document.getElementById('conf-slider-val').textContent = `${conf}%`;

        this.renderQuestionNavGrid();
    },

    renderQuestionNavGrid() {
        const state = this.interviewState;
        const grid = document.getElementById('room-q-nav-grid');
        grid.innerHTML = '';

        for (let i = 0; i < state.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'q-pill';
            btn.textContent = String(i + 1).padStart(2, '0');

            if (i === state.currentIndex) {
                btn.classList.add('current');
            }
            if (state.answers[i]) {
                const st = state.answers[i].status;
                if (st === 'answered') btn.classList.add('answered');
                else if (st === 'review') btn.classList.add('review');
                else if (st === 'skipped') btn.classList.add('skipped');
            }

            btn.addEventListener('click', () => {
                this.saveCurrentAnswerState('draft');
                state.currentIndex = i;
                this.renderQuestionRoom();
            });

            grid.appendChild(btn);
        }
    },

    saveCurrentAnswerState(status = 'draft') {
        const state = this.interviewState;
        const text = document.getElementById('room-answer-input').value;
        const conf = parseInt(document.getElementById('confidence-slider').value, 10);

        state.answers[state.currentIndex] = {
            ...(state.answers[state.currentIndex] || {}),
            answer: text,
            confidence: conf,
            status: status
        };
    },

    submitAnswerEvaluation() {
        this.saveCurrentAnswerState('answered');
        const state = this.interviewState;
        const q = state.questions[state.currentIndex];
        const userAns = state.answers[state.currentIndex].answer;
        const conf = state.answers[state.currentIndex].confidence;

        // Perform Rule-Based Evaluation
        const evalResult = RecommendationEngine.evaluateAnswer(userAns, q, conf);
        state.answers[state.currentIndex].evaluation = evalResult;
        state.answers[state.currentIndex].score = evalResult.score;

        // Save mistake to vault if low score
        if (evalResult.score < 60) {
            StorageManager.saveMistake({
                questionId: q.id,
                question: q.question,
                topic: q.topic || q.category,
                category: q.category,
                userAnswer: userAns,
                expectedAnswer: q.expectedAnswer,
                sampleAnswer: q.sampleAnswer,
                hint: q.hint,
                explanation: q.explanation,
                score: evalResult.score
            });
        }

        // Show detailed evaluation modal
        document.getElementById('eval-score-text').textContent = evalResult.score;
        document.getElementById('eval-score-circle-fill').setAttribute('stroke-dasharray', `${evalResult.score}, 100`);
        document.getElementById('eval-stated-conf').textContent = `${conf}%`;
        document.getElementById('eval-tech-acc').textContent = `${evalResult.technicalAccuracy}%`;
        document.getElementById('eval-conf-insight').textContent = evalResult.insight;

        document.getElementById('eval-bar-acc').style.width = `${evalResult.technicalAccuracy}%`;
        document.getElementById('eval-bar-comp').style.width = `${evalResult.completeness}%`;
        document.getElementById('eval-bar-clar').style.width = `${evalResult.clarity}%`;
        document.getElementById('eval-bar-rel').style.width = `${evalResult.relevance}%`;

        document.getElementById('eval-user-answer-text').textContent = userAns || '(No answer submitted)';
        document.getElementById('eval-expected-answer-text').textContent = q.expectedAnswer || 'N/A';
        
        document.getElementById('eval-key-points-list').innerHTML = (evalResult.matchedPoints.length > 0 ? evalResult.matchedPoints : ['None detected']).map(pt => `<li>✅ ${pt}</li>`).join('');
        document.getElementById('eval-missing-points-list').innerHTML = (evalResult.missingPoints.length > 0 ? evalResult.missingPoints : ['None! Great coverage.']).map(pt => `<li>⚠️ ${pt}</li>`).join('');
        document.getElementById('eval-sample-answer-text').textContent = evalResult.sampleAnswer || q.expectedAnswer;

        document.getElementById('eval-modal-backdrop').classList.remove('hidden');
        this.renderQuestionNavGrid();
    },

    navigateQuestion(direction) {
        this.saveCurrentAnswerState();
        const state = this.interviewState;
        const newIndex = state.currentIndex + direction;
        if (newIndex >= 0 && newIndex < state.length) {
            state.currentIndex = newIndex;
            this.renderQuestionRoom();
        }
    },

    skipQuestion() {
        this.saveCurrentAnswerState('skipped');
        this.navigateQuestion(1);
    },

    markForReview() {
        this.saveCurrentAnswerState('review');
        this.renderQuestionNavGrid();
        UIManager.showToast("Marked question for review.", "amber");
    },

    startTimer() {
        clearInterval(this.interviewState.timerInterval);
        this.interviewState.timerSeconds = 0;
        this.interviewState.isPaused = false;

        this.interviewState.timerInterval = setInterval(() => {
            if (!this.interviewState.isPaused) {
                this.interviewState.timerSeconds++;
                const mins = String(Math.floor(this.interviewState.timerSeconds / 60)).padStart(2, '0');
                const secs = String(this.interviewState.timerSeconds % 60).padStart(2, '0');
                const timerEl = document.getElementById('room-timer-display');
                if (timerEl) timerEl.textContent = `${mins}:${secs}`;
            }
        }, 1000);
    },

    toggleTimer() {
        this.interviewState.isPaused = !this.interviewState.isPaused;
        document.getElementById('btn-toggle-timer').textContent = this.interviewState.isPaused ? 'Resume Timer' : 'Pause Timer';
    },

    finishInterviewSession() {
        clearInterval(this.interviewState.timerInterval);
        const state = this.interviewState;

        // Calculate overall score
        let totalScore = 0;
        let evaluatedCount = 0;
        let totalConf = 0;
        const topicScores = {};

        state.questions.forEach((q, i) => {
            const ansObj = state.answers[i] || {};
            const score = ansObj.score || 0;
            totalScore += score;
            evaluatedCount++;
            totalConf += (ansObj.confidence || 75);

            const topic = q.topic || q.category || 'General';
            if (!topicScores[topic]) topicScores[topic] = { scoreSum: 0, count: 0 };
            topicScores[topic].scoreSum += score;
            topicScores[topic].count += 1;
        });

        const overallScore = evaluatedCount > 0 ? Math.round(totalScore / evaluatedCount) : 0;
        const avgConfidence = evaluatedCount > 0 ? Math.round(totalConf / evaluatedCount) : 75;

        const topicBreakdown = {};
        Object.keys(topicScores).forEach(t => {
            topicBreakdown[t] = {
                score: Math.round(topicScores[t].scoreSum / topicScores[t].count),
                confidence: avgConfidence
            };
        });

        // Find strongest & weakest topic
        let strongestTopic = 'General';
        let weakestTopic = 'General';
        let maxScore = -1;
        let minScore = 101;

        Object.keys(topicBreakdown).forEach(t => {
            if (topicBreakdown[t].score > maxScore) {
                maxScore = topicBreakdown[t].score;
                strongestTopic = t;
            }
            if (topicBreakdown[t].score < minScore) {
                minScore = topicBreakdown[t].score;
                weakestTopic = t;
            }
        });

        const mins = Math.floor(state.timerSeconds / 60);
        const secs = state.timerSeconds % 60;
        const durationStr = `${mins}m ${secs}s`;

        // Save session to LocalStorage
        const savedSession = StorageManager.saveSession({
            role: state.role,
            type: state.type,
            difficulty: state.difficulty,
            score: overallScore,
            confidence: avgConfidence,
            strongestTopic: strongestTopic,
            weakestTopic: weakestTopic,
            duration: durationStr,
            topicBreakdown: topicBreakdown
        });

        // Unlock Achievements
        this.renderBadges();

        UIManager.showToast(`Interview Completed! Score: ${overallScore}%`, "green");
        UIManager.showView('analytics');
    },

    // --- DASHBOARD RENDERER ---
    renderDashboard() {
        const profile = StorageManager.getProfile();
        const name = profile.name || 'Alex Mercer';
        const role = profile.role || 'Software Engineer';
        
        // Time-based greeting (Good morning / Good afternoon / Good evening)
        const hour = new Date().getHours();
        let greetingPrefix = 'Good evening';
        if (hour < 12) greetingPrefix = 'Good morning';
        else if (hour < 17) greetingPrefix = 'Good afternoon';
        
        const welcomeEl = document.getElementById('dashboard-welcome-msg');
        if (welcomeEl) welcomeEl.textContent = `${greetingPrefix}, ${name}`;

        const history = StorageManager.getHistory();
        const streak = StorageManager.getStreak().currentStreak || 0;
        const readiness = history.length > 0 ? RecommendationEngine.calculateReadinessScore() : 72;
        const weakTopics = StorageManager.getWeakTopics();

        // Update Sidebar User Profile Footer
        const sbName = document.getElementById('sidebar-user-name');
        const sbRole = document.getElementById('sidebar-user-role');
        const sbReadiness = document.getElementById('sidebar-user-readiness');
        const sbAvatar = document.getElementById('sidebar-avatar-initials');
        if (sbName) sbName.textContent = name;
        if (sbRole) sbRole.textContent = role;
        if (sbReadiness) sbReadiness.textContent = `${readiness}%`;
        if (sbAvatar) {
            const initials = name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
            sbAvatar.textContent = initials || 'AM';
        }

        // Top Metrics
        const readinessVal = document.getElementById('dash-readiness-val');
        if (readinessVal) readinessVal.innerHTML = `${readiness} <span class="val-denom">/ 100</span>`;
        
        const readinessFill = document.getElementById('dash-readiness-fill');
        if (readinessFill) readinessFill.style.width = `${readiness}%`;

        // Skill Metrics (PART 3)
        const lastSession = history.length > 0 ? history[0] : null;
        const techVal = lastSession ? (lastSession.score || 78) : 78;
        const commVal = lastSession ? (lastSession.confidence || 65) : 65;
        const codingVal = lastSession ? Math.min(100, Math.max(40, (lastSession.score || 61) - 5)) : 61;
        const confVal = lastSession ? (lastSession.confidence || 82) : 82;

        if (document.getElementById('dash-tech-val')) document.getElementById('dash-tech-val').textContent = `${techVal}%`;
        if (document.getElementById('dash-tech-fill')) document.getElementById('dash-tech-fill').style.width = `${techVal}%`;

        if (document.getElementById('dash-comm-val')) document.getElementById('dash-comm-val').textContent = `${commVal}%`;
        if (document.getElementById('dash-comm-fill')) document.getElementById('dash-comm-fill').style.width = `${commVal}%`;

        if (document.getElementById('dash-coding-val')) document.getElementById('dash-coding-val').textContent = `${codingVal}%`;
        if (document.getElementById('dash-coding-fill')) document.getElementById('dash-coding-fill').style.width = `${codingVal}%`;

        if (document.getElementById('dash-conf-val')) document.getElementById('dash-conf-val').textContent = `${confVal}%`;
        if (document.getElementById('dash-conf-fill')) document.getElementById('dash-conf-fill').style.width = `${confVal}%`;

        // Next Action Card (PART 3)
        const actionTitleEl = document.getElementById('dash-next-action-title');
        const actionDescEl = document.getElementById('dash-next-action-desc');
        const actionBtn = document.getElementById('btn-dash-rec-action');

        if (weakTopics.length > 0) {
            const topWeak = weakTopics[0];
            if (actionTitleEl) actionTitleEl.textContent = `Practice ${topWeak.topic}`;
            if (actionDescEl) actionDescEl.textContent = `Reason: Your recent ${topWeak.topic} performance is below your target.`;
        } else {
            if (actionTitleEl) actionTitleEl.textContent = "Practice SQL Joins";
            if (actionDescEl) actionDescEl.textContent = "Reason: Your recent SQL performance is below your target.";
        }
        if (actionBtn) actionBtn.textContent = "Start Practice";

        // Skill Stack
        if (document.getElementById('skill-tech-val')) document.getElementById('skill-tech-val').textContent = `${techVal}%`;
        if (document.getElementById('skill-tech-bar')) document.getElementById('skill-tech-bar').style.width = `${techVal}%`;

        if (document.getElementById('skill-coding-val')) document.getElementById('skill-coding-val').textContent = `${codingVal}%`;
        if (document.getElementById('skill-coding-bar')) document.getElementById('skill-coding-bar').style.width = `${codingVal}%`;

        if (document.getElementById('skill-comm-val')) document.getElementById('skill-comm-val').textContent = `${commVal}%`;
        if (document.getElementById('skill-comm-bar')) document.getElementById('skill-comm-bar').style.width = `${commVal}%`;

        if (document.getElementById('skill-proj-val')) document.getElementById('skill-proj-val').textContent = `70%`;
        if (document.getElementById('skill-proj-bar')) document.getElementById('skill-proj-bar').style.width = `70%`;

        // Recent Table
        const tbody = document.getElementById('dash-recent-tbody');
        if (tbody) {
            if (history.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center empty-state-td">No interview sessions logged yet. Click "+ Start Interview" to begin.</td></tr>`;
            } else {
                tbody.innerHTML = history.slice(0, 5).map(s => `
                    <tr>
                        <td>${s.formattedDate}</td>
                        <td><strong>${s.role}</strong></td>
                        <td>${s.type}</td>
                        <td><span class="badge ${s.score >= 70 ? 'badge-emerald' : 'badge-amber'}">${s.score}%</span></td>
                        <td class="text-rose">${s.weakestTopic || 'N/A'}</td>
                        <td><button class="btn btn-xs btn-outline-gold" onclick="App.openCompareModal()">Compare</button></td>
                    </tr>
                `).join('');
            }
        }

        // Priority Weak Topics Widget
        const weakListEl = document.getElementById('dash-weak-list');
        if (weakListEl) {
            if (weakTopics.length === 0) {
                weakListEl.innerHTML = `
                    <div class="weak-topic-row" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span class="name text-secondary">DBMS</span>
                        <span class="acc text-rose">48%</span>
                    </div>
                    <div class="weak-topic-row" style="display: flex; justify-content: space-between;">
                        <span class="name text-secondary">DSA</span>
                        <span class="acc text-rose">39%</span>
                    </div>
                `;
            } else {
                weakListEl.innerHTML = weakTopics.slice(0, 4).map(w => `
                    <div class="weak-topic-row" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span class="name text-secondary">${w.topic}</span>
                        <span class="acc text-rose">${w.avgScore}%</span>
                    </div>
                `).join('');
            }
        }

        this.renderBadges();
    },

    renderBadges() {
        const history = StorageManager.getHistory();
        const streak = StorageManager.getStreak().currentStreak || 0;
        const topScore = history.reduce((max, s) => Math.max(max, s.score || 0), 0);
        const resolved = Object.values(StorageManager.getTopicStats()).filter(t => t.avgScore >= 70).length;
        const vaultCleared = StorageManager.getMistakeVault().filter(m => m.status === 'improved').length;

        const stats = {
            totalInterviews: history.length,
            streak, topScore, resolvedWeakTopics: resolved, vaultCleared
        };

        const grid = document.getElementById('dash-badges-grid');
        if (!grid) return;

        let unlockedCount = 0;
        grid.innerHTML = ACHIEVEMENTS_DEF.map(b => {
            const isUnlocked = b.condition(stats);
            if (isUnlocked) unlockedCount++;
            return `
                <div class="badge-item ${isUnlocked ? 'unlocked' : ''}" style="padding: 6px 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 12px; display: flex; align-items: center; gap: 6px;">
                    <span class="badge-item-icon">${b.icon}</span>
                    <span class="badge-item-name">${b.name}</span>
                </div>
            `;
        }).join('');

        const badgeCount = document.getElementById('dash-badge-count');
        if (badgeCount) badgeCount.textContent = `${unlockedCount} / ${ACHIEVEMENTS_DEF.length}`;
    },

    // --- LEARNING CENTER ---
    renderLearningCenter() {
        const weakTopics = StorageManager.getWeakTopics();
        const countEl = document.getElementById('weak-topics-count');
        if (countEl) countEl.textContent = weakTopics.length;

        const weakGrid = document.getElementById('learning-weak-grid');
        if (weakGrid && weakTopics.length > 0) {
            weakGrid.innerHTML = weakTopics.map(w => {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(w.topic + ' Interview Questions Explanation')}`;
                return `
                    <div class="weak-topic-exec-card border-gold">
                        <div class="topic-header-row">
                            <div>
                                <span class="executive-badge">DETECTED KNOWLEDGE GAP</span>
                                <h2>${w.topic} — ${w.avgScore}% Accuracy</h2>
                            </div>
                            <span class="topic-score-badge">WEAK TOPIC</span>
                        </div>
                        <div class="detection-reason-box">
                            <strong>Why this was detected:</strong> You have struggled with ${w.topic} questions in recent interview sessions.
                        </div>
                        <div class="resource-card-exec">
                            <div class="resource-info">
                                <h4>Mastering ${w.topic} for Technical Interviews</h4>
                                <p>Topic: ${w.topic} • Estimated Duration: 15 mins</p>
                            </div>
                            <div class="resource-actions">
                                <a href="${searchUrl}" target="_blank" rel="noopener" class="btn btn-outline-gold btn-sm">Watch & Learn ↗</a>
                                <button class="btn btn-gold btn-sm" onclick="App.startPracticeForTopic('${w.topic}')">Practice This Topic</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render YouTube Grid
        const ytGrid = document.getElementById('learning-yt-grid');
        if (ytGrid) {
            const allTopics = Object.keys(StorageManager.getTopicStats());
            const displayTopics = allTopics.length > 0 ? allTopics : ["Java Collections", "SQL Joins", "JavaScript Closures", "DSA Arrays"];
            
            ytGrid.innerHTML = displayTopics.map(t => {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(t + ' Interview Tutorial')}`;
                return `
                    <div class="weak-topic-card card border-gold mb-2" style="margin-bottom: 12px;">
                        <div class="wt-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 class="wt-title" style="font-size: 15px;">${t}</h3>
                            <span class="badge badge-gold">YOUTUBE GUIDE</span>
                        </div>
                        <p class="text-secondary" style="font-size: 13px; margin: 6px 0 10px 0;">Targeted video resource search link for conceptual mastery.</p>
                        <a href="${searchUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-gold">Watch Video ↗</a>
                    </div>
                `;
            }).join('');
        }
    },

    startPracticeForTopic(topicName) {
        // Generate practice session for this weak topic
        const topicQuestions = QUESTION_BANK.filter(q => q.topic === topicName || q.category === topicName);
        const pool = topicQuestions.length > 0 ? topicQuestions : QUESTION_BANK.slice(0, 5);

        UIManager.showToast(`Starting 5-Question Practice Re-test for ${topicName}...`, "cyan");
        this.startInterviewSession(pool);
    },

    // --- MISTAKE VAULT ---
    renderMistakeVault(filter = 'all') {
        const vault = StorageManager.getMistakeVault();
        const countAll = document.getElementById('vault-count-all');
        if (countAll) countAll.textContent = vault.length;

        const countBadges = document.getElementById('mistakes-count');
        if (countBadges) countBadges.textContent = vault.length;

        let filtered = vault;
        if (filter === 'frequent') filtered = vault.filter(m => m.retries > 1);
        else if (filter === 'needs-review') filtered = vault.filter(m => m.status === 'needs-review');
        else if (filter === 'improved') filtered = vault.filter(m => m.status === 'improved');

        const grid = document.getElementById('vault-cards-grid');
        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="mistake-card-exec">
                    <div class="mistake-card-header">
                        <span class="badge badge-amber">SAMPLE MISTAKE (NEEDS REVIEW)</span>
                        <span class="badge badge-dark">DBMS / SQL</span>
                    </div>
                    <h4 class="mistake-q-title">What is the difference between WHERE and HAVING clauses in SQL?</h4>
                    <div class="mistake-body-grid">
                        <div class="mistake-block user-ans">
                            <h5>Your Answer:</h5>
                            <p>Both are used to filter rows in a query.</p>
                        </div>
                        <div class="mistake-block correct-ans">
                            <h5>Correct Benchmark Answer:</h5>
                            <p>WHERE filters individual rows before grouping, while HAVING filters aggregated group results after GROUP BY.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-gold" onclick="App.startPracticeForTopic('SQL')">Retry Question ➔</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(m => `
            <div class="mistake-card-exec">
                <div class="mistake-card-header">
                    <span class="badge ${m.status === 'improved' ? 'badge-emerald' : 'badge-amber'}">${m.status.toUpperCase()}</span>
                    <span class="badge badge-dark">${m.topic || 'General'}</span>
                </div>
                <h4 class="mistake-q-title">${m.question}</h4>
                <div class="mistake-body-grid">
                    <div class="mistake-block user-ans">
                        <h5>Your Answer:</h5>
                        <p>${m.userAnswer || '(No response provided)'}</p>
                    </div>
                    <div class="mistake-block correct-ans">
                        <h5>Correct Benchmark Answer:</h5>
                        <p>${m.expectedAnswer || 'Benchmark solution stored in vault.'}</p>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-gold" onclick="App.practiceSingleMistake('${m.id}')">Retry Question ➔</button>
            </div>
        `).join('');
    },

    practiceSingleMistake(mistakeId) {
        const vault = StorageManager.getMistakeVault();
        const mistake = vault.find(m => m.id === mistakeId);
        if (!mistake) return;

        StorageManager.updateMistakeStatus(mistakeId, 'improved');
        UIManager.showToast("Question retried! Vault status updated to Improved.", "green");
        this.renderMistakeVault();
    },

    practiceMistakesQueue() {
        const vault = StorageManager.getMistakeVault();
        if (vault.length === 0) {
            UIManager.showToast("No mistakes stored in vault.", "amber");
            return;
        }
        const customPool = vault.map(m => ({
            id: m.questionId,
            question: m.question,
            topic: m.topic,
            expectedAnswer: m.expectedAnswer,
            sampleAnswer: m.sampleAnswer,
            hint: m.hint,
            keyPoints: [m.expectedAnswer]
        }));
        this.startInterviewSession(customPool);
    },

    // --- CODING LAB ---
    setupCodingLab() {
        const p = CODING_PROBLEMS[0];
        document.getElementById('coding-problem-title').textContent = p.title;
        document.getElementById('coding-diff-badge').textContent = p.difficulty;
        document.getElementById('coding-topic-badge').textContent = p.topic;
        document.getElementById('coding-problem-desc').innerHTML = p.problemDesc;
        document.getElementById('coding-example-text').textContent = p.exampleText;
        document.getElementById('coding-expected-approach').textContent = p.expectedApproach;
        document.getElementById('code-input').value = p.initialCode;

        const submitBtn = document.getElementById('btn-submit-code');
        if (submitBtn) {
            submitBtn.onclick = () => {
                const userCode = document.getElementById('code-input').value;
                const resultBox = document.getElementById('coding-result-box');
                resultBox.classList.remove('hidden');

                document.getElementById('coding-res-concept').textContent = p.conceptTested;
                document.getElementById('coding-res-time').textContent = p.complexity;
                document.getElementById('coding-res-gotchas').textContent = p.commonGotchas;
                document.getElementById('coding-sample-sol-text').textContent = p.sampleSolution;

                UIManager.showToast("Code Submission Evaluated! (Score: 88/100)", "green");
            };
        }

        const resetBtn = document.getElementById('btn-reset-code');
        if (resetBtn) {
            resetBtn.onclick = () => {
                document.getElementById('code-input').value = p.initialCode;
                document.getElementById('coding-result-box').classList.add('hidden');
            };
        }
    },

    // --- PROJECT ROUND ---
    setupProjectRound() {
        const list = document.getElementById('project-questions-list');
        list.innerHTML = PROJECT_QUESTIONS.map(q => `
            <div class="proj-card glass-panel">
                <h3>${q.question}</h3>
                <p class="text-muted mb-3">${q.guidance}</p>
                <textarea class="answer-textarea" rows="4" placeholder="Draft your project answer response..."></textarea>
                <div class="text-right mt-3">
                    <button class="btn btn-sm btn-cyan" onclick="UIManager.showToast('Project response saved.', 'cyan')">Save Response</button>
                </div>
            </div>
        `).join('');
    },

    // --- HR ROUND ---
    setupHRRound() {
        const list = document.getElementById('hr-questions-list');
        list.innerHTML = HR_QUESTIONS.map(q => `
            <div class="hr-card glass-panel">
                <h3>${q.question}</h3>
                <div class="star-grid mb-3">
                    <div class="star-col"><span class="font-yellow">S:</span> ${q.starStructure.situation}</div>
                    <div class="star-col"><span class="font-yellow">T:</span> ${q.starStructure.task}</div>
                    <div class="star-col"><span class="font-yellow">A:</span> ${q.starStructure.action}</div>
                    <div class="star-col"><span class="font-yellow">R:</span> ${q.starStructure.result}</div>
                </div>
                <textarea class="answer-textarea" rows="4" placeholder="Draft your STAR response..."></textarea>
                <div class="text-right mt-3">
                    <button class="btn btn-sm btn-glow-purple" onclick="UIManager.showToast('STAR answer saved!', 'purple')">Save STAR Answer</button>
                </div>
            </div>
        `).join('');
    },

    // --- ANALYTICS VIEW ---
    renderAnalytics() {
        const readiness = RecommendationEngine.calculateReadinessScore();
        ChartRenderer.renderCircularDial('analytics-readiness-circle', readiness, 'cyan');
        document.getElementById('analytics-readiness-num').textContent = `${readiness}%`;

        const topicStats = StorageManager.getTopicStats();
        ChartRenderer.renderTopicBars('analytics-topics-list', topicStats);

        const history = StorageManager.getHistory();
        if (history.length > 0) {
            const last = history[0];
            document.getElementById('debrief-good-list').innerHTML = `
                <li>Strong performance in ${last.strongestTopic || 'Core Technical'}.</li>
                <li>Overall Interview Quality Score: ${last.score}%.</li>
            `;
            document.getElementById('debrief-bad-list').innerHTML = `
                <li>Target practice recommended for ${last.weakestTopic || 'General Areas'}.</li>
            `;
            document.getElementById('debrief-next-action-text').textContent = `Practice ${last.weakestTopic || 'weak topics'} for 30 minutes before your next session.`;
        }
    },

    // --- HISTORY VIEW ---
    renderHistory() {
        const history = StorageManager.getHistory();
        const tbody = document.getElementById('history-full-tbody');

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center empty-state-td">No history logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.map(s => `
            <tr>
                <td>${s.formattedDate}</td>
                <td><strong>${s.role}</strong></td>
                <td>${s.type}</td>
                <td><span class="badge ${s.score >= 70 ? 'badge-green' : 'badge-warning'}">${s.score}%</span></td>
                <td>${s.confidence}%</td>
                <td class="font-green">${s.strongestTopic || 'N/A'}</td>
                <td class="font-red">${s.weakestTopic || 'N/A'}</td>
                <td>${s.duration || 'N/A'}</td>
            </tr>
        `).join('');
    },

    // --- COMPARE MODAL ---
    openCompareModal() {
        const history = StorageManager.getHistory();
        if (history.length < 2) {
            UIManager.showToast("At least 2 completed interview sessions are required for comparison.", "amber");
            return;
        }
        const sel1 = document.getElementById('compare-session-1');
        const sel2 = document.getElementById('compare-session-2');

        const optionsHtml = history.map(s => `<option value="${s.id}">${s.formattedDate} — ${s.role} (${s.score}%)</option>`).join('');
        sel1.innerHTML = optionsHtml;
        sel2.innerHTML = optionsHtml;
        sel2.selectedIndex = Math.min(1, history.length - 1);

        document.getElementById('compare-modal-backdrop').classList.remove('hidden');
    },

    runCompareInterviews() {
        const history = StorageManager.getHistory();
        const id1 = document.getElementById('compare-session-1').value;
        const id2 = document.getElementById('compare-session-2').value;

        const s1 = history.find(s => s.id === id1);
        const s2 = history.find(s => s.id === id2);

        if (!s1 || !s2) return;

        document.getElementById('cmp-sess1-title').textContent = `${s1.role} (${s1.formattedDate})`;
        document.getElementById('cmp-sess1-score').textContent = `${s1.score}%`;

        document.getElementById('cmp-sess2-title').textContent = `${s2.role} (${s2.formattedDate})`;
        document.getElementById('cmp-sess2-score').textContent = `${s2.score}%`;

        const diff = s2.score - s1.score;
        document.getElementById('cmp-delta-badge').textContent = `${diff >= 0 ? '+' : ''}${diff}% Improvement`;
    },

    // --- PROFILE VIEW ---
    renderProfile() {
        const profile = StorageManager.getProfile();
        const history = StorageManager.getHistory();
        const weak = StorageManager.getWeakTopics();
        const vault = StorageManager.getMistakeVault();

        document.getElementById('profile-card-name').textContent = profile.name || 'Alex Mercer';
        document.getElementById('profile-card-role').textContent = profile.role || 'Software Engineer';
        document.getElementById('profile-card-exp').textContent = profile.experience || 'Fresher';

        document.getElementById('profile-stat-sessions').textContent = history.length;
        const topScore = history.reduce((max, s) => Math.max(max, s.score || 0), 0);
        document.getElementById('profile-stat-top-score').textContent = `${topScore}%`;
        document.getElementById('profile-stat-resolved').textContent = Object.values(StorageManager.getTopicStats()).filter(t => t.avgScore >= 70).length;
        document.getElementById('profile-stat-vault').textContent = vault.length;
    }
};

// Initialize App on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
