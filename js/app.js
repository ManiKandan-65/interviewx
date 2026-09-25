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
        this.setupCodingLab();
        this.setupProjectRound();
        this.setupHRRound();
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
                const customWrap = document.getElementById('custom-role-wrap');
                if (customWrap) customWrap.style.display = isCustom ? 'block' : 'none';
                this.updateRoleIntelPreview(isCustom ? (document.getElementById('setup-custom-role')?.value || 'Custom Role') : e.target.value);
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
                const counter = document.getElementById('answer-word-count');
                if (counter) counter.textContent = `${words} Words`;
            });
        }

        const slider = document.getElementById('confidence-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = e.target.value;
                const valEl = document.getElementById('conf-slider-val');
                if (valEl) valEl.textContent = `${val}%`;
                const label = val >= 80 ? 'High Confidence' : (val >= 50 ? 'Confident' : 'Uncertain');
                const badgeEl = document.getElementById('conf-badge-label');
                if (badgeEl) badgeEl.textContent = label;
            });
        }

        document.getElementById('btn-reveal-hint')?.addEventListener('click', () => {
            document.getElementById('room-hint-text')?.classList.remove('hidden');
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
            document.getElementById('eval-modal-backdrop')?.classList.add('hidden');
        });
        document.getElementById('btn-eval-continue')?.addEventListener('click', () => {
            document.getElementById('eval-modal-backdrop')?.classList.add('hidden');
            this.navigateQuestion(1);
        });

        // Learning Center Tabs & Buttons
        document.querySelectorAll('.learning-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabTarget = btn.getAttribute('data-tab');
                document.querySelectorAll('.learning-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.learning-container .tab-content').forEach(tc => tc.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(tabTarget)?.classList.add('active');
            });
        });
        document.getElementById('btn-practice-dbms-topic')?.addEventListener('click', () => this.startPracticeForTopic('DBMS'));

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
            document.getElementById('compare-modal-backdrop')?.classList.add('hidden');
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
            const uqs = document.getElementById('user-quick-stat');
            if (uqs) uqs.style.display = 'flex';
            
            const uap = document.getElementById('user-avatar-pill');
            if (uap) uap.style.display = 'flex';

            const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            
            const ai = document.getElementById('avatar-initials');
            if (ai) ai.textContent = initials;
            
            const palg = document.getElementById('profile-avatar-lg-text');
            if (palg) palg.textContent = initials;
            
            const qs = document.getElementById('quick-streak');
            if (qs) qs.textContent = StorageManager.getStreak().currentStreak || 0;
            
            const qr = document.getElementById('quick-readiness');
            if (qr) qr.textContent = `${RecommendationEngine.calculateReadinessScore()}%`;
        }
    },

    loadProfileIntoSetup() {
        const profile = StorageManager.getProfile();
        const nameInput = document.getElementById('setup-name');
        if (nameInput && profile.name) nameInput.value = profile.name;

        const expSelect = document.getElementById('setup-exp');
        if (expSelect && profile.experience) expSelect.value = profile.experience;

        if (profile.role) {
            const roleSel = document.getElementById('setup-role');
            if (roleSel) {
                if (Array.from(roleSel.options).some(o => o.value === profile.role)) {
                    roleSel.value = profile.role;
                } else {
                    roleSel.value = 'custom';
                    const wrap = document.getElementById('custom-role-wrap');
                    if (wrap) wrap.style.display = 'block';
                    const customInput = document.getElementById('setup-custom-role');
                    if (customInput) customInput.value = profile.role;
                }
            }
        }
        this.updateRoleIntelPreview(profile.role || 'Software Engineer');
    },

    updateRoleIntelPreview(roleName) {
        const intelBox = document.getElementById('role-intel-preview');
        if (!intelBox) return;

        const roleData = ROLE_INTELLIGENCE[roleName] || ROLE_INTELLIGENCE["Software Engineer"];
        const titleEl = document.getElementById('intel-role-title');
        if (titleEl) titleEl.textContent = `Selected Domain: ${roleName}`;
        
        const tagsContainer = document.getElementById('intel-topics-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = roleData.topics.map(t => `<span class="badge badge-gold">${t}</span>`).join('');
        }
    },

    generateRoadmap() {
        const nameInput = document.getElementById('setup-name');
        const name = (nameInput?.value || '').trim() || 'Alex Mercer';
        
        const expSelect = document.getElementById('setup-exp');
        const exp = expSelect?.value || '1-3 Years';

        const roleSel = document.getElementById('setup-role')?.value || 'Software Engineer';
        const customRole = document.getElementById('setup-custom-role')?.value || '';
        const role = roleSel === 'custom' ? (customRole.trim() || 'Custom Role') : roleSel;

        const companyType = document.getElementById('setup-company-type')?.value || 'Product-Based';

        // Save candidate profile
        StorageManager.saveProfile({
            name, experience: exp, role, companyType,
            theme: StorageManager.getTheme()
        });

        this.checkInitialData();

        // Directly launch the interview session for seamless user flow
        this.startInterviewSession();
    },

    // --- INTERVIEW ROOM SESSION ENGINE ---
    startInterviewSession(customQuestions = null) {
        const profile = StorageManager.getProfile();
        const role = profile.role || document.getElementById('setup-role')?.value || 'Software Engineer';
        const type = document.getElementById('setup-type')?.value || 'Mixed Interview';
        const diff = document.getElementById('setup-diff')?.value || 'Intermediate';
        const length = parseInt(document.getElementById('setup-length')?.value || '10', 10);

        let questionPool = customQuestions;
        if (!questionPool || questionPool.length === 0) {
            // 1. Strict Filter: Role match
            let filtered = QUESTION_BANK.filter(q => q.role === role);

            // 2. Type & Difficulty secondary match if enough items
            if (filtered.length === 0) {
                filtered = QUESTION_BANK.filter(q => q.role === 'Software Engineer' || q.category === type || q.round === type);
            }

            // 3. Fallback to full QUESTION_BANK if zero matches
            if (filtered.length === 0) {
                filtered = QUESTION_BANK;
            }

            // Duplicate/expand pool if needed to reach target length
            questionPool = [...filtered];
            while (questionPool.length < length) {
                questionPool = questionPool.concat(filtered);
            }
            questionPool = questionPool.slice(0, length);
        }

        this.interviewState = {
            active: true,
            role: role,
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
        UIManager.showToast(`Interview Room Active (${questionPool.length} Questions)`, "gold");
    },

    renderQuestionRoom() {
        const state = this.interviewState;
        const q = state.questions[state.currentIndex];
        if (!q) return;

        const roleTitle = document.getElementById('room-role-title');
        if (roleTitle) roleTitle.textContent = `${state.role} Interview`;

        const qProgText = document.getElementById('room-q-progress-text');
        if (qProgText) qProgText.textContent = `Question ${state.currentIndex + 1} / ${state.length}`;

        const qProgBar = document.getElementById('room-q-progress-bar');
        if (qProgBar) qProgBar.style.width = `${((state.currentIndex + 1) / state.length) * 100}%`;

        const topicTag = document.getElementById('room-topic-tag');
        if (topicTag) topicTag.textContent = q.topic || q.category || 'Technical';

        const diffTag = document.getElementById('room-diff-tag');
        if (diffTag) diffTag.textContent = q.difficulty || state.difficulty;

        const answeredCount = Object.keys(state.answers).filter(k => state.answers[k].status === 'answered').length;
        const answeredEl = document.getElementById('room-answered-count');
        if (answeredEl) answeredEl.textContent = `${answeredCount} / ${state.length}`;

        const hintText = document.getElementById('room-hint-text');
        if (hintText) {
            hintText.textContent = q.hint || "Focus on key technical concepts and clear syntax.";
            hintText.classList.add('hidden');
        }

        const qNumBadge = document.getElementById('room-q-num-badge');
        if (qNumBadge) qNumBadge.textContent = `Question ${String(state.currentIndex + 1).padStart(2, '0')} / ${state.length}`;

        const roundTag = document.getElementById('room-round-type-tag');
        if (roundTag) roundTag.textContent = q.round || state.type;

        const qText = document.getElementById('room-question-text');
        if (qText) qText.textContent = q.question;

        // STAR guidance banner for HR
        const starBanner = document.getElementById('star-guide-banner');
        if (starBanner) starBanner.style.display = (q.round === 'HR' || state.type === 'HR') ? 'block' : 'none';

        // Load existing answer if typed
        const saved = state.answers[state.currentIndex] || {};
        const ansInput = document.getElementById('room-answer-input');
        if (ansInput) ansInput.value = saved.answer || '';

        const words = (saved.answer || '').trim().split(/\s+/).filter(w => w.length > 0).length;
        const wordCounter = document.getElementById('answer-word-count');
        if (wordCounter) wordCounter.textContent = `${words} Words`;

        const conf = saved.confidence || 75;
        const slider = document.getElementById('confidence-slider');
        if (slider) slider.value = conf;

        const sliderVal = document.getElementById('conf-slider-val');
        if (sliderVal) sliderVal.textContent = `${conf}%`;

        this.renderQuestionNavGrid();
    },

    renderQuestionNavGrid() {
        const state = this.interviewState;
        const grid = document.getElementById('room-q-nav-grid');
        if (!grid) return;
        grid.innerHTML = '';

        for (let i = 0; i < state.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'q-pill';
            btn.textContent = String(i + 1).padStart(2, '0');

            if (i === state.currentIndex) {
                btn.classList.add('active');
            }
            if (state.answers[i]) {
                const st = state.answers[i].status;
                if (st === 'answered') btn.classList.add('answered');
                else if (st === 'review') btn.classList.add('review');
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
        if (!state.active) return;

        const ansInput = document.getElementById('room-answer-input');
        const text = ansInput ? ansInput.value : '';

        const slider = document.getElementById('confidence-slider');
        const conf = slider ? parseInt(slider.value, 10) : 75;

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
        const scoreText = document.getElementById('eval-score-text');
        if (scoreText) scoreText.textContent = `${evalResult.score} / 100`;

        const statedConf = document.getElementById('eval-stated-conf');
        if (statedConf) statedConf.textContent = `${conf}%`;

        const techAcc = document.getElementById('eval-tech-acc');
        if (techAcc) techAcc.textContent = `${evalResult.technicalAccuracy}%`;

        const confInsight = document.getElementById('eval-conf-insight');
        if (confInsight) confInsight.textContent = evalResult.insight;

        const barAcc = document.getElementById('eval-bar-acc');
        if (barAcc) barAcc.style.width = `${evalResult.technicalAccuracy}%`;

        const barComp = document.getElementById('eval-bar-comp');
        if (barComp) barComp.style.width = `${evalResult.completeness}%`;

        const barClar = document.getElementById('eval-bar-clar');
        if (barClar) barClar.style.width = `${evalResult.clarity}%`;

        const barRel = document.getElementById('eval-bar-rel');
        if (barRel) barRel.style.width = `${evalResult.relevance}%`;

        const userAnsText = document.getElementById('eval-user-answer-text');
        if (userAnsText) userAnsText.textContent = userAns || '(No answer submitted)';

        const expectedAnsText = document.getElementById('eval-expected-answer-text');
        if (expectedAnsText) expectedAnsText.textContent = q.expectedAnswer || 'N/A';

        const matchedList = document.getElementById('eval-key-points-list');
        if (matchedList) {
            matchedList.innerHTML = (evalResult.matchedPoints.length > 0 ? evalResult.matchedPoints : ['None detected']).map(pt => `<li>✅ ${pt}</li>`).join('');
        }

        const missingList = document.getElementById('eval-missing-points-list');
        if (missingList) {
            missingList.innerHTML = (evalResult.missingPoints.length > 0 ? evalResult.missingPoints : ['None! Great coverage.']).map(pt => `<li>⚠️ ${pt}</li>`).join('');
        }

        const sampleAnsText = document.getElementById('eval-sample-answer-text');
        if (sampleAnsText) sampleAnsText.textContent = evalResult.sampleAnswer || q.expectedAnswer;

        const modalBackdrop = document.getElementById('eval-modal-backdrop');
        if (modalBackdrop) modalBackdrop.classList.remove('hidden');

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
        if (this.interviewState.timerInterval) {
            clearInterval(this.interviewState.timerInterval);
        }
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
        const toggleBtn = document.getElementById('btn-toggle-timer');
        if (toggleBtn) toggleBtn.textContent = this.interviewState.isPaused ? 'Resume Timer' : 'Pause Timer';
    },

    finishInterviewSession() {
        if (this.interviewState.timerInterval) {
            clearInterval(this.interviewState.timerInterval);
        }
        const state = this.interviewState;
        state.active = false;

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
        StorageManager.saveSession({
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

        // Unlock Achievements & Update Dashboard
        this.renderBadges();
        this.renderDashboard();

        UIManager.showToast(`Interview Completed! Overall Score: ${overallScore}%`, "green");
        UIManager.showView('analytics');
    },

    // --- DASHBOARD RENDERER ---
    renderDashboard() {
        const profile = StorageManager.getProfile();
        const name = profile.name || 'Alex Mercer';
        const role = profile.role || 'Software Engineer';
        
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
                    <div class="weak-topic-card card border-gold mb-2" style="margin-bottom: 12px; padding: 14px;">
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
        const topicQuestions = QUESTION_BANK.filter(q => q.topic === topicName || q.category === topicName);
        const pool = topicQuestions.length > 0 ? topicQuestions : QUESTION_BANK.slice(0, 5);

        UIManager.showToast(`Starting 5-Question Practice Re-test for ${topicName}...`, "gold");
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
        UIManager.showToast("Question retried! Vault status updated to Improved.", "emerald");
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
        const titleEl = document.getElementById('coding-problem-title');
        if (titleEl) titleEl.textContent = p.title;

        const diffEl = document.getElementById('coding-diff-badge');
        if (diffEl) diffEl.textContent = p.difficulty;

        const topicEl = document.getElementById('coding-topic-badge');
        if (topicEl) topicEl.textContent = p.topic;

        const descEl = document.getElementById('coding-problem-desc');
        if (descEl) descEl.innerHTML = p.problemDesc;

        const exampleEl = document.getElementById('coding-example-text');
        if (exampleEl) exampleEl.textContent = p.exampleText;

        const approachEl = document.getElementById('coding-expected-approach');
        if (approachEl) approachEl.textContent = p.expectedApproach;

        const codeInput = document.getElementById('code-input');
        if (codeInput) codeInput.value = p.initialCode;

        const submitBtn = document.getElementById('btn-submit-code');
        if (submitBtn) {
            submitBtn.onclick = () => {
                const resultBox = document.getElementById('coding-result-box');
                if (resultBox) resultBox.classList.remove('hidden');

                const conceptEl = document.getElementById('coding-res-concept');
                if (conceptEl) conceptEl.textContent = p.conceptTested;

                const timeEl = document.getElementById('coding-res-time');
                if (timeEl) timeEl.textContent = p.complexity;

                const gotchasEl = document.getElementById('coding-res-gotchas');
                if (gotchasEl) gotchasEl.textContent = p.commonGotchas;

                const sampleSolEl = document.getElementById('coding-sample-sol-text');
                if (sampleSolEl) sampleSolEl.textContent = p.sampleSolution;

                UIManager.showToast("Code Submission Evaluated! (Score: 88/100)", "emerald");
            };
        }

        const resetBtn = document.getElementById('btn-reset-code');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (codeInput) codeInput.value = p.initialCode;
                const resultBox = document.getElementById('coding-result-box');
                if (resultBox) resultBox.classList.add('hidden');
            };
        }
    },

    // --- PROJECT ROUND ---
    setupProjectRound() {
        const list = document.getElementById('project-questions-list');
        if (!list) return;
        list.innerHTML = PROJECT_QUESTIONS.map(q => `
            <div class="card mb-3">
                <h3>${q.question}</h3>
                <p class="text-secondary" style="font-size: 13px; margin: 6px 0 12px 0;">${q.guidance}</p>
                <textarea class="answer-textarea" rows="4" placeholder="Draft your technical project architecture response..."></textarea>
                <div style="text-align: right; margin-top: 12px;">
                    <button class="btn btn-sm btn-gold" onclick="UIManager.showToast('Project response saved.', 'gold')">Save Architecture Response</button>
                </div>
            </div>
        `).join('');
    },

    // --- HR ROUND ---
    setupHRRound() {
        const list = document.getElementById('hr-questions-list');
        if (!list) return;
        list.innerHTML = HR_QUESTIONS.map(q => `
            <div class="card mb-3">
                <h3>${q.question}</h3>
                <div class="card" style="background: var(--bg-surface); margin: 10px 0 14px 0; padding: 12px;">
                    <div style="font-size: 12.5px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div><strong class="text-gold">S:</strong> ${q.starStructure.situation}</div>
                        <div><strong class="text-gold">T:</strong> ${q.starStructure.task}</div>
                        <div><strong class="text-gold">A:</strong> ${q.starStructure.action}</div>
                        <div><strong class="text-gold">R:</strong> ${q.starStructure.result}</div>
                    </div>
                </div>
                <textarea class="answer-textarea" rows="4" placeholder="Draft your STAR response..."></textarea>
                <div style="text-align: right; margin-top: 12px;">
                    <button class="btn btn-sm btn-gold" onclick="UIManager.showToast('STAR answer saved!', 'gold')">Save STAR Answer</button>
                </div>
            </div>
        `).join('');
    },

    // --- ANALYTICS VIEW ---
    renderAnalytics() {
        const readiness = RecommendationEngine.calculateReadinessScore();
        const readinessNum = document.getElementById('analytics-readiness-num');
        if (readinessNum) readinessNum.textContent = `${readiness}%`;

        const topicStats = StorageManager.getTopicStats();
        ChartRenderer.renderTopicBars('analytics-topics-list', topicStats);

        const history = StorageManager.getHistory();
        if (history.length > 0) {
            const last = history[0];
            const goodList = document.getElementById('debrief-good-list');
            if (goodList) {
                goodList.innerHTML = `
                    <li>Strong performance in ${last.strongestTopic || 'Core Technical'}.</li>
                    <li>Overall Interview Quality Score: ${last.score}%.</li>
                `;
            }
            const badList = document.getElementById('debrief-bad-list');
            if (badList) {
                badList.innerHTML = `
                    <li>Target practice recommended for ${last.weakestTopic || 'General Areas'}.</li>
                `;
            }
            const nextActionText = document.getElementById('debrief-next-action-text');
            if (nextActionText) {
                nextActionText.textContent = `Practice ${last.weakestTopic || 'weak topics'} for 30 minutes before your next session.`;
            }
        }
    },

    // --- HISTORY VIEW ---
    renderHistory() {
        const history = StorageManager.getHistory();
        const tbody = document.getElementById('history-full-tbody');
        if (!tbody) return;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center empty-state-td">No history logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.map(s => `
            <tr>
                <td>${s.formattedDate}</td>
                <td><strong>${s.role}</strong></td>
                <td>${s.type}</td>
                <td><span class="badge ${s.score >= 70 ? 'badge-emerald' : 'badge-amber'}">${s.score}%</span></td>
                <td>${s.confidence}%</td>
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
        if (!sel1 || !sel2) return;

        const optionsHtml = history.map(s => `<option value="${s.id}">${s.formattedDate} — ${s.role} (${s.score}%)</option>`).join('');
        sel1.innerHTML = optionsHtml;
        sel2.innerHTML = optionsHtml;
        sel2.selectedIndex = Math.min(1, history.length - 1);

        document.getElementById('compare-modal-backdrop')?.classList.remove('hidden');
    },

    runCompareInterviews() {
        const history = StorageManager.getHistory();
        const sel1 = document.getElementById('compare-session-1');
        const sel2 = document.getElementById('compare-session-2');
        if (!sel1 || !sel2) return;

        const id1 = sel1.value;
        const id2 = sel2.value;

        const s1 = history.find(s => s.id === id1);
        const s2 = history.find(s => s.id === id2);

        if (!s1 || !s2) return;

        const title1 = document.getElementById('cmp-sess1-title');
        if (title1) title1.textContent = `${s1.role} (${s1.formattedDate})`;

        const score1 = document.getElementById('cmp-sess1-score');
        if (score1) score1.textContent = `${s1.score}%`;

        const title2 = document.getElementById('cmp-sess2-title');
        if (title2) title2.textContent = `${s2.role} (${s2.formattedDate})`;

        const score2 = document.getElementById('cmp-sess2-score');
        if (score2) score2.textContent = `${s2.score}%`;

        const diff = s2.score - s1.score;
        const badge = document.getElementById('cmp-delta-badge');
        if (badge) badge.textContent = `${diff >= 0 ? '+' : ''}${diff}% Improvement`;
    },

    // --- PROFILE VIEW ---
    renderProfile() {
        const profile = StorageManager.getProfile();
        const history = StorageManager.getHistory();
        const vault = StorageManager.getMistakeVault();

        const nameEl = document.getElementById('profile-card-name');
        if (nameEl) nameEl.textContent = profile.name || 'Alex Mercer';

        const roleEl = document.getElementById('profile-card-role');
        if (roleEl) roleEl.textContent = `${profile.role || 'Software Engineer'} • ${profile.experience || '1-3 Years Experience'}`;

        const expEl = document.getElementById('profile-card-exp');
        if (expEl) expEl.textContent = profile.experience || '1-3 Years';

        const sessEl = document.getElementById('profile-stat-sessions');
        if (sessEl) sessEl.textContent = history.length;

        const topScore = history.reduce((max, s) => Math.max(max, s.score || 0), 0);
        const topEl = document.getElementById('profile-stat-top-score');
        if (topEl) topEl.textContent = `${topScore}%`;

        const resolvedEl = document.getElementById('profile-stat-resolved');
        if (resolvedEl) resolvedEl.textContent = Object.values(StorageManager.getTopicStats()).filter(t => t.avgScore >= 70).length;

        const vaultEl = document.getElementById('profile-stat-vault');
        if (vaultEl) vaultEl.textContent = vault.length;
    }
};

// Initialize App on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
