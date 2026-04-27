(function () {
    const canvas = document.getElementById("gamePreview");
    const ctx = canvas.getContext("2d");
    const toastLayer = document.getElementById("toastLayer");
    const panelTitle = document.getElementById("panelTitle");
    const panelContent = document.getElementById("panelContent");
    const coinCard = document.getElementById("coinCard");
    const coinAmount = document.getElementById("coinAmount");
    const rankCard = document.getElementById("rankCard");
    const rankIcon = document.getElementById("rankIcon");
    const rankName = document.getElementById("rankName");
    const rankProgress = document.getElementById("rankProgress");

    const ranks = [
        { name: "Recluta", icon: "R", color: "#36d36f", min: 0, next: 500 },
        { name: "Soldado", icon: "S", color: "#38bdf8", min: 500, next: 1500 },
        { name: "Elite", icon: "E", color: "#c56bff", min: 1500, next: 3500 },
        { name: "Destructor", icon: "D", color: "#ff4d6d", min: 3500, next: 7000 },
        { name: "Legendario", icon: "L", color: "#ffd166", min: 7000, next: 10000 }
    ];

    const panels = {
        shop: {
            title: "Tienda",
            html: `<div class="panel-list"><div class="panel-item">Skins, rarezas y compras disponibles.</div><div class="panel-item">Abrir tienda completa en el juego.</div></div>`,
            action: "shop"
        },
        inventory: {
            title: "Inventario / Skins",
            html: `<div class="panel-list"><div class="panel-item">Skin equipada, desbloqueadas y coleccion.</div><div class="panel-item">Usa F en partida para volver al arma unica de skin.</div></div>`,
            action: "shop"
        },
        powers: {
            title: "Poderes",
            html: `<div class="panel-list"><div class="panel-item">Click derecho activa el especial de la skin.</div><div class="panel-item">1-9 mantienen armas normales.</div></div>`
        },
        stats: {
            title: "Estadisticas",
            html: `<div class="panel-list"><div class="panel-item">Rango calculado con tu XP total.</div><div class="panel-item">Monedas y progreso guardados localmente.</div></div>`,
            action: "ranking"
        },
        lab: {
            title: "Laboratorio",
            html: `<div class="panel-list"><div class="panel-item">Mejoras, pruebas de armas y tecnologia experimental.</div><div class="panel-item">Modulo preparado para nuevas mejoras.</div></div>`
        },
        planet: {
            title: "Seleccionar Planeta",
            html: `<div class="panel-list"><div class="panel-item">Galaxia, Marte, Luna, Jupiter, Sol, Agujero Negro y mas.</div><div class="panel-item">El selector aparece antes de iniciar partida.</div></div>`,
            action: "planet"
        }
    };

    function readPlayerData() {
        try {
            const data = JSON.parse(localStorage.getItem("gs_player1") || "{}");
            return {
                coins: Number(data.coins || 0),
                xp: Number(data.totxp || data.xp || 0),
                level: Number(data.lvl || 1)
            };
        } catch (_) {
            return { coins: 0, xp: 0, level: 1 };
        }
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("es-CO").format(value);
    }

    function updateProgression() {
        const data = readPlayerData();
        coinAmount.textContent = formatNumber(data.coins);
        coinCard.classList.remove("pulse");
        void coinCard.offsetWidth;
        coinCard.classList.add("pulse");

        const rank = ranks.reduce((acc, item) => data.xp >= item.min ? item : acc, ranks[0]);
        const next = Math.max(rank.next - rank.min, 1);
        const pct = Math.max(0, Math.min(100, ((data.xp - rank.min) / next) * 100));
        rankName.textContent = rank.name;
        rankIcon.textContent = rank.icon;
        rankCard.style.color = rank.color;
        rankProgress.style.width = `${pct}%`;
        localStorage.setItem("gs_visual_rank", JSON.stringify({ rank: rank.name, xp: data.xp, updatedAt: Date.now() }));
    }

    function notify(text) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = text;
        toastLayer.appendChild(toast);
        setTimeout(() => toast.remove(), 4600);
    }

    let previewActive = true;

    function showPanel(key) {
        const panel = panels[key];
        if (!panel) return;
        panelTitle.textContent = panel.title;
        panelContent.innerHTML = panel.html + (panel.action ? `<button class="pro-btn panel-open" data-open="${panel.action}">Abrir</button>` : "");
        panelContent.querySelector("[data-open]")?.addEventListener("click", (event) => {
            launchGame({ panel: event.currentTarget.dataset.open });
        });
    }

    function openGamePanel(panel) {
        const game = window.game;
        if (!game) return;
        game.hideAllScreens?.();
        document.getElementById("gamificationUI")?.classList.remove("hidden");
        document.querySelectorAll(".gamification-panel").forEach((item) => item.classList.add("hidden"));
        const panelIds = { shop: "shopPanel", ranking: "rankingPanel", missions: "missionsPanel", battle: "battlePassPanel" };
        const target = document.getElementById(panelIds[panel]);
        if (target) target.classList.remove("hidden");
        if (panel === "shop") game.gamification?.renderShop?.("skin");
        if (panel === "ranking") game.gamification?.renderRanking?.("coins");
    }

    function enterGameView() {
        previewActive = false;
        document.body.classList.remove("menu-active");
        document.body.classList.add("game-active");
        document.body.classList.remove("launching");
    }

    function launchGame(options = {}) {
        document.body.dataset.indexPanel = options.panel || options.mode || "normal";
        document.body.classList.add("launching");
        setTimeout(() => {
            enterGameView();
            setTimeout(() => {
                if (options.panel && options.panel !== "planet") {
                    openGamePanel(options.panel);
                    return;
                }
                if (options.mode === "coliseum" && typeof window.openColiseumSelector === "function") {
                    window.openColiseumSelector();
                    return;
                }
                const buttonId = options.mode === "coliseum" ? "btnColiseum" : "btnStart";
                const button = document.getElementById(buttonId);
                if (button) button.click();
                else window.game?.startGame?.();
            }, 80);
        }, 760);
    }

    function returnToIndexMenu() {
        delete document.body.dataset.indexPanel;
        document.body.classList.remove("game-active", "launching");
        document.body.classList.add("menu-active");
        document.getElementById("gamificationUI")?.classList.add("hidden");
        document.querySelectorAll(".gamification-panel").forEach((item) => item.classList.add("hidden"));
        window.game?.hideAllScreens?.();
        document.getElementById("mainMenu")?.classList.remove("hidden");
        updateProgression();
        if (!previewActive) {
            previewActive = true;
            requestAnimationFrame(animatePreview);
        }
    }

    window.returnToIndexMenu = returnToIndexMenu;

    function addRipple(button, event) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    document.querySelectorAll(".pro-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            addRipple(button, event);
            const mode = button.dataset.play;
            const panel = button.dataset.panel;
            if (mode === "normal") launchGame({ mode: "normal" });
            else if (mode === "coliseum") launchGame({ mode: "coliseum" });
            else if (panel) {
                showPanel(panel);
                if (panels[panel]?.action && ["shop", "inventory", "stats"].includes(panel)) notify(`Modulo listo: ${panels[panel].title}`);
            }
        });
    });

    document.addEventListener("click", (event) => {
        const target = event.target.closest("button");
        if (!target || !document.body.dataset.indexPanel) return;
        const returnIds = new Set([
            "closeMissions",
            "closeShop",
            "closeRanking",
            "closeBattlePass",
            "btnBackMapSelect",
            "btnBackColiseumSelect",
            "btnBackGamification",
            "btnMenu",
            "btnMenuPause",
            "btnMenuVictory"
        ]);
        if (returnIds.has(target.id)) {
            setTimeout(returnToIndexMenu, 0);
        }
    });

    function drawShip(x, y, t) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(t * 0.02) * 0.08);
        ctx.shadowColor = "#6ae2ff";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#6ae2ff";
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(-18, -15);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-18, 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(5, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    const state = {
        t: 0,
        shots: [],
        enemies: [],
        stars: Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * 1.5 + 0.4,
            a: Math.random()
        }))
    };

    function spawnPreviewEntities() {
        if (state.t % 18 === 0) state.shots.push({ x: 220, y: 175 + Math.sin(state.t * 0.04) * 55 });
        if (state.t % 70 === 0) state.enemies.push({ x: canvas.width + 30, y: 70 + Math.random() * 220, r: 12 + Math.random() * 10, hit: 0 });
    }

    function animatePreview() {
        if (!previewActive) return;
        state.t++;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, "#020611");
        bg.addColorStop(1, "#0b1f46");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        for (const star of state.stars) {
            star.x -= star.z * 0.35;
            if (star.x < 0) {
                star.x = w;
                star.y = Math.random() * h;
            }
            ctx.globalAlpha = 0.35 + Math.sin(state.t * 0.03 + star.a * 6) * 0.25;
            ctx.fillStyle = "#fff";
            ctx.fillRect(star.x, star.y, star.z * 1.7, star.z * 1.7);
        }
        ctx.globalAlpha = 1;

        spawnPreviewEntities();
        const shipY = 180 + Math.sin(state.t * 0.025) * 58;
        drawShip(150 + Math.sin(state.t * 0.018) * 28, shipY, state.t);

        for (let i = state.shots.length - 1; i >= 0; i--) {
            const shot = state.shots[i];
            shot.x += 9;
            ctx.strokeStyle = "#ffd166";
            ctx.shadowColor = "#ffd166";
            ctx.shadowBlur = 12;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(shot.x - 18, shot.y);
            ctx.lineTo(shot.x + 8, shot.y);
            ctx.stroke();
            if (shot.x > w + 40) state.shots.splice(i, 1);
        }
        ctx.shadowBlur = 0;

        for (let i = state.enemies.length - 1; i >= 0; i--) {
            const enemy = state.enemies[i];
            enemy.x -= 3.2;
            enemy.y += Math.sin((state.t + i * 9) * 0.04) * 0.7;
            for (const shot of state.shots) {
                if (Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < enemy.r + 8) {
                    enemy.hit = 12;
                    shot.x = w + 80;
                }
            }
            ctx.fillStyle = enemy.hit > 0 ? "#ffd166" : "#c56bff";
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = enemy.hit > 0 ? 22 : 12;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(enemy.x - 4, enemy.y - 3, enemy.r * 0.24, 0, Math.PI * 2);
            ctx.arc(enemy.x + 5, enemy.y - 3, enemy.r * 0.24, 0, Math.PI * 2);
            ctx.fill();
            if (enemy.hit > 0) enemy.hit--;
            if (enemy.x < -40) state.enemies.splice(i, 1);
        }
        ctx.shadowBlur = 0;

        if (previewActive) requestAnimationFrame(animatePreview);
    }

    updateProgression();
    animatePreview();
    setTimeout(() => notify("Evento activo: Invasion alienigena"), 700);
    setTimeout(() => notify("Recompensa diaria disponible"), 1800);
    setTimeout(() => notify("Nuevo jefe desbloqueado"), 3100);
})();
