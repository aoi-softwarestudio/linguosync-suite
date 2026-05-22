// StudyFlow AI - Monetization & Premium Logic

const upgradeModal = document.getElementById('upgradeModal');
const headerUpgradeBtn = document.getElementById('headerUpgradeBtn');
const exportBtn = document.getElementById('exportBtn');

// Helper to check if Premium is active via unified Suite Gatekeeper
function isSuitePremium() {
    return typeof SuiteGatekeeper !== 'undefined' && SuiteGatekeeper.isPremium();
}

headerUpgradeBtn.addEventListener('click', () => {
    if (typeof SuiteGatekeeper !== 'undefined') {
        SuiteGatekeeper.openSettings();
    }
});

const upgradeBtnDirect = document.getElementById('upgradeBtnDirect');
if (upgradeBtnDirect) {
    upgradeBtnDirect.addEventListener('click', () => {
        if (isSuitePremium()) {
            if (typeof showToast === 'function') showToast("すでにプレミアムプランが有効です！", "success");
        } else {
            if (typeof SuiteGatekeeper !== 'undefined') {
                SuiteGatekeeper.openCheckout();
            }
        }
    });
}

// Update the header upgrade button display if premium is active
window.addEventListener('DOMContentLoaded', () => {
    if (isSuitePremium()) {
        headerUpgradeBtn.style.display = 'none'; // Hide the duplicate purchase trigger
        
        // Render sleek non-clickable Gold premium status badge in header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const premiumBadge = document.createElement('div');
            premiumBadge.className = 'premium-status-badge';
            premiumBadge.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15))';
            premiumBadge.style.border = '1px solid #ffd700';
            premiumBadge.style.color = '#ffd700';
            premiumBadge.style.fontSize = '0.72rem';
            premiumBadge.style.fontWeight = '900';
            premiumBadge.style.padding = '5px 12px';
            premiumBadge.style.borderRadius = '20px';
            premiumBadge.style.display = 'flex';
            premiumBadge.style.alignItems = 'center';
            premiumBadge.style.gap = '5px';
            premiumBadge.style.textShadow = '0 0 4px rgba(255,215,0,0.2)';
            premiumBadge.innerHTML = '<i class="fas fa-crown"></i> プレミアム有効';
            
            const settingsBtn = document.querySelector('.btn-settings');
            if (settingsBtn) {
                headerActions.insertBefore(premiumBadge, settingsBtn);
            } else {
                headerActions.appendChild(premiumBadge);
            }
        }
        
        // Polish the main-page direct upgrade button
        if (upgradeBtnDirect) {
            upgradeBtnDirect.innerHTML = '<i class="fas fa-check-circle"></i> プレミアムプラン有効中';
            upgradeBtnDirect.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15))';
            upgradeBtnDirect.style.border = '1px solid #ffd700';
            upgradeBtnDirect.style.color = '#ffd700';
            upgradeBtnDirect.style.cursor = 'default';
        }

        const pricingSec = document.getElementById('pricing');
        if (pricingSec) {
            pricingSec.style.display = 'none';
        }
    }
});

// Gate features behind premium
exportBtn.addEventListener('click', (e) => {
    if (isSuitePremium()) {
        // Allow default export logic from app.js to run
        return;
    }
    // Stop propagation so app.js export handler doesn't trigger
    e.stopImmediatePropagation();
    showPremiumGate("PDF出力はプレミアム機能です。");
});

function showPremiumGate(message) {
    const modalTitle = upgradeModal.querySelector('h2');
    const modalText = upgradeModal.querySelector('p');
    
    modalTitle.innerText = "プレミアム限定機能";
    modalText.innerText = `${message} アップグレードして、すべての機能を利用しましょう。`;
    
    upgradeModal.style.display = 'flex';
}

// Close modal when clicking outside the card
upgradeModal.addEventListener('click', (e) => {
    if (e.target === upgradeModal) {
        upgradeModal.style.display = 'none';
    }
});

// Add a "Pro" badge to the sidebar for mock purposes
window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const proBanner = document.createElement('div');
    proBanner.style.marginTop = 'auto';
    proBanner.style.padding = '1rem';
    
    if (isSuitePremium()) {
        proBanner.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15))';
        proBanner.style.borderRadius = '12px';
        proBanner.style.border = '1px solid #ffd700';
        proBanner.innerHTML = `
            <p style="font-size: 0.8rem; font-weight: 900; color: #ffd700;"><i class="fas fa-crown"></i> PREMIUM ACTIVE</p>
            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.5rem;">無制限の解析 & PDFエクスポートが有効です</p>
            <button class="btn-premium" style="font-size: 0.7rem; width: 100%; padding: 0.4rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;">設定 & 契約内容</button>
        `;
        sidebar.appendChild(proBanner);
        proBanner.querySelector('button').onclick = () => { if (typeof SuiteGatekeeper !== 'undefined') SuiteGatekeeper.openSettings(); };
    } else {
        const credits = (typeof SuiteGatekeeper !== 'undefined') ? SuiteGatekeeper.getCredits() : 3;
        proBanner.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))';
        proBanner.style.borderRadius = '12px';
        proBanner.style.border = '1px solid var(--primary)';
        proBanner.innerHTML = `
            <p style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">FREE PLAN</p>
            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.5rem;">残り ${credits} 回の生成</p>
            <button class="btn-premium" style="font-size: 0.7rem; width: 100%; padding: 0.4rem;">UPGRADE</button>
        `;
        sidebar.appendChild(proBanner);
        proBanner.querySelector('button').onclick = () => { if (typeof SuiteGatekeeper !== 'undefined') SuiteGatekeeper.openCheckout(); };
    }
});
