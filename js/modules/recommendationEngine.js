/* ==========================================================================
   INTERVIEWX — DETERMINISTIC RULE-BASED RECOMMENDATION ENGINE
   ========================================================================== */

const RecommendationEngine = {
    
    /**
     * Rule-based answer quality evaluation
     */
    evaluateAnswer(userAnswer, questionObj, confidence = 75) {
        if (!userAnswer || userAnswer.trim().length === 0) {
            return {
                score: 0,
                technicalAccuracy: 0,
                completeness: 0,
                clarity: 0,
                relevance: 0,
                confidence: confidence,
                insight: "No answer provided.",
                missingPoints: questionObj.keyPoints || [],
                matchedPoints: []
            };
        }

        const cleanUser = userAnswer.toLowerCase();
        const expected = (questionObj.expectedAnswer || '').toLowerCase();
        const keyPoints = questionObj.keyPoints || [];

        // 1. Keyword & Key Points Coverage
        let matchedCount = 0;
        const missingPoints = [];
        const matchedPoints = [];

        keyPoints.forEach(pt => {
            const keywords = pt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const matches = keywords.filter(kw => cleanUser.includes(kw));
            if (matches.length > 0 || cleanUser.includes(pt.toLowerCase().slice(0, 15))) {
                matchedCount++;
                matchedPoints.push(pt);
            } else {
                missingPoints.push(pt);
            }
        });

        const keyPointScore = keyPoints.length > 0 ? Math.round((matchedCount / keyPoints.length) * 100) : 70;

        // 2. Length & Completeness heuristic
        const wordCount = userAnswer.trim().split(/\s+/).length;
        let completenessScore = Math.min(100, Math.round((wordCount / 25) * 100));

        // 3. Technical Accuracy Heuristic
        const techAccuracy = Math.round((keyPointScore * 0.7) + (completenessScore * 0.3));

        // 4. Clarity & Relevance
        const clarityScore = wordCount >= 15 ? 85 : 60;
        const relevanceScore = keyPointScore;

        // Weighted Overall Answer Score
        const overallScore = Math.min(100, Math.round(
            (techAccuracy * 0.5) + (completenessScore * 0.2) + (clarityScore * 0.15) + (relevanceScore * 0.15)
        ));

        // 5. Confidence vs Performance Analysis
        let insight = "Calibrated Alignment: Your confidence matches your answer accuracy.";
        if (confidence >= 80 && overallScore < 50) {
            insight = "High confidence, but low accuracy. Concept revision is recommended to address knowledge gaps.";
        } else if (confidence <= 50 && overallScore >= 75) {
            insight = "You know more than you think. Build confidence in your technical articulation!";
        } else if (overallScore >= 85) {
            insight = "Excellent mastery! High technical accuracy and clear conceptual depth.";
        }

        return {
            score: overallScore,
            technicalAccuracy: techAccuracy,
            completeness: completenessScore,
            clarity: clarityScore,
            relevance: relevanceScore,
            confidence: confidence,
            insight: insight,
            missingPoints: missingPoints,
            matchedPoints: matchedPoints,
            sampleAnswer: questionObj.sampleAnswer || questionObj.expectedAnswer
        };
    },

    /**
     * Calculate Interview Readiness Metric (0 - 100%)
     */
    calculateReadinessScore() {
        const history = StorageManager.getHistory();
        const weakTopics = StorageManager.getWeakTopics();
        const streak = StorageManager.getStreak().currentStreak || 0;

        if (history.length === 0) return 0;

        // Avg Score from last 5 sessions
        const recentSessions = history.slice(0, 5);
        const avgRecentScore = Math.round(recentSessions.reduce((acc, s) => acc + (s.score || 0), 0) / recentSessions.length);

        // Session Count Weight (up to 20 pts)
        const sessionWeight = Math.min(20, history.length * 4);

        // Weak Topics Penalty (-5 pts per weak topic, max penalty 30)
        const weakPenalty = Math.min(30, weakTopics.length * 6);

        // Streak Bonus (up to 10 pts)
        const streakBonus = Math.min(10, streak * 2);

        // Final Base Calculation
        let readiness = Math.round((avgRecentScore * 0.6) + sessionWeight - weakPenalty + streakBonus);
        return Math.max(0, Math.min(100, readiness));
    },

    /**
     * Deterministic Next Best Action Recommendation
     */
    getNextBestAction() {
        const profile = StorageManager.getProfile();
        const history = StorageManager.getHistory();
        const weakTopics = StorageManager.getWeakTopics();

        if (!profile.role || history.length === 0) {
            return {
                title: "Configure Profile & Target Role",
                description: "Define your experience level and target role to generate a customized interview roadmap.",
                actionText: "Setup Profile",
                targetView: "setup"
            };
        }

        if (weakTopics.length > 0) {
            const topWeak = weakTopics[0];
            return {
                title: `Practice Weak Area: ${topWeak.topic}`,
                description: `Your average accuracy in ${topWeak.topic} is currently ${topWeak.avgScore}%. Watch recommended YouTube resources and complete a 5-question practice re-test.`,
                actionText: "Open Learning Center",
                targetView: "learning-center"
            };
        }

        const mistakes = StorageManager.getMistakeVault().filter(m => m.status === 'needs-review');
        if (mistakes.length > 0) {
            return {
                title: `Review ${mistakes.length} Mistakes in Vault`,
                description: "You have unreviewed wrong answers saved in your Mistake Vault. Review sample answers and retry them.",
                actionText: "Open Mistake Vault",
                targetView: "mistake-vault"
            };
        }

        return {
            title: `Launch ${profile.role} Interview Round`,
            description: `You are on a roll! Launch a new full interview session for ${profile.role} to test your interview readiness.`,
            actionText: "Start Interview",
            targetView: "setup"
        };
    }
};
