const MV_URL = '/wp-content/plugins/ipanel-visualizer/assets/vendor/model-viewer.min.js';

// P3-13: UMD fallback for import() — handles browsers without dynamic import support
const loadModelViewer = () => {
    // If already loaded globally, skip
    if (window.customElements && window.customElements.get('model-viewer')) {
        return Promise.resolve();
    }
    
    return import(MV_URL).catch(() => {
        // Fallback: load as script tag for UMD bundle
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = MV_URL;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    });
};

// P2-8: Validate URL before using as attribute
function isValidModelUrl(url) {
    if (!url || typeof url !== 'string') return false;
    // Allow http/https URLs and same-origin paths, reject javascript: and data:
    if (/^(https?:)?\/\//.test(url)) return true;
    if (url.startsWith('/') && !url.startsWith('//')) return true;
    return false;
}

async function init(container) {
    const btn = container.querySelector('.ipanel-load-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Loading 3D…'; }
    
    // P2-8: Validate data-glb before proceeding
    const glbSrc = container.dataset.glb;
    if (!isValidModelUrl(glbSrc)) {
        container.innerHTML = '<div class="ipanel-error">Invalid 3D model URL.</div>';
        console.error('iPanel viewer: invalid data-glb value');
        return;
    }
    
    try {
        // P2-7: 15-second timeout for model loading
        const loadPromise = loadModelViewer();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Model viewer load timeout')), 15000);
        });
        
        await Promise.race([loadPromise, timeoutPromise]);
        
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', glbSrc);
        if (container.dataset.usdz && isValidModelUrl(container.dataset.usdz)) {
            mv.setAttribute('ios-src', container.dataset.usdz);
        }
        mv.setAttribute('ar', '');
        mv.setAttribute('ar-modes', 'scene-viewer quick-look');
        mv.setAttribute('ar-placement', 'wall');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('shadow-intensity', '1');
        container.innerHTML = '';
        container.appendChild(mv);
        (window.dataLayer = window.dataLayer || []).push({ event: 'visualizer_open' });
    } catch (e) {
        // P1-2: CSP-safe error handler (no inline onclick)
        const errorDiv = document.createElement('div');
        errorDiv.className = 'ipanel-error';
        errorDiv.textContent = '3D view failed to load. ';
        
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.textContent = 'Retry';
        retryBtn.addEventListener('click', () => location.reload());
        
        errorDiv.appendChild(retryBtn);
        container.innerHTML = '';
        container.appendChild(errorDiv);
        
        (window.dataLayer = window.dataLayer || []).push({ event: 'ipanel_error', err_msg: String(e).substring(0, 200) });
        console.error('iPanel viewer:', e);
    }
}

// P3-14: Check readyState before attaching DOMContentLoaded listener
function attachListeners() {
    document.querySelectorAll('.ipanel-viewer').forEach((c) => {
        const btn = c.querySelector('.ipanel-load-btn');
        if (btn) { btn.addEventListener('click', () => init(c), { once: true }); }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
} else {
    // DOM already loaded, attach immediately
    attachListeners();
}
