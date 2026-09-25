/* ==========================================================================
   INTERVIEWX — GAMIFICATION & BADGES CONFIGURATION
   ========================================================================== */

const ACHIEVEMENTS_DEF = [
    {
        id: "badge_first_interview",
        name: "First Launch",
        icon: "🚀",
        desc: "Completed your first interview simulation.",
        condition: (stats) => stats.totalInterviews >= 1
    },
    {
        id: "badge_5_interviews",
        name: "Veteran Candidate",
        icon: "🎯",
        desc: "Completed 5 interview sessions.",
        condition: (stats) => stats.totalInterviews >= 5
    },
    {
        id: "badge_streak_7",
        name: "7-Day Streak",
        icon: "🔥",
        desc: "Maintained a 7-day interview practice streak.",
        condition: (stats) => stats.streak >= 7
    },
    {
        id: "badge_score_80",
        name: "High Caliber",
        icon: "⚡",
        desc: "Achieved an overall interview score of 80% or higher.",
        condition: (stats) => stats.topScore >= 80
    },
    {
        id: "badge_weakness_resolved",
        name: "Weakness Overcome",
        icon: "🧠",
        desc: "Improved a weak topic by completing re-test practice.",
        condition: (stats) => stats.resolvedWeakTopics >= 1
    },
    {
        id: "badge_perfect_round",
        name: "Perfect Round",
        icon: "👑",
        desc: "Scored 95%+ quality in a technical round.",
        condition: (stats) => stats.topScore >= 95
    },
    {
        id: "badge_vault_master",
        name: "Vault Master",
        icon: "🔒",
        desc: "Practiced and cleared 5 mistakes from your Mistake Vault.",
        condition: (stats) => stats.vaultCleared >= 5
    }
];
