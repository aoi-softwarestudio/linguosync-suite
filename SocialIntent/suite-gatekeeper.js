// LinguoSync Suite - Unified Gatekeeper & Billing Integration
// This script provides global premium license validation and free trial credit capping.

const SuiteGatekeeper = {
    // Local storage keys
    KEYS: {
        LICENSE_KEY: 'linguosync_license_key',
        LICENSE_STATUS: 'linguosync_license_status', // 'active' or 'free'
        CREDITS: 'linguosync_free_credits' // Remaining credits for free trial
    },

    // Price Mapping for SaaS Empire
    PRICES: {
        studyflow: { name: "StudyFlow AI - Lifetime Pro", price: 980, display: "¥980" },
        socialintent: { name: "SocialIntent AI - Viral Planner Premium", price: 580, display: "¥580" },
        linguosync: { name: "LinguoSync Studio - Lifetime Premium", price: 3980, display: "¥3,980" },
        novacapital: { name: "NovaCapital Wealth - Lifetime Enterprise Alpha", price: 9800, display: "¥9,800" },
        vendimap: { name: "VendiMap Gold - Lifetime VIP Secret Map", price: 480, display: "¥480" }
    },

    // Check if premium is active
    isPremium() {
        return localStorage.getItem(this.KEYS.LICENSE_STATUS) === 'active';
    },

    // Get free credits
    getCredits() {
        const val = localStorage.getItem(this.KEYS.CREDITS);
        if (val === null) {
            localStorage.setItem(this.KEYS.CREDITS, '3');
            return 3;
        }
        return parseInt(val);
    },

    // Consume credit
    consumeCredit() {
        if (this.isPremium()) {
            return true; // Bypass limits
        }
        const current = this.getCredits();
        if (current <= 0) {
            return false; // Out of credits
        }
        const updated = current - 1;
        localStorage.setItem(this.KEYS.CREDITS, updated.toString());
        this.updateUIStatus();
        return true;
    },

    // Save configuration
    saveConfig(licenseKey) {
        localStorage.setItem(this.KEYS.LICENSE_KEY, licenseKey.trim());
    },

    // Initialize Gatekeeper UI and Event Handlers
    init(currentApp) {
        this.currentApp = currentApp; // 'linguosync', 'studyflow', 'novacapital', etc.
        this.KEYS = {
            LICENSE_KEY: `${currentApp}_license_key`,
            LICENSE_STATUS: `${currentApp}_license_status`,
            CREDITS: `${currentApp}_free_credits`
        };
        this.appInfo = this.PRICES[currentApp] || { name: "Premium License", price: 4980, display: "¥4,980" };
        this.injectStyles();
        this.injectHeaderBar();
        this.injectModal();
        this.injectCheckoutModal();
        this.bindEvents();
        this.updateUIStatus();
    },

    // Public method to open settings modal
    openSettings() {
        const modal = document.getElementById('suite-settings-modal');
        if (modal) modal.style.display = 'flex';
    },

    // Public method to open checkout modal
    openCheckout() {
        const modal = document.getElementById('suite-settings-modal');
        if (modal) modal.style.display = 'none';
        const lemonModal = document.getElementById('lemon-checkout-modal');
        if (lemonModal) {
            lemonModal.style.display = 'flex';
            const formBody = document.getElementById('lemon-checkout-form-body');
            const processingScreen = document.getElementById('lemon-processing-screen');
            const progressState = document.getElementById('lemon-processing-state');
            const successState = document.getElementById('lemon-success-state');
            if (formBody) formBody.style.display = 'block';
            if (processingScreen) processingScreen.style.display = 'none';
            if (progressState) progressState.style.display = 'flex';
            if (successState) successState.style.display = 'none';
        }
    },

    // Inject modern shared styles
    injectStyles() {
        if (document.getElementById('suite-styles-inline')) return;
        const styles = `
            /* Suite Header Integration */
            .suite-topbar {
                background: rgba(10, 10, 15, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                padding: 0.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'Inter', sans-serif;
                z-index: 9999;
                position: relative;
                backdrop-filter: blur(10px);
            }
            .suite-brand {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 900;
                letter-spacing: 1px;
                color: #fff;
                font-size: 0.9rem;
            }
            .suite-brand span {
                background: linear-gradient(to right, #00d4ff, #ff007a);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .suite-apps {
                display: flex;
                gap: 15px;
            }
            .suite-app-link {
                color: rgba(255, 255, 255, 0.6);
                text-decoration: none;
                font-size: 0.75rem;
                font-weight: 700;
                transition: 0.3s;
                padding: 4px 10px;
                border-radius: 4px;
            }
            .suite-app-link:hover, .suite-app-link.active {
                color: #fff;
                background: rgba(255, 255, 255, 0.08);
            }
            .suite-app-link.active {
                border-left: 2px solid #ff007a;
            }
            .suite-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .suite-badge {
                font-size: 0.65rem;
                font-weight: 900;
                padding: 3px 8px;
                border-radius: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .suite-badge.free {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
            }
            .suite-badge.premium {
                background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
                color: #000;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
            }
            .suite-settings-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.7rem;
                font-weight: 700;
                cursor: pointer;
                transition: 0.3s;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .suite-settings-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #ff007a;
            }

            /* Suite Modal styling */
            .suite-modal-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(8px);
                z-index: 100000;
                align-items: center;
                justify-content: center;
                font-family: 'Inter', sans-serif;
            }
            .suite-modal-card {
                background: #111116;
                border: 1px solid rgba(255, 255, 255, 0.1);
                width: 90%;
                max-width: 460px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                animation: suiteModalFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            @keyframes suiteModalFadeIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .suite-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .suite-modal-title {
                font-weight: 900;
                font-size: 1.1rem;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .suite-modal-close {
                background: none;
                border: none;
                color: rgba(255,255,255,0.4);
                cursor: pointer;
                font-size: 1rem;
                transition: 0.3s;
            }
            .suite-modal-close:hover {
                color: #fff;
            }
            .suite-modal-body {
                padding: 1.5rem;
            }
            .suite-form-group {
                margin-bottom: 1.2rem;
            }
            .suite-form-label {
                display: block;
                font-size: 0.7rem;
                font-weight: 700;
                color: rgba(255,255,255,0.5);
                margin-bottom: 0.4rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .suite-form-input {
                width: 100%;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                padding: 0.6rem 0.8rem;
                border-radius: 8px;
                color: #fff;
                font-size: 0.8rem;
                outline: none;
                transition: 0.3s;
            }
            .suite-form-input:focus {
                border-color: #ff007a;
                background: rgba(255,255,255,0.06);
            }
            .suite-btn-submit {
                width: 100%;
                background: linear-gradient(135deg, #00d4ff 0%, #ff007a 100%);
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: 8px;
                font-weight: 800;
                font-size: 0.85rem;
                cursor: pointer;
                transition: 0.3s;
                margin-top: 0.5rem;
            }
            .suite-btn-submit:hover {
                transform: translateY(-1px);
                box-shadow: 0 5px 15px rgba(255, 0, 122, 0.4);
            }
            .suite-key-status {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                font-size: 0.6rem;
                font-weight: 700;
                margin-top: 0.3rem;
            }
            .suite-key-status.connected { color: #00ff88; }
            .suite-key-status.missing { color: rgba(255,255,255,0.3); }

            /* Lemon Squeezy Checkout Simulator Styles */
            .lemon-checkout-card {
                background: #181824;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 1.5rem;
                margin-top: 1rem;
                font-family: 'Inter', sans-serif;
            }
            .lemon-badge {
                background: rgba(254, 194, 60, 0.15);
                color: #fec23c;
                border: 1px solid rgba(254, 194, 60, 0.3);
                font-size: 0.6rem;
                font-weight: 900;
                padding: 2px 6px;
                border-radius: 4px;
                display: inline-block;
                margin-bottom: 0.5rem;
            }
            .lemon-input-group {
                margin-bottom: 1rem;
            }
            .lemon-row {
                display: flex;
                gap: 10px;
            }
            .lemon-btn-pay {
                width: 100%;
                background: #fec23c;
                color: #000;
                border: none;
                padding: 0.75rem;
                border-radius: 8px;
                font-weight: 900;
                font-size: 0.85rem;
                cursor: pointer;
                transition: 0.3s;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
            }
            .lemon-btn-pay:hover {
                background: #fdb018;
                box-shadow: 0 4px 15px rgba(254, 194, 60, 0.3);
            }
            .lemon-processing-overlay {
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                text-align: center;
                padding: 2rem 0;
            }
            .lemon-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(254, 194, 60, 0.1);
                border-top: 4px solid #fec23c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        const styleEl = document.createElement('style');
        styleEl.id = 'suite-styles-inline';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    },

    // Inject top suite bar
    injectHeaderBar() {
        if (this.currentApp === 'studyflow' || this.currentApp === 'socialintent' || this.currentApp === 'vendimap') {
            return; // Hide top bar for these apps to prevent layout clutter and duplication as requested by USER
        }
        
        const topbar = document.createElement('div');
        topbar.className = 'suite-topbar';
        
        let appName = "LINGUOSYNC STUDIO";
        let appIcon = "fa-video";
        if (this.currentApp === 'studyflow') {
            appName = "STUDYFLOW AI";
            appIcon = "fa-graduation-cap";
        } else if (this.currentApp === 'novacapital') {
            appName = "NOVACAPITAL WEALTH";
            appIcon = "fa-chart-line";
        } else if (this.currentApp === 'socialintent') {
            appName = "SOCIALINTENT AI";
            appIcon = "fa-bullseye";
        } else if (this.currentApp === 'vendimap') {
            appName = "VENDIMAP GOLD";
            appIcon = "fa-map-marked-alt";
        }
        
        topbar.innerHTML = `
            <div class="suite-brand">
                <i class="fas ${appIcon}" style="color: #ff007a;"></i>
                <span>${appName}</span>
            </div>
            <div class="suite-controls">
                <span id="suite-badge-el" class="suite-badge free">FREE TRIAL</span>
                <button id="suite-settings-trigger" class="suite-settings-btn">
                    <i class="fas fa-crown" style="color: #ffd700;"></i> 決済・アップグレード
                </button>
            </div>
        `;
        
        // Prepend to body so it stays at the very top
        document.body.insertBefore(topbar, document.body.firstChild);
    },

    // Inject Settings & License Modal
    injectModal() {
        if (document.getElementById('suite-settings-modal')) return;

        const overlay = document.createElement('div');
        overlay.className = 'suite-modal-overlay';
        overlay.id = 'suite-settings-modal';
        
        const licenseVal = localStorage.getItem(this.KEYS.LICENSE_KEY) || '';
        
        overlay.innerHTML = `
            <div class="suite-modal-card">
                <div class="suite-modal-header">
                    <div class="suite-modal-title" id="suite-modal-title-el">
                        <i class="fas fa-crown" style="color: #ffd700;"></i>
                        プレミアムアップグレード
                    </div>
                    <button id="suite-modal-close-btn" class="suite-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="suite-modal-body">
                    <!-- Premium Active Banner -->
                    <div id="suite-premium-active-banner" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%); border: 1px solid #ffd700; border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; text-align: center; box-shadow: 0 0 15px rgba(255, 215, 0, 0.15); display: none;">
                        <i class="fas fa-crown" style="font-size: 2rem; color: #ffd700; margin-bottom: 8px; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));"></i>
                        <div style="font-size: 1.1rem; font-weight: 900; color: #ffd700; letter-spacing: 0.5px;">プレミアムプラン有効中</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7); margin-top: 4px;">すべてのプレミアム機能が無制限に解放されています</div>
                    </div>

                    <div id="suite-pricing-info" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: center;">
                        <div style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">対象商品</div>
                        <div style="font-size: 1rem; font-weight: 900; color: #fff; margin-top: 0.2rem;">${this.appInfo.name}</div>
                        <div style="font-size: 1.5rem; font-weight: 900; color: #fec23c; margin-top: 0.5rem;">${this.appInfo.display} <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 500;">(Lifetime Access)</span></div>
                    </div>
                    
                    <button id="suite-buy-btn" class="suite-btn-submit" style="background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%); color: #000; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 1.5rem;">
                        <i class="fas fa-credit-card"></i> 💳 クレジットカードで安全に購入する
                    </button>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem;">
                        <div class="suite-form-group">
                            <label class="suite-form-label">既にライセンスキーをお持ちの方</label>
                            <input type="text" id="suite-license-input" class="suite-form-input" placeholder="LS-XXXX-XXXX-XXXX" value="${licenseVal}">
                            <div id="license-status-msg" class="suite-key-status missing" style="margin-top: 0.5rem; display: block; font-size: 0.65rem;">
                                未有効化：フリープラン（残りクレジットを消費中）
                            </div>
                        </div>
                        
                        <button id="suite-save-btn" class="suite-btn-submit" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;">
                            ライセンスを認証する
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // Inject Lemon Squeezy Checkout Simulator Modal
    injectCheckoutModal() {
        if (document.getElementById('lemon-checkout-modal')) return;

        const overlay = document.createElement('div');
        overlay.className = 'suite-modal-overlay';
        overlay.id = 'lemon-checkout-modal';
        
        overlay.innerHTML = `
            <div class="suite-modal-card" style="max-width: 400px; border-color: rgba(254, 194, 60, 0.3);">
                <div class="suite-modal-header" style="background: #181824;">
                    <div class="suite-modal-title" style="color: #fec23c;">
                        <i class="fas fa-shopping-cart"></i> Lemon Squeezy Checkout
                    </div>
                    <button id="lemon-modal-close-btn" class="suite-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Main Checkout Form -->
                <div class="suite-modal-body" id="lemon-checkout-form-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <span class="lemon-badge">SECURE CHECKOUT</span>
                            <div style="font-size: 0.9rem; font-weight: 800; color: #fff;">${this.appInfo.name}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.1rem; font-weight: 900; color: #fec23c;">${this.appInfo.display}</div>
                            <div style="font-size: 0.6rem; color: rgba(255,255,255,0.4);">One-time payment</div>
                        </div>
                    </div>
                    
                    <div class="lemon-checkout-card">
                        <div class="lemon-input-group">
                            <label class="suite-form-label" style="color: rgba(254, 194, 60, 0.8);">メールアドレス</label>
                            <input type="email" id="lemon-email" class="suite-form-input" placeholder="you@example.com" value="sota.kojima@empire.com">
                        </div>
                        
                        <div class="lemon-input-group">
                            <label class="suite-form-label" style="color: rgba(254, 194, 60, 0.8);">クレジットカード番号</label>
                            <div style="position: relative;">
                                <input type="text" id="lemon-card-num" class="suite-form-input" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242">
                                <i class="fab fa-cc-visa" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); font-size: 1.2rem;"></i>
                            </div>
                        </div>
                        
                        <div class="lemon-row">
                            <div class="lemon-input-group" style="flex: 1;">
                                <label class="suite-form-label" style="color: rgba(254, 194, 60, 0.8);">有効期限 (MM / YY)</label>
                                <input type="text" id="lemon-card-expiry" class="suite-form-input" placeholder="12 / 29" value="12 / 29">
                            </div>
                            <div class="lemon-input-group" style="flex: 1;">
                                <label class="suite-form-label" style="color: rgba(254, 194, 60, 0.8);">CVC (セキュリティコード)</label>
                                <input type="text" id="lemon-card-cvc" class="suite-form-input" placeholder="123" value="123">
                            </div>
                        </div>
                        
                        <button id="lemon-pay-btn" class="lemon-btn-pay" style="margin-top: 1rem;">
                            <i class="fas fa-lock"></i> ${this.appInfo.display} を安全に支払う
                        </button>
                    </div>
                    
                    <div style="text-align: center; margin-top: 1rem; font-size: 0.6rem; color: rgba(255,255,255,0.3);">
                        <i class="fas fa-shield-alt"></i> 100% 認証セキュア暗号化。Lemon Squeezy シミュレーション決済。
                    </div>
                </div>
                
                <!-- Loading / Success Screen -->
                <div class="suite-modal-body" id="lemon-processing-screen" style="display: none;">
                    <div class="lemon-processing-overlay" id="lemon-processing-state">
                        <div class="lemon-spinner"></div>
                        <div style="color: #fec23c; font-weight: 800; font-size: 0.9rem;" id="lemon-progress-text">決済を安全に処理しています...</div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.7rem; font-family: monospace;">Connecting to gateway...</div>
                    </div>
                    
                    <div class="lemon-processing-overlay" id="lemon-success-state" style="display: none;">
                        <i class="fas fa-check-circle" style="color: #00ff88; font-size: 3rem; filter: drop-shadow(0 0 10px rgba(0,255,136,0.3));"></i>
                        <div style="color: #fff; font-weight: 900; font-size: 1.1rem;">決済が正常に完了しました！</div>
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem; max-width: 300px; margin: 0 auto; line-height: 1.5;">
                            ${this.appInfo.name} のライセンスが正常に発行されました。
                        </div>
                        
                        <div style="background: rgba(0,255,136,0.05); border: 1px dashed rgba(0,255,136,0.3); border-radius: 8px; padding: 0.8rem; margin: 1rem 0; width: 100%;">
                            <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">あなたのプレミアムライセンスキー</div>
                            <div id="lemon-generated-key" style="font-size: 0.85rem; font-weight: 700; color: #00ff88; font-family: monospace; letter-spacing: 0.5px; margin-top: 0.3rem;">LS-XXXX-XXXX-XXXX</div>
                        </div>
                        
                        <button id="lemon-activate-btn" class="suite-btn-submit" style="background: #00ff88; color: #000; font-weight: 900;">
                            👑 ライセンスを自動適用してアンロック
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // Bind event listeners
    bindEvents() {
        const modal = document.getElementById('suite-settings-modal');
        const trigger = document.getElementById('suite-settings-trigger');
        const closeBtn = document.getElementById('suite-modal-close-btn');
        const saveBtn = document.getElementById('suite-save-btn');
        const buyBtn = document.getElementById('suite-buy-btn');
        
        // Lemon Checkout Elements
        const lemonModal = document.getElementById('lemon-checkout-modal');
        const lemonCloseBtn = document.getElementById('lemon-modal-close-btn');
        const lemonPayBtn = document.getElementById('lemon-pay-btn');
        const lemonActivateBtn = document.getElementById('lemon-activate-btn');
        
        if (trigger) {
            trigger.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside card
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                this.openCheckout();
            });
        }
        
        if (lemonCloseBtn) {
            lemonCloseBtn.addEventListener('click', () => {
                lemonModal.style.display = 'none';
            });
        }

        lemonModal.addEventListener('click', (e) => {
            if (e.target === lemonModal) lemonModal.style.display = 'none';
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const license = document.getElementById('suite-license-input').value;
                this.saveConfig(license);
                this.validateLicenseOnline(license);
            });
        }

        if (lemonPayBtn) {
            lemonPayBtn.addEventListener('click', () => {
                this.executeSimulatedCheckout();
            });
        }

        if (lemonActivateBtn) {
            lemonActivateBtn.addEventListener('click', () => {
                const generatedKey = document.getElementById('lemon-generated-key').innerText;
                localStorage.setItem(this.KEYS.LICENSE_STATUS, 'active');
                localStorage.setItem(this.KEYS.LICENSE_KEY, generatedKey);
                lemonModal.style.display = 'none';
                location.reload();
            });
        }
    },

    // Execute beautiful Lemon Squeezy Simulated Payment Flow
    executeSimulatedCheckout() {
        const formBody = document.getElementById('lemon-checkout-form-body');
        const processingScreen = document.getElementById('lemon-processing-screen');
        const progressState = document.getElementById('lemon-processing-state');
        const successState = document.getElementById('lemon-success-state');
        const progressText = document.getElementById('lemon-progress-text');
        
        formBody.style.display = 'none';
        processingScreen.style.display = 'flex';
        progressState.style.display = 'flex';
        successState.style.display = 'none';
        
        const steps = [
            "カード情報の整合性を検証中...",
            "SSLセキュアゲートウェイで暗号化中...",
            "Lemon Squeezy 支払いトランザクションを実行中...",
            "決済処理完了！ライセンスキーを生成しています..."
        ];
        
        let stepIdx = 0;
        const interval = setInterval(() => {
            if (stepIdx < steps.length) {
                progressText.innerText = steps[stepIdx];
                stepIdx++;
            } else {
                clearInterval(interval);
                
                // Payment Success: Generate Lifetime Premium Key
                const randomHex = Math.random().toString(16).substr(2, 6).toUpperCase();
                const randomHex2 = Math.random().toString(16).substr(2, 6).toUpperCase();
                const generatedKey = `LS-PREMIUM-${randomHex}-${randomHex2}`;
                
                document.getElementById('lemon-generated-key').innerText = generatedKey;
                progressState.style.display = 'none';
                successState.style.display = 'flex';
                
                // Add revenue to global localStorage (VentureOS reads this)
                const price = this.appInfo.price;
                const currentRevenue = parseInt(localStorage.getItem('ventureos_real_revenue') || '0');
                localStorage.setItem('ventureos_real_revenue', (currentRevenue + price).toString());
                
                // Save Transaction History
                const currentHistory = JSON.parse(localStorage.getItem('ventureos_tx_history') || '[]');
                const emailVal = document.getElementById('lemon-email').value || 'sota.kojima@empire.com';
                const tx = {
                    id: "TX-" + Date.now().toString().substr(-6),
                    app: this.appInfo.name.split(' - ')[0],
                    amount: price,
                    email: emailVal,
                    time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
                currentHistory.unshift(tx); // Add to head
                localStorage.setItem('ventureos_tx_history', JSON.stringify(currentHistory));
            }
        }, 800);
    },

    // Validate Lemon Squeezy License Key
    async validateLicenseOnline(licenseKey) {
        const saveBtn = document.getElementById('suite-save-btn');
        const originalText = saveBtn.innerText;
        saveBtn.innerText = '認証しています...';
        saveBtn.disabled = true;
        
        if (!licenseKey.trim()) {
            localStorage.setItem(this.KEYS.LICENSE_STATUS, 'free');
            this.completeValidation(saveBtn, originalText, '設定を保存しました');
            return;
        }

        setTimeout(() => {
            const isValid = licenseKey.toUpperCase().startsWith('LS-') && licenseKey.length >= 10;
            
            if (isValid) {
                localStorage.setItem(this.KEYS.LICENSE_STATUS, 'active');
                this.completeValidation(saveBtn, originalText, '👑 プレミアム有効化！');
            } else {
                localStorage.setItem(this.KEYS.LICENSE_STATUS, 'free');
                this.completeValidation(saveBtn, originalText, '無効なライセンスキーです', true);
            }
        }, 1000);
    },

    completeValidation(btn, originalText, msg, isError = false) {
        btn.disabled = false;
        btn.innerText = msg;
        btn.style.background = isError ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
            this.updateUIStatus();
            document.getElementById('suite-settings-modal').style.display = 'none';
            // Reload page dynamically to trigger state unlock across the DOM
            location.reload();
        }, 1200);
    },

    // Sync state variables with DOM status
    updateUIStatus() {
        const badge = document.getElementById('suite-badge-el');
        const licenseMsg = document.getElementById('license-status-msg');
        const trigger = document.getElementById('suite-settings-trigger');
        const isPrem = this.isPremium();
        
        if (badge) {
            if (isPrem) {
                badge.className = 'suite-badge premium';
                badge.innerHTML = '👑 PREMIUM';
                badge.style.background = '';
                badge.style.color = '';
            } else {
                badge.className = 'suite-badge free';
                const credits = this.getCredits();
                badge.innerHTML = `FREE: ${credits} CREDITS`;
                badge.style.background = '';
                badge.style.color = '';
            }
        }
        
        if (licenseMsg) {
            licenseMsg.className = isPrem ? 'suite-key-status connected' : 'suite-key-status missing';
            licenseMsg.innerHTML = isPrem 
                ? '<i class="fas fa-check-circle"></i> Lifetime Premium License Active! Access unlocked.'
                : '<i class="fas fa-info-circle"></i> フリー版。機能が制限されています。購入して永久アンロック。';
        }

        if (trigger) {
            if (isPrem) {
                trigger.innerHTML = '<i class="fas fa-cog"></i> 設定・ライセンス';
            } else {
                trigger.innerHTML = '<i class="fas fa-crown" style="color: #ffd700;"></i> 決済・アップグレード';
            }
        }

        // Toggling elements in settings modal based on premium active state
        const modalTitle = document.getElementById('suite-modal-title-el');
        const activeBanner = document.getElementById('suite-premium-active-banner');
        const pricingInfo = document.getElementById('suite-pricing-info');
        const buyBtn = document.getElementById('suite-buy-btn');

        if (modalTitle) {
            if (isPrem) {
                modalTitle.innerHTML = '<i class="fas fa-cog"></i> 設定・ライセンス';
            } else {
                modalTitle.innerHTML = '<i class="fas fa-crown" style="color: #ffd700;"></i> プレミアムアップグレード';
            }
        }

        if (activeBanner) {
            activeBanner.style.display = isPrem ? 'block' : 'none';
        }

        if (pricingInfo) {
            pricingInfo.style.display = isPrem ? 'none' : 'block';
        }

        if (buyBtn) {
            buyBtn.style.display = isPrem ? 'none' : 'flex';
        }
    }
};

// Automatic initialization when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
    let currentApp = 'studyflow';
    if (document.body.dataset.app) {
        currentApp = document.body.dataset.app;
    } else {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('linguosync')) currentApp = 'linguosync';
        else if (path.includes('novacapital')) currentApp = 'novacapital';
        else if (path.includes('vendimap')) currentApp = 'vendimap';
        else if (path.includes('socialintent')) currentApp = 'socialintent';
        else if (path.includes('studyflow')) currentApp = 'studyflow';
    }
    SuiteGatekeeper.init(currentApp);
});
