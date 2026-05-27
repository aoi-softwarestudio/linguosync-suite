// StudyFlow AI - Advanced Personal Learning Coach Core Logic
// Full-featured, Gamified & E2E Connected Version

// UI Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const heroSection = document.getElementById('heroSection');
const mainDashboard = document.getElementById('mainDashboard');
const loadingOverlay = document.getElementById('loadingOverlay');
const viewTitle = document.getElementById('viewTitle');
const viewContent = document.getElementById('viewContent');
const interactiveDocViewer = document.getElementById('interactiveDocViewer');
const dailyStreakBadge = document.getElementById('dailyStreakBadge');
const streakCountSpan = document.getElementById('streakCount');
const userLevelCircle = document.getElementById('userLevelCircle');
const userLevelText = document.getElementById('userLevelText');
const levelProgressFill = document.getElementById('levelProgressFill');

// State Variables
let sourceFiles = []; // Array of { name: string, text: string, enabled: boolean }
let currentData = null;
let activeView = 'flashcards';
let examInterval = null;
let fullDocumentText = "";
let currentSpeakUtterance = null; // TTS tracker
let isSocraticMode = true; // Socratic Active Recall questioning mode active
let tutorChatCount = 0; // Tracks consecutive tutor Q&As for achievements

// API Configuration
let modalDropZoneBound = false;
let geminiApiKey = (typeof SuiteGatekeeper !== 'undefined' && typeof SuiteGatekeeper.getGeminiKey === 'function' ? SuiteGatekeeper.getGeminiKey() : '') || localStorage.getItem('gemini_api_key') || '';
let isGeminiEnabled = true;
let geminiModel = localStorage.getItem('studyflow_gemini_model') || 'gemini-3.5-flash';
let backendApiUrl = 'https://cholesterol-anniversary-opinions-perhaps.trycloudflare.com'; // Dynamic local routing API Gateway fallback
// Gamification State
let userGold = parseInt(localStorage.getItem('studyflow_gold') || '100');
let userInventory = JSON.parse(localStorage.getItem('studyflow_inventory') || '{"hp_potion":1,"scroll_insight":0,"shield_scroll":0,"double_strike":0}');
let userXp = parseInt(localStorage.getItem('studyflow_xp') || '50');
let userStreak = parseInt(localStorage.getItem('studyflow_streak') || '3');
// Ranks Mapping
const SCHOLAR_RANKS = [
    { lvl: 1, name: "学者見習い" },
    { lvl: 2, name: "熱心な学徒" },
    { lvl: 3, name: "知識の探求者" },
    { lvl: 4, name: "叡智の賢者" },
    { lvl: 5, name: "マスター・マインド" }
];
// PDF.js Setup
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    // Sync settings if SuiteGatekeeper is loaded
    if (typeof SuiteGatekeeper !== 'undefined') {
        if (typeof SuiteGatekeeper.getGeminiKey === 'function' && SuiteGatekeeper.getGeminiKey()) {
            geminiApiKey = SuiteGatekeeper.getGeminiKey();
        }
    }
    
    // Sync UI model selector with storage
    const modelEl = document.getElementById('geminiModel');
    if (modelEl) modelEl.value = geminiModel;
    const keyEl = document.getElementById('geminiKey');
    if (keyEl) keyEl.value = geminiApiKey;
    
    // Restore study ambiance theme
    const savedTheme = localStorage.getItem('studyflow_ambiance_theme') || 'cyber-amethyst';
    document.body.classList.add(savedTheme);
    const themeSelectEl = document.getElementById('studyThemeSelect');
    if (themeSelectEl) themeSelectEl.value = savedTheme;
    
    // Setup initial gamification states
    updateGamificationUI();
    renderSessionList();
    initDailyQuests();
    renderAchievements();
    
    // Load last session if any
    const lastId = localStorage.getItem('studyflow_active_project_id');
    if (lastId) {
        loadSession(lastId);
    }
    
    // Update dashboard buttons visibility
    updateDashboardButtons();
    
    // Update Auth UI and run initial sync if logged in
    updateAuthUI();
    if (localStorage.getItem('studyflow_auth_token')) {
        syncUserDataFromServer();
    }
    
    // Bind modal elements
    setupModalDropZone();
});
// Toast Notification
function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
// --- GAMIFICATION SYSTEM & SOUND SYNTH ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playRetroSound(type) {
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        
        if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'hurt') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.25);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'item') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.06);
            osc.frequency.setValueAtTime(783.99, now + 0.12);
            osc.frequency.setValueAtTime(1046.50, now + 0.18);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'victory') {
            osc.type = 'square';
            const notes = [523.25, 523.25, 523.25, 523.25, 659.25, 587.33, 659.25, 783.99, 1046.50];
            const durations = [0.06, 0.06, 0.06, 0.12, 0.12, 0.06, 0.06, 0.06, 0.3];
            let time = now;
            gain.gain.setValueAtTime(0.1, now);
            notes.forEach((freq, idx) => {
                osc.frequency.setValueAtTime(freq, time);
                time += durations[idx];
            });
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, time);
            osc.start(now);
            osc.stop(time);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(196.00, now);
            osc.frequency.linearRampToValueAtTime(130.81, now + 0.25);
            osc.frequency.linearRampToValueAtTime(98.00, now + 0.55);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'shield') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    } catch (e) {
        console.warn("AudioContext error:", e);
    }
}

function addGold(amount) {
    userGold += amount;
    localStorage.setItem('studyflow_gold', userGold.toString());
    updateGamificationUI();
}

function addXp(amount) {
    userXp += amount;
    localStorage.setItem('studyflow_xp', userXp.toString());
    
    // Automatically grant gold alongside XP
    addGold(amount);
    
    // Level calculator
    const oldLevel = Math.floor((userXp - amount) / 200) + 1;
    const newLevel = Math.floor(userXp / 200) + 1;
    
    updateGamificationUI();
    showToast(`+${amount} XP ＆ ゴールド 獲得！`, 'success');
    
    if (newLevel > oldLevel) {
        showToast(`🎉 レベルアップ！ レベル ${newLevel} に到達しました！`, 'success');
        playRetroSound('victory');
        triggerConfettiEffect();
    }
    if (localStorage.getItem('studyflow_auth_token')) {
        syncUserDataFromServer();
    }
}

function updateGamificationUI() {
    const level = Math.floor(userXp / 200) + 1;
    const progressPercent = ((userXp % 200) / 200) * 100;
    
    if (userLevelCircle) userLevelCircle.innerText = level;
    
    // Get rank text
    let rankText = "学者見習い";
    for (let r of SCHOLAR_RANKS) {
        if (level >= r.lvl) rankText = r.name;
    }
    if (userLevelText) userLevelText.innerText = rankText;
    if (levelProgressFill) levelProgressFill.style.width = `${progressPercent}%`;
    if (streakCountSpan) streakCountSpan.innerText = userStreak;
    
    const goldCountSpan = document.getElementById('goldCount');
    if (goldCountSpan) goldCountSpan.innerText = userGold;
}

function triggerConfettiEffect() {
    // Simple visual reward flash
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.right = '0';
    flash.style.bottom = '0';
    flash.style.background = 'rgba(99, 102, 241, 0.2)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '99999';
    flash.style.transition = 'opacity 0.6s';
    document.body.appendChild(flash);
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 600);
    }, 200);
}

// --- NATIVE TEXT-TO-SPEECH (TTS) READER ---
function playTts(text) {
    if (!text) return;
    
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        showToast('音声を停止しました', 'info');
        return;
    }
    
    // Clean markup tags from speak text
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\*/g, '').substring(0, 800);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Find Japanese or English voice
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JA'));
    if (jaVoice) utterance.voice = jaVoice;
    
    utterance.rate = 1.05;
    
    utterance.onend = () => {
        currentSpeakUtterance = null;
    };
    
    window.speechSynthesis.speak(utterance);
    currentSpeakUtterance = utterance;
    showToast('音声読み上げ中... もう一度クリックで停止', 'info');
}

// --- PARSING & INTERACTIVE KEYWORDS VIEWER ---
async function readPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(" ") + "\n";
                }
                resolve(text);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Load Document Text in the Left Interactive Split Viewer
function renderInteractiveDocument() {
    if (!interactiveDocViewer) return;
    
    if (!fullDocumentText) {
        interactiveDocViewer.innerHTML = `
            <div style="text-align: center; color: var(--text-dim); padding-top: 5rem;">
                資料をアップロードすると、AIが能動的キーワードを抽出し、ここに表示されます。クリックで即座に対話解説できます。
            </div>
        `;
        return;
    }
    
    // Extract key conceptual terms to highlight (either from currentData.flashcards or default keywords)
    let terms = [];
    if (currentData && currentData.flashcards) {
        terms = currentData.flashcards.map(c => c.front);
    }
    
    // Fallback default terms if empty
    if (terms.length === 0) {
        terms = ["AI", "ノート", "学習", "合格", "StudyFlow", "アクティブリコール", "ソクラテス式"];
    }
    
    // Format text and inject interactive keywords
    let formattedText = fullDocumentText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(paragraph => {
            let processed = paragraph;
            
            // First, convert markdown style **bold** directly to temporary bold tags to avoid double-processing
            processed = processed.replace(/\*\*([^*]+)\*\*/g, `__BOLD_START__$1__BOLD_END__`);
            
            // Sort terms by length descending to replace longer phrases first (avoids partial replacements)
            const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
            
            // Loop and replace matched terms with styled interactive handles, avoiding matching inside HTML tags
            sortedTerms.forEach(term => {
                if (term.length > 1) {
                    // Use a negative lookahead to prevent replacing matches that are already inside HTML tags or attributes
                    const regex = new RegExp(`(${term})(?![^<>]*>)`, 'gi');
                    processed = processed.replace(regex, `<span class="interactive-term" onclick="askTutorAbout('$1')">$1</span>`);
                }
            });
            
            // Revert the temporary bold tags into actual interactive terms, also tag-safe
            processed = processed.replace(/__BOLD_START__([^_]+)__BOLD_END__/g, `<span class="interactive-term" onclick="askTutorAbout('$1')">$1</span>`);
            
            // Treat lines starting with '#' as headers
            if (processed.startsWith('# ')) {
                return `<h3 style="color: var(--primary); font-size: 1.15rem; margin-top: 1.2rem; border-left: 3px solid var(--accent); padding-left: 8px;">${processed.substring(2)}</h3>`;
            } else if (processed.startsWith('## ')) {
                return `<h4 style="color: white; font-size: 0.95rem; margin-top: 1rem; margin-bottom: 0.5rem;">${processed.substring(3)}</h4>`;
            }
            
            return `<p>${processed}</p>`;
        })
        .join('');
        
    interactiveDocViewer.innerHTML = formattedText;
}

// --- PROJECT / SESSION MANAGEMENT ---
function getSessions() {
    return JSON.parse(localStorage.getItem('studyflow_projects') || '[]');
}

function saveSessions(sessions) {
    localStorage.setItem('studyflow_projects', JSON.stringify(sessions));
    if (localStorage.getItem('studyflow_auth_token')) {
        syncUserDataFromServer();
    }
}

function updateDashboardButtons() {
    const sessions = getSessions();
    const hasHistory = sessions.length > 0;
    const isHeroVisible = (!heroSection || heroSection.style.display !== 'none');
    
    const headerBtn = document.getElementById('headerDashboardBtn');
    const heroBtn = document.getElementById('heroDashboardBtn');
    
    if (headerBtn) {
        if (hasHistory && isHeroVisible) {
            headerBtn.style.display = 'inline-flex';
        } else {
            headerBtn.style.display = 'none';
        }
    }
    
    if (heroBtn) {
        if (hasHistory && isHeroVisible) {
            heroBtn.style.display = 'inline-flex';
        } else {
            heroBtn.style.display = 'none';
        }
    }
}

function jumpToActiveProject() {
    const sessions = getSessions();
    if (sessions.length > 0) {
        let activeId = localStorage.getItem('studyflow_active_project_id');
        if (!activeId || !sessions.find(s => s.id === activeId)) {
            activeId = sessions[0].id;
        }
        loadSession(activeId);
    } else {
        showToast('プロジェクト履歴がありません。資料をアップロードして新しいプロジェクトを開始してください。', 'warning');
    }
}

function createNewProject() {
    // Clear and reset dashboard to default
    sourceFiles = [];
    currentData = null;
    fullDocumentText = "";
    localStorage.removeItem('studyflow_active_project_id');
    
    heroSection.style.display = 'block';
    mainDashboard.style.display = 'none';
    
    if (interactiveDocViewer) interactiveDocViewer.innerHTML = "";
    
    showToast('新しい学習セットを作成しました。資料をアップロードしてください。');
    renderSessionList();
    updateDashboardButtons();
}

function saveActiveSession() {
    if (!currentData) return;
    
    const sessions = getSessions();
    const activeId = localStorage.getItem('studyflow_active_project_id') || 'proj_' + Date.now();
    localStorage.setItem('studyflow_active_project_id', activeId);
    
    const existingIdx = sessions.findIndex(s => s.id === activeId);
    const existingProj = existingIdx >= 0 ? sessions[existingIdx] : null;
    const wasBossDefeated = existingProj ? (existingProj.bossDefeated || false) : false;
    
    const projectData = {
        id: activeId,
        title: currentData.title || "無題のドキュメント",
        fullDocumentText: fullDocumentText,
        sourceFiles: sourceFiles,
        currentData: currentData,
        date: new Date().toLocaleDateString('ja-JP'),
        updated: Date.now(),
        bossDefeated: wasBossDefeated
    };
    
    if (existingIdx >= 0) {
        sessions[existingIdx] = projectData;
    } else {
        sessions.unshift(projectData);
    }
    
    saveSessions(sessions);
    renderSessionList();
}

function loadSession(id) {
    const sessions = getSessions();
    const proj = sessions.find(s => s.id === id);
    if (!proj) return;
    
    localStorage.setItem('studyflow_active_project_id', id);
    sourceFiles = proj.sourceFiles || [];
    fullDocumentText = proj.fullDocumentText || "";
    currentData = proj.currentData;
    
    finalizeUpload();
    showToast(`プロジェクト「${proj.title}」を復元しました`);
}

function deleteSession(id, event) {
    if (event) event.stopPropagation();
    
    const sessions = getSessions();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    
    const activeId = localStorage.getItem('studyflow_active_project_id');
    if (activeId === id) {
        if (updated.length > 0) {
            loadSession(updated[0].id);
        } else {
            createNewProject();
        }
    } else {
        renderSessionList();
    }
    updateDashboardButtons();
    showToast('プロジェクトを削除しました');
}

function renameProject(newTitle) {
    if (!currentData || !newTitle.trim()) return;
    currentData.title = newTitle.trim();
    saveActiveSession();
    showToast('タイトルを更新しました', 'success');
}

function renderSessionList() {
    const container = document.getElementById('sessionList');
    if (!container) return;
    
    const sessions = getSessions();
    if (sessions.length === 0) {
        container.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--text-dim); font-size: 0.75rem;">挑戦可能なダンジョンはありません</div>`;
        return;
    }
    
    const activeId = localStorage.getItem('studyflow_active_project_id');
    
    container.innerHTML = sessions.map(s => {
        // Calculate progress of card mastery
        let masteredCount = 0;
        let totalCards = 0;
        if (s.currentData && s.currentData.flashcards) {
            totalCards = s.currentData.flashcards.length;
            const masteredKeys = JSON.parse(localStorage.getItem('studyflow_mastered_cards') || '[]');
            masteredCount = s.currentData.flashcards.filter(c => masteredKeys.includes(c.front)).length;
        }
        
        const cardProgress = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
        const isBossDefeated = s.bossDefeated || false;
        
        let statusText = "未踏破";
        let statusClass = "unexplored";
        let icon = "🛡️";
        if (cardProgress === 100 && isBossDefeated) {
            statusText = "完全制覇";
            statusClass = "conquered";
            icon = "🏆";
        } else if (cardProgress > 0 || isBossDefeated) {
            statusText = "攻略中";
            statusClass = "in-progress";
            icon = "⚔️";
        }
        
        return `
            <div class="session-item ${s.id === activeId ? 'active' : ''}" onclick="loadSession('${s.id}')">
                <span class="session-title" title="${s.title}">
                    <span class="dungeon-icon">${icon}</span>
                    <span class="dungeon-title-text">${s.title}</span>
                </span>
                <div class="dungeon-status-badge ${statusClass}">${statusText} (${cardProgress}%)</div>
                <button class="delete-project-btn" onclick="deleteSession('${s.id}', event)" title="削除" style="border: none; padding: 2px 6px; font-size: 0.7rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');
}

// --- MAIN CONTROLLER & UPLOAD FINALIZATION ---
function finalizeUpload() {
    heroSection.style.display = 'none';
    mainDashboard.style.display = 'grid';
    
    // Initial active sources compilation
    compileActiveSources();
    
    // Inject documents on the left split pane
    renderInteractiveDocument();
    
    // Render checkboxes for files in the sidebar
    renderSourceList();
    
    // Render Readiness Ring inside sidebar
    renderReadinessMeter();
    
    // Save active project in historical registry
    saveActiveSession();
    
    // Switch to active view
    renderView();
    
    // Update dashboard buttons visibility
    updateDashboardButtons();
}

function renderSourceList() {
    const sourceList = document.getElementById('sourceList');
    if (!sourceList) return;
    
    sourceList.innerHTML = sourceFiles.map((f, i) => `
        <div class="source-checkbox-container">
            <input type="checkbox" class="source-checkbox" id="src_cb_${i}" ${f.enabled !== false ? 'checked' : ''} onchange="toggleSourceActive(${i})">
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; font-weight: 600;" title="${f.name}">📄 ${f.name}</span>
        </div>
    `).join('');
}

window.toggleSourceActive = (idx) => {
    const cb = document.getElementById(`src_cb_${idx}`);
    if (cb) {
        sourceFiles[idx].enabled = cb.checked;
    }
    
    compileActiveSources();
    renderInteractiveDocument();
    
    // Trigger daily quest tracking
    updateQuestProgress('studyflow_quest_active_recall'); 
    showToast('アクティブな資料コンテキストを再構成しました');
};

function compileActiveSources() {
    const active = sourceFiles.filter(f => f.enabled !== false);
    fullDocumentText = active.map(f => f.text).join('\n\n');
}

function renderReadinessMeter() {
    const container = document.getElementById('readinessMeterContainer');
    if (!container) return;
    
    // Compute study status: master count, streak, etc.
    let masteredCount = 0;
    if (currentData && currentData.flashcards) {
        const masteredKeys = JSON.parse(localStorage.getItem('studyflow_mastered_cards') || '[]');
        masteredCount = currentData.flashcards.filter(c => masteredKeys.includes(c.front)).length;
    }
    
    const totalCount = (currentData && currentData.flashcards) ? currentData.flashcards.length : 10;
    const progress = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
    
    //Conic-gradient visual ring
    container.innerHTML = `
        <div class="readiness-meter" style="--percent: ${progress};">
            <div class="progress-ring">
                <div style="font-size: 1rem; font-weight: 900; color: #fff;">${progress}%</div>
                <div style="font-size: 0.55rem; color: var(--text-dim); position: absolute; bottom: 15px;">暗記定着率</div>
            </div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">学術理解スコア</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 4px;">模擬試験・カード進捗を総合評価</div>
        </div>
    `;
}

// --- CLIENT-SIDE DOCUMENT SUMMARIZATION & TERM HIGHLIGHTING ---
function convertMarkdownToSummaryHtml(markdownText, flashcards, fileName) {
    if (!markdownText) return "";
    
    // Normalize newlines
    let lines = markdownText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    
    let html = '<div class="premium-summary">';
    html += `<h3><i class="fas fa-book"></i> 資料マスター要約</h3>`;
    
    let inList = false;
    
    for (let line of lines) {
        let trimmed = line.trim();
        if (!trimmed) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue;
        }
        
        // Match headers
        if (trimmed.startsWith('#')) {
            if (inList) { html += '</ul>'; inList = false; }
            let level = 0;
            while (level < trimmed.length && trimmed[level] === '#') {
                level++;
            }
            let title = trimmed.substring(level).trim();
            html += `<h${Math.min(level + 1, 6)}>${title}</h${Math.min(level + 1, 6)}>`;
        }
        // Match list items
        else if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || trimmed.startsWith('・')) {
            if (!inList) {
                html += '<ul style="margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc;">';
                inList = true;
            }
            let content = trimmed.replace(/^[\-\*•・]\s*/, '').trim();
            html += `<li style="margin-bottom: 0.5rem;">${content}</li>`;
        }
        // Paragraph
        else {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p style="margin-bottom: 1rem; text-indent: 0.5rem; text-align: justify; line-height: 1.6;">${trimmed}</p>`;
        }
    }
    
    if (inList) {
        html += '</ul>';
    }
    
    html += '</div>';
    
    // Highlight terms from flashcards
    return highlightTermsInHtml(html, flashcards);
}

function highlightTermsInHtml(htmlString, flashcards) {
    if (!flashcards || flashcards.length === 0) return htmlString;
    
    const terms = flashcards.map(c => c.front).filter(t => t && t.length >= 2);
    if (terms.length === 0) return htmlString;
    
    const uniqueTerms = [...new Set(terms)].sort((a, b) => b.length - a.length);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    const escapedTerms = uniqueTerms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'g');
    
    function traverse(node) {
        if (node.nodeType === 3) { // Text node
            const text = node.nodeValue;
            pattern.lastIndex = 0;
            if (pattern.test(text)) {
                const parent = node.parentNode;
                if (parent && (parent.tagName === 'STRONG' || parent.tagName === 'A' || parent.tagName === 'H3' || parent.tagName === 'H2' || parent.tagName === 'BUTTON' || parent.classList.contains('interactive-term'))) {
                    return;
                }
                
                const span = document.createElement('span');
                span.innerHTML = text.replace(pattern, '<strong class="interactive-term" onclick="askTutorAbout(\'$1\')" style="cursor: pointer; color: var(--primary); text-decoration: underline;">$1</strong>');
                
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, node);
                }
                parent.removeChild(node);
            }
        } else if (node.nodeType === 1) { // Element node
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'BUTTON') {
                const children = Array.from(node.childNodes);
                for (let child of children) {
                    traverse(child);
                }
            }
        }
    }
    
    traverse(tempDiv);
    return tempDiv.innerHTML;
}

// --- CLIENT-SIDE MINI-RAG FOR CHAT CONTEXT ---
function getRelevantContext(text, query, concept, maxChars = 1500) {
    if (!text) return "";
    if (text.length <= maxChars) return text;
    
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 5);
    const keywords = [];
    if (concept) keywords.push(concept.toLowerCase());
    if (query) {
        const words = query.toLowerCase().split(/[\s,，.．、。・「」『』【】！？\?\!#]+/);
        for (let w of words) {
            if (w.length >= 2) keywords.push(w);
        }
    }
    
    const scoredParagraphs = paragraphs.map(p => {
        let score = 0;
        const lowerP = p.toLowerCase();
        for (let kw of keywords) {
            if (lowerP.includes(kw)) {
                score += kw === concept?.toLowerCase() ? 10 : 2;
            }
        }
        return { text: p, score };
    });
    
    const matched = scoredParagraphs.filter(p => p.score > 0);
    if (matched.length === 0) {
        return text.substring(0, maxChars);
    }
    
    matched.sort((a, b) => b.score - a.score);
    
    let context = "";
    for (let p of matched) {
        if ((context + p.text).length > maxChars) {
            if (context.length === 0) {
                context = p.text.substring(0, maxChars);
            }
            break;
        }
        context += p.text + "\n\n";
    }
    
    return context.trim() || text.substring(0, maxChars);
}

// --- CORE AI GATEWAY CONNECTION ---
async function callGeminiAPI(text, fileName) {
    const prompt = `
        You are given a highly structured, premium academic Summary or Study Guide exported from Google NotebookLM.
        Your mission is to compile its contents into interactive gaming study assets.

        Integrated NotebookLM textbook:
        ${text.substring(0, 16000)}

        CRITICAL OBJECTIVES:
        1. PEDAGOGICAL FLASHCARDS: Extract 10 core academic definitions/terms from the textbook. Create flashcards with high-fidelity, comprehensive pedagogical answers.
        2. MASTERY MOCK EXAM: Create 5 deep-thinking, application-oriented multiple-choice exam questions based on the textbook.
        3. CITATIONS: For every core definition or claim in flashcards, append an inline citation linking to the source filename in the format [Source: ${fileName}] at the end. Example: "SaaSビジネスの指標としてチャーンレートがあります [Source: ${fileName}]".

        OUTPUT SPECIFICATION (JSON ONLY):
        {
            "title": "Google NotebookLM 提携特訓プロジェクト: ${fileName}",
            "flashcards": [
                {"front": "Core Concept Name", "back": "Exhaustive explanation including context, significance, and relationships with strict source citations [Source: ${fileName}]. Japanese."}
            ],
            "exam": [
                {"question": "Synthesis Question based on textbook concepts.", "options": ["Option A","Option B","Option C","Option D"], "answer": 0}
            ]
        }
    `;

    const activeModel = geminiModel || "gemini-3.5-flash";

    let response;
    if (geminiApiKey) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
            })
        });
    } else {
        const licenseKey = localStorage.getItem('studyflow_license_key') || '';
        response = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-License-Key': licenseKey,
                'X-App-Id': 'studyflow'
            },
            body: JSON.stringify({
                model: activeModel,
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
    }

    if (response.status === 429) {
        alert("無料プランのAPI利用上限（1日3回）に達しました。悪用防止のため、サーバー側で制限を行っています。プレミアムライセンスキーを入力するか、しばらく時間をおいてから再度お試しください。");
    }

    if (!response.ok) throw new Error(`Gateway Error: ${response.status}`);
    const data = await response.json();
    let result = data.candidates[0].content.parts[0].text;
    
    // Parse pure JSON response
    const parsed = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
    currentData = {
        title: parsed.title || `Google NotebookLM 提携特訓プロジェクト: ${fileName}`,
        flashcards: parsed.flashcards || [],
        exam: parsed.exam || [],
        summary: convertMarkdownToSummaryHtml(text, parsed.flashcards || [], fileName)
    };
    
    // Unlock "First Document" Achievement
    unlockAchievement('trophy_first_doc');
}

// Fallback dynamic local text parser in case API is offline
function processContent(text, fileName) {
    const flashcards = [];
    const exam = [];
    
    // Clean text helpers
    const cleanMarker = (s) => s.replace(/[\*#_\-`「」【】『』]/g, '').trim();
    
    function cleanExtractedTerm(term) {
        let clean = term.replace(/[\*#_\-`「」【】『』"']/g, '').trim();
        clean = clean.replace(/^[・\-\*＊•\s\d+\.、]+/, '').trim();
        
        const boundaries = ['である', 'における', 'において', 'についての', 'に関する', 'という', 'という名の', 'は、', 'が、', 'の、', 'および', 'および、', 'と、', 'や、'];
        for (let boundary of boundaries) {
            const idx = clean.lastIndexOf(boundary);
            if (idx !== -1) {
                clean = clean.substring(idx + boundary.length).trim();
            }
        }
        
        clean = clean.replace(/^[はがをにでのとやも]、?/, '').trim();
        return clean;
    }
    
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 3);
    const extractedTerms = new Map(); // Term -> Definition
    
    // 1. Scan for list items with colons: e.g. "・機械学習：大量のデータから..."
    const listRegex = /^[・\-＊\*]?\s*(\d+[\.、]\s*)?([^：:\n]{2,30})[：:]\s*(.+)/gm;
    let listMatch;
    while ((listMatch = listRegex.exec(text)) !== null) {
        const term = cleanExtractedTerm(listMatch[2]);
        const definition = cleanMarker(listMatch[3]);
        if (term.length >= 2 && term.length <= 25 && definition.length > 5) {
            extractedTerms.set(term, definition);
        }
    }
    
    paragraphs.forEach(para => {
        const cleanPara = para.replace(/\s+/g, ' ');
        
        // 2. Look for **Term**
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;
        while ((match = boldRegex.exec(para)) !== null) {
            const term = cleanExtractedTerm(match[1]);
            if (term.length >= 2 && term.length <= 25 && !extractedTerms.has(term)) {
                let definition = cleanPara;
                const sentences = cleanPara.split(/[。]/);
                for (let s of sentences) {
                    if (s.includes(match[1]) && s.trim().length > 10) {
                        definition = s.trim() + "。";
                        break;
                    }
                }
                extractedTerms.set(term, cleanMarker(definition));
            }
        }
        
        // 3. Look for 【Term】 or 「Term」
        const bracketRegex = /[「【]([^」】]+)[」】]/g;
        while ((match = bracketRegex.exec(para)) !== null) {
            const term = cleanExtractedTerm(match[1]);
            if (term.length >= 2 && term.length <= 25 && !extractedTerms.has(term)) {
                let definition = cleanPara;
                const sentences = cleanPara.split(/[。]/);
                for (let s of sentences) {
                    if (s.includes(match[1]) && s.trim().length > 10) {
                        definition = s.trim() + "。";
                        break;
                    }
                }
                extractedTerms.set(term, cleanMarker(definition));
            }
        }
        
        // 4. Look for Termとは or Termは、
        const defPatterns = [
            /([^。？\n\r]{2,40})とは/g,
            /([^。？\n\r]{2,40})は、/g
        ];
        defPatterns.forEach(regex => {
            let m;
            while ((m = regex.exec(para)) !== null) {
                const term = cleanExtractedTerm(m[1]);
                if (term.length >= 2 && term.length <= 25 && !extractedTerms.has(term)) {
                    let definition = cleanPara;
                    const sentences = cleanPara.split(/[。]/);
                    for (let s of sentences) {
                        if (s.includes(m[1]) && s.trim().length > 10) {
                            definition = s.trim() + "。";
                            break;
                        }
                    }
                    extractedTerms.set(term, cleanMarker(definition));
                }
            }
        });
    });
    
    // Convert extracted terms to cards
    extractedTerms.forEach((def, term) => {
        let cleanDef = def;
        const prefixes = [term + "とは、", term + "とは", term + "は、", term + "は"];
        for (let pref of prefixes) {
            if (cleanDef.startsWith(pref)) {
                cleanDef = cleanDef.substring(pref.length).trim();
                break;
            }
        }
        cleanDef = cleanDef.replace(/^[、。,.\s]/, '').trim();
        if (cleanDef.length < 5) {
            cleanDef = `「${term}」に関する詳細および解説が資料内に記述されています。`;
        }
        flashcards.push({ front: term, back: cleanDef });
    });
    
    // Fallback if we couldn't extract enough terms
    if (flashcards.length < 3) {
        let sentences = text.split(/[。|\n]/).map(s => s.trim()).filter(s => s.length > 10);
        
        sentences.forEach((sentence) => {
            let cleanS = cleanMarker(sentence).replace(/^[・\-\*＊•\s\d+\.、]+/, '').trim();
            if (cleanS.length < 15) return;
            
            let term = cleanS.substring(0, 12);
            const commas = [',', '，', '、', '：', ':'];
            for (let c of commas) {
                if (cleanS.includes(c)) {
                    const parts = cleanS.split(c);
                    if (parts[0].trim().length >= 2 && parts[0].trim().length <= 20) {
                        term = cleanExtractedTerm(parts[0]);
                        break;
                    }
                }
            }
            flashcards.push({ front: term, back: cleanS + "。" });
        });
    }
    
    // Ensure we don't have empty fronts or backs
    const finalFlashcards = flashcards.filter(c => c.front.length > 0 && c.back.length > 0).slice(0, 12);
    
    // If still empty (e.g. extremely short input)
    if (finalFlashcards.length === 0) {
        finalFlashcards.push({
            front: "学習トピック",
            back: cleanMarker(text) || "資料のインポートが完了しました。"
        });
    }
    
    // 2. Generate multiple-choice exam
    finalFlashcards.forEach((card, idx) => {
        const correctOpt = card.back;
        
        // Find distractor options from other flashcards
        const otherBacks = finalFlashcards
            .filter((_, i) => i !== idx)
            .map(c => c.back);
            
        // Shuffle other definitions to select distractors
        const distractors = otherBacks.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        // Fill up to 3 distractors with premium templates if not enough concepts
        const distractorTemplates = [
            `「${card.front}」に関連する概念であるが、論理的構成要素が異なるため不正確な説明。`,
            `資料内の関連コンテキストにおいて、別の概念的特徴と混同している記述。`,
            `具体例や応用シナリオにおいて、学術的根拠が不足している不適切な記述。`
        ];
        while (distractors.length < 3) {
            distractors.push(distractorTemplates[distractors.length]);
        }
        
        // Mix correct option with distractors
        const optionsList = [correctOpt, ...distractors];
        
        // Shuffle all 4 options
        const shuffledOptions = [];
        let correctAnswerIndex = 0;
        const indices = [0, 1, 2, 3].sort(() => 0.5 - Math.random());
        indices.forEach((originalIndex, targetIndex) => {
            shuffledOptions[targetIndex] = optionsList[originalIndex];
            if (originalIndex === 0) {
                correctAnswerIndex = targetIndex;
            }
        });
        
        exam.push({
            question: `「${card.front}」に関する説明として最も適切なものはどれですか？`,
            options: shuffledOptions,
            answer: correctAnswerIndex
        });
    });

    // 3. Build HTML summary
    let summaryHtml = `
        <div class="premium-summary">
            <h3><i class="fas fa-book"></i> 資料マスター要約</h3>
            <p style="color: var(--text-dim); margin-bottom: 1.5rem;">以下のテーマと定義語句が検出されました。クリックして対話を開始できます。</p>
            <ul>
    `;
    finalFlashcards.forEach(fc => {
        summaryHtml += `
            <li style="margin-bottom: 1rem;">
                <strong class="interactive-term" onclick="askTutorAbout('${fc.front}')" style="cursor: pointer; color: var(--primary); text-decoration: underline;">${fc.front}</strong>: ${fc.back}
            </li>
        `;
    });
    summaryHtml += `</ul></div>`;

    currentData = {
        title: `統合ローカル解析セット: ${fileName}`,
        summary: summaryHtml,
        flashcards: finalFlashcards,
        exam: exam
    };
}

// --- CITATION PARSER & INTERACTIVE SOURCE JUMPING ---
function parseCitations(htmlText) {
    if (!htmlText) return "";
    const regex = /\[Source:\s*([^\]]+)\]/gi;
    return htmlText.replace(regex, (match, filename) => {
        const cleanName = escapeHtml(filename.trim());
        return `<span class="citation-badge" onclick="jumpToSourceText('${cleanName}')"><i class="fas fa-link"></i> ${cleanName.substring(0, 15)}</span>`;
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.jumpToSourceText = (filename) => {
    const viewer = document.getElementById('interactiveDocViewer');
    if (!viewer) return;
    
    showToast(`資料「${filename}」の参照箇所へジャンプします`, 'info');
    
    // Scan left panel terms to highlight & scroll
    const terms = viewer.getElementsByClassName('interactive-term');
    if (terms.length > 0) {
        const target = terms[Math.floor(Math.random() * terms.length)]; // Dynamic mock match
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('highlight-segment');
        setTimeout(() => target.classList.remove('highlight-segment'), 2000);
    }
};

// --- RENDER DYNAMIC ACTIVE PANEL VIEWS ---
function renderView() {
    if (!currentData) return;
    
    // Stop exam timer if running
    if (examInterval) clearInterval(examInterval);
    
    const viewTitleEl = document.getElementById('viewTitle');
    const container = document.getElementById('viewContent');
    
    // Premium Game Titles
    if (activeView === 'flashcards') {
        viewTitleEl.innerHTML = `<i class="fas fa-clone"></i> 重要語句暗記カード: ${currentData.title}`;
        renderFlashcardsView(container);
    } else if (activeView === 'exam') {
        viewTitleEl.innerHTML = `<i class="fas fa-shield-halved"></i> 試験ボスバトル・アリーナ: ${currentData.title}`;
        renderExamView(container);
    } else if (activeView === 'tutor') {
        viewTitleEl.innerHTML = `<i class="fas fa-robot"></i> Socratic AI 家庭教師: ${currentData.title}`;
        renderTutorView(container);
    } else if (activeView === 'shop') {
        viewTitleEl.innerHTML = `<i class="fas fa-shopping-bag"></i> よろず屋 (Item Shop): ゴールドを活用`;
        renderShopView(container);
    }
}

function renderShopView(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
            <h3 style="color: #fbbf24; font-size: 1.1rem;"><i class="fas fa-shopping-bag"></i> アイテムよろず屋</h3>
            <span style="font-size: 0.8rem; color: var(--text-dim);">所持金: <strong style="color:#fbbf24;">${userGold} G</strong></span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1.5rem;">獲得したゴールドを消費して、試験ボスバトルを有利に進めるアイテムを購入できます。</p>
        
        <div class="shop-grid">
            <div class="shop-card">
                <div class="shop-card-icon">🧪</div>
                <div class="shop-card-title">HPポーション</div>
                <div class="shop-card-desc">試験ボスバトル中に使用すると、プレイヤーのHPを30回復します（上限100）。</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div class="shop-card-price">🪙 50 G</div>
                    <button class="shop-buy-btn" onclick="buyShopItem('hp_potion', 50)">購入する (所持: ${userInventory.hp_potion})</button>
                </div>
            </div>
            
            <div class="shop-card">
                <div class="shop-card-icon">📜</div>
                <div class="shop-card-title">賢者のスクロール</div>
                <div class="shop-card-desc">試験ボスバトル中に使用すると、現在解いている4択クイズから誤答を2つ消去します（50%削り）。</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div class="shop-card-price">🪙 80 G</div>
                    <button class="shop-buy-btn" onclick="buyShopItem('scroll_insight', 80)">購入する (所持: ${userInventory.scroll_insight})</button>
                </div>
            </div>
            
            <div class="shop-card">
                <div class="shop-card-icon">🛡️</div>
                <div class="shop-card-title">防護の巻物</div>
                <div class="shop-card-desc">試験ボスバトル中に使用すると、次に不正解した際のボスからの被ダメージを1回だけ完全に無効化します。</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div class="shop-card-price">🪙 60 G</div>
                    <button class="shop-buy-btn" onclick="buyShopItem('shield_scroll', 60)">購入する (所持: ${userInventory.shield_scroll})</button>
                </div>
            </div>
            
            <div class="shop-card">
                <div class="shop-card-icon">💥</div>
                <div class="shop-card-title">二連撃の巻物</div>
                <div class="shop-card-desc">試験ボスバトル中に使用すると、次に正解した際、ボスに与える攻撃ダメージを2倍にします。</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div class="shop-card-price">🪙 100 G</div>
                    <button class="shop-buy-btn" onclick="buyShopItem('double_strike', 100)">購入する (所持: ${userInventory.double_strike})</button>
                </div>
            </div>
        </div>
    `;
}

window.buyShopItem = (itemId, cost) => {
    if (userGold < cost) {
        showToast('ゴールドが不足しています！', 'error');
        return;
    }
    
    userGold -= cost;
    userInventory[itemId] = (userInventory[itemId] || 0) + 1;
    
    localStorage.setItem('studyflow_gold', userGold.toString());
    localStorage.setItem('studyflow_inventory', JSON.stringify(userInventory));
    
    playRetroSound('item');
    updateGamificationUI();
    renderView(); // re-render shop list
    showToast('アイテムを購入しました！', 'success');
};

// Flashcard Renderer with Mastered status toggling
function renderFlashcardsView(container) {
    const masteredKeys = JSON.parse(localStorage.getItem('studyflow_mastered_cards') || '[]');
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
            <h3 style="color: var(--primary); font-size: 1.1rem;"><i class="fas fa-clone"></i> 重要語句暗記カード</h3>
            <span style="font-size: 0.8rem; color: var(--text-dim);">カードをクリックして反転</span>
        </div>
        <div class="flashcard-grid">
            ${currentData.flashcards.map((c, i) => {
                const isMastered = masteredKeys.includes(c.front);
                return `
                    <div class="flashcard ${isMastered ? 'mastered' : ''}" id="card_${i}" onclick="this.classList.toggle('flipped')">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">
                                ${c.front}
                                <button class="mastery-btn" onclick="toggleCardMastery('${c.front}', event)">
                                    ${isMastered ? '✓ 暗記済' : '✓ 覚えた'}
                                </button>
                            </div>
                            <div class="flashcard-back">
                                ${parseCitations(c.back)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function toggleCardMastery(term, event) {
    if (event) event.stopPropagation();
    
    let masteredKeys = JSON.parse(localStorage.getItem('studyflow_mastered_cards') || '[]');
    const idx = masteredKeys.indexOf(term);
    
    if (idx >= 0) {
        masteredKeys.splice(idx, 1);
        showToast('カードを未暗記に戻しました', 'info');
    } else {
        masteredKeys.push(term);
        addXp(20);
    }
    
    localStorage.setItem('studyflow_mastered_cards', JSON.stringify(masteredKeys));
    renderReadinessMeter();
    renderView(); // Refresh flashcards view
}

// Timed Exam assessment logic
function renderExamView(container) {
    // Battle State variables
    let playerHp = 100;
    let bossHp = 100;
    let currentQIdx = 0;
    const totalQs = currentData.exam.length;
    const damagePerCorrect = Math.ceil(100 / totalQs);
    const damagePerIncorrect = 25; // 4 mistakes = death
    
    // Items state (battle session-local modifiers)
    let isShieldActive = false;
    let isDoubleStrikeActive = false;
    
    // Calculate dynamic Boss Name from title
    let docTitle = currentData.title || "無題の資料";
    let cleanTitle = docTitle.replace(/Google NotebookLM 提携特訓プロジェクト:\s*/, '').replace(/統合ローカル解析セット:\s*/, '').substring(0, 15);
    let bossName = `「${cleanTitle}」の守護獣`;
    
    // Reset any running interval/timers
    if (examInterval) clearInterval(examInterval);
    
    // Local Item usage logic via closure
    window.useBattleItem = (itemId) => {
        if (!userInventory[itemId] || userInventory[itemId] <= 0) {
            showToast('このアイテムを持っていません！よろず屋で購入してください。', 'warning');
            return;
        }
        
        const logEl = document.getElementById('battleLog');
        
        if (itemId === 'hp_potion') {
            if (playerHp >= 100) {
                showToast('すでにHPは満タンです！', 'info');
                return;
            }
            playerHp = Math.min(100, playerHp + 30);
            userInventory[itemId]--;
            playRetroSound('item');
            showToast('HPポーションを使用！ HPが30回復しました。', 'success');
            if (logEl) logEl.innerHTML = `<span style="color: #10b981; font-weight:800;">🧪 アイテム使用</span><br>HPポーションを使用してHPを30回復した！`;
        } 
        else if (itemId === 'scroll_insight') {
            const currentQ = currentData.exam[currentQIdx];
            const correctOptIdx = currentQ.answer;
            const options = document.querySelectorAll('.option');
            
            const incorrectIndices = [];
            options.forEach((opt, idx) => {
                if (idx !== correctOptIdx && opt.style.opacity !== '0.3') {
                    incorrectIndices.push(idx);
                }
            });
            
            if (incorrectIndices.length === 0) {
                showToast('これ以上消去できる選択肢がありません！', 'info');
                return;
            }
            
            const toDisable = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
            toDisable.forEach(idx => {
                const opt = options[idx];
                if (opt) {
                    opt.style.opacity = '0.3';
                    opt.style.pointerEvents = 'none';
                    opt.style.textDecoration = 'line-through';
                }
            });
            
            userInventory[itemId]--;
            playRetroSound('item');
            showToast('賢者のスクロールを使用！ 誤答の選択肢を2つ排除しました。', 'success');
            if (logEl) logEl.innerHTML = `<span style="color: #38bdf8; font-weight:800;">📜 アイテム使用</span><br>賢者のスクロールを使用して誤答を排除した！`;
        } 
        else if (itemId === 'shield_scroll') {
            if (isShieldActive) {
                showToast('すでにシールドが展開されています！', 'info');
                return;
            }
            isShieldActive = true;
            userInventory[itemId]--;
            playRetroSound('shield');
            showToast('防護の巻物を使用！ 次の被ダメージを無効化します。', 'success');
            if (logEl) logEl.innerHTML = `<span style="color: #fbbf24; font-weight:800;">🛡️ アイテム使用</span><br>防護の魔法シールドを展開した！`;
            const shieldBtn = document.getElementById('btn_item_shield_scroll');
            if (shieldBtn) shieldBtn.classList.add('active-effect');
        } 
        else if (itemId === 'double_strike') {
            if (isDoubleStrikeActive) {
                showToast('すでに二連撃の準備ができています！', 'info');
                return;
            }
            isDoubleStrikeActive = true;
            userInventory[itemId]--;
            playRetroSound('item');
            showToast('二連撃の巻物を使用！ 次の攻撃ダメージが2倍になります。', 'success');
            if (logEl) logEl.innerHTML = `<span style="color: #ef4444; font-weight:800;">💥 アイテム使用</span><br>次回攻撃ダメージ2倍のバフを付与した！`;
            const strikeBtn = document.getElementById('btn_item_double_strike');
            if (strikeBtn) strikeBtn.classList.add('active-effect');
        }
        
        localStorage.setItem('studyflow_inventory', JSON.stringify(userInventory));
        
        for (let key in userInventory) {
            const cntSpan = document.getElementById(`cnt_item_${key}`);
            if (cntSpan) cntSpan.innerText = userInventory[key];
            const btnEl = document.getElementById(`btn_item_${key}`);
            if (btnEl && userInventory[key] <= 0) {
                btnEl.disabled = true;
            }
        }
        
        drawBattleArenaHeaderOnly();
    };

    function drawBattleArenaHeaderOnly() {
        const pBar = document.querySelector('.fighter-card.player .hp-bar-fill');
        const pText = document.querySelector('.fighter-card.player .hp-text');
        const bBar = document.querySelector('.fighter-card.boss .hp-bar-fill');
        const bText = document.querySelector('.fighter-card.boss .hp-text');
        const pAvatar = document.querySelector('.fighter-card.player .fighter-avatar');
        
        if (pBar) {
            pBar.style.width = `${playerHp}%`;
            pBar.className = 'hp-bar-fill ' + (playerHp > 50 ? '' : (playerHp > 20 ? 'warning' : 'danger'));
        }
        if (pText) pText.innerText = `HP: ${playerHp} / 100`;
        
        if (bBar) {
            bBar.style.width = `${bossHp}%`;
            bBar.className = 'hp-bar-fill boss-hp ' + (bossHp > 50 ? '' : (bossHp > 20 ? 'warning' : 'danger'));
        }
        if (bText) bText.innerText = `HP: ${bossHp} / 100`;
        
        if (pAvatar) {
            pAvatar.innerHTML = isShieldActive ? '🛡️' : '🦸';
            if (isShieldActive) {
                pAvatar.style.borderColor = '#fbbf24';
                pAvatar.style.boxShadow = '0 0 15px rgba(251,191,36,0.6)';
            } else {
                pAvatar.style.borderColor = 'var(--primary)';
                pAvatar.style.boxShadow = '0 0 10px var(--primary-glow)';
            }
        }
    }
    
    function drawBattleArena() {
        // HP bar classes
        let playerHpClass = playerHp > 50 ? '' : (playerHp > 20 ? 'warning' : 'danger');
        let bossHpClass = bossHp > 50 ? 'boss-hp' : (bossHp > 20 ? 'boss-hp warning' : 'boss-hp danger');
        
        container.innerHTML = `
            <div class="battle-arena" id="battleArenaCard">
                <!-- Battle Header: VS Status -->
                <div class="battle-header">
                    <!-- Player Stats -->
                    <div class="fighter-card player">
                        <div class="fighter-avatar" style="transition: all 0.3s ease;">${isShieldActive ? '🛡️' : '🦸'}</div>
                        <div class="fighter-stats">
                            <div class="fighter-name">勇者（あなた）</div>
                            <div class="hp-container">
                                <div class="hp-bar-fill ${playerHpClass}" style="width: ${playerHp}%;"></div>
                            </div>
                            <div class="hp-text">HP: ${playerHp} / 100</div>
                        </div>
                    </div>
                    
                    <div class="battle-vs">VS</div>
                    
                    <!-- Boss Stats -->
                    <div class="fighter-card boss">
                        <div class="fighter-avatar">👹</div>
                        <div class="fighter-stats">
                            <div class="fighter-name" title="${bossName}">${bossName}</div>
                            <div class="hp-container">
                                <div class="hp-bar-fill ${bossHpClass}" style="width: ${bossHp}%;"></div>
                            </div>
                            <div class="hp-text">HP: ${bossHp} / 100</div>
                        </div>
                    </div>
                </div>
                
                <!-- Battle Items Inventory Hotbar -->
                <div class="battle-items-hotbar" style="display: flex; gap: 8px; border: 1px solid var(--glass-border); padding: 8px 12px; border-radius: 12px; justify-content: center; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 0.72rem; color: var(--text-dim); font-weight: 800; margin-right: 6px;">戦闘アイテム:</span>
                    <button class="item-btn" onclick="useBattleItem('hp_potion')" id="btn_item_hp_potion" ${userInventory.hp_potion <= 0 ? 'disabled' : ''}>
                        🧪 ポーション (<span id="cnt_item_hp_potion">${userInventory.hp_potion}</span>)
                    </button>
                    <button class="item-btn" onclick="useBattleItem('scroll_insight')" id="btn_item_scroll_insight" ${userInventory.scroll_insight <= 0 ? 'disabled' : ''}>
                        📜 賢者 (<span id="cnt_item_scroll_insight">${userInventory.scroll_insight}</span>)
                    </button>
                    <button class="item-btn ${isShieldActive ? 'active-effect' : ''}" onclick="useBattleItem('shield_scroll')" id="btn_item_shield_scroll" ${userInventory.shield_scroll <= 0 ? 'disabled' : ''}>
                        🛡️ 防護 (<span id="cnt_item_shield_scroll">${userInventory.shield_scroll}</span>)
                    </button>
                    <button class="item-btn ${isDoubleStrikeActive ? 'active-effect' : ''}" onclick="useBattleItem('double_strike')" id="btn_item_double_strike" ${userInventory.double_strike <= 0 ? 'disabled' : ''}>
                        💥 二連撃 (<span id="cnt_item_double_strike">${userInventory.double_strike}</span>)
                    </button>
                </div>
                
                <!-- Battle Combat Log -->
                <div class="battle-log-card" id="battleLog">
                    バトル開始！「${bossName}」が現れた！問題に正解して攻撃を叩き込め！
                </div>
                
                <!-- Battle Arena Body: Question Box -->
                <div class="battle-arena-body" id="battleQuestionArea">
                    <!-- Inject Question here -->
                </div>
            </div>
        `;
        
        renderBattleQuestion();
    }
    
    function renderBattleQuestion() {
        const questionArea = document.getElementById('battleQuestionArea');
        if (!questionArea) return;
        
        if (playerHp <= 0) {
            showBattleDefeat();
            return;
        }
        
        if (bossHp <= 0 || currentQIdx >= totalQs) {
            showBattleVictory();
            return;
        }
        
        const q = currentData.exam[currentQIdx];
        
        questionArea.innerHTML = `
            <div class="question-item" style="margin: 0; background: rgba(255,255,255,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; font-size: 0.78rem; color: var(--text-dim);">
                    <span>ターン ${currentQIdx + 1} / ${totalQs}</span>
                    <span>属性: 学術</span>
                </div>
                <h4 style="font-size: 1rem; line-height: 1.5; color: white;">${q.question}</h4>
                <div style="margin-top: 1rem;">
                    ${q.options.map((opt, oi) => `
                        <div class="option" onclick="submitBattleAnswer(${oi})" style="padding: 0.8rem 1.2rem; display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 800; color: var(--primary); font-family: monospace; background: rgba(99,102,241,0.15); width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 0.75rem;">${String.fromCharCode(65 + oi)}</span>
                            <span>${opt}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    window.submitBattleAnswer = (optionIdx) => {
        const q = currentData.exam[currentQIdx];
        const logEl = document.getElementById('battleLog');
        const arenaEl = document.getElementById('battleArenaCard');
        const options = document.querySelectorAll('.option');
        
        // Disable clicks during animation
        options.forEach(o => o.style.pointerEvents = 'none');
        
        const isCorrect = (optionIdx === q.answer);
        
        if (isCorrect) {
            // Player attacks!
            let damage = damagePerCorrect;
            let strikeMsg = "";
            if (isDoubleStrikeActive) {
                damage = damage * 2;
                isDoubleStrikeActive = false;
                strikeMsg = "二連撃発動！ダブルダメージ！ ";
            }
            bossHp = Math.max(0, bossHp - damage);
            
            playRetroSound('hit');
            if (logEl) logEl.innerHTML = `<span style="color: #10b981; font-weight: 800;"><i class="fas fa-magic"></i> ⚔️ ${strikeMsg}クリティカルヒット！ 正解！</span><br>ボス「${bossName}」に ${damage} ダメージを与えた！`;
            if (arenaEl) {
                arenaEl.classList.add('flash-green-effect');
                setTimeout(() => arenaEl.classList.remove('flash-green-effect'), 500);
            }
        } else {
            // Boss attacks!
            if (isShieldActive) {
                isShieldActive = false;
                playRetroSound('shield');
                if (logEl) logEl.innerHTML = `<span style="color: #fbbf24; font-weight: 800;"><i class="fas fa-shield-halved"></i> 盾ガード！ ダメージ無効（正解は ${String.fromCharCode(65 + q.answer)}）</span><br>「${bossName}」の攻撃！防護の魔法盾がダメージを防いだ！`;
            } else {
                playerHp = Math.max(0, playerHp - damagePerIncorrect);
                playRetroSound('hurt');
                if (logEl) logEl.innerHTML = `<span style="color: #f43f5e; font-weight: 800;"><i class="fas fa-bolt"></i> 手痛い反撃！ 不正解...（正解は ${String.fromCharCode(65 + q.answer)}）</span><br>「${bossName}」の攻撃！あなたは ${damagePerIncorrect} ダメージを受けた！`;
                if (arenaEl) {
                    arenaEl.classList.add('shake-effect', 'flash-red-effect');
                    setTimeout(() => arenaEl.classList.remove('shake-effect', 'flash-red-effect'), 500);
                }
            }
        }
        
        // Advance
        currentQIdx++;
        
        // Redraw stats after animation
        setTimeout(() => {
            drawBattleArena();
        }, 1600);
    };
    
    function showBattleVictory() {
        playRetroSound('victory');
        container.innerHTML = `
            <div class="battle-result-card">
                <div class="battle-result-icon win">🏆</div>
                <div class="battle-result-title" style="color: #fbbf24;">VICTORY!</div>
                <div class="battle-result-desc">
                    あなたは「${bossName}」を見事に撃破し、このダンジョンを攻略した！
                    <br><strong style="color: #10b981;">完全制覇報酬: +100 XP ＆ ダンジョン踏破バッジを獲得！</strong>
                </div>
                <div style="display: flex; gap: 1rem; width: 100%; justify-content: center; margin-top: 1rem;">
                    <button class="btn-premium" onclick="activeView='flashcards'; renderView();" style="background: linear-gradient(135deg, #10b981, #059669); border: none;">
                        <i class="fas fa-arrow-left"></i> ダンジョンに戻る
                    </button>
                    <button class="btn-demo" onclick="activeView='exam'; renderView();" style="border-color: var(--accent); color: var(--accent);">
                        <i class="fas fa-rotate"></i> 再戦する
                    </button>
                </div>
            </div>
        `;
        
        // Mark project as conquered
        const sessions = getSessions();
        const activeId = localStorage.getItem('studyflow_active_project_id');
        const idx = sessions.findIndex(s => s.id === activeId);
        if (idx >= 0) {
            sessions[idx].bossDefeated = true;
            saveSessions(sessions);
            renderSessionList();
        }
        
        // Award large XP and unlock achievements
        addXp(100);
        triggerQuestConfetti();
        unlockAchievement('trophy_exam_ace');
        updateQuestProgress('studyflow_quest_submit_exam');
    }
    
    function showBattleDefeat() {
        playRetroSound('gameover');
        container.innerHTML = `
            <div class="battle-result-card">
                <div class="battle-result-icon lose">💀</div>
                <div class="battle-result-title" style="color: #f43f5e;">DEFEAT</div>
                <div class="battle-result-desc">
                    あなたは「${bossName}」の猛攻に力尽きた...。
                    <br><span style="color: var(--text-dim);">理解が浅い用語があるようです。「重要語句暗記カード」で復習し、記憶力を高めてから再挑戦しましょう！</span>
                </div>
                <div style="display: flex; gap: 1rem; width: 100%; justify-content: center; margin-top: 1rem;">
                    <button class="btn-premium" onclick="activeView='flashcards'; renderView();">
                        <i class="fas fa-clone"></i> 暗記カードで復習する
                    </button>
                    <button class="btn-demo" onclick="activeView='exam'; renderView();">
                        <i class="fas fa-rotate"></i> リベンジする
                    </button>
                </div>
            </div>
        `;
        
        // Update daily quest for play count even if lost
        updateQuestProgress('studyflow_quest_submit_exam');
        
        // Add standard fail XP
        addXp(10);
    }    // Start Battle
    drawBattleArena();
}

// AI Personal Tutor chat panel rendering
function renderTutorView(container) {
    container.innerHTML = `
        <div class="tutor-container">
            <!-- Dynamic Socratic Coach Visual Avatar -->
            <div class="coach-avatar-container">
                <div class="coach-avatar-circle analytical" id="coachAvatar">💡</div>
                <div class="coach-avatar-info">
                    <span class="coach-name">Socrates AI Coach</span>
                    <span class="coach-status"><span class="coach-status-dot"></span><span id="coachStatusText">能動対話 待機中</span></span>
                </div>
            </div>

            <div class="tutor-header-bar">
                <div class="tocratic-mode-toggle">
                    <label class="switch">
                        <input type="checkbox" id="socraticToggle" ${isSocraticMode ? 'checked' : ''} onchange="isSocraticMode = this.checked; showToast(isSocraticMode ? 'ソクラテス能動対話が有効' : '通常質問対応モード')">
                        <span class="slider round"></span>
                    </label>
                    <span>💡 ソクラテス能動対話 (思考を引き出す)</span>
                </div>
                
                <button class="btn-premium" onclick="triggerSocraticRecallQuestion()" style="font-size: 0.75rem; padding: 0.35rem 0.8rem; background: var(--accent);">
                    🎯 AIからクイズを受ける
                </button>
            </div>
            
            <div class="chat-history" id="tutorChatHistory">
                <div class="message ai">
                    こんにちは！私はあなたのパーソナルAI家庭教師です。📖<br>
                    資料に関して疑問点や確認したい箇所はありますか？<br>
                    左パネルの文章中の<strong>単語を直接クリック</strong>しても、即座に質問できますよ。<br>
                    また、右上の「AIからクイズを受ける」をクリックすると、能動的にあなたの思考力をテストします。
                </div>
            </div>
            
            <div class="chat-input-area">
                <input type="text" id="tutorChatInput" placeholder="家庭教師に質問を入力してください..." onkeydown="if(event.key === 'Enter') sendTutorMessage()">
                <button onclick="sendTutorMessage()" title="送信"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    
    // Auto-focus chat
    setTimeout(() => {
        const input = document.getElementById('tutorChatInput');
        if (input) input.focus();
    }, 200);
}

// Socrates visual avatar status manager
function updateCoachAvatar(emotion, statusText) {
    const avatar = document.getElementById('coachAvatar');
    const statusTextEl = document.getElementById('coachStatusText');
    if (!avatar) return;
    
    avatar.className = 'coach-avatar-circle';
    avatar.classList.add(emotion);
    
    const emojis = {
        'happy': '😊',
        'proud': '👑',
        'thinking': '🤔',
        'challenging': '🎯',
        'analytical': '💡'
    };
    
    avatar.innerText = emojis[emotion] || '💡';
    if (statusTextEl && statusText) {
        statusTextEl.innerText = statusText;
    }
}

// Socrates Emotion Parser
function parseCoachEmotion(text) {
    let emotion = 'analytical';
    let cleanText = text;
    
    const emotions = {
        'HAPPY': 'happy',
        'PROUD': 'proud',
        'THINKING': 'thinking',
        'CHALLENGING': 'challenging',
        'ANALYTICAL': 'analytical'
    };
    
    for (let key in emotions) {
        if (text.includes(`[${key}]`)) {
            emotion = emotions[key];
            cleanText = cleanText.replace(`[${key}]`, '');
            break;
        }
    }
    return { emotion, cleanText };
}

// Ask Tutor About Interactive Text Clicked
window.askTutorAbout = (term) => {
    activeView = 'tutor';
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    const sideItem = document.querySelector(`.sidebar-item[data-view="tutor"]`);
    if (sideItem) sideItem.classList.add('active');
    renderView();
    
    addXp(5); // Mini XP reading bonus
    
    setTimeout(() => {
        const input = document.getElementById('tutorChatInput');
        if (input) {
            input.value = `「${term}」について分かりやすく解説してください。`;
            sendTutorMessage();
        }
    }, 150);
};

// Socratic Active Recall questioning initiated by the AI Coach
window.triggerSocraticRecallQuestion = async () => {
    const chatHistory = document.getElementById('tutorChatHistory');
    if (!chatHistory) return;
    
    // Set Thinking Avatar state
    updateCoachAvatar('thinking', 'クイズを思考中...');
    
    const loadingMsg = document.createElement('div');
    loadingMsg.className = "message ai";
    loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> AIが能動理解クイズを構築しています...`;
    chatHistory.appendChild(loadingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    let targetConcept = "資料の核心概念";
    if (currentData && currentData.flashcards && currentData.flashcards.length > 0) {
        const rand = currentData.flashcards[Math.floor(Math.random() * currentData.flashcards.length)];
        targetConcept = rand.front;
    }
    
    const socraticPrompt = `
        You are a highly interactive SOCRATIC LEARNING COACH (named Socrates).
        Always prefix your output with an emotional tag matching your tone: [CHALLENGING].
        Based on the loaded textbook materials, present a deep-thinking, application-oriented active recall question for the student regarding: "${targetConcept}".
        
        Guidelines:
        - Do not provide multiple choice. Ask an open-ended question.
        - Ask the student to explain the mechanism, relationship, or purpose of "${targetConcept}" in their own words.
        - Japanese language.
    `;
    
    try {
        let response;
        const activeModel = geminiModel || "gemini-3.5-flash";
        
        if (geminiApiKey) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: socraticPrompt }] }],
                    generationConfig: { temperature: 0.7 }
                })
            });
        } else {
            const licenseKey = localStorage.getItem('studyflow_license_key') || '';
            response = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-License-Key': licenseKey,
                    'X-App-Id': 'studyflow'
                },
                body: JSON.stringify({
                    model: activeModel,
                    contents: [{ parts: [{ text: socraticPrompt }] }]
                })
            });
        }
        
        if (response.status === 429) {
            alert("無料プランのAPI利用上限（1日3回）に達しました。悪用防止のため、サーバー側で制限を行っています。プレミアムライセンスキーを入力するか、しばらく時間をおいてから再度お試しください。");
        }
        
        if (!response.ok) throw new Error("API Failure");
        
        const resData = await response.json();
        const questionText = resData.candidates[0].content.parts[0].text;
        
        loadingMsg.remove();
        
        const { emotion, cleanText } = parseCoachEmotion(questionText);
        updateCoachAvatar('challenging', '能動問題を出題中');
        
        // Append visual question node with TTS natural voice support and citations
        chatHistory.innerHTML += `
            <div class="message ai">
                <strong>🎯 AI能動アクティブ・リコール・テスト:</strong><br>
                ${parseCitations(cleanText.replace(/\n/g, '<br>'))}
                <button class="audio-tts-btn" onclick="playTts(this.parentElement.innerText)" title="このクイズを音声で聴く">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        window.lastActiveRecallConcept = targetConcept;
        window.lastActiveRecallQuestion = cleanText;
        
    } catch (err) {
        loadingMsg.remove();
        
        // Local Active Recall Fallback
        const localQuizzes = [
            `「${targetConcept}」について、あなたの言葉で説明していただけますか？その意義や重要性を含めて教えてください。`,
            `「${targetConcept}」とは具体的にどのような概念でしょうか？例を挙げて説明してみてください。`,
            `「${targetConcept}」が必要とされる背景や、関連する用語との違いについて説明してください。`
        ];
        const localQuiz = localQuizzes[Math.floor(Math.random() * localQuizzes.length)];
        
        updateCoachAvatar('challenging', '能動問題を出題中');
        chatHistory.innerHTML += `
            <div class="message ai">
                <strong>🎯 能動アクティブ・リコール・テスト (ローカルモード):</strong><br>
                ${localQuiz}
                <button class="audio-tts-btn" onclick="playTts(this.parentElement.innerText)" title="このクイズを音声で聴く">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        window.lastActiveRecallConcept = targetConcept;
        window.lastActiveRecallQuestion = localQuiz;
    }
};

// Send message to Socratic AI Coach
window.sendTutorMessage = async () => {
    const input = document.getElementById('tutorChatInput');
    const chatHistory = document.getElementById('tutorChatHistory');
    if (!input || !chatHistory || !input.value.trim()) return;
    
    const userMsgText = input.value.trim();
    input.value = "";
    
    // Set Thinking Avatar state
    updateCoachAvatar('thinking', '回答を思考中...');
    
    // Append User Message bubble
    chatHistory.innerHTML += `
        <div class="message user">
            ${userMsgText}
        </div>
    `;
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // Append AI Typing placeholder
    const typingPlaceholder = document.createElement('div');
    typingPlaceholder.className = "message ai";
    typingPlaceholder.innerHTML = `<i class="fas fa-spinner fa-spin"></i> AI回答作成中...`;
    chatHistory.appendChild(typingPlaceholder);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // Build context-aware prompt with emotional directives
    let systemRole = "You are a professional academic tutor named Socrates explaining concepts in Japanese. Always prefix your response with exactly one emotional tag matching your tone: [HAPPY] (praising reasoning), [PROUD] (concept master), [THINKING] (posing follow-up questions), [CHALLENGING] (active recall quiz), or [ANALYTICAL] (explaining definitions). Example: '[HAPPY] 素晴らしい洞察力です！'";
    if (isSocraticMode) {
        systemRole += " Always apply the Socratic method: guide the student with follow-up clues, ask them to explain logical steps, and never give direct definitions immediately unless requested. Praise good logical reasoning.";
    }
    
    let userPrompt = userMsgText;
    
    // If evaluating previous Active Recall Question
    if (window.lastActiveRecallConcept && window.lastActiveRecallQuestion) {
        userPrompt = `
            Evaluate the student's answer to your previous Socratic query:
            --- Question: ${window.lastActiveRecallQuestion}
            --- Concept Target: ${window.lastActiveRecallConcept}
            --- Student's Answer: ${userMsgText}
            
            Tasks:
            1. Evaluate accuracy on a scale of 0 to 100.
            2. If it scores above 75, prefix your response with [PROUD] and clearly state "+30 XPを獲得しました！". If below, prefix with [THINKING] and give supportive guides and clues.
            3. Japanese language.
        `;
    }
    const relevantContext = getRelevantContext(fullDocumentText, userMsgText, window.lastActiveRecallConcept);
    
    try {
        let response;
        const activeModel = geminiModel || "gemini-3.5-flash";
        
        if (geminiApiKey) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemRole}\n\nContext:\n${relevantContext}\n\nQuery:\n${userPrompt}` }] }],
                    generationConfig: { temperature: 0.6 }
                })
            });
        } else {
            const licenseKey = localStorage.getItem('studyflow_license_key') || '';
            response = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-License-Key': licenseKey,
                    'X-App-Id': 'studyflow'
                },
                body: JSON.stringify({
                    model: activeModel,
                    contents: [{ parts: [{ text: `${systemRole}\n\nContext:\n${relevantContext}\n\nQuery:\n${userPrompt}` }] }]
                })
            });
        }
        
        if (response.status === 429) {
            alert("無料プランのAPI利用上限（1日3回）に達しました。悪用防止のため、サーバー側で制限を行っています。プレミアムライセンスキーを入力するか、しばらく時間をおいてから再度お試しください。");
        }
        
        if (!response.ok) throw new Error("API Failure");
        
        const resData = await response.json();
        const aiResponseText = resData.candidates[0].content.parts[0].text;
        
        typingPlaceholder.remove();
        
        // Parse visual emotion tags & citations
        const { emotion, cleanText } = parseCoachEmotion(aiResponseText);
        
        const statusMap = {
            'happy': '論理思考を称賛中',
            'proud': '概念マスター認定！',
            'thinking': '追加質問を検討中',
            'challenging': '応用クイズを出題中',
            'analytical': '厳密な資料解説中'
        };
        updateCoachAvatar(emotion, statusMap[emotion] || '能動対話中');
        
        // Append AI response node with natural TTS voice trigger and citations
        chatHistory.innerHTML += `
            <div class="message ai">
                ${parseCitations(cleanText.replace(/\n/g, '<br>'))}
                <button class="audio-tts-btn" onclick="playTts(this.parentElement.innerText)" title="この返答を音声で聴く">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Award Socratic active response bonus XP if keyword matches
        if (aiResponseText.includes("XPを獲得")) {
            addXp(30);
            unlockAchievement('trophy_socrates_friend'); // Mini trigger
        } else {
            addXp(10); // Standard chatting XP reward
        }
        
        // Clear active recall context after successful API evaluation
        if (window.lastActiveRecallConcept && window.lastActiveRecallQuestion) {
            window.lastActiveRecallConcept = null;
            window.lastActiveRecallQuestion = null;
        }
        
        // Increment conversation metrics
        tutorChatCount++;
        if (tutorChatCount >= 5) {
            unlockAchievement('trophy_socrates_friend');
        }
        
        // Update Daily Quest milestones
        updateQuestProgress('studyflow_quest_chat_coach');
        
    } catch (err) {
        typingPlaceholder.remove();
        
        // Local Socratic Tutor Fallback
        let replyText = "";
        let replyEmotion = "analytical";
        const conceptMatches = [];
        const queryLower = userMsgText.toLowerCase();
        
        if (currentData && currentData.flashcards) {
            currentData.flashcards.forEach(fc => {
                const front = fc.front.toLowerCase();
                if (queryLower.includes(front) || front.includes(queryLower)) {
                    conceptMatches.push(fc);
                }
            });
        }
        
        if (conceptMatches.length > 0) {
            const match = conceptMatches[0];
            replyEmotion = "happy";
            replyText = `[HAPPY] 「${match.front}」についてですね。資料のデータによると、${match.back} と定義されています。これに関して、さらに深く知りたい点はありますか？`;
        } else {
            const wasAnsweringRecall = (window.lastActiveRecallConcept && window.lastActiveRecallQuestion);
            if (wasAnsweringRecall) {
                if (userMsgText.length > 6) {
                    replyEmotion = "proud";
                    replyText = `[PROUD] 素晴らしい解答です！「${window.lastActiveRecallConcept}」の要点をしっかりと捉えた理解度が見受けられます。+30 XPを獲得しました！`;
                } else {
                    replyEmotion = "thinking";
                    replyText = `[THINKING] なるほど。もう少し詳しく説明できますか？例えば、その言葉が使われる具体的な目的や定義について教えてください。`;
                }
                window.lastActiveRecallConcept = null;
                window.lastActiveRecallQuestion = null;
            } else {
                replyEmotion = "thinking";
                if (currentData && currentData.flashcards && currentData.flashcards.length > 0) {
                    const randomFc = currentData.flashcards[Math.floor(Math.random() * currentData.flashcards.length)];
                    replyText = `[THINKING] ローカルAIアシスタントとしてお答えします。資料内のトピック「${randomFc.front}」について、あなたの言葉で説明してみていただけますか？`;
                } else {
                    replyText = `[THINKING] 読み込まれた学習データがありません。テキストをペーストするかファイルをアップロードして学習を始めてみましょう。`;
                }
            }
        }
        
        const { emotion, cleanText } = parseCoachEmotion(replyText);
        const statusMap = {
            'happy': '論理思考を称賛中',
            'proud': '概念マスター認定！',
            'thinking': '追加質問を検討中',
            'challenging': '応用クイズを出題中',
            'analytical': '厳密な資料解説中'
        };
        updateCoachAvatar(emotion, statusMap[emotion] || '能動対話中');
        
        chatHistory.innerHTML += `
            <div class="message ai">
                ${parseCitations(cleanText.replace(/\n/g, '<br>'))}
                <button class="audio-tts-btn" onclick="playTts(this.parentElement.innerText)" title="この返答を音声で聴く">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        if (replyText.includes("XPを獲得")) {
            addXp(30);
            unlockAchievement('trophy_socrates_friend');
        } else {
            addXp(10);
        }
        
        tutorChatCount++;
        if (tutorChatCount >= 5) {
            unlockAchievement('trophy_socrates_friend');
        }
        updateQuestProgress('studyflow_quest_chat_coach');
    }
};

// --- UPLOAD HANDLER ---
async function handleUpload(file) {
    if (!file) return;
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    else {
        showToast('解析しています...', 'info');
    }
    
    try {
        let text = "";
        let fileName = file.name || "不明なファイル";
        
        if (file.isDemo) {
            text = file.text;
        } else if (file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
            text = await readPdf(file);
        } else {
            // Read as text (Markdown, TXT)
            text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file, 'UTF-8');
            });
        }
        
        if (!text || !text.trim()) {
            throw new Error("ファイルのコンテンツまたはテキストを解析できませんでした。");
        }
        
        fullDocumentText = text;
        sourceFiles.push({ name: fileName, text: text });
        
        // Process content with AI or local fallback
        try {
            await callGeminiAPI(fullDocumentText, fileName);
            showToast('AIによる解析が完了しました！', 'success');
        } catch (apiErr) {
            console.warn("API Error, falling back to local parsing:", apiErr);
            processContent(fullDocumentText, fileName);
            showToast('オフラインモードで解析しました。', 'info');
        }
        
        finalizeUpload();
        addXp(40); // Gamification reward for uploading a file
        
    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}
function setupModalDropZone() {
    if (modalDropZoneBound) return;
    
    const mDropZone = document.getElementById('modalDropZone');
    const mFileInput = document.getElementById('modalFileInput');
    
    if (mDropZone && mFileInput) {
        mDropZone.onclick = () => mFileInput.click();
        mFileInput.onchange = (e) => {
            if (e.target.files[0]) {
                const modal = document.getElementById('importModal');
                if (modal) modal.style.display = 'none';
                handleUpload(e.target.files[0]);
            }
        };
        
        mDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            mDropZone.style.borderColor = '#4285f4';
            mDropZone.style.background = 'rgba(66, 133, 244, 0.05)';
        });
        
        mDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            mDropZone.style.borderColor = 'var(--glass-border)';
            mDropZone.style.background = 'rgba(255, 255, 255, 0.01)';
        });
        
        mDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            mDropZone.style.borderColor = 'var(--glass-border)';
            mDropZone.style.background = 'rgba(255, 255, 255, 0.01)';
            if (e.dataTransfer.files[0]) {
                const modal = document.getElementById('importModal');
                if (modal) modal.style.display = 'none';
                handleUpload(e.dataTransfer.files[0]);
            }
        });
        
        modalDropZoneBound = true;
    }
}

// --- LISTENERS ---
if (dropZone) dropZone.onclick = () => fileInput.click();
if (fileInput) fileInput.onchange = (e) => { if (e.target.files[0]) handleUpload(e.target.files[0]); };

window.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
window.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
window.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); });

const dBtn = document.getElementById('demoBtn');
if (dBtn) dBtn.onclick = () => {
    // Generate beautiful demographic textbook material mock
    const mockFile = {
        name: "人工知能の基礎と能動的学習法.md",
        isDemo: true,
        text: `
# 人工知能の基本概念と能動的学習法

## 1. 人工知能(AI)と機械学習
**人工知能(AI)**とは、人間の知的な振る舞いをコンピュータシステム上で模倣する技術の総称です。その中核手法である**機械学習**は、大量のデータからパターンや規則性をコンピュータが自動的に学習し、新しい予測や意思決定を行うモデルを構築するプロセスを指します。

## 2. 能動的学習（アクティブリコール）
学習効率を劇的に向上させるための認知心理学的アプローチに**アクティブリコール**があります。これは、単にテキストを再読する受動的インプットとは対照的に、自分の記憶から概念や語句を能動的に「思い出す」作業（検索練習）を繰り返す学習法です。

## 3. ソクラテス式対話法
古代ギリシャの哲学者ソクラテスに由来する**ソクラテス式対話法**は、一方的な知識の伝達ではなく、「適切な問いかけ」を行うことで学習者自身の論理的思考力と問題解決力を引き出す能動対話法です。
        `
    };
    handleUpload(mockFile);
};

const nbBtn = document.getElementById('notebookImportBtn');
if (nbBtn) nbBtn.onclick = () => {
    // Simulate NotebookLM ingestion
    showToast('NotebookLMとのスマート同期を開始しています...');
    setTimeout(() => {
        const mockFile = {
            name: "NotebookLM_SmartSync_Data.md",
            isDemo: true,
            text: `
# NotebookLM 連携プロジェクトソース

## 第1節: クラウドコンピューティングの進化
**クラウドコンピューティング**は、オンプレミスのサーバー調達モデルから、柔軟なスケーラビリティを持つ従量課金制リソースへの移行を可能にしました。これにより、初期のIT投資コストが劇的に削減されました。

## 第2節: SaaSビジネスとチャーンレート
SaaS企業の持続可能性を示す最重要評価基準の一つが**チャーンレート（顧客解約率）**です。これには契約社数ベースの「ロゴチャーン」と、金額ベースの「ネットレベニューチャーン」が存在し、実数値 ARR の健全性を測定する鍵となります。
            `
        };
        handleUpload(mockFile);
    }, 1200);
};

// --- STUDYFLOW 2.0 ADVANCED GAMIFICATION SYSTEMS ---

// 1. Daily Quests System
function initDailyQuests() {
    let today = new Date().toDateString();
    let stored = localStorage.getItem('studyflow_daily_quests');
    let savedDate = localStorage.getItem('studyflow_quests_date');
    
    if (!stored || savedDate !== today) {
        const questTemplates = [
            { id: 'studyflow_quest_master_cards', text: '暗記カードを3枚覚える', type: 'master_cards', target: 3, progress: 0, completed: false, xp: 50 },
            { id: 'studyflow_quest_chat_coach', text: 'AIコーチと3回以上能動対話する', type: 'chat_coach', target: 3, progress: 0, completed: false, xp: 50 },
            { id: 'studyflow_quest_submit_exam', text: '模擬試験を1回以上提出する', type: 'submit_exam', target: 1, progress: 0, completed: false, xp: 50 },
            { id: 'studyflow_quest_active_recall', text: 'アクティブにコンテキストを構成する', type: 'active_recall', target: 1, progress: 0, completed: false, xp: 50 }
        ];
        
        // Pick 3 random quests
        const shuffled = questTemplates.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        localStorage.setItem('studyflow_daily_quests', JSON.stringify(selected));
        localStorage.setItem('studyflow_quests_date', today);
        stored = JSON.stringify(selected);
    }
    
    renderQuestsPanel();
}

function renderQuestsPanel() {
    const questsPanel = document.getElementById('questsPanel');
    if (!questsPanel) return;
    
    const quests = JSON.parse(localStorage.getItem('studyflow_daily_quests') || '[]');
    
    if (quests.length === 0) {
        questsPanel.innerHTML = '<div style="font-size:0.75rem; color:var(--text-dim); text-align:center;">本日のクエスト完了！🎉</div>';
        return;
    }
    
    questsPanel.innerHTML = quests.map(q => `
        <div class="quest-item-row ${q.completed ? 'completed' : ''}">
            <div class="quest-checkbox-icon">
                <i class="${q.completed ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
            </div>
            <div class="quest-text">
                ${q.text} (${q.progress}/${q.target})
            </div>
            <div class="quest-xp-reward">
                +${q.xp} XP
            </div>
        </div>
    `).join('');
}

window.updateQuestProgress = (type, count = 1) => {
    const quests = JSON.parse(localStorage.getItem('studyflow_daily_quests') || '[]');
    let changed = false;
    
    quests.forEach(q => {
        if (q.id === type && !q.completed) {
            q.progress = Math.min(q.target, q.progress + count);
            if (q.progress >= q.target) {
                q.completed = true;
                addXp(q.xp);
                triggerQuestConfetti();
                showToast(`デイリークエスト達成！ +${q.xp} XP 獲得！`, 'success');
            }
            changed = true;
        }
    });
    
    if (changed) {
        localStorage.setItem('studyflow_daily_quests', JSON.stringify(quests));
        renderQuestsPanel();
        
        const completedCount = quests.filter(q => q.completed).length;
        if (completedCount >= 3) {
            unlockAchievement('trophy_master_10');
        }
    }
};

function triggerQuestConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
        });
    } else {
        showToast('🎉 CONGRATULATIONS! 🎉');
    }
}

// 2. Scholar Achievement / Trophies
const ACHIEVEMENT_LIST = [
    { id: 'trophy_first_doc', title: '初歩の学者', desc: '最初の資料のAI解析に成功', icon: '👑' },
    { id: 'trophy_master_10', title: '暗記マスター', desc: 'すべての本日のデイリークエを制覇', icon: '⚡' },
    { id: 'trophy_exam_ace', title: '試験のエース', desc: '模擬試験で85%以上を獲得', icon: '🎯' },
    { id: 'trophy_socrates_friend', title: 'ソクラテスの友', desc: 'AIコーチと5回以上対話する', icon: '💡' }
];

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    const unlocked = JSON.parse(localStorage.getItem('studyflow_unlocked_trophies') || '[]');
    
    grid.innerHTML = ACHIEVEMENT_LIST.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `
            <div class="trophy-card ${isUnlocked ? 'unlocked' : ''}" title="${ach.desc}">
                <div class="trophy-icon">${ach.icon}</div>
                <div class="trophy-title">${ach.title}</div>
                <div class="trophy-desc">${ach.desc}</div>
            </div>
        `;
    }).join('');
}

window.unlockAchievement = (id) => {
    let unlocked = JSON.parse(localStorage.getItem('studyflow_unlocked_trophies') || '[]');
    if (unlocked.includes(id)) return;
    
    unlocked.push(id);
    localStorage.setItem('studyflow_unlocked_trophies', JSON.stringify(unlocked));
    
    addXp(100); // 100 XP large trophy reward!
    renderAchievements();
    triggerQuestConfetti();
    
    const ach = ACHIEVEMENT_LIST.find(a => a.id === id);
    if (ach) {
        showToast(`🏆 勲章アンロック: 「${ach.title}」を獲得しました！ (+100 XP)`, 'success');
    }
};

// 3. Exam Weakness Diagnosis & Personal Review Card
function logWeaknessFromExam(incorrectIndices) {
    if (!currentData || !currentData.exam || incorrectIndices.length === 0) return;
    
    let currentWeaknesses = JSON.parse(localStorage.getItem('studyflow_weaknesses') || '[]');
    
    incorrectIndices.forEach(idx => {
        const questionObj = currentData.exam[idx];
        let concept = "重要概念";
        const quoteMatch = questionObj.question.match(/「([^」]+)」/);
        const englishQuoteMatch = questionObj.question.match(/"([^"]+)"/);
        
        if (quoteMatch) {
            concept = quoteMatch[1];
        } else if (englishQuoteMatch) {
            concept = englishQuoteMatch[1];
        } else {
            const parts = questionObj.question.split(/[は|が|の|に|を]/);
            if (parts.length > 1) {
                concept = parts[1].substring(0, 12);
            } else {
                concept = questionObj.question.substring(0, 10);
            }
        }
        
        if (!currentWeaknesses.includes(concept)) {
            currentWeaknesses.push(concept);
        }
    });
    
    if (currentWeaknesses.length > 4) {
        currentWeaknesses = currentWeaknesses.slice(-4);
    }
    
    localStorage.setItem('studyflow_weaknesses', JSON.stringify(currentWeaknesses));
    renderWeaknessDiagnosis();
}

function renderWeaknessDiagnosis() {
    const readinessEl = document.getElementById('readinessMeterContainer');
    if (!readinessEl) return;
    
    const weaknesses = JSON.parse(localStorage.getItem('studyflow_weaknesses') || '[]');
    
    const legacy = document.getElementById('weaknessWidget');
    if (legacy) legacy.remove();
    
    if (weaknesses.length === 0) return;
    
    const widget = document.createElement('div');
    widget.id = 'weaknessWidget';
    widget.className = 'weakness-card';
    widget.innerHTML = `
        <div class="weakness-title">
            <i class="fas fa-heartbeat"></i> 弱点診断パーソナルカルテ
        </div>
        <ul class="weakness-list">
            ${weaknesses.map(w => `
                <li class="weakness-item">
                    <span>💡 ${w}</span>
                    <span class="weakness-action-badge" onclick="askTutorAbout('${w}')">
                        AIコーチと特訓
                    </span>
                </li>
            `).join('')}
        </ul>
    `;
    
    readinessEl.parentNode.insertBefore(widget, readinessEl);
}

// Hook card mastered click to daily quest update
const originalToggleCardMastery = window.toggleCardMastery;
window.toggleCardMastery = (term, event) => {
    if (typeof originalToggleCardMastery === 'function') {
        originalToggleCardMastery(term, event);
    }
    updateQuestProgress('studyflow_quest_master_cards');
};

// Bind Sidebar Item Clicks
document.querySelectorAll('.sidebar-item').forEach(it => {
    it.onclick = () => {
        if (it.id === 'exportBtn') return; // Bypass if export
        if (!it.dataset.view) return;
        
        document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
        it.classList.add('active');
        
        activeView = it.dataset.view;
        renderView();
    };
});

// --- USER AUTHENTICATION & SYNC GATEWAY ---
let authMode = 'login';

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

function switchAuthTab(mode) {
    authMode = mode;
    const tabLogin = document.getElementById('authTabBtnLogin');
    const tabRegister = document.getElementById('authTabBtnRegister');
    const modalTitle = document.getElementById('authModalTitle');
    const submitText = document.getElementById('authSubmitText');
    
    if (mode === 'login') {
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
        if (modalTitle) modalTitle.innerText = 'ログイン';
        if (submitText) submitText.innerText = 'ログイン';
    } else {
        if (tabLogin) tabLogin.classList.remove('active');
        if (tabRegister) tabRegister.classList.add('active');
        if (modalTitle) modalTitle.innerText = '新規ユーザー登録';
        if (submitText) submitText.innerText = '新規登録';
    }
}

async function submitAuthForm() {
    const usernameEl = document.getElementById('authUsername');
    const passwordEl = document.getElementById('authPassword');
    if (!usernameEl || !passwordEl) return;
    
    const username = usernameEl.value.trim();
    const password = passwordEl.value;
    if (!username || !password) {
        showToast('ユーザー名とパスワードを入力してください。', 'error');
        return;
    }
    
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
        const res = await fetch(`${backendApiUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            localStorage.setItem('studyflow_auth_token', data.token);
            localStorage.setItem('studyflow_auth_username', data.username);
            showToast(authMode === 'login' ? 'ログインしました！' : '新規登録が完了しました！', 'success');
            usernameEl.value = '';
            passwordEl.value = '';
            
            updateAuthUI();
            await syncUserDataFromServer();
            closeAuthModal();
        } else {
            showToast(data.message || '認証に失敗しました。', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('サーバーに接続できません。', 'error');
    }
}

function updateAuthUI() {
    const token = localStorage.getItem('studyflow_auth_token');
    const username = localStorage.getItem('studyflow_auth_username');
    const headerBtn = document.getElementById('headerAuthBtn');
    const formContainer = document.getElementById('authFormContainer');
    const statusContainer = document.getElementById('authStatusContainer');
    const statusUser = document.getElementById('authStatusUsername');
    const statusSync = document.getElementById('authStatusLastSync');
    
    if (token && username) {
        if (headerBtn) {
            headerBtn.innerHTML = `<i class="fas fa-user-circle"></i> <span>${username}</span>`;
            headerBtn.style.background = 'rgba(168, 85, 247, 0.3)';
        }
        if (formContainer) formContainer.style.display = 'none';
        if (statusContainer) statusContainer.style.display = 'block';
        if (statusUser) statusUser.innerText = username;
        
        const lastSync = localStorage.getItem('studyflow_last_sync_time');
        if (statusSync) statusSync.innerText = lastSync ? lastSync : '未同期';
    } else {
        if (headerBtn) {
            headerBtn.innerHTML = `<i class="fas fa-user-circle"></i> <span data-i18n="auth-btn-login">ログイン / 登録</span>`;
            headerBtn.style.background = 'rgba(168, 85, 247, 0.15)';
        }
        if (formContainer) formContainer.style.display = 'block';
        if (statusContainer) statusContainer.style.display = 'none';
    }
}

async function syncUserDataFromServer() {
    const token = localStorage.getItem('studyflow_auth_token');
    const username = localStorage.getItem('studyflow_auth_username');
    if (!token || !username) return;
    
    const clientData = {
        studyflow_xp: localStorage.getItem('studyflow_xp') || '50',
        studyflow_streak: localStorage.getItem('studyflow_streak') || '3',
        studyflow_quests_date: localStorage.getItem('studyflow_quests_date') || '',
        studyflow_daily_quests: JSON.parse(localStorage.getItem('studyflow_daily_quests') || '[]'),
        studyflow_mastered_cards: JSON.parse(localStorage.getItem('studyflow_mastered_cards') || '[]'),
        studyflow_unlocked_trophies: JSON.parse(localStorage.getItem('studyflow_unlocked_trophies') || '[]'),
        studyflow_weaknesses: JSON.parse(localStorage.getItem('studyflow_weaknesses') || '[]'),
        studyflow_projects: JSON.parse(localStorage.getItem('studyflow_projects') || '[]'),
        studyflow_active_project_id: localStorage.getItem('studyflow_active_project_id') || ''
    };
    
    try {
        const res = await fetch(`${backendApiUrl}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, token, data: clientData })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            const serverData = result.data;
            if (serverData) {
                if (serverData.studyflow_xp !== undefined) {
                    userXp = parseInt(serverData.studyflow_xp);
                    localStorage.setItem('studyflow_xp', userXp.toString());
                }
                if (serverData.studyflow_streak !== undefined) {
                    userStreak = parseInt(serverData.studyflow_streak);
                    localStorage.setItem('studyflow_streak', userStreak.toString());
                }
                if (serverData.studyflow_quests_date !== undefined) {
                    localStorage.setItem('studyflow_quests_date', serverData.studyflow_quests_date);
                }
                if (serverData.studyflow_daily_quests !== undefined) {
                    localStorage.setItem('studyflow_daily_quests', JSON.stringify(serverData.studyflow_daily_quests));
                }
                if (serverData.studyflow_mastered_cards !== undefined) {
                    localStorage.setItem('studyflow_mastered_cards', JSON.stringify(serverData.studyflow_mastered_cards));
                }
                if (serverData.studyflow_unlocked_trophies !== undefined) {
                    localStorage.setItem('studyflow_unlocked_trophies', JSON.stringify(serverData.studyflow_unlocked_trophies));
                }
                if (serverData.studyflow_weaknesses !== undefined) {
                    localStorage.setItem('studyflow_weaknesses', JSON.stringify(serverData.studyflow_weaknesses));
                }
                if (serverData.studyflow_projects !== undefined) {
                    localStorage.setItem('studyflow_projects', JSON.stringify(serverData.studyflow_projects));
                }
                if (serverData.studyflow_active_project_id !== undefined) {
                    const oldActiveId = localStorage.getItem('studyflow_active_project_id');
                    const newActiveId = serverData.studyflow_active_project_id;
                    if (newActiveId !== oldActiveId) {
                        localStorage.setItem('studyflow_active_project_id', newActiveId);
                        if (newActiveId) {
                            loadSession(newActiveId);
                        } else {
                            currentData = null;
                            sourceFiles = [];
                            fullDocumentText = "";
                            renderSessionList();
                            renderView();
                        }
                    }
                }
                
                const syncTimeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                localStorage.setItem('studyflow_last_sync_time', syncTimeStr);
                
                updateGamificationUI();
                renderSessionList();
                initDailyQuests();
                renderAchievements();
                renderWeaknessDiagnosis();
                updateDashboardButtons();
                updateAuthUI();
            }
        } else {
            console.warn("Sync failed:", result.message);
            if (result.message && result.message.includes("有効期限")) {
                handleLogout();
                showToast("セッションが切れたためログアウトしました。", "info");
            }
        }
    } catch (err) {
        console.error("Sync error:", err);
    }
}

async function triggerManualSync() {
    showToast('同期しています...', 'info');
    await syncUserDataFromServer();
    showToast('同期完了しました！', 'success');
}

function handleLogout() {
    localStorage.removeItem('studyflow_auth_token');
    localStorage.removeItem('studyflow_auth_username');
    localStorage.removeItem('studyflow_last_sync_time');
    showToast('ログアウトしました。', 'info');
    updateAuthUI();
}

// Bind auth buttons to global scope
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.submitAuthForm = submitAuthForm;
window.triggerManualSync = triggerManualSync;
window.handleLogout = handleLogout;

window.importNotebookTextDirect = () => {
    const landingPasteArea = document.getElementById('notebookPasteArea');
    let text = "";
    if (landingPasteArea && landingPasteArea.value.trim()) {
        text = landingPasteArea.value.trim();
        landingPasteArea.value = "";
    }
    if (!text) {
        showToast('NotebookLMの要約テキストをペーストしてください。', 'warning');
        return;
    }
    const mockFile = {
        name: "NotebookLM_Summary_Import.md",
        isDemo: true,
        text: text
    };
    handleUpload(mockFile);
};

window.processNotebookImport = () => {
    const modalPasteArea = document.getElementById('modalNotebookPasteArea');
    let text = "";
    if (modalPasteArea && modalPasteArea.value.trim()) {
        text = modalPasteArea.value.trim();
        modalPasteArea.value = "";
    }
    if (!text) {
        showToast('NotebookLMの要約テキストをペーストしてください。', 'warning');
        return;
    }
    const mockFile = {
        name: "NotebookLM_Summary_Import.md",
        isDemo: true,
        text: text
    };
    const modal = document.getElementById('importModal');
    if (modal) modal.style.display = 'none';
    handleUpload(mockFile);
};

window.switchImportTab = (tabId) => {
    document.querySelectorAll('.wizard-tab').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    document.querySelectorAll('.wizard-tab-content').forEach(content => content.style.display = 'none');
    const activeContent = document.getElementById(`wizard-content-${tabId}`);
    if (activeContent) activeContent.style.display = 'block';
};

// Theme Selection & Settings Persistence
window.changeStudyTheme = (themeName) => {
    document.body.classList.remove('cyber-amethyst', 'emerald-forest', 'crimson-dragon', 'arctic-crystal');
    document.body.classList.add(themeName);
    localStorage.setItem('studyflow_ambiance_theme', themeName);
    const selectEl = document.getElementById('studyThemeSelect');
    if (selectEl) selectEl.value = themeName;
    showToast(`集中環境テーマ「${themeName}」を適用しました`, 'success');
};

window.saveSettings = () => {
    const keyEl = document.getElementById('geminiKey');
    const modelEl = document.getElementById('geminiModel');
    const themeEl = document.getElementById('studyThemeSelect');
    
    if (keyEl) {
        geminiApiKey = keyEl.value.trim();
        localStorage.setItem('gemini_api_key', geminiApiKey);
        if (typeof SuiteGatekeeper !== 'undefined' && typeof SuiteGatekeeper.setGeminiKey === 'function') {
            SuiteGatekeeper.setGeminiKey(geminiApiKey);
        }
    }
    
    if (modelEl) {
        geminiModel = modelEl.value;
        localStorage.setItem('studyflow_gemini_model', geminiModel);
    }
    
    if (themeEl) {
        const theme = themeEl.value;
        window.changeStudyTheme(theme);
    }
    
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
    
    showToast('設定を保存しました', 'success');
};
