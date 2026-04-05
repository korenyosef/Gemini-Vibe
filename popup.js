const presets = [
  {
    id: "tetris",
    name: "🕹️ Pro Tetris",
    url: "https://chvin.github.io/react-tetris/",
  },
  {
    id: "2048",
    name: "🔢 2048 Master",
    url: "https://alfishanshaikh.github.io/2048-game/",
  },
  {
    id: "snake",
    name: "🐍 Retro Snake",
    url: "https://alirezaomidi.github.io/classic-snake-html5/",
  },
  {
    id: "pacman",
    name: "🍒 Classic Pacman",
    url: "https://www.google.com/logos/2010/pacman10-i.html",
  },
  { id: "runner", name: "🏃 T-Rex Runner", url: "https://chromedino.com/" },
];

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("game-list");
  const customInput = document.getElementById("custom-url");
  const saveCustomBtn = document.getElementById("save-custom");

  // Load selection and custom URL
  chrome.storage.local.get(
    ["selectedGameId", "selectedGameUrl", "customGameUrl"],
    (res) => {
      const currentId = res.selectedGameId || "tetris";
      if (res.customGameUrl) customInput.value = res.customGameUrl;
      renderList(currentId);
    },
  );

  function renderList(activeId) {
    if (!listContainer) return;
    listContainer.innerHTML = "";

    // Add presets
    presets.forEach((game) => {
      const div = document.createElement("div");
      div.className = `game-option ${game.id === activeId ? "active" : ""}`;
      div.innerHTML = `<span>${game.name}</span><span class="check-mark">✓</span>`;
      div.onclick = () => selectGame(game.id, game.url);
      listContainer.appendChild(div);
    });

    // Handle 'custom' if active
    if (activeId === "custom") {
      chrome.storage.local.get(["customGameUrl"], (res) => {
        if (res.customGameUrl) {
          const div = document.createElement("div");
          div.className = "game-option active";
          div.innerHTML = `<span>🎨 Custom Game</span><span class="check-mark">✓</span>`;
          div.onclick = () => selectGame("custom", res.customGameUrl);
          listContainer.appendChild(div);
        }
      });
    }
  }

  function selectGame(id, url) {
    chrome.storage.local.set(
      {
        selectedGameId: id,
        selectedGameUrl: url,
      },
      () => {
        renderList(id);
      },
    );
  }

  saveCustomBtn.onclick = () => {
    const url = customInput.value.trim();
    if (url.startsWith("http")) {
      chrome.storage.local.set(
        {
          selectedGameId: "custom",
          selectedGameUrl: url,
          customGameUrl: url,
        },
        () => {
          renderList("custom");
          alert("Custom Game Saved and Selected!");
        },
      );
    } else {
      alert("Please enter a valid URL starting with http:// or https://");
    }
  };
});
