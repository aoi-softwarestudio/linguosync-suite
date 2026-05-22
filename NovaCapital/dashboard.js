// Nova Capital - Core Engine (Universal SaaS Edition)

const initialAssets = [
    { id: "WATCH_DAYTONA", label: "Rolex Daytona 126500LN", basePrice: 5850000, volatility: 0.02, category: "WATCH" },
    { id: "WATCH_NAUTILUS", label: "Patek Philippe Nautilus 5711", basePrice: 18400000, volatility: 0.05, category: "WATCH" },
    { id: "SNEAKER_CHICAGO", label: "Air Jordan 1 Chicago (1985)", basePrice: 1250000, volatility: 0.12, category: "SNEAKER" },
    { id: "CRYPTO_BTC", label: "Bitcoin (BTC)", basePrice: 9500000, volatility: 0.15, category: "CRYPTO" }
];

const ASSET_MASTER_LIST = [
    "Rolex Daytona", "Rolex Submariner", "Rolex GMT-Master II", "Rolex Day-Date", "Patek Philippe Nautilus", "Patek Philippe Aquanaut",
    "Audemars Piguet Royal Oak", "Vacheron Constantin Overseas", "Omega Speedmaster", "IWC Portugieser", "Cartier Tank", "Grand Seiko Heritage",
    "Air Jordan 1 Retro High OG", "Air Jordan 4 Retro", "Nike Dunk Low", "Nike SB Dunk High", "Adidas Yeezy Boost 350", "Yeezy Slide",
    "Levi's 501XX (Vintage)", "Hermes Birkin 30", "Hermes Kelly 25", "Chanel Classic Flap", "Louis Vuitton Keepall", "Supreme Box Logo Tee",
    "Porsche 911 GT3 RS", "Ferrari F40", "Lamborghini Aventador", "Nissan Skyline GT-R V-Spec II", "Toyota Supra RZ", "Honda NSX-R",
    "Pokemon Charizard 1st Edition", "Pikachu Illustrator Promo", "MTG Black Lotus", "Yu-Gi-Oh! Blue-Eyes White Dragon",
    "Lego Star Wars UCS Falcon", "Be@rbrick 1000%", "Metal Build Gundam", "Hot Wheels Treasure Hunt",
    "Yamazaki 18 Years", "Hibiki 21 Years", "Hakushu 25 Years", "Macallan 18 Year Sherry Oak", "Don Julio 1942",
    "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Gold Spot (XAU)", "Silver Spot (XAG)"
];

window.livePrices = initialAssets.map(a => ({ ...a, currentPrice: a.basePrice, change: 0 }));
window.alerts = [
    { id: 1, assetId: "WATCH_DAYTONA", tag: "MARKET_SYNC", title: "Global Price Convergence", meta: "Tokyo and London prices aligned.", baseScore: 88, intensity: "MEDIUM" }
];
window.activeAssetId = null;

let globalSentiment = 72;

function initDashboard() {
    loadUserAssets();
    renderAlerts();
    renderHeatmap();
    renderTicker();
    renderSentiment();
    renderVolumeLeaders();
    initSuggestions();
    window.renderPremiumStatus();
    setInterval(updatePrices, 3000);
    setInterval(updateClock, 1000);
}

function loadUserAssets() {
    const saved = localStorage.getItem('novacapital_user_assets');
    if (saved) {
        const userAssets = JSON.parse(saved);
        userAssets.forEach(asset => {
            if (!window.livePrices.find(a => a.id === asset.id)) {
                window.livePrices.push({ ...asset, currentPrice: asset.basePrice, change: 0 });
            }
        });
    }
}

function initSuggestions() {
    const input = document.getElementById('newAssetName');
    const suggestionBox = document.getElementById('searchSuggestions');
    if (!input || !suggestionBox) return;

    input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length < 1) { suggestionBox.style.display = 'none'; return; }

        let filtered = ASSET_MASTER_LIST.filter(item => 
            item.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 7);

        let html = filtered.map(item => `
            <div class="suggestion-item" onclick="selectSuggestion('${item}')">
                <i class="fas fa-${getIconForAsset(item)}"></i>
                <span>${item}</span>
            </div>
        `).join('');

        html += `
            <div class="suggestion-item ai-search-option" onclick="selectSuggestion('${val}')">
                <i class="fas fa-robot" style="color: var(--primary-green);"></i>
                <span style="font-weight: 800;">AI_SEARCH_ON_WEB: "${val}"</span>
            </div>
        `;

        suggestionBox.innerHTML = html;
        suggestionBox.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionBox.contains(e.target)) suggestionBox.style.display = 'none';
    });
}

function getIconForAsset(name) {
    const n = name.toLowerCase();
    if (n.includes("rolex") || n.includes("watch") || n.includes("patek")) return "clock";
    if (n.includes("jordan") || n.includes("nike") || n.includes("dunk") || n.includes("yeezy")) return "shoe-prints";
    if (n.includes("car") || n.includes("porsche") || n.includes("ferrari")) return "car";
    if (n.includes("yamazaki") || n.includes("hibiki") || n.includes("wine") || n.includes("whisky")) return "wine-bottle";
    if (n.includes("btc") || n.includes("eth") || n.includes("gold")) return "coins";
    if (n.includes("pokemon") || n.includes("card") || n.includes("lego") || n.includes("toy")) return "box-open";
    return "search";
}

window.selectSuggestion = function(name) {
    const input = document.getElementById('newAssetName');
    const suggestionBox = document.getElementById('searchSuggestions');
    if (input) input.value = name;
    if (suggestionBox) suggestionBox.style.display = 'none';
};

window.openAddAssetModal = function() { 
    const modal = document.getElementById('addAssetModal');
    if (!modal) return;
    modal.style.display = 'flex'; 
    modal.offsetHeight; // Force reflow
    modal.classList.add('open');
};
window.closeAddAssetModal = function() { 
    const modal = document.getElementById('addAssetModal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => {
        if (!modal.classList.contains('open')) {
            modal.style.display = 'none';
        }
    }, 300);
};

function renderAlerts() {
    const list = document.getElementById('alertsList');
    if (!list) return;
    list.innerHTML = window.alerts.map(a => `
        <div class="alert-card ${a.intensity ? a.intensity.toLowerCase() : ''} ${window.activeAssetId === a.assetId ? 'active' : ''}" data-id="${a.id}" data-asset-id="${a.assetId}" onclick="window.triggerAnalysis('${a.assetId}')">
            <div class="alert-tag mono">${a.tag}</div>
            <div class="alert-title">${a.title}</div>
            <div class="alert-meta">${a.meta}</div>
        </div>
    `).join('');
}

window.submitNewAsset = async function(e) {
    e.preventDefault();
    const name = document.getElementById('newAssetName').value;
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = `<i class="fas fa-brain fa-spin"></i> ANALYZING_GLOBAL_MARKET_DATA...`;
    submitBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 2500));

    let price = 50000;
    let cat = "UNCLASSIFIED";
    let vol = 0.10;
    const n = name.toLowerCase();

    if (n.includes("rolex")) { price = 4200000; cat = "WATCH"; vol = 0.03; }
    else if (n.includes("patek") || n.includes("audemars")) { price = 15000000; cat = "WATCH"; vol = 0.05; }
    else if (n.includes("ferrari") || n.includes("f40")) { price = 450000000; cat = "CAR"; vol = 0.02; }
    else if (n.includes("porsche") || n.includes("911")) { price = 55000000; cat = "CAR"; vol = 0.04; }
    else if (n.includes("gt-r") || n.includes("skyline")) { price = 25000000; cat = "CAR"; vol = 0.08; }
    else if (n.includes("jordan 1")) { price = 85000; cat = "SNEAKER"; vol = 0.12; }
    else if (n.includes("dunk") || n.includes("panda")) { price = 24000; cat = "SNEAKER"; vol = 0.20; }
    else if (n.includes("pokemon") || n.includes("card")) { price = 1500000; cat = "CARD"; vol = 0.15; }
    else if (n.includes("lotus") || n.includes("black lotus")) { price = 60000000; cat = "CARD"; vol = 0.01; }
    else if (n.includes("yamazaki") || n.includes("hibiki")) { price = 350000; cat = "SPIRITS"; vol = 0.05; }
    else if (n.includes("btc") || n.includes("bitcoin")) { price = 9700000; cat = "CRYPTO"; vol = 0.18; }
    else if (n.includes("eth") || n.includes("ethereum")) { price = 450000; cat = "CRYPTO"; vol = 0.22; }
    else if (n.includes("gold") || n.includes("xau")) { price = 11200; cat = "COMMODITY"; vol = 0.02; }
    
    if (cat === "UNCLASSIFIED") {
        if (n.includes("vintage")) price = 120000;
        if (n.includes("rare")) price *= 5;
        if (n.includes("limited")) price *= 3;
    }

    const newAsset = {
        id: "UNI_" + Date.now(),
        label: name,
        basePrice: price,
        currentPrice: price + (Math.random() - 0.5) * price * 0.03,
        volatility: vol,
        category: cat,
        change: (Math.random() - 0.5) * 6
    };

    window.livePrices.unshift(newAsset);
    const saved = JSON.parse(localStorage.getItem('novacapital_user_assets') || '[]');
    saved.push(newAsset);
    localStorage.setItem('novacapital_user_assets', JSON.stringify(saved));

    renderHeatmap();
    renderTicker();
    
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    window.showToast(`UNIVERSAL_FETCH_COMPLETE: ${name}`, 'success');
    closeAddAssetModal();
    document.getElementById('addAssetForm').reset();
};

function updateClock() {
    const el = document.getElementById('currentTime');
    if (el) el.innerText = new Date().toISOString().split('T')[1].split('.')[0] + " UTC";
    const elUpdate = document.getElementById('lastUpdated');
    if (elUpdate) elUpdate.innerText = new Date().toLocaleTimeString('ja-JP');
}

function updatePrices() {
    let totalMovement = 0;
    window.livePrices = window.livePrices.map(item => {
        const movement = (Math.random() - 0.5) * item.volatility * 0.03;
        totalMovement += movement;
        const newPrice = item.currentPrice * (1 + movement);
        return { ...item, currentPrice: newPrice, change: ((newPrice - item.basePrice) / item.basePrice) * 100 };
    });
    globalSentiment = Math.max(5, Math.min(95, globalSentiment + (totalMovement * 200)));
    if (Math.random() > 0.88) discoverNewAlert();
    renderTicker(); renderHeatmap(); renderSentiment(); renderVolumeLeaders();
}

function renderVolumeLeaders() {
    const el = document.getElementById('volumeLeaders');
    if (!el) return;
    const t = window.translations[window.currentLang];
    const sorted = [...window.livePrices].sort((a, b) => b.basePrice - a.basePrice);
    el.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; color:var(--text-primary);">
            <thead style="text-align:left; color:var(--text-secondary); font-size:0.65rem; text-transform:uppercase; letter-spacing:1px;">
                <tr>
                    <th style="padding:1rem; border-bottom:1px solid var(--border-dim);">${t["table-asset"]}</th>
                    <th style="padding:1rem; border-bottom:1px solid var(--border-dim);">${t["table-price"]}</th>
                    <th style="padding:1rem; border-bottom:1px solid var(--border-dim);">${t["table-chg"]}</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.slice(0, 8).map(a => `
                    <tr style="border-bottom:1px solid var(--border-dim); transition:0.2s; cursor:pointer;" onclick="window.triggerAnalysis('${a.id}')">
                        <td style="padding:1rem; font-weight:700;">${a.label}</td>
                        <td class="mono" style="padding:1rem;">¥${Math.floor(a.currentPrice).toLocaleString()}</td>
                        <td class="mono" style="padding:1rem; color:${a.change >= 0 ? 'var(--primary-green)' : '#f43f5e'}; font-weight:700;">
                            ${a.change >= 0 ? '+' : ''}${a.change.toFixed(2)}%
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function discoverNewAlert() {
    const randomAsset = window.livePrices[Math.floor(Math.random() * window.livePrices.length)];
    const types = ["PRICE_ANOMALY", "SENTIMENT_SPIKE", "SUPPLY_DRAIN"];
    const type = types[Math.floor(Math.random() * types.length)];
    const newAlert = {
        id: Date.now(), assetId: randomAsset.id, tag: type,
        title: randomAsset.label.split(' ')[0] + " " + type.split('_')[0],
        meta: `AI detected ${type.toLowerCase().replace('_', ' ')} on ${randomAsset.category} market.`,
        baseScore: Math.floor(75 + Math.random() * 24), intensity: Math.random() > 0.5 ? "HIGH" : "MEDIUM"
    };
    window.alerts.unshift(newAlert);
    if (window.alerts.length > 8) window.alerts.pop();
    renderAlerts();
    if (typeof showToast === 'function') showToast(`NEW_SIGNAL: ${randomAsset.label}`);
}

function renderHeatmap() {
    const el = document.getElementById('marketHeatmap');
    if (!el) return;
    el.innerHTML = window.livePrices.map(a => `
        <div class="heat-cell ${window.activeAssetId === a.id ? 'active' : ''}" data-id="${a.id}" onclick="window.triggerAnalysis('${a.id}')">
            <div class="cell-label">${a.label}</div>
            <div class="cell-value mono">¥${Math.floor(a.currentPrice).toLocaleString()}</div>
            <div class="cell-change ${a.change >= 0 ? 'up' : 'down'} mono">
                <i class="fas fa-caret-${a.change >= 0 ? 'up' : 'down'}"></i>
                ${a.change >= 0 ? '+' : ''}${a.change.toFixed(2)}%
            </div>
        </div>
    `).join('');
}

function renderSentiment() {
    const el = document.getElementById('marketSentiment');
    if (!el) return;
    const t = window.translations[window.currentLang];
    let sentimentText = t["sentiment-neutral"];
    let color = "#94a3b8";
    if (globalSentiment > 80) { sentimentText = t["sentiment-extreme-greed"]; color = "#10b981"; }
    else if (globalSentiment > 60) { sentimentText = t["sentiment-greed"]; color = "#10b981"; }
    else if (globalSentiment < 20) { sentimentText = t["sentiment-extreme-fear"]; color = "#f43f5e"; }
    else if (globalSentiment < 40) { sentimentText = t["sentiment-fear"]; color = "#f43f5e"; }
    el.innerHTML = `
        <div style="font-size:0.6rem; font-weight:900; color:var(--text-secondary); margin-bottom:1rem; text-transform:uppercase; letter-spacing:1px;">${t["sentiment-label"]}</div>
        <div style="display:flex; align-items:flex-end; gap:0.8rem;">
            <div class="mono" style="font-size:2rem; font-weight:900; color:${color}; line-height:1;">${Math.floor(globalSentiment)}</div>
            <div style="font-size:0.75rem; font-weight:800; padding-bottom:0.2rem; color:var(--text-primary); opacity:0.8;">${sentimentText}</div>
        </div>
        <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); margin-top:1.2rem; border-radius:10px; position:relative; overflow:hidden;">
            <div style="position:absolute; left:0; top:0; height:100%; width:${globalSentiment}%; background:${color}; transition:0.8s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 15px ${color};"></div>
        </div>
    `;
}

function renderTicker() {
    const el = document.getElementById('tickerContent');
    if (!el) return;
    const tickerItems = window.livePrices.map(a => `
        <span class="ticker-item mono">
            ${a.label}: <span class="${a.change >= 0 ? 'up' : 'down'}">
                ¥${Math.floor(a.currentPrice).toLocaleString()} 
                (${a.change >= 0 ? '+' : ''}${a.change.toFixed(2)}%)
            </span>
        </span>
    `).join('');
    el.innerHTML = tickerItems + tickerItems;
}

window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 500); }, 3000);
};

window.triggerAnalysis = function(assetId) {
    window.activeAssetId = assetId;
    
    // Highlight heat cells
    document.querySelectorAll('.heat-cell').forEach(c => {
        c.classList.toggle('active', c.dataset.id === assetId);
    });

    // Highlight alert cards
    document.querySelectorAll('.alert-card').forEach(c => {
        c.classList.toggle('active', c.dataset.assetId === assetId);
    });

    if (window.renderAnalysis) window.renderAnalysis(assetId);
    const panel = document.querySelector('.panel-analysis');
    if (panel) panel.scrollTop = 0;
};

window.renderPremiumStatus = function() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    
    // Remove existing premium elements if any
    const existingBadge = document.querySelector('.nova-premium-badge');
    const existingUpgradeBtn = document.querySelector('.nova-upgrade-btn');
    if (existingBadge) existingBadge.remove();
    if (existingUpgradeBtn) existingUpgradeBtn.remove();
    
    if (typeof SuiteGatekeeper === 'undefined') return;
    
    const isPrem = SuiteGatekeeper.isPremium();
    const lang = window.currentLang || 'ja';
    
    if (isPrem) {
        // Render Premium Badge
        const badge = document.createElement('div');
        badge.className = 'nova-premium-badge';
        badge.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))';
        badge.style.border = '1px solid var(--accent-gold)';
        badge.style.color = 'var(--accent-gold)';
        badge.style.fontSize = '0.75rem';
        badge.style.fontWeight = '900';
        badge.style.padding = '6px 14px';
        badge.style.borderRadius = '8px';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '6px';
        badge.style.cursor = 'pointer';
        badge.style.textShadow = '0 0 4px rgba(251, 191, 36, 0.2)';
        badge.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.1)';
        badge.innerHTML = lang === 'ja' ? '<i class="fas fa-crown"></i> プレミアム有効' : '<i class="fas fa-crown"></i> PREMIUM ACTIVE';
        badge.onclick = () => SuiteGatekeeper.openSettings();
        
        // Insert before language switcher
        const langBtn = headerRight.querySelector('.lang-switcher');
        if (langBtn) {
            headerRight.insertBefore(badge, langBtn);
        } else {
            headerRight.appendChild(badge);
        }
    } else {
        const credits = SuiteGatekeeper.getCredits();
        
        // Render Upgrade Button
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'nova-upgrade-btn';
        upgradeBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)';
        upgradeBtn.style.border = 'none';
        upgradeBtn.style.color = '#fff';
        upgradeBtn.style.fontSize = '0.75rem';
        upgradeBtn.style.fontWeight = '800';
        upgradeBtn.style.padding = '6px 14px';
        upgradeBtn.style.borderRadius = '8px';
        upgradeBtn.style.cursor = 'pointer';
        upgradeBtn.style.display = 'flex';
        upgradeBtn.style.alignItems = 'center';
        upgradeBtn.style.gap = '6px';
        upgradeBtn.style.boxShadow = '0 0 12px rgba(139, 92, 246, 0.3)';
        upgradeBtn.style.transition = 'all 0.2s';
        upgradeBtn.innerHTML = lang === 'ja' ? `<i class="fas fa-gem"></i> プロ版 (残り ${credits} 回)` : `<i class="fas fa-gem"></i> PRO (Remaining ${credits})`;
        
        upgradeBtn.onmouseover = () => {
            upgradeBtn.style.transform = 'translateY(-1px)';
            upgradeBtn.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.5)';
        };
        upgradeBtn.onmouseout = () => {
            upgradeBtn.style.transform = 'none';
            upgradeBtn.style.boxShadow = '0 0 12px rgba(139, 92, 246, 0.3)';
        };
        upgradeBtn.onclick = () => SuiteGatekeeper.openCheckout();
        
        // Insert before language switcher
        const langBtn = headerRight.querySelector('.lang-switcher');
        if (langBtn) {
            headerRight.insertBefore(upgradeBtn, langBtn);
        } else {
            headerRight.appendChild(upgradeBtn);
        }
    }

    // Render Sidebar Banner
    const panelSide = document.querySelector('.panel-side');
    if (panelSide) {
        // Remove existing banner if any
        const existingBanner = panelSide.querySelector('.nova-premium-banner');
        if (existingBanner) existingBanner.remove();
        
        if (!isPrem) {
            const banner = document.createElement('div');
            banner.className = 'nova-premium-banner';
            banner.style.margin = 'auto 1rem 1rem 1rem';
            banner.style.padding = '1rem';
            banner.style.borderRadius = '12px';
            banner.style.transition = '0.3s';
            banner.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))';
            banner.style.border = '1px solid rgba(139, 92, 246, 0.2)';
            
            const credits = SuiteGatekeeper.getCredits();
            banner.innerHTML = `
                <div style="font-size: 0.8rem; font-weight: 900; color: #a78bfa; display: flex; align-items: center; gap: 6px; margin-bottom: 0.3rem;">
                    <i class="fas fa-gem"></i> ${lang === 'ja' ? 'フリープラン' : 'FREE PLAN'}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.6rem;">
                    ${lang === 'ja' ? `AI詳細分析の残り枠: ${credits} クレジット` : `Remaining AI analysis: ${credits} credits`}
                </div>
                <button style="width: 100%; padding: 6px; font-size: 0.7rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #fff; cursor: pointer; font-weight: 800;" onclick="SuiteGatekeeper.openCheckout()">
                    ${lang === 'ja' ? 'プレミアムにアップグレード' : 'Upgrade to Premium'}
                </button>
            `;
            panelSide.appendChild(banner);
        }
    }
};

window.onload = initDashboard;
