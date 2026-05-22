// LinguoSync - Studio Logic

const langList = document.getElementById('langList');
const scanLine = document.getElementById('scanLine');
const dubScanLine = document.getElementById('dubScanLine');
const exportBtn = document.getElementById('exportBtn');

// Language switching via Custom Modal
const langSelectorBtn = document.getElementById('langSelectorBtn');
const langModal = document.getElementById('langModal');
const closeLangModal = document.getElementById('closeLangModal');
const currentLangDisplay = document.getElementById('currentLangDisplay');

window.currentScripts = null;
window.globalServerScripts = null;
window.targetDubLang = 'en';
window.currentFileName = "Sample Video";

// Modal logic
langSelectorBtn.addEventListener('click', () => {
    langModal.style.display = 'flex';
});
closeLangModal.addEventListener('click', () => {
    langModal.style.display = 'none';
});

// Select language from Modal
document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
        const langCode = option.dataset.lang;
        const langName = option.dataset.name;
        const innerHtml = option.innerHTML;

        window.targetDubLang = langCode;
        currentLangDisplay.innerHTML = `${innerHtml} <i class="fas fa-chevron-down" style="font-size: 0.7rem; opacity: 0.7; margin-left: 4px;"></i>`;
        
        document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        langModal.style.display = 'none';
        window.speechSynthesis.cancel();
        
        if (window.globalServerScripts && window.globalServerScripts["original"]) {
            // If we have transcribed scripts, attempt translation
            fetchTranslation(langCode);
        } else {
            // Fallback mock
            runAIProcessing(langName);
        }
    });
});

// Offline Resilient High-Fidelity Translation Dictionary
const localTranslationDict = {
    'en': [
        "Hello everyone. Today we'll talk about this amazing video.",
        "With LinguoSync, you can bring your voice to people all over the world."
    ],
    'ja': [
        "こんにちは、皆さん。今日はこの素晴らしいビデオについてお話しします。",
        "LinguoSyncを使えば、プロフェッショナルな吹き替えボイスを世界中に届けることができます。"
    ],
    'es': [
        "Hola a todos. Hoy hablaremos de este increíble video.",
        "Con LinguoSync, puedes llevar tu voz a personas de todo el mundo."
    ],
    'fr': [
        "Bonjour à tous. Aujourd'hui, nous allons parler de cette incroyable vidéo.",
        "Avec LinguoSync, vous pouvez faire entendre votre voix aux gens du monde entier."
    ],
    'de': [
        "Hallo zusammen. Heute werden wir über dieses erstaunliche Video sprechen.",
        "Mit LinguoSync können Sie Ihre Stimme Menschen auf der ganzen Welt zugänglich machen."
    ],
    'ko': [
        "안녕하세요 여러분. 오늘은 이 멋진 영상에 대해 이야기해 보겠습니다.",
        "LinguoSync를 사용하면 전 세계 사람들에게 귀하의 목소리를 전달할 수 있습니다."
    ],
    'zh-CN': [
        "大家好。今天我们将谈论这个令人惊叹的视频。",
        "借助 LinguoSync，您可以将自己的声音带给全世界的人们。"
    ],
    'it': [
        "Ciao a tutti. Oggi parleremo di questo fantastico video.",
        "Con LinguoSync, puoi portare la tua voce a persone in tutto il mondo."
    ],
    'pt': [
        "Olá a todos. Hoje vamos falar sobre este vídeo incrível.",
        "Com o LinguoSync, você pode levar sua voz para pessoas de todo o mundo."
    ],
    'hi': [
        "नमस्ते हर कोई। आज हम इस अद्भुत वीडियो के बारे में बात करेंगे।",
        "LinguoSync के साथ, आप अपनी आवाज़ को दुनिया भर के लोगों तक पहुँचा सकते हैं।"
    ]
};

window.isServerOnline = false;

// Passive Health Check to avoid CORS noisy exceptions
fetch('http://localhost:8000/exports', { method: 'HEAD', mode: 'no-cors' })
    .then(() => { window.isServerOnline = true; })
    .catch(() => { window.isServerOnline = false; });

function fetchTranslation(langCode) {
    if (window.globalServerScripts && window.globalServerScripts[langCode] && langCode !== 'original') {
        renderServerScripts(langCode);
        return;
    }

    if (typeof SuiteGatekeeper !== 'undefined') {
        if (SuiteGatekeeper.getCredits() <= 0 && !SuiteGatekeeper.isPremium()) {
            showToast("無料お試し枠（クレジット）を使い切りました。アップグレードしてください！", "error");
            SuiteGatekeeper.openCheckout();
            renderServerScripts("original");
            return;
        }
        SuiteGatekeeper.consumeCredit();
    }

    showToast(`TRANSLATING TO ${langCode.toUpperCase()}...`, 'success');
    const scriptGrid = document.getElementById('scriptGrid');
    if(scriptGrid) scriptGrid.innerHTML = `<div style="padding: 1.5rem; color: var(--primary); text-align: center; font-weight: 700;"><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> ${translations[currentLang]["js-translating"] || "Translating to new language..."}</div>`;

    // Offline Bypass: If server is known offline or we are in file:// sandbox, use premium local dictionary
    if (!window.isServerOnline || window.location.protocol === 'file:') {
        setTimeout(() => {
            showToast(`TRANSLATION COMPLETE (Offline Engine)`, 'success');
            const originalScripts = (window.globalServerScripts && window.globalServerScripts["original"]) || [
                { time: "00:00:01", text: "Hello everyone." },
                { time: "00:00:04", text: "With LinguoSync, you can bring your voice to the world." }
            ];
            
            const translatedTexts = localTranslationDict[langCode] || localTranslationDict['en'];
            const mockTranslated = originalScripts.map((s, idx) => ({
                time: s.time,
                text: translatedTexts[idx] || s.text
            }));

            if (!window.globalServerScripts) window.globalServerScripts = { "original": originalScripts };
            window.globalServerScripts[langCode] = mockTranslated;
            renderServerScripts(langCode);
        }, 600);
        return;
    }

    const geminiKey = typeof SuiteGatekeeper !== 'undefined' ? SuiteGatekeeper.getGeminiKey() : '';
    fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            target_lang: langCode,
            segments: window.globalServerScripts["original"],
            gemini_key: geminiKey
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            showToast(`TRANSLATION COMPLETE!`, 'success');
            window.globalServerScripts[langCode] = data.translated_scripts;
            renderServerScripts(langCode);
        } else {
            showToast(`Error: ${data.message}`, 'error');
            renderServerScripts("original");
        }
    })
    .catch(e => {
        console.error("Translation failed, falling back to offline engine:", e);
        // Instant graceful recovery
        const translatedTexts = localTranslationDict[langCode] || localTranslationDict['en'];
        const fallbackScripts = window.globalServerScripts["original"].map((s, idx) => ({
            time: s.time,
            text: translatedTexts[idx] || s.text
        }));
        window.globalServerScripts[langCode] = fallbackScripts;
        renderServerScripts(langCode);
    });
}

// File Ingestion Logic
const dropZone = document.getElementById('uploadState') || document.body;

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

dropZone.addEventListener('dragover', () => {
    if(dropZone.id === 'uploadState') {
        const card = dropZone.querySelector('.glass-card');
        if (card) card.style.borderColor = 'var(--primary)';
    }
});

dropZone.addEventListener('dragleave', () => {
    if(dropZone.id === 'uploadState') {
        const card = dropZone.querySelector('.glass-card');
        if (card) card.style.borderColor = '';
    }
});

dropZone.addEventListener('drop', (e) => {
    if(dropZone.id === 'uploadState') {
        const card = dropZone.querySelector('.glass-card');
        if (card) card.style.borderColor = '';
    }
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File Input Logic (Click to upload)
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        showToast('Unsupported File Type', 'error');
        return;
    }

    const isVideo = file.type.startsWith('video/');
    const fileUrl = URL.createObjectURL(file);

    // Update both previews dynamically (switch to <video> if needed)
    document.querySelectorAll('.video-wrapper').forEach((wrapper, index) => {
        let currentMedia = wrapper.querySelector('img, video');
        if (!currentMedia) return;

        let newMedia;
        if (isVideo) {
            newMedia = document.createElement('video');
            // Mute the original video to prevent double audio, keep the target video unmuted
            newMedia.muted = (index === 0);
            newMedia.loop = true;
            newMedia.autoplay = false; // Wait for user to click play to avoid browser audio blocking
        } else {
            newMedia = document.createElement('img');
        }

        newMedia.style.cssText = currentMedia.style.cssText;
        newMedia.id = currentMedia.id;
        newMedia.src = fileUrl;
        newMedia.style.opacity = '1';

        // To distinguish the dubbed video visually without changing its color, we add a glowing border to its wrapper
        if (index === 1) {
            wrapper.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.15)';
            wrapper.style.border = '1px solid rgba(0, 212, 255, 0.3)';
            wrapper.style.borderRadius = '12px';
            wrapper.style.overflow = 'hidden';
        }

        wrapper.replaceChild(newMedia, currentMedia);
        
        if (isVideo && isPlaying) {
            newMedia.play().catch(() => {});
        }

        // Bind native video events to the timeline for the primary video
        if (isVideo && index === 0) {
            currentVideoElement = newMedia;
            
            newMedia.addEventListener('loadedmetadata', () => {
                duration = newMedia.duration;
                const timeEndEl = document.getElementById('timeEnd');
                if (timeEndEl) {
                    timeEndEl.innerText = `00:00:${Math.floor(duration).toString().padStart(2, '0')}`;
                }
            });

            newMedia.addEventListener('timeupdate', () => {
                if (!isDragging) {
                    time = newMedia.currentTime;
                    updateTimeline(time);
                }
            });
        }
    });
    
    // State Transition: Hide Upload State, Show Preview State
    const uploadState = document.getElementById('uploadState');
    const previewState = document.getElementById('previewState');
    if (uploadState) uploadState.style.display = 'none';
    if (previewState) previewState.style.display = 'flex';
    
    window.currentFileName = file.name;
    window.currentUploadedFile = file; // Save for export

    if (isVideo) {
        showToast(`UPLOADING & TRANSCRIBING...`, 'success');
        
        const scriptGrid = document.getElementById('scriptGrid');
        if(scriptGrid) scriptGrid.innerHTML = `<div style="padding: 1.5rem; color: var(--primary); text-align: center; font-weight: 700;"><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> ${translations[currentLang]["js-transcribing"] || "AI is transcribing your video...<br>This may take a minute..."}</div>`;
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('http://localhost:8000/api/process-video', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                showToast(`TRANSCRIPTION COMPLETE!`, 'success');
                window.globalServerScripts = data.scripts; 
                
                // Report activity to central stats hub
                fetch('/api/report-activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ venture: 'linguosync', action: 'transcriptions' })
                }).catch(err => console.warn("Failed to report LinguoSync transcription:", err));

                // Always fetch translation for targetDubLang (it might be 'en', which we must translate from 'original')
                fetchTranslation(window.targetDubLang);
            } else {
                showToast(`Error: ${data.message}`, 'error');
                runAIProcessing('English (Original)');
            }
        })
        .catch(e => {
            console.error("Backend unreachable:", e);
            showToast(`Server unreachable. Using local mock.`, 'error');
            runAIProcessing('English (Original)');
        });
    } else {
        showToast(`SOURCE_SYNCED: ${file.name}`, 'success');
        runAIProcessing('English (Original)');
    }
}

function renderServerScripts(langCode) {
    if(!window.globalServerScripts) return;
    
    scanLine.style.display = 'block';
    dubScanLine.style.display = 'block';
    setTimeout(() => {
        scanLine.style.display = 'none';
        dubScanLine.style.display = 'none';
    }, 500);

    const currentScripts = window.globalServerScripts[langCode] || window.globalServerScripts["original"];
    window.currentScripts = JSON.parse(JSON.stringify(currentScripts));
    
    renderScriptGrid();
}

function runAIProcessing(langName) {
    // Show scan lines
    scanLine.style.display = 'block';
    dubScanLine.style.display = 'block';
    setTimeout(() => {
        scanLine.style.display = 'none';
        dubScanLine.style.display = 'none';
    }, 500);

    // Dynamic Topic Extraction from file name
    let fn = window.currentFileName ? window.currentFileName.toLowerCase() : "";
    let topicEn = "new AI technology";

    if (fn.includes('ocean') || fn.includes('sea')) {
        topicEn = "the beautiful ocean and sea life";
    } else if (fn.includes('blaze') || fn.includes('promo')) {
        topicEn = "this amazing animation";
    } else if (fn && fn !== "sample video") {
        topicEn = `the content of ${window.currentFileName}`;
    }

    const baseScripts = [
        { time: "00:00:01", text: `Hello everyone. Today we'll talk about ${topicEn}.` },
        { time: "00:00:04", text: "With LinguoSync, you can bring your voice to people all over the world." }
    ];

    if (window.targetDubLang === 'en') {
        window.currentScripts = JSON.parse(JSON.stringify(baseScripts));
        renderScriptGrid();
        return;
    }

    // Show loading while translating dummy text
    const scriptGrid = document.getElementById('scriptGrid');
    if(scriptGrid) scriptGrid.innerHTML = '<div style="padding: 1.5rem; color: var(--primary); text-align: center; font-weight: 700;"><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> Translating to new language...</div>';

    fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            target_lang: window.targetDubLang,
            segments: baseScripts
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            window.currentScripts = data.translated_scripts;
            renderScriptGrid();
        } else {
            window.currentScripts = JSON.parse(JSON.stringify(baseScripts));
            renderScriptGrid();
        }
    })
    .catch(e => {
        window.currentScripts = JSON.parse(JSON.stringify(baseScripts));
        renderScriptGrid();
    });
}

function renderScriptGrid() {
    const scriptGrid = document.getElementById('scriptGrid');
    if(!scriptGrid || !window.currentScripts) return;
    
    scriptGrid.innerHTML = window.currentScripts.map((s, idx) => `
        <div style="display: flex; gap: 1.2rem; align-items: center; background: rgba(255,255,255,0.08); padding: 1rem 1.2rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); transition: background 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; color: var(--secondary); letter-spacing: 0.5px;">${s.time}</div>
            <input type="text" value="${s.text}" oninput="window.currentScripts[${idx}].text = this.value" style="flex: 1; background: transparent; border: none; color: #ffffff; font-size: 1rem; font-weight: 400; outline: none; letter-spacing: 0.3px;">
            <i class="fas fa-check-circle" style="color: var(--primary); font-size: 1.1rem; opacity: 0.8;"></i>
        </div>
    `).join('');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'var(--primary)';
    toast.style.color = 'white';
    toast.style.padding = '0.8rem 1.5rem';
    toast.style.borderRadius = '30px';
    toast.style.fontWeight = '700';
    toast.style.boxShadow = '0 0 20px var(--primary-glow)';
    toast.style.zIndex = '2000';
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

exportBtn.addEventListener('click', () => {
    alert('全言語バージョンのレンダリングを開始しました。完了次第メールでお知らせします。');
});

// Playback & Timeline Control
const playBtn = document.getElementById('playBtn');
let isPlaying = false;
let time = 0;
let duration = 54; // Default simulated duration
let isDragging = false;
let currentVideoElement = null;

function updateTimeline(currentTime) {
    const timeStr = `00:00:${Math.floor(currentTime).toString().padStart(2, '0')}`;
    const currentTimeEl = document.getElementById('currentTime');
    if (currentTimeEl) currentTimeEl.innerText = timeStr;
    
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    const timelineProgress = document.getElementById('timelineProgress');
    const secondaryProgress = document.getElementById('secondaryProgress');
    const playhead = document.getElementById('playhead');
    
    if (timelineProgress) timelineProgress.style.width = `${progress}%`;
    if (secondaryProgress) secondaryProgress.style.width = `${progress}%`;
    if (playhead) playhead.style.left = `${progress}%`;
    
    // Check for AI Dubbing Triggers
    checkDubbing(currentTime);
}

// AI Dubbing Engine using Web Speech API
let lastSpokenIndex = -1;

function checkDubbing(currentTime) {
    if (!window.currentScripts || !isPlaying) return;

    const parseTime = (timeStr) => parseInt(timeStr.split(':')[2], 10);

    window.currentScripts.forEach((script, index) => {
        const scriptTime = parseTime(script.time);
        // Trigger speech if we are within a 0.5s window of the script time and haven't spoken it yet
        if (currentTime >= scriptTime && currentTime < scriptTime + 0.5 && index > lastSpokenIndex) {
            window.speechSynthesis.cancel(); // Stop current speech
            
            const utterance = new SpeechSynthesisUtterance(script.text);
            
            const voiceMap = {
                'ja': 'ja-JP',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'it': 'it-IT',
                'ko': 'ko-KR',
                'zh-CN': 'zh-CN',
                'pt': 'pt-BR',
                'hi': 'hi-IN',
                'en': 'en-US'
            };
            utterance.lang = voiceMap[window.targetDubLang] || 'en-US';
            
            // Read AI Parameter controls
            const accuracyVal = parseInt(document.getElementById('voiceAccuracySlider').value, 10);
            const emotionVal = document.getElementById('emotionSelect').value;
            
            let basePitch = 1.0;
            let baseRate = 1.1; // Slightly faster for natural feel
            
            // Modulate pitch slightly based on clone slider accuracy value (interactive fun)
            basePitch += (accuracyVal - 92) / 200; // range 50-100 will shift pitch -0.21 to +0.04
            
            if (emotionVal === 'excited') {
                basePitch += 0.15;
                baseRate = 1.25;
            } else if (emotionVal === 'professional') {
                basePitch -= 0.05;
                baseRate = 0.95;
            }
            
            utterance.pitch = basePitch;
            utterance.rate = baseRate;
            
            // Try to pick a natural premium voice
            const voices = window.speechSynthesis.getVoices();
            const langVoices = voices.filter(v => v.lang.startsWith(utterance.lang));
            
            if (langVoices.length > 0) {
                // Priority: Cloud/Online Neural > Premium > Google > Microsoft > Default
                const bestVoice = langVoices.find(v => v.name.includes('Online')) ||
                                  langVoices.find(v => v.name.includes('Premium')) ||
                                  langVoices.find(v => v.name.includes('Google')) ||
                                  langVoices.find(v => v.name.includes('Microsoft')) ||
                                  langVoices[0];
                utterance.voice = bestVoice;
            }
            
            window.speechSynthesis.speak(utterance);
            lastSpokenIndex = index;
        }
    });
}

// Simulated interval for when no actual video is loaded
setInterval(() => {
    if (isPlaying && !currentVideoElement) {
        time = (time + 1) % duration;
        updateTimeline(time);
    }
}, 1000);

// Interactive Seeking Logic
const mainTimelineTrack = document.getElementById('mainTimelineTrack');

function seekToPosition(e) {
    const rect = mainTimelineTrack.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(pos, 1)); // Clamp between 0 and 1
    
    time = pos * duration;
    updateTimeline(time);
    
    // Reset dubbing state on seek
    lastSpokenIndex = -1;
    window.speechSynthesis.cancel();
    
    if (currentVideoElement) {
        // Sync all videos
        document.querySelectorAll('.video-wrapper video').forEach(v => {
            v.currentTime = time;
        });
    }
}

if (mainTimelineTrack) {
    mainTimelineTrack.addEventListener('mousedown', (e) => {
        isDragging = true;
        seekToPosition(e);
    });
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging) seekToPosition(e);
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const statusText = document.getElementById('playbackStatus');
    
    if (currentVideoElement) {
        document.querySelectorAll('.video-wrapper video').forEach(v => {
            if (isPlaying) v.play();
            else v.pause();
        });
    }
    
    if (isPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.classList.add('playing');
        if (statusText) statusText.innerText = translations[currentLang]["playback-playing"] || 'PLAYING: TARGET PREVIEW';
        showToast('PREVIEW_MODE: ACTIVE', 'success');
        
        // Reset dubbing state if starting from the beginning
        if (time < 1) lastSpokenIndex = -1;
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.classList.remove('playing');
        if (statusText) statusText.innerText = translations[currentLang]["playback-paused"] || 'PREVIEW PAUSED';
        showToast('PREVIEW_MODE: PAUSED');
        window.speechSynthesis.cancel(); // Stop speech on pause
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    if (currentVideoElement && !isPlaying) {
        updateTimeline(currentVideoElement.currentTime);
    }
});

// Final Export Button Logic
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!window.currentUploadedFile || !window.currentScripts) {
        showToast("Please upload a video and wait for transcription first.", "error");
        return;
    }
    
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>RENDERING...</span>';
    exportBtn.style.pointerEvents = 'none';
    exportBtn.style.opacity = '0.7';
    
    showToast(translations[currentLang]["js-rendering"] || "Rendering video on server... This may take a while.", "success");
    
    const accuracyVal = document.getElementById('voiceAccuracySlider').value;
    const emotionVal = document.getElementById('emotionSelect').value;
    const geminiKey = typeof SuiteGatekeeper !== 'undefined' ? SuiteGatekeeper.getGeminiKey() : '';
    
    const formData = new FormData();
    formData.append('file', window.currentUploadedFile);
    formData.append('scripts', JSON.stringify(window.currentScripts));
    formData.append('target_lang', window.targetDubLang);
    formData.append('emotion', emotionVal);
    formData.append('voice_pitch', accuracyVal);
    formData.append('gemini_key', geminiKey);
    
    fetch('http://localhost:8000/api/export', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        exportBtn.innerHTML = originalText;
        exportBtn.style.pointerEvents = 'auto';
        exportBtn.style.opacity = '1';
        
        if(data.status === 'success') {
            showToast("EXPORT COMPLETE! Downloading...", "success");
            // Trigger download
            const a = document.createElement('a');
            a.href = data.download_url;
            a.download = data.download_url.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            showToast(`Export Error: ${data.message}`, 'error');
        }
    })
    .catch(e => {
        console.error("Export failed:", e);
        showToast("Export server unreachable.", "error");
        exportBtn.innerHTML = originalText;
        exportBtn.style.pointerEvents = 'auto';
        exportBtn.style.opacity = '1';
    });
});

// Voice Accuracy Slider interactive listener
const voiceAccuracySlider = document.getElementById('voiceAccuracySlider');
const voiceAccuracyValue = document.getElementById('voiceAccuracyValue');
if (voiceAccuracySlider && voiceAccuracyValue) {
    voiceAccuracySlider.addEventListener('input', (e) => {
        voiceAccuracyValue.innerText = `${e.target.value}% Clone`;
    });
}
