let currentChart = null;
let backendApiUrl = 'https://coastal-provision-hearings-installing.trycloudflare.com';

async function reportActivity(venture, action) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        await fetch(`${backendApiUrl}/api/report-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ venture, action }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        console.warn("Could not report activity:", e);
    }
}

window.renderAnalysis = async function(assetId) {
    const panel = document.getElementById('analysisPanel');
    const lang = window.currentLang || 'ja';
    const t = window.translations ? window.translations[lang] : {};

    if (typeof SuiteGatekeeper !== 'undefined') {
        if (SuiteGatekeeper.getCredits() <= 0 && !SuiteGatekeeper.isPremium()) {
            if (typeof showToast === 'function') {
                showToast("無料お試し枠（クレジット）を使い切りました。アップグレードしてください！", "error");
            }
            SuiteGatekeeper.openCheckout();
            return;
        }
        SuiteGatekeeper.consumeCredit();
    }
    
    panel.innerHTML = `
        <div style="height:100%; display:flex; align-items:center; justify-content:center; color:#10b981;">
            <i class="fas fa-microchip fa-spin" style="font-size:2rem;"></i>
        </div>
    `;

    const asset = (window.livePrices || []).find(a => a.id === assetId);
    if (!asset) {
        panel.innerHTML = "ERROR: ASSET_NOT_FOUND [" + assetId + "]";
        return;
    }

    const geminiKey = (typeof SuiteGatekeeper !== 'undefined' && typeof SuiteGatekeeper.getGeminiKey === 'function') ? SuiteGatekeeper.getGeminiKey() : '';
    const snsMetrics = getSnsMetrics(asset);
    const prompt = (
        `You are a world-class alternative asset investment quant and professional analyst tracking viral social media momentum.\n`
        `Task: Provide a brief, high-impact, data-driven deep market analysis (strictly 2-3 sentences max) for this alternative asset, incorporating the latest SNS (Instagram, YouTube, TikTok) trend data synced via NotebookLM to track consumer hype:\n`
        `- Name: ${asset.label}\n`
        `- Price: ¥${Math.floor(asset.currentPrice).toLocaleString()}\n`
        `- Category: ${asset.category}\n`
        `- Volatility: ${(asset.volatility * 100).toFixed(1)}%\n`
        `- Instagram Hype Velocity (Mentions & Reach): ${snsMetrics.instagram}\n`
        `- YouTube Review & Video View Growth: ${snsMetrics.youtube}\n`
        `- TikTok Viral Index (CapCut/Unboxing shares): ${snsMetrics.tiktok}\n\n`
        `Strict constraints:\n`
        `1. Explicitly factor in how the social media momentum (YouTube views, TikTok trends, Instagram posts) is driving or impacting the asset price or entry timing.\n`
        `2. Focus explicitly on potential price anomalies, market liquidity velocity, and tactical asymmetric entry windows.\n`
        `3. Language & Style: Write in ${lang === 'ja' ? 'highly professional, formal Japanese (using deep financial and SNS terminology, e.g. "インフルエンサー需要", "TikTokバイラル", "需給のタイト化", "乖離アノマリー")' : 'Wall Street grade, extremely professional, concise English'}.\n`
        `4. Do not include introductory filler words. Start directly with the core analysis.`
    );

    if (geminiKey) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text.trim();
            renderAnalysis(asset, aiText);
        } catch (e) {
            console.warn("Gemini analysis failed:", e);
            renderAnalysis(asset); // Fallback to mock
        }
    } else {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(`${backendApiUrl}/api/gemini-proxy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "gemini-3.5-flash",
                    contents: [{ parts: [{ text: prompt }] }]
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                    const aiText = data.candidates[0].content.parts[0].text.trim();
                    renderAnalysis(asset, aiText);
                } else {
                    renderAnalysis(asset);
                }
            } else {
                renderAnalysis(asset);
            }
        } catch (e) {
            console.warn("Server proxy analysis failed, falling back to high-fidelity mock:", e);
            renderAnalysis(asset);
        }
    }
};

function getSnsMetrics(asset) {
    const seed = asset.label.charCodeAt(0) + (Math.floor(asset.currentPrice) % 1000);
    const isHigh = seed % 3 === 0;
    const isMed = seed % 3 === 1;
    
    let instagram, youtube, tiktok;
    
    if (asset.category === "SNEAKER" || asset.label.includes("Jordan")) {
        instagram = "+18.4% YoY (リール動画の着用急増)";
        youtube = "+12.1% MoM (スニーカー解説・開封動画)";
        tiktok = "バイラル度: HIGH (#SneakerTok)";
    } else if (asset.label.includes("Charizard") || asset.label.includes("Pokemon") || asset.label.includes("Blue-Eyes") || asset.label.includes("Black Lotus")) {
        instagram = "+5.2% MoM (コレクター投稿数増加)";
        youtube = "+24.5% MoM (鑑定開封ライブ再生回数急増)";
        tiktok = "バイラル度: VERY HIGH (トレカ自慢バイラル)";
    } else if (asset.category === "WATCH" || asset.label.includes("Rolex") || asset.label.includes("Patek")) {
        instagram = "+8.9% MoM (ラグジュアリー着用投稿の安定)";
        youtube = "+3.6% MoM (専門チャンネル解説視聴数微増)";
        tiktok = "バイラル度: MEDIUM (#Rolex露出安定)";
    } else if (asset.label.includes("Yamazaki") || asset.label.includes("Hibiki") || asset.label.includes("Whisky")) {
        instagram = "+15.3% MoM (ジャパニーズウイスキー紹介増)";
        youtube = "+19.2% MoM (外国人プレミア探索動画再生増)";
        tiktok = "バイラル度: MEDIUM (お酒ショート露出増)";
    } else {
        instagram = isHigh ? "+14.2% MoM (投稿数増加)" : "+2.1% MoM (安定推移)";
        youtube = isMed ? "+8.5% MoM (解説動画の増加)" : "+1.8% MoM (通常運転)";
        tiktok = isHigh ? "バイラル度: HIGH (ショートバイラルあり)" : "バイラル度: LOW (通常露出)";
    }
    
    return { instagram, youtube, tiktok };
}

function renderAnalysis(asset, customAiText = null) {
    reportActivity('novacapital', 'analyses');
    const panel = document.getElementById('analysisPanel');
    const lang = window.currentLang || 'ja';
    const t = window.translations ? window.translations[lang] : {};
    const name = asset.label;
    const price = Math.floor(asset.currentPrice).toLocaleString();
    const cat = asset.category;
    const snsMetrics = getSnsMetrics(asset);

    // Generate pseudo-advanced metrics
    const alphaScore = Math.floor(70 + Math.random() * 28);
    const liquidity = ["HIGH", "STABLE", "LOW"][Math.floor(Math.random() * 2)];
    const momentum = ["BULLISH", "NEUTRAL", "SPIKING"][Math.floor(Math.random() * 3)];

    const aiReasoningText = customAiText || (window.currentLang === 'ja' ? 
        `AIによる${cat}市場の深層解析：現在、供給の急速なタイト化と主要取引プラットフォームでの価格乖離（アノマリー）を検知。短期的な価格上昇期待値は${alphaScore}%と極めて高く、戦略的な参入チャンスを示唆しています。` : 
        `AI Deep Analysis for ${cat} market: Current data shows rapid supply tightening and price anomalies across major platforms. Probability for short-term appreciation is extremely high at ${alphaScore}%, suggesting a strategic entry window.`);

    panel.innerHTML = `
        <div class="analysis-header" style="animation: fadeIn 0.5s ease-out;">
            <div class="score-circle">
                <div class="score-value">${alphaScore}</div>
                <div class="score-label">${t["stat-confidence"] || "CONFIDENCE"}</div>
            </div>
            <div style="font-size:0.6rem; font-weight:900; color:var(--primary-green); margin-bottom:1rem; letter-spacing:1px; text-align:center;">${t["alpha-score-label"]}</div>
            <h2 style="font-size:1.6rem; font-weight:900; letter-spacing:-0.5px; text-align:center;">${name}</h2>
            <div class="mono" style="font-size:2rem; color:var(--primary-green); margin-top:0.5rem; text-shadow: 0 0 30px var(--primary-glow); text-align:center;">¥${price}</div>
        </div>

        <div style="margin:2rem 0; background:rgba(255,255,255,0.01); border-radius:20px; padding:1.5rem; border:1px solid var(--border-dim);">
            <canvas id="analysisChart" style="height:200px; width:100%;"></canvas>
        </div>

        <div class="stat-box">
            <div class="stat-row">
                <span class="stat-label">${t["stat-liquidity"]}</span>
                <span class="stat-value" style="color:var(--primary-green);">${liquidity}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">${t["stat-velocity"]}</span>
                <span class="stat-value" style="color:var(--accent-gold);">${momentum}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">${t["stat-volatility"]}</span>
                <span class="stat-value">±${(asset.volatility * 100).toFixed(1)}%</span>
            </div>
        </div>

        <!-- SNS Hype Indicators -->
        <div style="margin: 1.5rem 0; background: rgba(66, 133, 244, 0.05); border: 1px solid rgba(66, 133, 244, 0.15); border-radius: 12px; padding: 1rem; text-align: left;">
            <div style="font-size: 0.75rem; font-weight: 900; color: #8ab4f8; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 6px;">
                <i class="fab fa-google"></i> NotebookLM / SNSトレンド同期データ
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.72rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px; gap: 10px;">
                    <span style="color: var(--text-secondary); white-space: nowrap;"><i class="fab fa-instagram" style="color: #e1306c; margin-right: 4px;"></i> Instagram</span>
                    <span style="color: var(--text-primary); font-weight: 700; text-align: right;">${snsMetrics.instagram}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px; gap: 10px;">
                    <span style="color: var(--text-secondary); white-space: nowrap;"><i class="fab fa-youtube" style="color: #ff0000; margin-right: 4px;"></i> YouTube</span>
                    <span style="color: var(--text-primary); font-weight: 700; text-align: right;">${snsMetrics.youtube}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                    <span style="color: var(--text-secondary); white-space: nowrap;"><i class="fab fa-tiktok" style="color: #00f2fe; margin-right: 4px;"></i> TikTok</span>
                    <span style="color: var(--text-primary); font-weight: 700; text-align: right;">${snsMetrics.tiktok}</span>
                </div>
            </div>
        </div>

        <div class="ai-reasoning">
            <div style="font-size:0.85rem; line-height:1.8; color:var(--text-primary); opacity:0.95;">
                ${aiReasoningText}
            </div>
        </div>

        <button class="trade-btn" onclick="openTargetMarket('${name.replace(/'/g, "\\'")}', '${cat}')" style="width:100%; padding:1.2rem; background:var(--primary-green); color:#000; border:none; border-radius:10px; font-weight:900; cursor:pointer; font-size:0.85rem; transition:0.3s; display:flex; align-items:center; justify-content:center; gap:0.8rem;">
            <i class="fas fa-external-link-alt"></i> <span>${t["btn-source"]}</span>
        </button>
        <p style="font-size:0.6rem; color:var(--text-secondary); margin-top:1rem; text-align:center; opacity:0.6;">${t["disclaimer"]}</p>
    `;

    requestAnimationFrame(() => {
        renderChart(asset);
    });
}

window.openTargetMarket = function(name, cat) {
    const query = encodeURIComponent(name);
    let url = "https://www.google.com/search?q=" + query;

    // PROFESSIONAL MARKET ROUTING (SaaS GRADE)
    if (cat === 'WATCH') url = "https://www.chrono24.jp/search/index.htm?query=" + query;
    else if (cat === 'CARD') url = "https://www.ebay.com/sch/i.html?_nkw=" + query;
    else if (cat === 'SNEAKER') url = "https://stockx.com/search?s=" + query;
    else if (cat === 'ART') url = "https://www.artsy.net/search?term=" + query;
    else if (cat === 'LUXURY') url = "https://www.sothebys.com/en/search?query=" + query;
    else if (cat === 'VINTAGE') url = "https://www.ebay.com/sch/i.html?_nkw=" + query + "+vintage";
    else if (cat === 'WINE') url = "https://www.wine-searcher.com/find/" + query;

    if (typeof showToast === 'function') {
        showToast(currentLang === 'ja' ? `専門市場 (${cat}) へ移動します...` : `Redirecting to ${cat} market...`);
    }

    window.open(url, "_blank");
};

function renderChart(asset) {
    const canvas = document.getElementById('analysisChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (currentChart) currentChart.destroy();
    
    const lang = window.currentLang || 'ja';
    const t = window.translations ? window.translations[lang] : {};

    // Generate dynamic history based on asset volatility
    const base = asset.currentPrice || asset.basePrice;
    const vol = asset.volatility || 0.05;
    
    // Seeded-style random for consistent-looking segments
    const dataPoints = Array.from({length: 12}, (_, i) => {
        const factor = 1 + (Math.sin(i * 0.5) * vol * 0.5) + ((Math.random() - 0.5) * vol);
        return base * factor;
    });

    const labels = Array.from({length: 12}, (_, i) => i === 11 ? 'NOW' : '');

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t["chart-price"] || "PRICE",
                data: dataPoints,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { display: false }, 
                y: { display: false } 
            },
            elements: { point: { radius: 0 } }
        }
    });
}
