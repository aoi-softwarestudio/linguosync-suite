import json
import re

def clean_line(line):
    # Strip line numbers like "1200: let text = ...;"
    # Format: optional spaces, digits, colon, optional space
    m = re.match(r'^\s*\d+:\s?(.*)$', line)
    if m:
        return m.group(1)
    return line

def main():
    log_path = r'C:\Users\小島蒼大\.gemini\antigravity\brain\f575ad2f-300b-438b-b406-9b336a8f84ab\.system_generated\logs\transcript.jsonl'
    
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            obj = json.loads(line)
            step = obj.get('step_index')
            if obj.get('type') in ['VIEW_FILE', 'FILE_EDIT']:
                content = obj.get('content', '')
                if 'async function handleUpload' in content and '1190:' in content:
                    print(f"=== Found app.js View in Step {step} ===")
                    lines = content.split('\n')
                    cleaned_lines = []
                    
                    # Let's extract from line 1190 to the end of handleUpload
                    recording = False
                    for l in lines:
                        if '1190:' in l or 'async function handleUpload' in l:
                            recording = True
                        if recording:
                            cleaned_lines.append(clean_line(l))
                            if 'finalizeUpload();' in l or 'addXp(40);' in l:
                                # We keep going until we see the closing brace of try-catch block
                                pass
                            if '1239:' in l or '1240:' in l: # approximately end of handleUpload
                                # Let's capture a bit more
                                pass
                            if '1245:' in l:
                                recording = False
                                break
                    
                    print('\n'.join(cleaned_lines))
                    break

if __name__ == '__main__':
    main()

    const newLevel = Math.floor(userXp / 200) + 1;
    
    updateGamificationUI();
    showToast(`+${amount} XP 獲得しました！`, 'success');
    
    if (newLevel > oldLevel) {
        showToast(`🎉 レベルアップ！ レベル ${newLevel} に到達しました！`, 'success');
        triggerConfettiEffect();
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

"""
        # Reconstruct content
        new_content = content[:handle_upload_start] + clean_handle_upload + content[setup_modal_dropzone_start:]
        
        # Ensure switchImportTab is defaulted to paste-text
        new_content = new_content.replace("switchImportTab('url-sync')", "switchImportTab('paste-text')")
        
        # Also clean up any other corrupted non-ascii text if we had to use errors='replace'
        # Since we might have used utf-8 replace, let's fix other common strings in app.js
        new_content = new_content.replace("͂Ă܂...", "解析しています...")
        new_content = new_content.replace("sȃt@C", "不明なファイル")
        new_content = new_content.replace("t@C̓eA܂͉͂ł܂łB", "ファイルのコンテンツまたはテキストを解析できませんでした。")
        new_content = new_content.replace("AIɂ鎑͂܂I", "AIによる解析が完了しました！")
        new_content = new_content.replace("ItC[hŎ͂܂", "オフラインモードで解析しました。")
        
        # Write out as UTF-8
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully wrote clean app.js in UTF-8")
    else:
        print("Failed to find handles in app.js")

if __name__ == '__main__':
    main()

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
// MISSING LINE 181
// MISSING LINE 182
// MISSING LINE 183
// MISSING LINE 184
// MISSING LINE 185
// MISSING LINE 186
// MISSING LINE 187
// MISSING LINE 188
// MISSING LINE 189
// MISSING LINE 190
// MISSING LINE 191
// MISSING LINE 192
// MISSING LINE 193
// MISSING LINE 194
// MISSING LINE 195
// MISSING LINE 196
// MISSING LINE 197
// MISSING LINE 198
// MISSING LINE 199
// MISSING LINE 200
// MISSING LINE 201
// MISSING LINE 202
// MISSING LINE 203
// MISSING LINE 204
// MISSING LINE 205
// MISSING LINE 206
// MISSING LINE 207
// MISSING LINE 208
// MISSING LINE 209
// MISSING LINE 210
// MISSING LINE 211
// MISSING LINE 212
// MISSING LINE 213
// MISSING LINE 214
// MISSING LINE 215
// MISSING LINE 216
// MISSING LINE 217
// MISSING LINE 218
// MISSING LINE 219
// MISSING LINE 220
// MISSING LINE 221
// MISSING LINE 222
// MISSING LINE 223
// MISSING LINE 224
// MISSING LINE 225
// MISSING LINE 226
// MISSING LINE 227
// MISSING LINE 228
// MISSING LINE 229
// MISSING LINE 230
// MISSING LINE 231
// MISSING LINE 232
// MISSING LINE 233
// MISSING LINE 234
// MISSING LINE 235
// MISSING LINE 236
// MISSING LINE 237
// MISSING LINE 238
// MISSING LINE 239
// MISSING LINE 240
// MISSING LINE 241
// MISSING LINE 242
// MISSING LINE 243
// MISSING LINE 244
// MISSING LINE 245
// MISSING LINE 246
// MISSING LINE 247
// MISSING LINE 248
// MISSING LINE 249
// MISSING LINE 250
// MISSING LINE 251
// MISSING LINE 252
// MISSING LINE 253
// MISSING LINE 254
// MISSING LINE 255
// MISSING LINE 256
        renderPhotos(selectedSpot);
    }
});

// Verification/Reporting Actions
document.getElementById('confirmPresenceBtn').addEventListener('click', () => {
    if (selectedSpot) {
        selectedSpot.verifiedCount = (selectedSpot.verifiedCount || 0) + 1;
    interactiveDocViewer.innerHTML = formattedText;
}

// --- PROJECT / SESSION MANAGEMENT ---
function getSessions() {
    return JSON.parse(localStorage.getItem('studyflow_projects') || '[]');
}

function saveSessions(sessions) {
    localStorage.setItem('studyflow_projects', JSON.stringify(sessions));
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
                </div>

                <!-- Progress Meter -->
                <div id="syncProgressContainer" style="display: none; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 1.2rem; border: 1px solid var(--glass-border); margin-bottom: 1rem; text-align: center;">
                    NotebookLM からエクスポートした Markdown (.md) または Text (.txt)、PDF (.pdf) ファイルを読み込みます。
                </p>
                <div class="upload-card" id="modalDropZone" style="padding: 2.2rem 1rem; border: 2px dashed var(--glass-border); background: rgba(255, 255, 255, 0.01); border-radius: 16px; max-width: 100%;">
                    <div style="font-size: 2.2rem; color: #4285f4; margin-bottom: 0.6rem;">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 0.8rem;">ファイルをここにドラッグ＆ドロップするか、以下から選択</p>
                    <button class="btn-demo" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="document.getElementById('modalFileInput').click()">
                        <i class="fas fa-folder-open"></i> ファイルを選択
                    </button>
                    <input type="file" id="modalFileInput" hidden>
                </div>
            </div>
        </div>
    </div>

    <div id="settingsModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; justify-content:center; align-items:center;">
        <div class="result-card" style="max-width: 500px; width: 90%;">
            <h2 style="margin-bottom: 1.5rem;"><i class="fas fa-cog"></i> 設定</h
}
}

function saveActiveSession() {
    if (!currentData) return;
    
    const sessions = getSessions();
    const activeId = localStorage.getItem('studyflow_active_project_id') || 'proj_' + Date.now();
    localStorage.setItem('studyflow_active_project_id', activeId);
    
    const existingIdx = sessions.findIndex(s => s.id === activeId);
    
    const projectData = {
        id: activeId,
        title: currentData.title || "無題のドキュメント",
        fullDocumentText: fullDocumentText,
        sourceFiles: sourceFiles,
        currentData: currentData,
        date: new Date().toLocaleDateString('ja-JP')
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
        createNewProject();
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
        container.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--text-dim); font-size: 0.75rem;">履歴はありません</div>`;
        return;
    }
    
    const activeId = localStorage.getItem('studyflow_active_project_id');
    
    container.innerHTML = sessions.map(s => `
        <div class="session-item ${s.id === activeId ? 'active' : ''}" onclick="loadSession('${s.id}')">
            <span class="session-title" title="${s.title}">
                <i class="fas fa-file-invoice"></i> ${s.title}
            </span>
            <button class="delete-project-btn" onclick="deleteSession('${s.id}', event)" title="削除" style="border: none; padding: 2px 6px; font-size: 0.7rem;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
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
    
    //
    renderReadinessMeter();
    
    // Save active project in historical registry
    saveActiveSession();
    
    // Switch to active view
    renderView();
}

// MISSING LINE 446
// MISSING LINE 447
// MISSING LINE 448
// MISSING LINE 449
// MISSING LINE 450
// MISSING LINE 451
// MISSING LINE 452
// MISSING LINE 453
// MISSING LINE 454
// MISSING LINE 455
// MISSING LINE 456
// MISSING LINE 457
// MISSING LINE 458
// MISSING LINE 459
// MISSING LINE 460
// MISSING LINE 461
// MISSING LINE 462
// MISSING LINE 463
// MISSING LINE 464
// MISSING LINE 465
// MISSING LINE 466
// MISSING LINE 467
// MISSING LINE 468
// MISSING LINE 469
// MISSING LINE 470
// MISSING LINE 471
// MISSING LINE 472
// MISSING LINE 473
// MISSING LINE 474
// MISSING LINE 475
// MISSING LINE 476
// MISSING LINE 477
// MISSING LINE 478
// MISSING LINE 479
// MISSING LINE 480
// MISSING LINE 481
// MISSING LINE 482
// MISSING LINE 483
// MISSING LINE 484
// MISSING LINE 485
// MISSING LINE 486
// MISSING LINE 487
// MISSING LINE 488
// MISSING LINE 489
// MISSING LINE 490
// MISSING LINE 491
// MISSING LINE 492
// MISSING LINE 493
// MISSING LINE 494
// MISSING LINE 495
// MISSING LINE 496
// MISSING LINE 497
// MISSING LINE 498
// MISSING LINE 499
            </div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">学術理解スコア</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 4px;">模擬試験・カード進捗を総合評価</div>
        </div>
    `;
}

// --- CORE AI GATEWAY CONNECTION ---
async function callGeminiAPI(text, fileName) {
    const prompt = `
        You are given a highly structured, premium academic Summary or Study Guide exported from Google NotebookLM.
        Your mission is to preserve this textbook summary EXACTLY as it is, and purely compile its contents into interactive gaming study assets.

        Integrated NotebookLM textbook:
        ${text.substring(0, 32000)}

        CRITICAL OBJECTIVES:
        1. STRICT VERBATIM SUMMARY FIDELITY: In the output "summary" key, do NOT write a new summary. Instead, output the exact verbatim NotebookLM textbook provided above (converting it into clean HTML structure using appropriate paragraphs, headers, and bullet points, and highlighting key terms inside <strong>...</strong>).
        2. PEDAGOGICAL FLASHCARDS: Extract 10 core academic definitions/terms from the textbook. Create flashcards with high-fidelity, comprehensive pedagogical answers.
        3. MASTERY MOCK EXAM: Create 5 deep-thinking, application-oriented multiple-choice exam questions based on the textbook.
        4. CITATIONS: For every core definition or claim in flashcards, append an inline citation linking to the source filename in the format [Source: ${fileName}] at the end. Example: "SaaSビジネスの指標としてチャーンレートがあります [Source: ${fileName}]".

        OUTPUT SPECIFICATION (JSON ONLY):
        {
            "title": "Google NotebookLM 提携特訓プロジェクト: ${fileName}",
            "summary": "The full verbatim NotebookLM textbook converted to clean structured HTML (div, h3, p, strong tags only). Keep the absolute fidelity of the input textbook.",
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
        response = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: activeModel,
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
    }

    if (!response.ok) throw new Error(`Gateway Error: ${response.status}`);
    const data = await response.json();
    let result = data.candidates[0].content.parts[0].text;
    
    // Parse pure JSON response
    currentData = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
    
    // Unlock "First Document" Achievement
    unlockAchievement('trophy_first_doc');
}

// Fallback dynamic local text parser in case API is offline
function processContent(text, fileName) {
    const blocks = text.split(/\n\s*\n/);
    let summaryHtml = `
        <div class="premium-summary">
            <h3><i class="fas fa-book"></i> 資料マスター要約</h3>
            <p style="color: var(--text-dim); margin-bottom: 1.5rem;">以下のテーマと定義語句が検出されました。クリックして対話を開始できます。</p>
            <ul>
    `;
    
    const flashcards = [];
    const exam = [];
    
    blocks.forEach((block, idx) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;
        
        let title = lines[0].replace(/[#*]/g, '');
        let desc = lines.slice(1).join(' ').replace(/\*/g, '') || "解説が提供されていません。";
        
        if (title.length > 50) title = "重要トピック " + (idx + 1);
        
        summaryHtml += `
            <li style="margin-bottom: 1rem;">
                <strong>${title}</strong>: ${desc}
            </li>
        `;
        
        flashcards.push({ front: title, back: desc });
        exam.push({
            question: `${title}に関する説明として正しいものはどれですか？`,
            options: [
                desc,
                `全く無関係なダミーの誤り選択肢 A`,
                
// MISSING LINE 604
// MISSING LINE 605
// MISSING LINE 606
// MISSING LINE 607
// MISSING LINE 608
    
    summaryHtml += `</ul></div>`;
    
    currentData = {
        title: `統合ローカル解析セット: ${fileName}`,
        summary: summaryHtml,
        flashcards: flashcards,
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
    
    viewTitleEl.innerText = currentData.title;
    
    if (activeView === 'summary') {
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-layer-group"></i> 総合マスター要約・ポイント
                </h3>
                <button class="audio-tts-btn" onclick="playTts(currentData.summary)" title="要約を音声で聴く">
                    <i class="fas fa-volume-up"></i> 音声を再生
                </button>
            </div>
            <div class="summary-grid" style="font-size: 0.95rem; line-height: 1.6;">
                ${parseCitations(currentData.summary)}
            </div>
        `;
    } else if (activeView === 'flashcards') {
        renderFlashcardsView(container);
    } else if (activeView === 'exam') {
        renderExamView(container);
    } else if (activ
// MISSING LINE 681
// MISSING LINE 682
// MISSING LINE 683
// MISSING LINE 684
// MISSING LINE 685
// MISSING LINE 686
// MISSING LINE 687
// MISSING LINE 688
// MISSING LINE 689
// MISSING LINE 690
// MISSING LINE 691
// MISSING LINE 692
// MISSING LINE 693
// MISSING LINE 694
// MISSING LINE 695
// MISSING LINE 696
// MISSING LINE 697
// MISSING LINE 698
// MISSING LINE 699
// MISSING LINE 700
// MISSING LINE 701
// MISSING LINE 702
// MISSING LINE 703
// MISSING LINE 704
// MISSING LINE 705
// MISSING LINE 706
// MISSING LINE 707
// MISSING LINE 708
// MISSING LINE 709
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
    let score = 0;
    let answeredCount = 0;
    let selectedAnswers = new Array(currentData.exam.length).fill(null);
    let secondsLeft = currentData.exam.length * 60; // 1 min per question
    
    container.innerHTML = `
        <div class="score-header">
            <div class="exam-status">
                <span class="timer" id="examTimer"><i class="fas fa-clock"></i> 制限時間: --:--</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="examProgress" style="width: 0%;"></div>
                </div>
                <button class="btn-premium" onclick="submitExam()" style="padding: 0.4rem 1rem; font-size: 0.8rem;">提出する</button>
            </div>
        </div>
        <div id="examQuestions" style="flex: 1; padding: 10px 0;">
            ${currentData.exam.map((q, qi) => `
                <div class="question-item" id="q_box_${qi}">
                    <h4>Q${qi + 1}. ${q.question}</h4>
                    <div>
                        ${q.options.map((opt, oi) => `
                            <div class="option" id="opt_${qi}_${oi}" onclick="selectAnswer(${qi}, ${oi})">
                                [${String.fromCharCode(65 + oi)}] ${opt}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Trigger exam clock countdown
    function updateClock() {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        const timerEl = document.getElementById('examTimer');
        if (timerEl) {
            timerEl.innerHTML = `<i class="fas fa-clock"></i> 制限時間: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        if (secondsLeft <= 0) {
            clearInterval(examInterval);
            submitExam();
        }
        secondsLeft--;
    }
    
    updateClock();
    examInterval = setInterval(updateClock, 1000);
    
    // Closure-based select helper
    window.selectAnswer = (qi, oi) => {
        // Deselect previous
        for (let i = 0; i < 4; i++) {
            const optEl = document.getElementById(`opt_${qi}_${i}`);
            if (optEl) optEl.classList.remove('selected');
        }
        
        const selectedEl = document.getElementById(`opt_${qi}_${oi}`);
        if (selectedEl) selectedEl.classList.add('selected');
        
        selectedAnswers[qi] = oi;
        
        // Progress bar updates
        answeredCount = selectedAnswers.filter(a => a !== null).length;
        const percent = (answeredCount / currentData.exam.length) * 100;
        const progressEl = document.getElementById('examProgress');
        if (progressEl) progressEl
        }
    };
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
                        <input type="checkbox" id="socraticToggle" ${isSocraticMode ? 'checked' : ''} onchange="isSocraticMode = this.checked; showToast(is
// MISSING LINE 827
// MISSING LINE 828
// MISSING LINE 829
// MISSING LINE 830
// MISSING LINE 831
// MISSING LINE 832
// MISSING LINE 833
// MISSING LINE 834
// MISSING LINE 835
// MISSING LINE 836
// MISSING LINE 837
// MISSING LINE 838
// MISSING LINE 839
// MISSING LINE 840
// MISSING LINE 841
// MISSING LINE 842
// MISSING LINE 843
// MISSING LINE 844
// MISSING LINE 845
// MISSING LINE 846
// MISSING LINE 847
// MISSING LINE 848
// MISSING LINE 849
// MISSING LINE 850
// MISSING LINE 851
// MISSING LINE 852
// MISSING LINE 853
// MISSING LINE 854
// MISSING LINE 855
// MISSING LINE 856
// MISSING LINE 857
// MISSING LINE 858
// MISSING LINE 859
// MISSING LINE 860
// MISSING LINE 861
// MISSING LINE 862
// MISSING LINE 863
// MISSING LINE 864
// MISSING LINE 865
// MISSING LINE 866
// MISSING LINE 867
// MISSING LINE 868
// MISSING LINE 869
// MISSING LINE 870
// MISSING LINE 871
// MISSING LINE 872
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
// MISSING LINE 951
// MISSING LINE 952
// MISSING LINE 953
// MISSING LINE 954
// MISSING LINE 955
// MISSING LINE 956
// MISSING LINE 957
// MISSING LINE 958
// MISSING LINE 959
// MISSING LINE 960
// MISSING LINE 961
// MISSING LINE 962
// MISSING LINE 963
// MISSING LINE 964
// MISSING LINE 965
// MISSING LINE 966
// MISSING LINE 967
// MISSING LINE 968
// MISSING LINE 969
// MISSING LINE 970
// MISSING LINE 971
// MISSING LINE 972
// MISSING LINE 973
// MISSING LINE 974
// MISSING LINE 975
// MISSING LINE 976
// MISSING LINE 977
// MISSING LINE 978
// MISSING LINE 979
// MISSING LINE 980
// MISSING LINE 981
// MISSING LINE 982
// MISSING LINE 983
// MISSING LINE 984
// MISSING LINE 985
// MISSING LINE 986
// MISSING LINE 987
// MISSING LINE 988
// MISSING LINE 989
// MISSING LINE 990
// MISSING LINE 991
// MISSING LINE 992
// MISSING LINE 993
// MISSING LINE 994
// MISSING LINE 995
// MISSING LINE 996
// MISSING LINE 997
// MISSING LINE 998
// MISSING LINE 999
// MISSING LINE 1000
// MISSING LINE 1001
// MISSING LINE 1002
// MISSING LINE 1003
// MISSING LINE 1004
// MISSING LINE 1005
// MISSING LINE 1006
// MISSING LINE 1007
// MISSING LINE 1008
// MISSING LINE 1009
// MISSING LINE 1010
// MISSING LINE 1011
// MISSING LINE 1012
// MISSING LINE 1013
// MISSING LINE 1014
// MISSING LINE 1015
// MISSING LINE 1016
// MISSING LINE 1017
// MISSING LINE 1018
// MISSING LINE 1019
// MISSING LINE 1020
// MISSING LINE 1021
// MISSING LINE 1022
// MISSING LINE 1023
// MISSING LINE 1024
// MISSING LINE 1025
// MISSING LINE 1026
// MISSING LINE 1027
// MISSING LINE 1028
// MISSING LINE 1029
// MISSING LINE 1030
// MISSING LINE 1031
// MISSING LINE 1032
// MISSING LINE 1033
// MISSING LINE 1034
// MISSING LINE 1035
// MISSING LINE 1036
// MISSING LINE 1037
// MISSING LINE 1038
// MISSING LINE 1039
// MISSING LINE 1040
// MISSING LINE 1041
// MISSING LINE 1042
// MISSING LINE 1043
// MISSING LINE 1044
// MISSING LINE 1045
// MISSING LINE 1046
// MISSING LINE 1047
// MISSING LINE 1048
// MISSING LINE 1049
        
    } catch (err) {
        loadingMsg.remove();
        updateCoachAvatar('analytical', '能動対話 待機中');
        showToast('能動クイズの生成に失敗しました', 'error');
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
    let systemRole = "You
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
        // Clear active recall context
        window.lastActiveRecallConcept = null;
        window.lastActiveRecallQuestion = null;
    }
    
    try {
        let response;
        const activeModel = geminiModel || "gemini-3.5-flash";
        
        if (geminiApiKey) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemRole}\n\nContext:\n${fullDocumentText.substring(0, 16000)}\n\nQuery:\n${userPrompt}` }] }],
                    generationConfig: { temperature: 0.6 }
                })
            });
        } else {
            response = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mod
// MISSING LINE 1130
// MISSING LINE 1131
// MISSING LINE 1132
// MISSING LINE 1133
        
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
        
        // Increment conversation metrics
        tutorChatCount++;
        if (tutorChatCount >= 5) {
            unlockAchievement('trophy_socrates_friend');
        }
        
        // Update Daily Quest milestones
        updateQuestProgress('studyflow_quest_chat_coach');
        
    } catch (err) {
        typingPlaceholder.remove();
        updateCoachAvatar('analytical', '能動対話 待機中');
        showToast('AI回答の生成に失敗しました', 'error');
    }
};

// --- UPLOAD HANDLER ---
// MISSING LINE 1190
// MISSING LINE 1191
// MISSING LINE 1192
// MISSING LINE 1193
// MISSING LINE 1194

## 1. 人工知能(AI)と機械学習
**人工知能(AI)**は、知的な判断や意思決定を自動化する技術です。その中核をなす**機械学習**は、データ内の統計的特徴から予測関数を自動生成します。

## 2. ソクラテス式対話法
学習者の深いインサイトを引き出すため、AI家庭教師は**ソクラテス式対話法**を採用します。これは直接的な解答を示す代わりに、誘導質問を行うことで自発的な発見を促す教育法です。`
        }
    ];
    
    // Render note options
    notesListEl.innerHTML = fetchedNotebookNotes.map((note, idx) => `
        <div class="fetched-note-row" onclick="toggleFetchedNoteCheckbox('${note.id}')" style="margin-bottom: 6px;">
            <input type="checkbox" class="fetched-note-checkbox" id="chk_${note.id}" checked onclick="event.stopPropagation()">
            <div style="flex: 1; text-align: left;">
                <div style="font-weight: 700; color: white; font-size: 0.85rem;">${note.title}</div>
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
                handleUploa
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
window.addEventListener('drop', (e) => { e.preventDefault();
// MISSING LINE 1309
// MISSING LINE 1310
// MISSING LINE 1311
// MISSING LINE 1312
// MISSING LINE 1313
// MISSING LINE 1314
// MISSING LINE 1315
// MISSING LINE 1316
// MISSING LINE 1317
// MISSING LINE 1318
// MISSING LINE 1319
// MISSING LINE 1320
// MISSING LINE 1321
// MISSING LINE 1322
// MISSING LINE 1323

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
        stored = J
            { id: 'studyflow_quest_master_cards', text: '暗記カードを3枚覚える', type: 'master_cards', target: 3, progress: 0, completed: false, xp: 50 },
            { id: 'studyflow_quest_chat_coach', text: 'AIコーチと3回以上能動対話する', type: 'chat_coach', target: 3, progress: 0, completed: false, xp: 50 },
            { id: 'studyflow_quest_submit_exam', text: '模擬試験を1回以上提出する', type: 'submit_exam', target: 1, progress: 0, completed: false, xp: 50 },
            { id: 'studyflow_quest_active_recall', text: 'アクティブにコンテキストを構成する', type: 'active_recall', target: 1, progress: 0, completed: 
// MISSING LINE 1368
// MISSING LINE 1369
// MISSING LINE 1370
// MISSING LINE 1371
// MISSING LINE 1372
// MISSING LINE 1373
// MISSING LINE 1374
        localStorage.setItem('studyflow_quests_date', today);
        stored = JSON.stringify(selected);
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
                <div class="trophy-icon">${ach.icon
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
    readinessEl.parentNode.insertBefore(widget, readinessEl);
}

// Hook card mastered click to daily quest update
const originalToggleCardMastery = window.toggleCardMastery;
    
    notesContainer.style.display = 'block';
}

window.toggleFetchedNoteCheckbox = (noteId) => {
    const chk = document.getElementById(`chk_${noteId}`);
    if (chk) {
        chk.checked = !chk.checked;
    }
};

    widget.id = 'weaknessWidget';
    widget.className = 'weakness-card';
    widget.innerHTML = `
        <div class="weakness-title">
            <i class="fas fa-heart-beat"></i> 弱点診断パーソナルカルテ
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

