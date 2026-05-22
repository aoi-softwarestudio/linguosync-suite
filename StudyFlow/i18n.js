const translations = {
    ja: {
        "header-logo": "STUDYFLOW AI",
        "nav-summary": "要約 & 要点",
        "nav-flashcards": "単語帳",
        "nav-exam": "模擬試験",
        "nav-premium": "プレミアム",
        "btn-dashboard": "プロジェクト画面へ",
        "upload-title": "学習資料をアップロード",
        "upload-desc": "ノート、教科書、PDFをドラッグ＆ドロップ",
        "upload-btn": "ファイルを選択",
        "loading-text": "AIが資料を解析中...",
        "export-btn": "PDFをエクスポート",
        "view-title-summary": "要約 & 要点",
        "view-title-flashcards": "単語帳 (クリックで反転)",
        "view-title-exam": "模擬試験",
        "toast-localization": "ローカライズ完了",
        "alert-processing": "資料を処理しています...",
        "status-target": "解析対象",
        "status-no-headers": "目次となる見出しが見つかりませんでした。テキスト全体を分析します。",
        "status-no-data": "データが見つかりませんでした",
        "question-prompt": "の説明として最も適切なものはどれですか？",
        "feedback-correct": "正解です！",
        "feedback-incorrect": "不正解です。もう一度考えてみましょう。",
        "auth-btn-login": "ログイン / 登録",
        "auth-modal-title-login": "ログイン",
        "auth-modal-title-register": "新規アカウント登録",
        "auth-modal-title-status": "アカウント同期設定",
        "auth-label-username": "ユーザー名",
        "auth-label-password": "パスワード",
        "auth-btn-submit-login": "ログインする",
        "auth-btn-submit-register": "アカウントを作成する",
        "auth-btn-logout": "ログアウト",
        "auth-btn-sync": "今すぐ同期する",
        "auth-status-logged-in": "ログイン中: ",
        "auth-status-last-sync": "最終同期時間: ",
        "auth-error-empty": "すべてのフィールドを入力してください。",
        "auth-toast-success-login": "ログインしました！データを同期しています...",
        "auth-toast-success-register": "アカウントを作成しました！",
        "auth-toast-success-sync": "同期が完了しました！",
        "auth-toast-success-logout": "ログアウトしました。",
        "auth-tab-login": "ログイン",
        "auth-tab-register": "新規登録"
    },
    en: {
        "header-logo": "STUDYFLOW AI",
        "nav-summary": "Summary & Key Points",
        "nav-flashcards": "Flashcards",
        "nav-exam": "Mock Exam",
        "nav-premium": "Premium",
        "btn-dashboard": "Go to Project",
        "upload-title": "Upload Study Material",
        "upload-desc": "Drag & drop notes, textbooks, or PDFs",
        "upload-btn": "Select File",
        "loading-text": "AI is analyzing your notes...",
        "export-btn": "Export to PDF",
        "view-title-summary": "Summary & Key Points",
        "view-title-flashcards": "Flashcards (Click to flip)",
        "view-title-exam": "Mock Exam",
        "toast-localization": "Localization Complete",
        "alert-processing": "Processing document...",
        "status-target": "Analyzing",
        "status-no-headers": "No headers found. Analyzing entire text.",
        "status-no-data": "No data found",
        "question-prompt": "Which of the following best describes",
        "feedback-correct": "Correct!",
        "feedback-incorrect": "Incorrect. Try again.",
        "auth-btn-login": "Login / Register",
        "auth-modal-title-login": "Login",
        "auth-modal-title-register": "Create Account",
        "auth-modal-title-status": "Account Sync Settings",
        "auth-label-username": "Username",
        "auth-label-password": "Password",
        "auth-btn-submit-login": "Sign In",
        "auth-btn-submit-register": "Create Account",
        "auth-btn-logout": "Sign Out",
        "auth-btn-sync": "Sync Now",
        "auth-status-logged-in": "Logged in as: ",
        "auth-status-last-sync": "Last synced: ",
        "auth-error-empty": "Please fill in all fields.",
        "auth-toast-success-login": "Successfully signed in! Syncing data...",
        "auth-toast-success-register": "Account created successfully!",
        "auth-toast-success-sync": "Synchronization complete!",
        "auth-toast-success-logout": "Signed out successfully.",
        "auth-tab-login": "Sign In",
        "auth-tab-register": "Sign Up"
    }
};

let currentLang = localStorage.getItem('studyflow_lang') || 'ja';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('studyflow_lang', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });

    // Update switcher UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Trigger re-render of dynamic content if it exists
    if (typeof renderView === 'function') renderView();
}

// Initial set
window.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});
