(function () {
    "use strict";

    if (window.__mobileControlsInstalled) return;
    window.__mobileControlsInstalled = true;

    const ui = {
        root: null,
        rotate: null,
        leftZone: null,
        rightZone: null,
        leftStick: null,
        rightStick: null,
        buttons: Object.create(null)
    };

    const input = {
        move: { active: false, x: 0, y: 0, id: null },
        aim: { active: false, x: 0, y: 0, id: null },
        hold: Object.create(null)
    };

    const state = {
        isMobile: false,
        landscape: true
    };

    function detectMobile() {
        const ua = navigator.userAgent || "";
        const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
        const narrow = Math.min(window.innerWidth, window.innerHeight) <= 1024;
        state.isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua) || (touch && narrow);
        state.landscape = window.innerWidth >= window.innerHeight;
        document.body.classList.toggle("mobile-device", state.isMobile);
        document.body.classList.toggle("is-portrait", state.isMobile && !state.landscape);
        return state.isMobile;
    }

    function canVibrate() {
        return !!navigator.vibrate;
    }

    function vibe(ms = 12) {
        if (state.isMobile && canVibrate()) navigator.vibrate(ms);
    }

    function pressKey(code, on) {
        if (!window.game?.keys) return;
        game.keys[code] = !!on;
    }

    function applyMove() {
        const x = input.move.x;
        const y = input.move.y;
        pressKey("KeyW", y < -0.2);
        pressKey("ArrowUp", y < -0.2);
        pressKey("KeyS", y > 0.2);
        pressKey("ArrowDown", y > 0.2);
        pressKey("KeyA", x < -0.2);
        pressKey("ArrowLeft", x < -0.2);
        pressKey("KeyD", x > 0.2);
        pressKey("ArrowRight", x > 0.2);
    }

    function resetMoveKeys() {
        ["KeyW", "ArrowUp", "KeyS", "ArrowDown", "KeyA", "ArrowLeft", "KeyD", "ArrowRight"].forEach(code => pressKey(code, false));
    }

    function setStickPosition(stick, nx, ny) {
        if (!stick) return;
        stick.style.transform = `translate(${nx * 32}px, ${ny * 32}px)`;
    }

    function normalizeJoystick(zone, clientX, clientY) {
        const rect = zone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const max = rect.width * 0.34;
        const len = Math.hypot(dx, dy) || 1;
        if (len > max) {
            dx = dx / len * max;
            dy = dy / len * max;
        }
        return { x: dx / max, y: dy / max };
    }

    function mapAimToMouse(nx, ny) {
        if (!window.game?.mouse || !window.game?.player) return;
        const p = game.player;
        const range = 260;
        game.mouse.x = p.x + nx * range;
        game.mouse.y = p.y + ny * range;
    }

    function updateButtonActive(key, on) {
        const el = ui.buttons[key];
        if (el) el.classList.toggle("is-active", !!on);
    }

    function setHoldButton(key, on) {
        input.hold[key] = !!on;
        updateButtonActive(key, on);
        if (key === "teleport") pressKey("KeyQ", on);
        else if (key === "skill") pressKey("KeyE", on);
        else if (key === "blast") pressKey("KeyC", on);
        else if (key === "dash") pressKey("ShiftLeft", on);
        else if (key === "reload") pressKey("KeyR", on);
        else if (key === "super" && window.game?.mouse) game.mouse.right = on;
    }

    function syncMobileInput() {
        if (!state.isMobile || !window.game) return;
        applyMove();
        if (input.aim.active) {
            game.mouse.down = true;
            mapAimToMouse(input.aim.x, input.aim.y);
        } else if (!input.hold.super) {
            game.mouse.down = false;
        }
    }

    function makeButton(id, label, sub, className) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = className;
        b.dataset.btn = id;
        b.innerHTML = `${label}<span class="mobile-btn-label">${sub}</span>`;
        ui.buttons[id] = b;
        return b;
    }

    function showRoot(show) {
        if (!ui.root) return;
        ui.root.classList.toggle("hidden", !show);
    }

    function updateVisibility() {
        if (!window.game || !ui.root) return;
        const showMobile = state.isMobile && ["playing", "paused", "shop"].includes(game.state);
        showRoot(showMobile);
        if (ui.rotate) ui.rotate.classList.toggle("hidden", !(state.isMobile && !state.landscape && game.state === "playing"));
    }

    function forceMenuExit() {
        if (!window.game) return;
        game.showMenu();
        if (game.mouse) {
            game.mouse.down = false;
            game.mouse.right = false;
        }
        resetMoveKeys();
        ["teleport", "skill", "blast", "dash", "reload", "super"].forEach(k => setHoldButton(k, false));
    }

    function setupWheelScrollFix() {
        document.addEventListener("wheel", (event) => {
            const target = event.target.closest("#shopContent, #missionsList, #rankingList, #bpRewardsList, #mapGrid, .panel-content, .gamification-panel, .side-panel, #panelContent");
            if (!target) return;
            const canScroll = target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth;
            if (!canScroll) return;
            target.scrollTop += event.deltaY;
            event.preventDefault();
        }, { passive: false });
    }

    function buildUI() {
        if (ui.root) return;
        const container = document.getElementById("gameContainer");
        if (!container) return;

        const root = document.createElement("div");
        root.className = "mobile-controls-root hidden";
        root.innerHTML = `
            <div class="rotate-lock hidden">
                <div class="rotate-lock-card">
                    <strong>Gira el celular</strong>
                    <span>Usa el juego en horizontal para ver mejor el escenario y los controles.</span>
                </div>
            </div>
            <div class="mobile-top-actions"></div>
            <div class="mobile-right-actions"></div>
            <div class="mobile-joystick-zone left"><div class="mobile-joystick"><div class="mobile-stick"></div></div></div>
            <div class="mobile-joystick-zone right"><div class="mobile-joystick"><div class="mobile-stick"></div></div></div>
        `;
        container.appendChild(root);
        ui.root = root;
        ui.rotate = root.querySelector(".rotate-lock");
        ui.leftZone = root.querySelector(".mobile-joystick-zone.left");
        ui.rightZone = root.querySelector(".mobile-joystick-zone.right");
        ui.leftStick = ui.leftZone.querySelector(".mobile-stick");
        ui.rightStick = ui.rightZone.querySelector(".mobile-stick");

        const top = root.querySelector(".mobile-top-actions");
        const right = root.querySelector(".mobile-right-actions");
        top.appendChild(makeButton("pause", "II", "PAUSA", "mobile-top-btn"));
        top.appendChild(makeButton("exit", "X", "SALIR", "mobile-top-btn"));
        right.appendChild(makeButton("teleport", "Q", "SKILL", "mobile-skill-btn"));
        right.appendChild(makeButton("skill", "E", "ALIADO", "mobile-skill-btn"));
        right.appendChild(makeButton("blast", "C", "BLAST", "mobile-skill-btn"));
        right.appendChild(makeButton("dash", "D", "DASH", "mobile-skill-btn"));
        right.appendChild(makeButton("reload", "R", "REC", "mobile-skill-btn"));
        right.appendChild(makeButton("super", "S", "SUPER", "mobile-super-btn"));

        ui.buttons.pause.addEventListener("click", () => {
            vibe(16);
            if (!window.game) return;
            if (game.state === "playing") game.pause();
            else if (game.state === "paused") game.resume();
            updateVisibility();
        });
        ui.buttons.exit.addEventListener("click", () => {
            vibe(20);
            forceMenuExit();
            updateVisibility();
        });

        ["teleport", "skill", "blast", "dash", "reload", "super"].forEach(key => {
            const btn = ui.buttons[key];
            const down = (e) => {
                e.preventDefault();
                vibe(10);
                setHoldButton(key, true);
            };
            const up = (e) => {
                e.preventDefault();
                setHoldButton(key, false);
            };
            btn.addEventListener("pointerdown", down, { passive: false });
            btn.addEventListener("pointerup", up, { passive: false });
            btn.addEventListener("pointercancel", up, { passive: false });
            btn.addEventListener("pointerleave", up, { passive: false });
        });

        const bindJoystick = (zone, stick, slot) => {
            zone.addEventListener("pointerdown", (e) => {
                if (!state.isMobile) return;
                e.preventDefault();
                zone.setPointerCapture?.(e.pointerId);
                const n = normalizeJoystick(zone, e.clientX, e.clientY);
                input[slot].active = true;
                input[slot].id = e.pointerId;
                input[slot].x = n.x;
                input[slot].y = n.y;
                setStickPosition(stick, n.x, n.y);
                if (slot === "aim") {
                    mapAimToMouse(n.x, n.y);
                    if (window.game?.mouse) game.mouse.down = true;
                }
            }, { passive: false });
            zone.addEventListener("pointermove", (e) => {
                if (input[slot].id !== e.pointerId) return;
                e.preventDefault();
                const n = normalizeJoystick(zone, e.clientX, e.clientY);
                input[slot].x = n.x;
                input[slot].y = n.y;
                setStickPosition(stick, n.x, n.y);
                if (slot === "aim") mapAimToMouse(n.x, n.y);
            }, { passive: false });
            const release = (e) => {
                if (input[slot].id !== e.pointerId) return;
                e.preventDefault();
                input[slot].active = false;
                input[slot].id = null;
                input[slot].x = 0;
                input[slot].y = 0;
                setStickPosition(stick, 0, 0);
                if (slot === "aim" && window.game?.mouse) game.mouse.down = false;
                if (slot === "move") resetMoveKeys();
            };
            zone.addEventListener("pointerup", release, { passive: false });
            zone.addEventListener("pointercancel", release, { passive: false });
        };

        bindJoystick(ui.leftZone, ui.leftStick, "move");
        bindJoystick(ui.rightZone, ui.rightStick, "aim");
    }

    function patchGame() {
        if (typeof Game === "undefined" || Game.prototype.__mobileControlsPatch) return;

        const oldSetupInput = Game.prototype.setupInput;
        Game.prototype.setupInput = function () {
            oldSetupInput.call(this);
            this.canvas.addEventListener("wheel", (e) => {
                const mapMouse = () => {
                    const rect = this.canvas.getBoundingClientRect();
                    const mx = (e.clientX - rect.left - this.offsetX) / this.scale;
                    const my = (e.clientY - rect.top - this.offsetY) / this.scale;
                    this.mouse.x = mx;
                    this.mouse.y = my;
                };
                mapMouse();
                if (!this.player) return;
                const weapons = ["normal", "triple", "quintuple", "grenade", "laser", "shockwave", "homing", "shotgun", "railgun", "plasma", "flame", "tesla", "iceburst", "gravity", "nuclear"];
                const current = weapons.indexOf(this.player.weaponType);
                const next = current < 0 ? 0 : (current + (e.deltaY > 0 ? 1 : -1) + weapons.length) % weapons.length;
                this.player.weaponType = weapons[next];
                e.preventDefault();
            }, { passive: false });
        };

        const oldSetupUI = Game.prototype.setupUI;
        Game.prototype.setupUI = function () {
            oldSetupUI.call(this);
            const pauseButtons = document.querySelector("#pauseScreen .menuButtons");
            if (pauseButtons && !document.getElementById("btnExitPause")) {
                const exitBtn = document.createElement("button");
                exitBtn.id = "btnExitPause";
                exitBtn.className = "menuBtn";
                exitBtn.textContent = "Salir del juego";
                exitBtn.addEventListener("click", () => forceMenuExit());
                pauseButtons.appendChild(exitBtn);
            }
        };

        const oldStartGame = Game.prototype.startGame;
        Game.prototype.startGame = function () {
            oldStartGame.call(this);
            detectMobile();
            updateVisibility();
        };

        const oldShowMenu = Game.prototype.showMenu;
        Game.prototype.showMenu = function () {
            oldShowMenu.call(this);
            updateVisibility();
        };

        const oldPause = Game.prototype.pause;
        Game.prototype.pause = function () {
            oldPause.call(this);
            updateVisibility();
        };

        const oldResume = Game.prototype.resume;
        Game.prototype.resume = function () {
            oldResume.call(this);
            updateVisibility();
        };

        const oldHideAllScreens = Game.prototype.hideAllScreens;
        Game.prototype.hideAllScreens = function () {
            oldHideAllScreens.call(this);
            updateVisibility();
        };

        const oldLoop = Game.prototype.loop;
        Game.prototype.loop = function (timestamp) {
            syncMobileInput();
            oldLoop.call(this, timestamp);
            updateVisibility();
        };

        Game.prototype.__mobileControlsPatch = true;
    }

    function init() {
        detectMobile();
        buildUI();
        setupWheelScrollFix();
        patchGame();
        window.addEventListener("resize", () => {
            detectMobile();
            updateVisibility();
        });
        window.addEventListener("orientationchange", () => {
            detectMobile();
            updateVisibility();
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
