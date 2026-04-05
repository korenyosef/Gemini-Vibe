const VIBE_CONFIG = {
  gameUrl: "https://chvin.github.io/react-tetris/",
  dimensions: { width: "450px", height: "550px" },
  debounceTime: 500,
};

const COLOR_MAP = {
  tetris: "#4285f4",
  2048: "#e67e22",
  snake: "#2ecc71",
  pacman: "#f1c40f",
  runner: "#95a5a6",
  custom: "#9b59b6",
};

class GeminiVibePro {
  constructor() {
    this.overlay = null;
    this.isGenerating = false;
    this.currentUrl = VIBE_CONFIG.gameUrl;
    this.currentGameId = "tetris";
    this.startTime = null;
    this.timerInterval = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupMutationObserver();
    this.setupPreloadListeners();
    this.listenForSettingsChanges();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["selectedGameUrl", "selectedGameId"], (res) => {
        if (res.selectedGameUrl) this.currentUrl = res.selectedGameUrl;
        if (res.selectedGameId) this.currentGameId = res.selectedGameId;
        resolve();
      });
    });
  }

  listenForSettingsChanges() {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.selectedGameUrl) {
        this.currentUrl = changes.selectedGameUrl.newValue;
        if (this.overlay)
          this.overlay.querySelector("iframe").src = this.currentUrl;
      }
      if (changes.selectedGameId) {
        this.currentGameId = changes.selectedGameId.newValue;
        this.applyDynamicStyles();
      }
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver(() => this.evaluateState());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  evaluateState() {
    const stopBtn = document.querySelector("button.stop");
    const isActive = !!stopBtn && stopBtn.offsetParent !== null;
    if (isActive && !this.isGenerating) this.showGame();
    else if (!isActive && this.isGenerating) this.hideGame();
  }

  showGame() {
    this.isGenerating = true;
    if (!this.overlay) this.injectOverlay();
    this.startTime = Date.now();
    this.startTimer();

    setTimeout(() => {
      if (this.isGenerating && this.overlay) {
        this.overlay.classList.add("vibe-visible");
        const iframe = this.overlay.querySelector("iframe");
        if (iframe) {
          iframe.focus();
          setTimeout(() => iframe.focus(), 150);
        }
      }
    }, VIBE_CONFIG.debounceTime);
  }

  hideGame() {
    this.isGenerating = false;
    if (!this.overlay) return;
    this.overlay.classList.remove("vibe-visible");
    clearInterval(this.timerInterval);
    const el = this.overlay;
    this.overlay = null;
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 1000);
  }

  startTimer() {
    const timerEl = document.getElementById("vibe-timer");
    if (!timerEl) return;
    this.timerInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - this.startTime) / 1000);
      const m = Math.floor(diff / 60)
        .toString()
        .padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      timerEl.innerText = `${m}:${s}`;
    }, 1000);
  }

  applyDynamicStyles() {
    if (!this.overlay) return;
    const color = COLOR_MAP[this.currentGameId] || "#4285f4";
    this.overlay.style.borderColor = color;
    this.overlay.style.boxShadow = `0 0 40px ${color}66, 0 25px 80px rgba(0, 0, 0, 0.9)`;
    const dot = this.overlay.querySelector(".vibe-status-dot");
    if (dot) dot.style.background = color;
  }

  injectOverlay() {
    if (document.getElementById("vibe-container")) return;
    this.overlay = document.createElement("div");
    this.overlay.id = "vibe-container";

    this.overlay.innerHTML = `
            <div class="vibe-header">
                <div class="vibe-status-dot"></div>
                <div class="vibe-title">GEMINI IS THINKING... <span id="vibe-timer">00:00</span></div>
                <button class="vibe-close-btn" id="vibe-manual-close">✕</button>
            </div>
            <div class="vibe-body">
                <iframe src="${this.currentUrl}" allow="autoplay; fullscreen" tabindex="0"></iframe>
            </div>
        `;

    this.overlay.style.width = VIBE_CONFIG.dimensions.width;
    this.overlay.style.height = VIBE_CONFIG.dimensions.height;
    document.body.appendChild(this.overlay);
    this.applyDynamicStyles();
    document.getElementById("vibe-manual-close").onclick = () =>
      this.hideGame();
  }

  setupPreloadListeners() {
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" && !e.shiftKey) this.injectOverlay();
      },
      true,
    );
    document.addEventListener("click", (e) => {
      if (e.target.closest("button.submit, button.send-button"))
        this.injectOverlay();
    });
  }
}

new GeminiVibePro();
