const translations = {
    ja: {
        "brand-name": "LINGUOSYNC STUDIO",
        "btn-export": "最終書き出し",
        "panel-languages": "対象言語",
        "btn-add-lang": "+ 言語を追加",
        "label-original": "ORIGINAL",
        "label-target": "TARGET",
        "label-lip-sync": "LIP-SYNC: ACTIVE",
        "panel-ai-params": "AI パラメータ",
        "label-voice-accuracy": "声質クローン精度 (Voice Accuracy)",
        "label-emotion": "感情の継承 (Emotion Preservation)",
        "label-global-stats": "グローバル配信予測 (ダミーデータ)",
        "label-reach": "想定リーチ増加数",
        "label-ad-rev": "想定広告収益",
        "toast-localization": "ローカライズ完了",
        "btn-synergy": "全事業シナジーを実行",
        "btn-report": "詳細レポートを表示",
        "upload-title": "新しいプロジェクトを開始",
        "upload-desc": "メディアファイルをクリックまたはドラッグ＆ドロップしてください。\nAIが自動的にコンテンツを分析しローカライズします。",
        "script-title": " 翻訳スクリプト",
        "badge-ai-refined": "AI 最適化済",
        "modal-title": "ターゲット言語を選択",
        "playback-ready": "プレビュー準備完了",
        "playback-playing": "再生中：ターゲットプレビュー",
        "playback-paused": "プレビュー一時停止",
        "js-transcribing": "AIが元の動画を文字起こし中...<br>1分ほどお待ちください...",
        "js-translating": "新しい言語に翻訳中...<br>少々お待ちください...",
        "js-rendering": "動画をサーバーでエンコード中... しばらくお待ちください。"
    },
    en: {
        "brand-name": "LINGUOSYNC STUDIO",
        "btn-export": "Final Export",
        "panel-languages": "Target Languages",
        "btn-add-lang": "+ Add Language",
        "label-original": "ORIGINAL",
        "label-target": "TARGET",
        "label-lip-sync": "LIP-SYNC: ACTIVE",
        "panel-ai-params": "AI Parameters",
        "label-voice-accuracy": "Voice Matching Accuracy",
        "label-emotion": "Emotion Preservation",
        "label-global-stats": "GLOBAL DISTRIBUTION STATS",
        "label-reach": "Potential Reach",
        "label-ad-rev": "Est. Ad Rev",
        "toast-localization": "Localization Complete",
        "btn-synergy": "Execute All Synergies",
        "btn-report": "Show Detailed Report",
        "upload-title": "Start New Project",
        "upload-desc": "Click or drag and drop your media file here.\nAI will automatically analyze and localize your content.",
        "script-title": " Translation Script",
        "badge-ai-refined": "AI REFINED",
        "modal-title": "Select Target Language",
        "playback-ready": "PREVIEW READY",
        "playback-playing": "PLAYING: TARGET PREVIEW",
        "playback-paused": "PREVIEW PAUSED",
        "js-transcribing": "AI is transcribing your video...<br>This may take a minute...",
        "js-translating": "Translating to new language...<br>Please wait...",
        "js-rendering": "Rendering video on server... This may take a while."
    }
};

let currentLang = localStorage.getItem('linguosync_lang') || 'ja';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('linguosync_lang', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Update switcher UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Initial set
window.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});
