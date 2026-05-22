window.translations = {
    ja: {
        "brand-name": "NOVA CAPITAL",
        "market-status": "市場状況: 取引中",
        "nav-alerts": "アルファ・アラート",
        "nav-heatmap": "市場ヒートマップ",
        "nav-analysis": "AI詳細分析",
        "stat-category": "カテゴリー",
        "stat-liquidity": "流動性",
        "stat-volatility": "ボラティリティ (30日)",
        "stat-marketcap": "推定時価総額",
        "liquidity-high": "高",
        "ai-processing": "AIモデル実行中...",
        "ai-summary-title": "AI分析インテリジェンス",
        "alpha-score-label": "ノヴァ・アルファスコア",
        "btn-source": "外部市場（ソース）を確認",
        "disclaimer": "*これは投資助言ではありません。自己責任で分析結果を活用してください。",
        "label-updated": "最終更新",
        "market-pulse-title": "マーケット・パルス",
        "market-pulse-desc": "オルタナティブ資産のリアルタイム価格変動",
        "volume-leaders": "出来高ランキング (24H)",
        "sentiment-label": "グローバル・センチメント",
        "sentiment-extreme-greed": "極度の強気 (EXTREME_GREED)",
        "sentiment-greed": "強気 (GREED)",
        "sentiment-neutral": "中立 (NEUTRAL)",
        "sentiment-fear": "弱気 (FEAR)",
        "sentiment-extreme-fear": "極度の弱気 (EXTREME_FEAR)",
        "chart-price": "市場価格",
        "chart-projection": "AI予測",
        "header-alerts": "アルファ・シグナル",
        "header-analysis": "資産詳細アナリティクス",
        "stat-velocity": "市場モメンタム",
        "stat-velocity-extreme": "非常に高い",
        "alert-price-anomaly": "価格乖離 (アノマリー)",
        "alert-sentiment-spike": "関心の急増 (モメンタム)",
        "alert-supply-drain": "供給タイト化 (希少性)",
        "table-asset": "銘柄/資産",
        "table-price": "市場価格",
        "table-volume": "24H 出来高",
        "table-chg": "騰落率",
        "stat-confidence": "AI確信度",
        "stat-liquidity-idx": "流動性指数",
        "stat-volatility-idx": "変動性リスク",
        "stat-liquidity": "流動性",
        "stat-volatility": "ボラティリティ (30D)",
        "label-confidence-high": "高確信",
        "label-liquidity-stable": "極めて安定",
        "placeholder-analysis": "分析を開始するには、アセットを選択してください",
        "btn-add-asset": "資産を追加",
        "modal-title-add": "新規資産登録",
        "label-asset-name": "資産名",
        "btn-register": "AI監視リストに登録"
    },
    en: {
        "brand-name": "NOVA CAPITAL",
        "market-status": "MARKET_STATUS: OPEN",
        "nav-alerts": "ALPHA ALERTS",
        "nav-heatmap": "MARKET HEATMAP",
        "nav-analysis": "AI ANALYSIS",
        "stat-category": "Category",
        "stat-liquidity": "Liquidity",
        "stat-volatility": "Volatility (30D)",
        "stat-velocity": "Market Momentum",
        "stat-marketcap": "Market Cap (Est.)",
        "liquidity-high": "HIGH",
        "ai-processing": "RUNNING_AI_MODELS...",
        "ai-summary-title": "AI ANALYSIS INTELLIGENCE",
        "alpha-score-label": "NOVA_ALPHA_SCORE",
        "btn-source": "GO TO EXTERNAL SOURCE",
        "disclaimer": "*This is not investment advice. Use data at your own risk.",
        "label-updated": "UPDATED",
        "market-pulse-title": "Market Pulse",
        "market-pulse-desc": "Real-time aggregated price movement across alternative asset classes.",
        "volume-leaders": "Volume Leaders (24H)",
        "sentiment-label": "GLOBAL_SENTIMENT",
        "sentiment-extreme-greed": "EXTREME_GREED",
        "sentiment-greed": "GREED",
        "sentiment-neutral": "NEUTRAL",
        "sentiment-fear": "FEAR",
        "sentiment-extreme-fear": "EXTREME_FEAR",
        "chart-price": "Market Price",
        "chart-projection": "AI Projection",
        "header-alerts": "ALPHA ALERTS",
        "header-analysis": "ASSET ANALYSIS",
        "stat-velocity-extreme": "EXTREME",
        "alert-price-anomaly": "PRICE_ANOMALY",
        "alert-sentiment-spike": "SENTIMENT_SPIKE",
        "alert-supply-drain": "SUPPLY_DRAIN",
        "table-asset": "ASSET",
        "table-price": "PRICE",
        "table-volume": "VOLUME (24H)",
        "table-chg": "CHG",
        "stat-confidence": "AI Confidence",
        "stat-liquidity-idx": "Liquidity Index",
        "stat-volatility-idx": "Volatility Risk",
        "label-confidence-high": "HIGH_CONFIDENCE",
        "label-liquidity-stable": "ULTRA_STABLE",
        "placeholder-analysis": "Select an asset to begin AI intelligence analysis",
        "btn-add-asset": "Add Asset",
        "modal-title-add": "New Asset Registration",
        "label-asset-name": "Asset Name",
        "btn-register": "Register to AI Monitor"
    }
};

window.currentLang = localStorage.getItem('novacapital_lang') || 'ja';

function setLanguage(lang) {
    window.currentLang = lang;
    localStorage.setItem('novacapital_lang', lang);
    
    // Update all static data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (window.translations[lang] && window.translations[lang][key]) {
            el.innerText = window.translations[lang][key];
        }
    });

    // Update switcher buttons UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Re-render Sentiment Meter
    if (typeof renderSentiment === 'function') {
        renderSentiment();
    }

    // IMPORTANT: Re-render the active Analysis Panel if it exists
    if (window.activeAssetId && typeof window.triggerAnalysis === 'function') {
        window.triggerAnalysis(window.activeAssetId);
    }

    // Re-render premium status if defined
    if (typeof window.renderPremiumStatus === 'function') {
        window.renderPremiumStatus();
    }
}

// Global initialization
window.addEventListener('load', () => {
    setLanguage(currentLang);
});
