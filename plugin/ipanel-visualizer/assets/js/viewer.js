const MV_URL = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js';
const loadModelViewer = () => import(MV_URL);

async function init(container) {
    const btn = container.querySelector('.ipanel-load-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Loading 3D…'; }
    try {
        await loadModelViewer();
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', container.dataset.glb);
        if (container.dataset.usdz) { mv.setAttribute('ios-src', container.dataset.usdz); }
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
        container.innerHTML = '<div class="ipanel-error">3D view failed to load. <button type="button" onclick="location.reload()">Retry</button></div>';
        (window.dataLayer = window.dataLayer || []).push({ event: 'ipanel_error', err_msg: String(e).substring(0, 200) });
        console.error('iPanel viewer:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ipanel-viewer').forEach((c) => {
        const btn = c.querySelector('.ipanel-load-btn');
        if (btn) { btn.addEventListener('click', () => init(c), { once: true }); }
    });
});
