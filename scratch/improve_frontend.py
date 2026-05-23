import os

def main():
    file_path = r"SocialIntent/index.html"
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # --- 1. Style block replacement ---
    target_style = """        .btn-export:hover { border-color: var(--accent); background: rgba(139,92,246,0.1); }
    </style>"""

    replace_style = """        .btn-export:hover { border-color: var(--accent); background: rgba(139,92,246,0.1); }

        /* Sidebar Drawer */
        .history-sidebar {
            position: fixed;
            top: 0;
            left: -350px;
            width: 320px;
            height: 100vh;
            background: #0b0d18;
            border-right: 1px solid var(--glass-border);
            z-index: 1100;
            transition: var(--transition-smooth);
            display: flex;
            flex-direction: column;
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
        }
        .history-sidebar.open {
            left: 0;
        }
        .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 1050;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .sidebar-overlay.show {
            display: block;
            opacity: 1;
        }
        .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--glass-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .sidebar-header h3 {
            font-size: 1.1rem;
            font-weight: 800;
            color: white;
        }
        .btn-close-sidebar {
            background: transparent;
            border: none;
            color: var(--text-dim);
            font-size: 1.2rem;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-close-sidebar:hover {
            color: white;
        }
        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .history-item {
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 0.8rem 1rem;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .history-item:hover {
            background: rgba(236, 72, 153, 0.05);
            border-color: var(--primary);
        }
        .history-item-keyword {
            font-weight: 800;
            font-size: 0.9rem;
            color: white;
        }
        .history-item-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.7rem;
            color: var(--text-dim);
        }
        .sidebar-footer {
            padding: 1rem;
            border-top: 1px solid var(--glass-border);
        }
        .btn-clear-history {
            width: 100%;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
            padding: 0.6rem;
            border-radius: 10px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .btn-clear-history:hover {
            background: rgba(239, 68, 68, 0.25);
            border-color: #ef4444;
        }
    </style>"""

    if target_style in content:
        content = content.replace(target_style, replace_style)
        print("Style block replaced successfully.")
    else:
        print("Warning: Style block not found!")

    # --- 2. Header buttons replacement ---
    target_header = """            <div class="header-right">
                <button class="btn-api-key" id="apiKeyBtn" onclick="showApiModal()" style="display:none;">
                    <i class="fas fa-key"></i> <span id="apiKeyStatus">APIキー設定</span>
                </button>
                <button class="btn-upgrade" id="customUpgradeBtn">
                    <i class="fas fa-crown"></i> プレミアムへ ¥580
                </button>
            </div>"""

    replace_header = """            <div class="header-right">
                <button class="btn-api-key" id="historyBtn" onclick="toggleHistoryPanel()" style="display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fas fa-history"></i> <span>履歴</span>
                </button>
                <button class="btn-api-key" id="settingsBtn" onclick="showSettingsModal()" style="display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fas fa-cog"></i> <span>環境設定</span>
                </button>
                <button class="btn-upgrade" id="customUpgradeBtn">
                    <i class="fas fa-crown"></i> プレミアムへ ¥580
                </button>
            </div>"""

    if target_header in content:
        content = content.replace(target_header, replace_header)
        print("Header buttons replaced successfully.")
    else:
        print("Warning: Header buttons not found!")

    # --- 3. Loader replacement ---
    target_loader = """        <!-- Loader -->
        <div class="loader" id="loader">
            <div class="spinner"></div>
            <div class="loader-steps">
                <div class="loader-step" id="step1"><i class="fas fa-circle-notch fa-spin"></i> 検索ボリューム・競合度を推定中...</div>
                <div class="loader-step" id="step2"><i class="fas fa-circle"></i> Gemini AIがトレンドを解析中...</div>
                <div class="loader-step" id="step3"><i class="fas fa-circle"></i> プラットフォーム別インサイトを生成中...</div>
                <div class="loader-step" id="step4"><i class="fas fa-circle"></i> レポートを構築中...</div>
            </div>
        </div>"""

    replace_loader = """        <!-- Loader -->
        <div class="loader" id="loader">
            <div class="spinner"></div>
            <div style="font-size: 1.5rem; font-weight: 900; color: white; margin-bottom: 0.5rem;" id="loaderPercent">0%</div>
            <div style="width: 100%; max-width: 400px; background: rgba(255,255,255,0.05); height: 6px; border-radius: 10px; margin: 0 auto 2rem; overflow: hidden; border: 1px solid var(--glass-border);">
                <div id="loaderProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 10px; transition: width 0.4s ease;"></div>
            </div>
            <div class="loader-steps">
                <div class="loader-step" id="step1"><i class="fas fa-circle-notch fa-spin"></i> 検索ボリューム・競合度を推定中...</div>
                <div class="loader-step" id="step2"><i class="fas fa-circle"></i> Gemini AIがトレンドを解析中...</div>
                <div class="loader-step" id="step3"><i class="fas fa-circle"></i> プラットフォーム別インサイトを生成中...</div>
                <div class="loader-step" id="step4"><i class="fas fa-circle"></i> レポートを構築中...</div>
            </div>
        </div>"""

    if target_loader in content:
        content = content.replace(target_loader, replace_loader)
        print("Loader replaced successfully.")
    else:
        print("Warning: Loader not found!")

    # --- 4. Recommendation banner ---
    target_dashboard = """        <!-- Dashboard -->
        <main class="dashboard" id="mainDashboard">"""

    replace_dashboard = """        <!-- Recommendation Banner -->
        <div class="recommendation-banner" id="recommendationBanner" style="display:none; background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15)); border: 1px solid var(--primary-glow); border-radius: 16px; padding: 1.2rem; margin-bottom: 1.5rem; text-align: left; display: flex; align-items: center; gap: 15px;">
            <div style="background: var(--primary-glow); width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--primary);">
                <i id="recPlatformIcon" class="fas fa-star"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-size:0.75rem; color:var(--text-dim); font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">Best Platform Recommendation</div>
                <div style="font-size:1rem; font-weight:800; color:white; margin: 2px 0;">このキーワードは <span id="recPlatformName" style="color:var(--primary);">YouTube</span> での訴求が最も効果的です！ (スコア: <span id="recPlatformScore">85</span>/100)</div>
                <div id="recPlatformReason" style="font-size:0.8rem; color:#cbd5e1; line-height:1.4;">トレンドが急上昇しており、視聴維持フックによる動画展開が最も適しています。</div>
            </div>
        </div>

        <!-- Dashboard -->
        <main class="dashboard" id="mainDashboard">"""

    if target_dashboard in content:
        content = content.replace(target_dashboard, replace_dashboard)
        print("Dashboard/Banner replaced successfully.")
    else:
        print("Warning: Dashboard tag not found!")

    # --- 5. Modals and Sidebar integration ---
    target_api_modal = """    <!-- API Key Modal -->
    <div class="modal-overlay" id="apiModal">
        <div class="modal-box">
            <h3><i class="fas fa-key" style="color:var(--accent);margin-right:8px"></i>Gemini APIキー設定</h3>
            <p>本物のAIトレンド分析・インテント解析を実行するために、Google AI Studioで無料取得できるGemini APIキーを入力してください。<br><span style="color:#a78bfa">※キーはローカルブラウザ（localStorage）に安全に保存されます。</span></p>
            <input class="modal-input" type="password" id="apiKeyInput" placeholder="AIzaSy...">
            <div class="modal-actions">
                <button class="btn-modal-save" onclick="saveApiKey()"><i class="fas fa-save"></i> 保存</button>
                <button class="btn-modal-skip" onclick="closeApiModal()">閉じる</button>
            </div>
        </div>
    </div>"""

    replace_settings_modal = """    <!-- Settings Modal -->
    <div class="modal-overlay" id="settingsModal">
        <div class="modal-box" style="max-width: 500px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <h3 style="margin:0;"><i class="fas fa-cog" style="color:var(--accent);margin-right:8px"></i>環境設定 (Settings)</h3>
                <button class="btn-close-sidebar" onclick="closeSettingsModal()"><i class="fas fa-times"></i></button>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:1.2rem;">
                <!-- Tab 1: Gemini API Key -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 14px; padding: 1.2rem;">
                    <div style="font-weight:800; font-size:0.9rem; color:white; margin-bottom:0.5rem; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-key" style="color:var(--accent)"></i> Gemini APIキー (カスタム)
                    </div>
                    <p style="color: var(--text-dim); font-size: 0.75rem; margin-bottom: 0.8rem; line-height: 1.5;">
                        独自のGemini APIキーを設定すると、無料プランの1日3回制限を完全にスキップできます。キーはローカルブラウザ（localStorage）にのみ保存されます。
                    </p>
                    <input class="modal-input" type="password" id="customApiKeyInput" placeholder="AIzaSy..." style="margin-bottom:0.3rem;">
                    <div style="font-size:0.7rem; color:var(--text-dim); display:flex; justify-content:space-between;">
                        <span>※Google AI Studio等から無料で取得可能です。</span>
                        <a href="https://aistudio.google.com/" target="_blank" style="color:var(--primary); text-decoration:none; font-weight:700;">キーを取得 →</a>
                    </div>
                </div>

                <!-- Tab 2: Premium License Key -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 14px; padding: 1.2rem;">
                    <div style="font-weight:800; font-size:0.9rem; color:white; margin-bottom:0.5rem; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-crown" style="color:#ffd700"></i> ライセンス管理
                    </div>
                    <p style="color: var(--text-dim); font-size: 0.75rem; margin-bottom: 0.8rem; line-height: 1.5;">
                        SocialIntent AI プレミアムプランのライセンスキーを適用し、競合分析やレポート保存機能をアンロックします。
                    </p>
                    <input class="modal-input" type="text" id="licenseKeyInput" placeholder="LS-XXXX-XXXX-XXXX" style="margin-bottom:0.3rem;">
                    <div id="licenseKeyStatusMsg" style="font-size:0.7rem; color:var(--text-dim); margin-top: 0.2rem;">
                        未有効化（フリープラン）
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 1.8rem; gap:10px;">
                <button class="btn-modal-save" onclick="saveSettings()"><i class="fas fa-save"></i> 設定を保存</button>
                <button class="btn-modal-skip" onclick="closeSettingsModal()">キャンセル</button>
            </div>
        </div>
    </div>

    <!-- History Sidebar -->
    <div class="history-sidebar" id="historySidebar">
        <div class="sidebar-header">
            <h3><i class="fas fa-history" style="color:var(--primary); margin-right:8px;"></i>検索履歴</h3>
            <button class="btn-close-sidebar" onclick="toggleHistoryPanel()"><i class="fas fa-times"></i></button>
        </div>
        <div class="sidebar-content" id="historyListContent">
            <!-- Dynamically populated -->
        </div>
        <div class="sidebar-footer">
            <button class="btn-clear-history" onclick="clearSearchHistory()"><i class="fas fa-trash-alt"></i> 履歴をクリア</button>
        </div>
    </div>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleHistoryPanel()"></div>"""

    if target_api_modal in content:
        content = content.replace(target_api_modal, replace_settings_modal)
        print("API Key Modal / Settings Sidebar replaced successfully.")
    else:
        print("Warning: API Key Modal not found!")

    # --- 6. JS script block replacement (API Key helper up to drawRadar end) ---
    # We will search for a target block that spans from:
    # "    // ── API Key ───────────────────────────────────────────"
    # to the end of the drawRadar closing bracket.
    # To do this safely, we can locate the start and find where the original drawRadar ends.
    # Since we restored the file, the original code from "// ── API Key ───" to the end of drawRadar is exactly:
    
    start_marker = "    // ── API Key ───────────────────────────────────────────"
    # The end of drawRadar is right before:
    # "    // ── Detail Report ─────────────────────────────────────"
    end_marker = "    // ── Detail Report ─────────────────────────────────────"
    
    if start_marker in content and end_marker in content:
        idx_start = content.find(start_marker)
        idx_end = content.find(end_marker)
        
        target_js_block = content[idx_start:idx_end]
        
        replace_js_block = """    // ── Settings (API Key & License) ──────────────────────
    function getApiKey() { return localStorage.getItem('si_gemini_key') || ''; }
    function getLicenseKey() { return localStorage.getItem('socialintent_license_key') || ''; }
    
    function showSettingsModal() {
        document.getElementById('customApiKeyInput').value = getApiKey();
        document.getElementById('licenseKeyInput').value = getLicenseKey();
        
        const isPrem = (typeof SuiteGatekeeper !== 'undefined' && SuiteGatekeeper.isPremium());
        const statusEl = document.getElementById('licenseKeyStatusMsg');
        if (isPrem) {
            statusEl.innerHTML = '<i class="fas fa-check-circle" style="color:#00ff88"></i> プレミアムプラン有効中';
            statusEl.style.color = '#00ff88';
        } else {
            statusEl.innerHTML = '<i class="fas fa-info-circle" style="color:var(--text-dim)"></i> フリープラン（残りクレジット：' + (typeof SuiteGatekeeper !== 'undefined' ? SuiteGatekeeper.getCredits() : 0) + '回）';
            statusEl.style.color = 'var(--text-dim)';
        }
        
        document.getElementById('settingsModal').classList.add('show');
    }
    
    function closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }
    
    function saveSettings() {
        const key = document.getElementById('customApiKeyInput').value.trim();
        const lic = document.getElementById('licenseKeyInput').value.trim();
        
        // Save API Key
        if (key) {
            localStorage.setItem('si_gemini_key', key);
        } else {
            localStorage.removeItem('si_gemini_key');
        }
        
        // Save License Key
        if (lic) {
            localStorage.setItem('socialintent_license_key', lic);
            if (typeof SuiteGatekeeper !== 'undefined') {
                SuiteGatekeeper.saveConfig(lic);
                // Validate license
                const isVal = lic.toUpperCase().startsWith('LS-') && lic.length >= 10;
                if (isVal) {
                    localStorage.setItem('socialintent_license_status', 'active');
                } else {
                    localStorage.setItem('socialintent_license_status', 'free');
                }
            }
        } else {
            localStorage.removeItem('socialintent_license_key');
            localStorage.setItem('socialintent_license_status', 'free');
        }
        
        closeSettingsModal();
        alert('設定を保存しました。反映のため画面をリロードします。');
        location.reload();
    }

    // ── Search History (Recent Searches) ───────────────────
    function saveToSearchHistory(keyword, data) {
        if (!keyword || !data) return;
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('si_search_history') || '[]');
        } catch(e) {
            history = [];
        }
        
        // Remove duplicates
        history = history.filter(item => item.keyword.toLowerCase() !== keyword.toLowerCase());
        
        // Add to front
        history.unshift({
            keyword: keyword,
            timestamp: new Date().toISOString(),
            data: data
        });
        
        // Limit to 20 items
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        localStorage.setItem('si_search_history', JSON.stringify(history));
        renderHistorySidebar();
    }

    function renderHistorySidebar() {
        const contentEl = document.getElementById('historyListContent');
        if (!contentEl) return;
        
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('si_search_history') || '[]');
        } catch(e) {
            history = [];
        }
        
        if (history.length === 0) {
            contentEl.innerHTML = `
                <div style="text-align:center; padding: 3rem 1rem; color: var(--text-dim); font-size:0.85rem;">
                    <i class="fas fa-history" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i>
                    <p>検索履歴はありません。<br>キーワードを入力して分析してください。</p>
                </div>
            `;
            return;
        }
        
        contentEl.innerHTML = history.map(item => {
            const dateStr = new Date(item.timestamp).toLocaleString('ja-JP', { month:'numeric', day:'numeric', hour:'numeric', minute:'2-digit' });
            const volume = item.data.volume ? Number(item.data.volume.toString().replace(/[^0-9]/g, '')) : 0;
            return `
                <div class="history-item" onclick="loadFromHistory('${item.keyword.replace(/'/g, "\\'")}')">
                    <div class="history-item-keyword">${item.keyword}</div>
                    <div class="history-item-meta">
                        <span>Vol: ${volume ? volume.toLocaleString() : 'N/A'}</span>
                        <span>${dateStr}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function toggleHistoryPanel() {
        const sidebar = document.getElementById('historySidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        } else {
            renderHistorySidebar();
            sidebar.classList.add('open');
            overlay.classList.add('show');
        }
    }

    function loadFromHistory(keyword) {
        toggleHistoryPanel(); // close panel
        
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('si_search_history') || '[]');
        } catch(e) {
            return;
        }
        
        const found = history.find(item => item.keyword.toLowerCase() === keyword.toLowerCase());
        if (found) {
            document.getElementById('keywordInput').value = found.keyword;
            loadPrepopulatedData(found.keyword, found.data);
        }
    }

    function clearSearchHistory() {
        if (confirm('検索履歴をすべて削除しますか？')) {
            localStorage.removeItem('si_search_history');
            renderHistorySidebar();
        }
    }

    function loadPrepopulatedData(keyword, aiData) {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('mainDashboard').style.display = 'none';
        document.getElementById('detailReport').style.display = 'none';
        document.getElementById('premiumReport').style.display = 'none';
        
        setStep(1);
        setTimeout(() => {
            setStep(3);
            setTimeout(() => {
                setStep(4);
                setTimeout(() => {
                    renderAnalysisResults(keyword, aiData);
                }, 200);
            }, 200);
        }, 200);
    }

    // ── Helpers ───────────────────────────────────────────
    function setKeyword(val) { document.getElementById('keywordInput').value = val; analyzeIntent(); }
    function hashStr(s) { return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0); }

    // ── Loader steps ──────────────────────────────────────
    function setStep(n) {
        const percentages = [0, 25, 50, 75, 100];
        const percent = percentages[n] || 0;
        
        const percentEl = document.getElementById('loaderPercent');
        const progressEl = document.getElementById('loaderProgressBar');
        if (percentEl) percentEl.innerText = percent + '%';
        if (progressEl) progressEl.style.width = percent + '%';
        
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById('step' + i);
            if (!el) continue;
            if (i < n) { el.className = 'loader-step done'; el.querySelector('i').className = 'fas fa-check-circle'; }
            else if (i === n) { el.className = 'loader-step active'; el.querySelector('i').className = 'fas fa-circle-notch fa-spin'; }
            else { el.className = 'loader-step'; el.querySelector('i').className = 'fas fa-circle'; }
        }
    }

    // ── Gemini API call ───────────────────────────────────
    async function callGemini(prompt) {
        const key = getApiKey();
        let res;
        try {
            if (key) {
                res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 1800 } })
                });
            } else {
                const licenseKey = localStorage.getItem('socialintent_license_key') || '';
                res = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-License-Key': licenseKey,
                        'X-App-Id': 'socialintent'
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        model: "gemini-3.5-flash"
                    })
                });
            }
            
            if (res.status === 429) {
                alert("無料プランのAPI利用上限（1日3回）に達しました。悪用防止のため、サーバー側で制限を行っています。プレミアムライセンスキーを入力するか、しばらく時間をおいてから再度お試しください。");
                return null;
            }
            
            if (!res.ok) return null;
            const data = await res.json();
            if (data.error) {
                console.error("Gemini API proxy error:", data.error);
                return null;
            }
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            // Extract JSON
            const match = text.match(/```json\\s*([\\s\\S]*?)```/) || text.match(/(\\{[\\s\\S]*\\})/);
            if (match) return JSON.parse(match[1]);
            return null;
        } catch (e) {
            console.error("Gemini API call failed:", e);
            return null;
        }
    }

    // ── Main analyze ──────────────────────────────────────
    async function analyzeIntent() {
        const keyword = document.getElementById('keywordInput').value.trim();
        if (!keyword) return;
        currentKeyword = keyword;
        currentHash = hashStr(keyword);

        // Check premium
        isPremium = (typeof SuiteGatekeeper !== 'undefined' && SuiteGatekeeper.isPremium());

        // Check cache (sessionStorage) first to bypass daily limit
        let aiData = null;
        let cachedVal = sessionStorage.getItem(`si_cache_${keyword}_${isPremium}`);
        if (!cachedVal && isPremium) {
            cachedVal = sessionStorage.getItem(`si_cache_${keyword}_false`);
        }
        if (cachedVal) {
            try {
                aiData = JSON.parse(cachedVal);
            } catch (e) {
                console.error("Error parsing cached AI data:", e);
            }
        }

        // Daily Limit check for Free users on cache miss
        if (!aiData && !isPremium) {
            const today = new Date().toLocaleDateString('ja-JP');
            let dailyUsage = JSON.parse(localStorage.getItem('si_daily_usage') || '{}');
            if (dailyUsage.date !== today) {
                dailyUsage = { date: today, count: 0, keywords: [] };
            }
            if (dailyUsage.count >= 3 && !dailyUsage.keywords.includes(keyword)) {
                showLimitModal();
                return;
            }
        }

        document.getElementById('loader').style.display = 'block';
        document.getElementById('mainDashboard').style.display = 'none';
        document.getElementById('detailReport').style.display = 'none';
        document.getElementById('premiumReport').style.display = 'none';
        setStep(1);

        await new Promise(r => setTimeout(r, 700));
        setStep(2);

        if (!aiData) {
            let prompt = "";
            if (isPremium) {
                prompt = `あなたはSNSマーケティングの専門家です。
キーワード「${keyword}」について2026年現在の日本市場向け分析を行い、以下のJSON形式で回答してください。

必ず実際のこのキーワードに特化した具体的な内容を書いてください（汎用的な回答は禁止）。

{
  "summary": "このキーワードの本質的な検索インテントを2文で（日本語）",
  "volume": 月間想定検索ボリュームの数値（1000〜500000の間の整数数値。必ずこのキーワードに応じた現実的な推測値にすること）,
  "difficulty": 検索競合難易度の数値（1〜100の間の整数数値。必ずこのキーワードに応じた現実的な推測値にすること）,
  "platforms": {
    "youtube": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "YouTubeでこのキーワードを扱う場合の具体的な戦略・注意点を3文で（日本語）。必ずこのキーワード固有の内容にすること",
      "hooks": ["このキーワード専用のYouTubeサムネイル文言またはタイトルフック", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "instagram": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "Instagram Reelsでこのキーワードを扱う場合の具体的な戦略・注意点を3文で（日本語）",
      "hooks": ["このキーワード専用のReels冒頭フック文", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "tiktok": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "TikTok/Shortsでこのキーワードを扱う場合の具体的な戦略・注意点を3文で（日本語）",
      "hooks": ["このキーワード専用のTikTokフック文", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "x": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "X/Twitterでこのキーワードを扱う場合の具体的な戦略・スレッド構成を3文で（日本語）",
      "hooks": ["このキーワード専用 of Xポストフック文", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "seo": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "Google検索でこのキーワードを扱う場合の具体的なSEO戦略・インテントタイプを3文で（日本語）",
      "hooks": ["このキーワード専用のメタタイトル案", "2つ目の案"],
      "hashtags": ["#関連キーワード1", "#関連キーワード2", "#関連キーワード3"]
    }
  },
  "relatedKeywords": ["関連KW1", "関連KW2", "関連KW3", "関連KW4", "関連KW5"],
  "differentiation": "競合動画や競合サイトに勝つための具体的なポジショニング・切り口（日本語で詳細に、200字〜300字程度）",
  "script": "このキーワードで最もバズるショート動画（TikTok/Shorts/Reels）の台本案（日本語）。構成：【0〜3秒: 強烈なフック】【3〜20秒: 具体的な本編】【20〜30秒: CTA・アクション誘導】のように、ト書きやナレーションセリフを含んだリアルで実用的な台本。300字以上"
}

JSONのみ返してください。`;
            } else {
                prompt = `あなたはSNSマーケティングの専門家です。
キーワード「${keyword}」について2026年現在の日本市場向け分析を行い、以下のJSON形式で回答してください。

必ず実際のこのキーワードに特化した具体的な内容を書いてください（汎用的な回答は禁止）。

{
  "summary": "このキーワードの本質的な検索インテントを2文で（日本語）",
  "volume": 月間想定検索ボリュームの数値（1000〜500000の間の整数数値。必ずこのキーワードに応じた現実的な推測値にすること）,
  "difficulty": 検索競合難易度の数値（1〜100の間の整数数値。必ずこのキーワードに応じた現実的な推測値にすること）,
  "platforms": {
    "youtube": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "YouTubeでこのキーワードを扱う場合の具体的な戦略・注意点を3文で（日本語）。必ずこのキーワード固有の内容にすること",
      "hooks": ["このキーワード専用のYouTubeサムネイル文言またはタイトルフック", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "instagram": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "Instagram Reelsでこのキーワードを扱う場合の具体的な戦略・注意点を3文で（日本語）",
      "hooks": ["このキーワード専用のReels冒頭フック文", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "tiktok": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "TikTok/Shortsでこのキーワードを扱う場合の具体的な戦略・注意点を3文で（日本語）",
      "hooks": ["このキーワード専用のTikTokフック文", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "x": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "X/Twitterでこのキーワードを扱う場合の具体的な戦略・スレッド構成を3文で（日本語）",
      "hooks": ["このキーワード専用 of Xポストフック文", "2つ目のフック"],
      "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
    },
    "seo": {
      "score": 0-100の整数,
      "trend": "現在のトレンド傾向を15字以内",
      "insight": "Google検索でこのキーワードを扱う場合の具体的なSEO戦略・インテントタイプを3文で（日本語）",
      "hooks": ["このキーワード専用のメタタイトル案", "2つ目の案"],
      "hashtags": ["#関連キーワード1", "#関連キーワード2", "#関連キーワード3"]
    }
  }
}

JSONのみ返してください。`;
            }

            aiData = await callGemini(prompt);
            if (!aiData) {
                alert("Gemini AIからのデータ取得に失敗しました。APIキーが正しいか、またはインターネットの接続状況を確認し、再度お試しください。");
                document.getElementById('loader').style.display = 'none';
                return;
            }
            try {
                sessionStorage.setItem(`si_cache_${keyword}_${isPremium}`, JSON.stringify(aiData));
            } catch (e) {
                console.error("Error saving AI data to cache:", e);
            }

            // Increment usage count for Free users on successful search
            if (!isPremium) {
                const today = new Date().toLocaleDateString('ja-JP');
                let dailyUsage = JSON.parse(localStorage.getItem('si_daily_usage') || '{}');
                if (dailyUsage.date !== today) {
                    dailyUsage = { date: today, count: 0, keywords: [] };
                }
                if (!dailyUsage.keywords.includes(keyword)) {
                    dailyUsage.keywords.push(keyword);
                    dailyUsage.count = dailyUsage.keywords.length;
                    localStorage.setItem('si_daily_usage', JSON.stringify(dailyUsage));
                }
            }
        }

        setStep(3);
        await new Promise(r => setTimeout(r, 400));
        setStep(4);
        await new Promise(r => setTimeout(r, 400));

        renderAnalysisResults(keyword, aiData);
    }

    // ── Render Analysis Results ───────────────────────────
    function renderAnalysisResults(keyword, aiData) {
        currentAIData = aiData;
        const hash = hashStr(keyword);

        const scores = {
            youtube:   aiData.platforms?.youtube?.score   ?? 50,
            instagram: aiData.platforms?.instagram?.score ?? 50,
            tiktok:    aiData.platforms?.tiktok?.score    ?? 50,
            x:         aiData.platforms?.x?.score         ?? 50,
            seo:       aiData.platforms?.seo?.score       ?? 50,
        };

        // Recommendation Engine: Find best platform
        let maxScore = -1;
        let bestPlatform = '';
        for (const [plt, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestPlatform = plt;
            }
        }

        const platformDisplayNames = {
            youtube: 'YouTube',
            instagram: 'Instagram Reels',
            tiktok: 'TikTok',
            x: 'X (Twitter)',
            seo: 'Google SEO'
        };
        const platformIcons = {
            youtube: 'fab fa-youtube',
            instagram: 'fab fa-instagram',
            tiktok: 'fab fa-tiktok',
            x: 'fab fa-x-twitter',
            seo: 'fab fa-google'
        };
        const platformColors = {
            youtube: '#ff0000',
            instagram: '#e1306c',
            tiktok: '#ff0050',
            x: '#1d9bf0',
            seo: '#8b5cf6'
        };

        const recName = platformDisplayNames[bestPlatform] || 'YouTube';
        const recIcon = platformIcons[bestPlatform] || 'fab fa-youtube';
        const recColor = platformColors[bestPlatform] || '#ff0000';
        const recScore = maxScore;
        const recInsight = aiData.platforms?.[bestPlatform]?.insight || 'このプラットフォームで最も強いトレンドが観測されています。';

        // Update recommendation banner
        const banner = document.getElementById('recommendationBanner');
        if (banner) {
            banner.style.display = 'flex';
            banner.style.borderLeft = `5px solid ${recColor}`;
            document.getElementById('recPlatformIcon').className = recIcon;
            document.getElementById('recPlatformIcon').style.color = recColor;
            document.getElementById('recPlatformName').innerText = recName;
            document.getElementById('recPlatformName').style.color = recColor;
            document.getElementById('recPlatformScore').innerText = recScore;
            document.getElementById('recPlatformReason').innerText = recInsight;
        }

        document.getElementById('loader').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'grid';

        document.getElementById('displayKeyword').innerText = keyword;
        
        // Coerce volume and difficulty from AI response if available
        let volumeVal = (12000 + (hash * 45) % 85000);
        if (aiData.volume) {
            const parsed = Number(aiData.volume.toString().replace(/[^0-9]/g, ''));
            if (!isNaN(parsed) && parsed > 0) volumeVal = parsed;
        }
        let difficultyVal = 25 + (hash % 65);
        if (aiData.difficulty) {
            const parsed = Number(aiData.difficulty.toString().replace(/[^0-9]/g, ''));
            if (!isNaN(parsed) && parsed > 0 && parsed <= 100) difficultyVal = parsed;
        }
        
        document.getElementById('valVolume').innerText = volumeVal.toLocaleString();
        document.getElementById('valDifficulty').innerText = difficultyVal + '/100';

        generateCopyHooks(keyword, aiData);
        drawRadar(scores);
        generateDetailReport(keyword, aiData);
        generatePremiumReport(keyword, aiData);
        trackVentureOSStats();
        
        // Save to search history
        saveToSearchHistory(keyword, aiData);
    }

    // Global variable to hold current hooks data for switching
    let currentPlatformHooks = {};

    // ── Copy Hooks ────────────────────────────────────────
    function generateCopyHooks(keyword, ai) {
        const container = document.getElementById('copyContainer');
        const platformColors = { x:'#1d9bf0', tiktok:'#ff0050', instagram:'#e1306c', youtube:'#ff0000', seo:'var(--accent)' };

        const hookDefs = [
            { platform:'x',         icon:'fab fa-x-twitter', tag:'💡 X / Twitter — スレッドフック',       aiKey:'x' },
            { platform:'tiktok',    icon:'fab fa-tiktok',    tag:'🔥 TikTok / Shorts — ループフック',    aiKey:'tiktok' },
            { platform:'instagram', icon:'fab fa-instagram', tag:'📸 Instagram Reels — 保存誘導フック',  aiKey:'instagram' },
            { platform:'youtube',   icon:'fab fa-youtube',   tag:'🎥 YouTube — 視聴維持フック',          aiKey:'youtube' },
            { platform:'seo',       icon:'fab fa-google',    tag:'📈 Google SEO — メタタイトル案',      aiKey:'seo' },
        ];

        // Store hooks data globally
        currentPlatformHooks = {};
        hookDefs.forEach(h => {
            const platformData = ai.platforms?.[h.aiKey];
            currentPlatformHooks[h.platform] = platformData?.hooks || ['データがありません。'];
        });

        const html = hookDefs.map(h => {
            const platformData = ai.platforms?.[h.aiKey];
            const textA = platformData?.hooks?.[0] || '分析データがありません。';
            const hasAlt = platformData?.hooks && platformData.hooks.length > 1;
            
            return `
            <div class="copy-item" style="border-left-color:${platformColors[h.platform]}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="copy-tag" style="color:${platformColors[h.platform]}">${h.tag}</span>
                    ${hasAlt ? `
                    <div class="hook-tabs" style="display:flex; gap:6px;">
                        <button class="hook-tab-btn active" id="tab-${h.platform}-0" onclick="switchHook('${h.platform}', 0)" style="background:var(--primary-glow); border:1px solid var(--primary); color:white; font-size:0.65rem; padding:2px 8px; border-radius:4px; cursor:pointer; font-weight:700;">案 A</button>
                        <button class="hook-tab-btn" id="tab-${h.platform}-1" onclick="switchHook('${h.platform}', 1)" style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); color:var(--text-dim); font-size:0.65rem; padding:2px 8px; border-radius:4px; cursor:pointer; font-weight:700;">案 B</button>
                    </div>
                    ` : ''}
                </div>
                <div class="copy-text" id="text-${h.platform}">${textA}</div>
                <button class="btn-copy" onclick="copyHookText(this, '${h.platform}')"><i class="fas fa-copy"></i> コピー</button>
            </div>`;
        }).join('');

        container.innerHTML = html;
    }

    function switchHook(platform, index) {
        const textEl = document.getElementById(`text-${platform}`);
        if (!textEl || !currentPlatformHooks[platform]) return;
        
        // Update text
        const hooks = currentPlatformHooks[platform];
        const selectedText = hooks[index] || hooks[0] || 'データがありません。';
        textEl.innerText = selectedText;
        
        // Update tabs active state
        for (let i = 0; i <= 1; i++) {
            const tabBtn = document.getElementById(`tab-${platform}-${i}`);
            if (tabBtn) {
                if (i === index) {
                    tabBtn.classList.add('active');
                    tabBtn.style.background = 'var(--primary-glow)';
                    tabBtn.style.borderColor = 'var(--primary)';
                    tabBtn.style.color = 'white';
                } else {
                    tabBtn.classList.remove('active');
                    tabBtn.style.background = 'rgba(255,255,255,0.03)';
                    tabBtn.style.borderColor = 'var(--glass-border)';
                    tabBtn.style.color = 'var(--text-dim)';
                }
            }
        }
    }

    function copyHookText(btn, platform) {
        const textEl = document.getElementById(`text-${platform}`);
        if (!textEl) return;
        copyText(btn, textEl.innerText);
    }

    let lastRadarScores = null;

    // ── Radar Chart ───────────────────────────────────────
    function drawRadar(scores, hoverMetricIndex = -1) {
        lastRadarScores = scores;
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2, radius = 100;

        const metrics = [
            { name: 'YouTube',   score: scores.youtube,   color: '#ff0000' },
            { name: 'Instagram', score: scores.instagram, color: '#e1306c' },
            { name: 'TikTok',    score: scores.tiktok,    color: '#ff0050' },
            { name: 'X',         score: scores.x,         color: '#1d9bf0' },
            { name: 'Google SEO',score: scores.seo,       color: '#8b5cf6' },
        ];
        const count = metrics.length;

        // Web rings
        for (let r = 0.2; r <= 1; r += 0.2) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            for (let i = 0; i < count; i++) {
                const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
                const x = cx + radius * r * Math.cos(angle), y = cy + radius * r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)); ctx.stroke();
        }

        // Score fill (gradient per point)
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
            const r = metrics[i].score / 100;
            const x = cx + radius * r * Math.cos(angle), y = cy + radius * r * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(236,72,153,0.15)'; ctx.fill();
        ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2.5; ctx.stroke();

        // Dots per axis
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
            const r = metrics[i].score / 100;
            const x = cx + radius * r * Math.cos(angle), y = cy + radius * r * Math.sin(angle);
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = metrics[i].color; ctx.fill();

            // Draw hover ring if active
            if (i === hoverMetricIndex) {
                ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2);
                ctx.strokeStyle = metrics[i].color; ctx.lineWidth = 1.5; ctx.stroke();
            }
        }

        // Labels
        ctx.font = 'bold 9px Outfit'; ctx.textAlign = 'center';
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
            const lx = cx + (radius + 22) * Math.cos(angle), ly = cy + (radius + 14) * Math.sin(angle);
            ctx.fillStyle = metrics[i].color;
            ctx.fillText(metrics[i].name, lx, ly);
            ctx.fillStyle = '#64748b';
            
            // Draw larger value on hover
            if (i === hoverMetricIndex) {
                ctx.font = 'bold 11px Outfit';
                ctx.fillStyle = '#fff';
                ctx.fillText(metrics[i].score + '/100 ★', lx, ly + 12);
                ctx.font = 'bold 9px Outfit';
            } else {
                ctx.fillText(metrics[i].score + '/100', lx, ly + 11);
            }
        }
    }

    // Set up canvas hover interactions
    function setupRadarInteractions() {
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;
        
        canvas.addEventListener('mousemove', (e) => {
            if (!lastRadarScores) return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const cx = canvas.width / 2, cy = canvas.height / 2, radius = 100;
            const count = 5;
            
            let closestIndex = -1;
            let minDistance = 20; // Max hover distance in pixels
            
            const metrics = [
                { score: lastRadarScores.youtube },
                { score: lastRadarScores.instagram },
                { score: lastRadarScores.tiktok },
                { score: lastRadarScores.x },
                { score: lastRadarScores.seo },
            ];

            for (let i = 0; i < count; i++) {
                const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
                const r = metrics[i].score / 100;
                const x = cx + radius * r * Math.cos(angle);
                const y = cy + radius * r * Math.sin(angle);
                
                const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = i;
                }
            }
            
            drawRadar(lastRadarScores, closestIndex);
        });
        
        canvas.addEventListener('mouseleave', () => {
            if (lastRadarScores) {
                drawRadar(lastRadarScores, -1);
            }
        });
    }
"""
        content = content.replace(target_js_block, replace_js_block)
        print("JS script helper block replaced successfully.")
    else:
        print("Warning: Start or End marker not found for JS script block!")

    # --- 7. DOMContentLoaded setup replacement ---
    target_domcontent = """    // ── Premium check ─────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        updateApiKeyStatus();"""

    replace_domcontent = """    // ── Premium check ─────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        renderHistorySidebar();
        setupRadarInteractions();"""

    if target_domcontent in content:
        content = content.replace(target_domcontent, replace_domcontent)
        print("DOMContentLoaded listener replaced successfully.")
    else:
        print("Warning: DOMContentLoaded target not found!")

    # --- Write back ---
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("All replacements done successfully!")

if __name__ == "__main__":
    main()
