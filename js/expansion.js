// Expansion: maps, coliseum, extended skins, advanced shop, electric chains.
(function () {
    if (window.__galacticExpansionInstalled) return;
    window.__galacticExpansionInstalled = true;

    const MAPS = [
        { id: "galaxy", name: "Galaxia", diff: 1, color: "#6ae2ff", accent: "#c56bff", desc: "Equilibrado, mezcla todos los enemigos y jefes.", enemies: null, bosses: ["mothership", "mech_beast", "robot_colossal", "electric_boss", "bomber_supreme", "supreme_dreadnought"], mini: ["mini_ship", "mini_mecha", "heavy_drone_boss", "ghost_lord"] },
        { id: "mars", name: "Marte", diff: 1.12, color: "#e85d3f", accent: "#ffd166", desc: "Tormentas de arena, meteoritos rojos y roca.", enemies: ["big", "tank", "kamikaze", "dynamiter", "grenadier", "trapper", "exploder"], bosses: ["tank_giant", "robot_colossal", "bomber_supreme"], mini: ["mini_tank", "mini_bomber", "mini_heavy_ship"] },
        { id: "moon", name: "Luna", diff: 1.08, color: "#cbd5e1", accent: "#7df9ff", desc: "Gravedad ligera, enemigos lentos y resistentes.", enemies: ["tank", "heavy_drone", "ghost", "freezer", "laser_turret", "sniper"], bosses: ["black_hole", "living_planet", "electric_boss"], mini: ["armored_dog", "ghost_lord", "mini_nuclear"] },
        { id: "jupiter", name: "Jupiter", diff: 1.2, color: "#f7b267", accent: "#f8ff6a", desc: "Tormentas gigantes y rayos electricos.", enemies: ["fast", "flyer", "electro", "laser_turret", "erratic", "expander", "police_sniper"], bosses: ["electric_boss", "supreme_dreadnought", "mothership"], mini: ["mini_ship", "mini_space_dragon", "mini_summoner"] },
        { id: "sun", name: "Sol", diff: 1.26, color: "#ff9f1c", accent: "#fff3b0", desc: "Calor extremo, fuego y explosiones solares.", enemies: ["bomber", "kamikaze", "exploder", "nuke_carrier", "toxic", "dynamiter"], bosses: ["bomber_supreme", "electric_boss", "mech_beast"], mini: ["mini_bomber", "mini_nuclear", "mini_space_dragon"] },
        { id: "blackhole", name: "Agujero Negro", diff: 1.35, color: "#1b102f", accent: "#b388ff", desc: "Distorsion oscura y enemigos gravitacionales.", enemies: ["ghost", "cloner", "erratic", "invisible", "leech", "freezer", "toxic"], bosses: ["black_hole", "living_planet", "supreme_dreadnought"], mini: ["ghost_lord", "splitter_boss", "mini_summoner"] },
        { id: "jurassic", name: "Planeta Jurasico", diff: 1.42, color: "#7ae582", accent: "#ff6b35", desc: "Dinosaurios, volcanes, meteoritos y selva.", enemies: ["canine", "big", "fast", "kamikaze", "slime", "splitter", "tank", "flyer"], bosses: ["mech_beast", "tank_giant", "living_planet"], mini: ["armored_dog", "splitter_boss", "mini_ninja", "mini_tank"] },
        { id: "nuclear", name: "Planeta Nuclear", diff: 1.5, color: "#9cff3a", accent: "#ff334d", desc: "Radioactividad, toxinas y jefes atomicos.", enemies: ["toxic", "nuke_carrier", "exploder", "bomber", "tank", "leech", "grenadier"], bosses: ["bomber_supreme", "robot_colossal", "tank_giant"], mini: ["mini_nuclear", "mini_bomber", "mini_heavy_ship"] },
        { id: "meat", name: "Mundo Carne", diff: 1.32, color: "#7f1d1d", accent: "#ff6b6b", desc: "Carnicerio organico, enemigos agresivos y jefes de carne.", enemies: ["leech", "toxic", "splitter", "slime", "kamikaze", "big", "exploder"], bosses: ["living_planet", "mech_beast", "tank_giant"], mini: ["splitter_boss", "ghost_lord", "armored_dog"] },
        { id: "arena", name: "Mundo Coliseo", diff: 1.38, color: "#b45309", accent: "#ffd166", desc: "Arena gladiadora, rondas rapidas y duelos cuerpo a cuerpo.", enemies: ["fast", "tank", "kamikaze", "canine", "mecha", "scout_ship"], bosses: ["tank_giant", "robot_colossal", "mech_beast"], mini: ["mini_tank", "mini_ninja", "mini_mecha"] },
        { id: "lava", name: "Mundo Lava", diff: 1.44, color: "#dc2626", accent: "#ffba08", desc: "Lava animada, fuego, rocas y enemigos explosivos.", enemies: ["bomber", "exploder", "dynamiter", "grenadier", "nuke_carrier", "kamikaze"], bosses: ["bomber_supreme", "mech_beast", "electric_boss"], mini: ["mini_bomber", "mini_nuclear", "mini_space_dragon"] },
        { id: "iceworld", name: "Mundo Hielo", diff: 1.24, color: "#60a5fa", accent: "#dbeafe", desc: "Nieve, congelacion y jefes de hielo.", enemies: ["freezer", "tank", "ghost", "sniper", "laser_turret", "heavy_drone"], bosses: ["black_hole", "living_planet", "supreme_dreadnought"], mini: ["ghost_lord", "mini_heavy_ship", "mini_nuclear"] },
        { id: "darkworld", name: "Mundo Oscuro", diff: 1.52, color: "#111827", accent: "#a855f7", desc: "Sombras, bajo brillo y enemigos muy agresivos.", enemies: ["ghost", "invisible", "leech", "erratic", "cloner", "toxic", "police_sniper"], bosses: ["black_hole", "supreme_dreadnought", "living_planet"], mini: ["ghost_lord", "splitter_boss", "mini_summoner"] }
    ];

    const EXTRA_SKINS = [
        ["moon", "Luna", "Rara", "Astronomicas", 420, "#cbd5e1", "#7df9ff", "moon", "lunar", "Disparo: proyectiles plateados. Especial: gravedad lunar."],
        ["mars", "Marte", "Epica", "Astronomicas", 540, "#e85d3f", "#ffd166", "mars", "storm", "Disparo: roca roja explosiva. Especial: tormenta marciana."],
        ["jupiter", "Jupiter", "Legendaria", "Astronomicas", 780, "#f7b267", "#f8ff6a", "electric", "redspot", "Disparo: rayos de tormenta gigante. Especial: gran tormenta roja."],
        ["galaxy", "Galaxia", "Cosmica", "Astronomicas", 820, "#6ae2ff", "#c56bff", "galaxy", "stars", "Disparo: energia cosmica. Especial: lluvia de estrellas."],
        ["comet", "Cometa", "Epica", "Astronomicas", 610, "#9be7ff", "#ffffff", "comet", "charge", "Disparo: cometas veloces. Especial: embestida cosmica."],
        ["nebula", "Nebulosa", "Epica", "Astronomicas", 650, "#c56bff", "#7ae582", "poison", "nebula", "Disparo: gas cosmico venenoso. Especial: nube de nebulosa."],
        ["supernova", "Supernova", "Mitica", "Astronomicas", 980, "#ff4fd8", "#ffd166", "supernova", "supernova", "Disparo: orbes explosivos. Especial: explosion supernova masiva."],
        ["trex", "T-Rex", "Jurasica", "Dinosaurios", 620, "#7ae582", "#ffea00", "bite", "roar", "Disparo: mordidas de energia. Especial: rugido paralizante."],
        ["raptor", "Raptor", "Jurasica", "Dinosaurios", 560, "#66c56f", "#ffffff", "claw", "dash", "Disparo: garras rapidas. Especial: dash multiple."],
        ["triceratops", "Triceratops", "Jurasica", "Dinosaurios", 680, "#b5a26a", "#fff3b0", "horn", "charge", "Disparo: cuernos de energia. Especial: carga frontal."],
        ["pterodactyl", "Pterodactilo", "Jurasica", "Dinosaurios", 600, "#8ecae6", "#ffb703", "air", "rocks", "Disparo: rafagas aereas. Especial: lluvia de rocas."],
        ["spinosaurus", "Espinosaurio", "Jurasica", "Dinosaurios", 720, "#48cae4", "#caf0f8", "water", "tsunami", "Disparo: agua cortante. Especial: tsunami jurasico."],
        ["ankylosaurus", "Anquilosaurio", "Jurasica", "Dinosaurios", 660, "#8d99ae", "#ffd166", "heavy", "seismic", "Disparo: bolas pesadas. Especial: golpe sismico."],
        ["dino_nuclear", "Dino Nuclear", "Nuclear", "Dinosaurios", 920, "#9cff3a", "#ff334d", "radio", "jurassic_nuke", "Disparo: baba radioactiva. Especial: explosion nuclear jurasica."],
        ["fossil_dino", "Dino Fosil", "Mitica", "Dinosaurios", 840, "#d6c7a1", "#ffffff", "bone", "allies", "Disparo: huesos afilados. Especial: aliados fosiles."],
        ["military_ship", "Nave Militar", "Rara", "Naves", 500, "#8d99ae", "#ff6b35", "rapid", "airstrike", "Disparo: balas rapidas. Especial: bombardeo aereo."],
        ["alien_ship", "Nave Alienigena", "Epica", "Naves", 670, "#80ffdb", "#7ae582", "alien", "abduct", "Disparo: plasma verde. Especial: abduccion."],
        ["mecha_ship", "Nave Mecha", "Legendaria", "Naves", 780, "#adb5bd", "#ff4d6d", "missile", "cannon", "Disparo: misiles. Especial: canon gigante."],
        ["ghost_ship", "Nave Fantasma", "Epica", "Naves", 700, "#d8f3ff", "#b388ff", "ghost", "phase", "Disparo: proyectiles espectrales. Especial: invisibilidad."],
        ["dragon_ship", "Nave Dragon", "Legendaria", "Naves", 860, "#ff5400", "#ffd166", "dragon", "dragon", "Disparo: fuego. Especial: dragon de fuego."],
        ["angel_ship", "Nave Angel", "Mitica", "Naves", 900, "#ffffff", "#ffd166", "holy", "holy", "Disparo: luz sagrada. Especial: cura y rayo celestial."],
        ["demon_ship", "Nave Demonio", "Mitica", "Naves", 920, "#9d0208", "#ffba08", "demon", "infernal", "Disparo: fuego oscuro. Especial: circulo infernal."],
        ["dynamite", "Dinamita", "Epica", "Naves", 690, "#d62828", "#ffba08", "dynamite", "dynamite_barrage", "Disparo: cartuchos de dinamita explosiva. Especial: muchas rafagas de dinamita."],
        ["meat_skin", "Carne", "Epica", "Organicas", 620, "#7f1d1d", "#ff6b6b", "meat", "meat_pulse", "Disparo: fragmentos organicos. Especial: pulso carnico que drena enemigos."],
        ["lava_skin", "Lava", "Legendaria", "Elementales", 760, "#dc2626", "#ffba08", "lava", "lava_wave", "Disparo: rocas de lava. Especial: ola de lava ardiente."],
        ["frost_skin", "Hielo Profundo", "Epica", "Elementales", 640, "#60a5fa", "#dbeafe", "frost", "deep_freeze", "Disparo: lanzas de hielo. Especial: congelacion total."],
        ["robot_skin", "Robot", "Rara", "Naves", 560, "#94a3b8", "#38bdf8", "robot", "drone_swarm", "Disparo: rafaga mecanica. Especial: enjambre de drones."],
        ["shadow_skin", "Sombra", "Mitica", "Oscuras", 880, "#111827", "#a855f7", "shadow", "shadow_burst", "Disparo: cuchillas sombrias. Especial: explosion de sombras."],
        ["energy_skin", "Energia", "Cosmica", "Astronomicas", 940, "#22d3ee", "#ffffff", "energy", "energy_overload", "Disparo: energia pura. Especial: sobrecarga total."],
        ["gladiator_skin", "Gladiador", "Legendaria", "Coliseo", 790, "#b45309", "#ffd166", "gladiator", "arena_slash", "Disparo: lanzas de arena. Especial: corte de gladiador."]
    ].map(([id, name, rarity, category, price, color, accent, shot, special, desc]) => ({ id, name, rarity, category, price, color, accent, shot, special, desc, cooldown: Math.max(480, Math.min(920, price)) }));

    const COLISEUM_BOSSES = [
        { type: "police_commander", name: "JEFE POLICIA SUPREMO", color: "#7df9ff", hp: 1.15 },
        { type: "mech_beast", name: "T-REX ALFA DEL COLISEO", color: "#7ae582", hp: 1.2 },
        { type: "tank_giant", name: "TRICERATOPS BLINDADO", color: "#ffd166", hp: 1.18 },
        { type: "bomber_supreme", name: "JEFE RADIOACTIVO", color: "#9cff3a", hp: 1.3 },
        { type: "robot_colossal", name: "ROBOT POLICIAL GIGANTE", color: "#adb5bd", hp: 1.22 },
        { type: "electric_boss", name: "COMANDANTE DE TORMENTA", color: "#f8ff6a", hp: 1.18 },
        { type: "black_hole", name: "SEÑOR DEL AGUJERO NEGRO", color: "#b388ff", hp: 1.28 },
        { type: "living_planet", name: "DEVORADOR JURASICO", color: "#ff6b35", hp: 1.35 },
        { type: "supreme_dreadnought", name: "SUPER JEFE ACORAZADO", color: "#ff4fd8", hp: 1.32 },
        { type: "mothership", name: "NODRIZA POLICIAL GALACTICA", color: "#6ae2ff", hp: 1.12 },
        { type: "bomber_supreme", name: "TITAN DE URANIO", color: "#b7ff00", hp: 1.42 },
        { type: "mech_beast", name: "DINO NUCLEAR COLOSAL", color: "#9cff3a", hp: 1.38 },
        { type: "robot_colossal", name: "REACTOR VIVIENTE", color: "#ff334d", hp: 1.36 },
        { type: "electric_boss", name: "GRAN TORMENTA ROJA", color: "#f7b267", hp: 1.24 },
        { type: "supreme_dreadnought", name: "COMETA DESTRUCTOR", color: "#9be7ff", hp: 1.3 }
    ];

    const COLISEUM_MINIS = [
        { type: "mini_ship", name: "MINI JEFE POLICIA", color: "#7df9ff", hp: 1.15 },
        { type: "mini_tank", name: "TANQUE POLICIAL", color: "#adb5bd", hp: 1.18 },
        { type: "armored_dog", name: "DINO BLINDADO", color: "#7ae582", hp: 1.2 },
        { type: "mini_ninja", name: "RAPTOR SUPREMO", color: "#66c56f", hp: 1.16 },
        { type: "mini_space_dragon", name: "PTERODACTILO REY", color: "#8ecae6", hp: 1.18 },
        { type: "mini_nuclear", name: "MINI REACTOR RADIOACTIVO", color: "#9cff3a", hp: 1.25 },
        { type: "mini_bomber", name: "BOMBARDERO TOXICO", color: "#ff334d", hp: 1.2 },
        { type: "mini_mecha", name: "ROBOT PESADO", color: "#adb5bd", hp: 1.22 },
        { type: "mini_heavy_ship", name: "NAVE ELITE POLICIAL", color: "#6ae2ff", hp: 1.17 },
        { type: "ghost_lord", name: "MUTANTE RADIOACTIVO", color: "#b388ff", hp: 1.24 },
        { type: "splitter_boss", name: "CRIATURA FISION", color: "#c56bff", hp: 1.2 },
        { type: "mini_summoner", name: "INVOCADOR DEL COLISEO", color: "#ff4fd8", hp: 1.16 }
    ];

    let lastColiseumKind = "";
    let lastColiseumBoss = null;
    let lastColiseumMini = null;

    const mapOf = id => MAPS.find(m => m.id === id) || MAPS[0];
    const skinList = () => window.skinSystem ? window.skinSystem.skins : [];

    function extendSkins() {
        if (!window.skinSystem || window.skinSystem.__bigCatalog) return;
        const existing = new Set(skinList().map(s => s.id));
        for (const s of skinList()) {
            s.rarity ||= s.price >= 900 ? "Mitica" : s.price >= 700 ? "Legendaria" : s.price >= 550 ? "Epica" : s.price > 0 ? "Rara" : "Comun";
            s.category ||= "Astronomicas";
        }
        for (const s of EXTRA_SKINS) if (!existing.has(s.id)) skinList().push(s);
        window.skinSystem.__bigCatalog = true;
    }

    function targets() {
        const list = [...game.enemyManager.enemies.filter(e => !e.dead && e.spawnTimer <= 0)];
        if (game.miniBoss && !game.miniBoss.dead) list.push(game.miniBoss);
        if (game.boss && !game.boss.dead) list.push(game.boss);
        return list;
    }

    function pulse(x, y, r, dmg, color, status) {
        for (const t of targets()) {
            if (dist(x, y, t.x, t.y) < r + (t.radius || 20)) {
                t.takeDamage(dmg * (1 - Math.min(0.65, dist(x, y, t.x, t.y) / r)));
                if (status) t.skinStatus = { ...status };
            }
        }
        game.particles.emitExplosion(x, y, Math.max(1, r / 120));
        game.particles.emitShockwave(x, y, color);
        game.screenShake.shake(Math.min(28, r / 20));
    }

    function bolt(x1, y1, x2, y2, color = "#f8ff6a", life = 14) {
        game.bulletManager.electricBolts ||= [];
        game.bulletManager.electricBolts.push({ x1, y1, x2, y2, color, life, maxLife: life, jitter: rand(8, 16) });
        game.particles.emit(x2, y2, 10, { colors: [color, "#7df9ff", "#ffffff"], speed: 4, life: 14, size: 2.5, glow: true });
    }

    function electricChain(x, y, a, dmg = 18, range = 720, jumps = 5) {
        const endX = x + Math.cos(a) * range;
        const endY = y + Math.sin(a) * range;
        const pool = targets();
        let first = null;
        let best = Infinity;
        for (const t of pool) {
            const d = pointToSegmentDistance(t.x, t.y, x, y, endX, endY);
            const forward = dist(x, y, t.x, t.y);
            if (d < (t.radius || 20) + 30 && forward < best) {
                first = t;
                best = forward;
            }
        }
        if (!first) {
            bolt(x, y, endX, endY, "#f8ff6a", 8);
            return;
        }
        const hit = new Set();
        let from = { x, y };
        let current = first;
        for (let i = 0; i < jumps && current; i++) {
            current.takeDamage(dmg * Math.max(0.45, 1 - i * 0.15));
            current.slowTimer = Math.max(current.slowTimer || 0, 14);
            bolt(from.x, from.y, current.x, current.y, i % 2 ? "#7df9ff" : "#f8ff6a", 16 - i);
            hit.add(current);
            from = current;
            let next = null;
            let close = 270;
            for (const t of pool) {
                if (hit.has(t) || t.dead) continue;
                const d = dist(current.x, current.y, t.x, t.y);
                if (d < close) {
                    close = d;
                    next = t;
                }
            }
            current = next;
        }
        game.screenShake.shake(5);
    }

    function drawBolts(ctx, list) {
        for (let i = list.length - 1; i >= 0; i--) {
            const b = list[i];
            b.life--;
            if (b.life <= 0) {
                list.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = b.life / b.maxLife;
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 3;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(b.x1, b.y1);
            for (let s = 1; s < 5; s++) {
                const t = s / 5;
                ctx.lineTo(lerp(b.x1, b.x2, t) + rand(-b.jitter, b.jitter), lerp(b.y1, b.y2, t) + rand(-b.jitter, b.jitter));
            }
            ctx.lineTo(b.x2, b.y2);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            ctx.restore();
        }
    }

    function ensureMapScreen() {
        if (document.getElementById("mapSelectScreen")) return;
        const screen = document.createElement("div");
        screen.id = "mapSelectScreen";
        screen.className = "screen hidden";
        screen.innerHTML = '<div class="menuBg"></div><div class="menuContent mapMenuContent"><h2>¿En que planeta quieres jugar?</h2><div id="mapGrid"></div><button id="btnBackMapSelect" class="menuBtn">Volver</button></div>';
        document.getElementById("gameContainer").appendChild(screen);
        const grid = screen.querySelector("#mapGrid");
        for (const map of MAPS) {
            const b = document.createElement("button");
            b.className = "map-card";
            b.style.setProperty("--map-color", map.color);
            b.style.setProperty("--map-accent", map.accent);
            b.innerHTML = `<span class="map-planet"></span><strong>${map.name}</strong><small>${map.desc}</small><em>Dificultad x${map.diff.toFixed(2)}</em>`;
            b.addEventListener("click", () => {
                game.selectedMap = map.id;
                game.pendingMode ||= "normal";
                game.startGame();
            });
            grid.appendChild(b);
        }
        document.getElementById("btnBackMapSelect").addEventListener("click", () => {
            if (window.returnToIndexMenu) window.returnToIndexMenu();
            else game.showMenu();
        });
    }

    function showMapSelect(mode) {
        ensureMapScreen();
        game.pendingMode = mode;
        game.hideAllScreens();
        document.getElementById("mapSelectScreen").classList.remove("hidden");
    }

    function renderShop() {
        extendSkins();
        const c = document.getElementById("shopContent");
        if (!c) return;
        c.classList.add("advanced-shop-grid");
        document.getElementById("skinShopControls")?.remove();
        const controls = document.createElement("div");
        controls.id = "skinShopControls";
        controls.className = "skin-shop-controls";
        controls.innerHTML = '<input id="skinSearch" placeholder="Buscar skin"><select id="skinCategory"><option value="all">Todas</option><option>Astronomicas</option><option>Dinosaurios</option><option>Naves</option></select><select id="skinRarity"><option value="all">Rareza</option><option>Comun</option><option>Rara</option><option>Epica</option><option>Legendaria</option><option>Mitica</option><option>Cosmica</option><option>Jurasica</option><option>Nuclear</option></select>';
        c.parentNode.insertBefore(controls, c);
        const paint = () => {
            const q = (document.getElementById("skinSearch").value || "").toLowerCase();
            const cat = document.getElementById("skinCategory").value;
            const rar = document.getElementById("skinRarity").value;
            c.innerHTML = "";
            for (const s of skinList()) {
                if (q && !(s.name + " " + s.desc).toLowerCase().includes(q)) continue;
                if (cat !== "all" && s.category !== cat) continue;
                if (rar !== "all" && s.rarity !== rar) continue;
                const unlocked = skinSystem.isUnlocked(s.id);
                const equipped = skinSystem.state.equipped === s.id;
                const card = document.createElement("button");
                card.type = "button";
                card.className = `shop-item skin-card ${equipped ? "equipped" : ""} ${unlocked ? "unlocked" : "locked"} rarity-${(s.rarity || "Comun").toLowerCase()}`;
                card.style.setProperty("--skin-color", s.color);
                card.style.setProperty("--skin-accent", s.accent);
                const parts = s.desc.split("Especial:");
                card.innerHTML = `<div class="item-preview skin-preview"></div><div class="skin-rarity">${s.rarity}</div><div class="item-name">${s.name}</div><div class="item-desc"><b>Normal:</b> ${parts[0].replace("Disparo:", "")}<br><b>Especial:</b> ${parts[1] || "Poder unico"}</div><div class="skin-meta"><span>${unlocked ? (equipped ? "Equipada" : "Desbloqueada") : s.price + " monedas"}</span><strong>${equipped ? "Desequipar" : unlocked ? "Equipar" : "Comprar"}</strong></div>`;
                card.addEventListener("click", () => {
                    const res = equipped ? skinSystem.unequip() : unlocked ? skinSystem.equip(s.id) : skinSystem.buy(s.id);
                    showNotif(res.message, res.ok ? "success" : "error");
                    paint();
                    updGamUI();
                });
                c.appendChild(card);
            }
        };
        controls.querySelectorAll("input,select").forEach(el => {
            el.addEventListener("input", paint);
            el.addEventListener("change", paint);
        });
        paint();
    }

    function specialByName(player, skin) {
        const x = player.x, y = player.y, a = player.angle;
        const start = () => {
            if (player.skinSkillTimer > 0) {
                showNotif("Especial en recarga: " + Math.ceil(player.skinSkillTimer / 60) + "s", "error");
                return false;
            }
            player.skinSkillTimer = skin.cooldown || 600;
            player.skinSkillMax = player.skinSkillTimer;
            window.onSkillUsed?.();
            return true;
        };
        if (!EXTRA_SKINS.some(s => s.id === skin.id)) return false;
        if (!start()) return true;
        const line = (steps, r, dmg, color) => { for (let i = 1; i <= steps; i++) setTimeout(() => pulse(x + Math.cos(a) * i * r, y + Math.sin(a) * i * r, r, dmg, color), i * 35); };
        if (["moon", "nebula"].includes(skin.id)) pulse(x, y, 430, 30, skin.accent, { type: skin.id === "moon" ? "freeze" : "poison", frames: 220, damage: 3, color: skin.accent });
        else if (["mars", "pterodactyl", "military_ship", "galaxy"].includes(skin.id)) for (let i = 0; i < 14; i++) setTimeout(() => pulse(clamp(x + rand(-480, 480), 80, CONFIG.canvasWidth - 80), clamp(y + rand(-340, 340), 80, CONFIG.canvasHeight - 80), 115, 42, skin.color), i * 70);
        else if (skin.id === "jupiter") { for (let i = 0; i < 9; i++) setTimeout(() => electricChain(x + rand(-280, 280), y + rand(-220, 220), rand(0, Math.PI * 2), 34, 520, 5), i * 65); pulse(x, y, 360, 44, skin.accent); }
        else if (["supernova", "dino_nuclear"].includes(skin.id)) pulse(x, y, 720, 170, skin.color, skin.id === "dino_nuclear" ? { type: "poison", frames: 260, damage: 4, color: skin.color } : null);
        else if (skin.id === "comet") { player.dashing = true; player.dashTimer = 32; player.dashInvulnTimer = 42; player.vx = Math.cos(a) * 5; player.vy = Math.sin(a) * 5; line(7, 110, 42, skin.color); }
        else if (skin.id === "trex") { for (const e of targets()) if (dist(x, y, e.x, e.y) < 430) { e.vx += Math.cos(angle(x, y, e.x, e.y)) * 12; e.vy += Math.sin(angle(x, y, e.x, e.y)) * 12; e.slowTimer = 180; e.takeDamage(38); } game.screenShake.shake(22); }
        else if (skin.id === "raptor") line(8, 95, 35, skin.accent);
        else if (["triceratops", "spinosaurus", "dragon_ship"].includes(skin.id)) line(12, 95, 40, skin.color);
        else if (skin.id === "ankylosaurus") pulse(x, y, 500, 74, skin.color, { type: "stun", frames: 140, damage: 1, color: skin.accent });
        else if (skin.id === "fossil_dino") { for (let i = 0; i < 3; i++) player.drones.push(new Drone(player)); showNotif("Aliados fosiles invocados", "powerup"); }
        else if (skin.id === "alien_ship") { for (const e of targets()) if (dist(x, y, e.x, e.y) < 440) { e.vx += (x - e.x) * 0.04; e.vy += (y - e.y) * 0.04; e.takeDamage(54); } game.particles.emitShockwave(x, y, skin.color); }
        else if (skin.id === "mecha_ship") for (let i = -2; i <= 2; i++) game.bulletManager.addRailgun(x, y, a + i * 0.04, 72);
        else if (skin.id === "ghost_ship") { player.invulnTimer = 240; setTimeout(() => pulse(player.x, player.y, 310, 72, skin.accent), 900); }
        else if (skin.id === "angel_ship") { player.heal(35); game.bulletManager.addLaser(x, y, a, 100, 25); pulse(x, y, 320, 50, skin.accent); }
        else if (skin.id === "demon_ship") pulse(x, y, 450, 92, skin.color, { type: "burn", frames: 220, damage: 5, color: skin.accent });
        else if (skin.id === "dynamite") {
            for (let i = 0; i < 24; i++) {
                setTimeout(() => {
                    const tx = clamp(x + rand(-520, 520), 80, CONFIG.canvasWidth - 80);
                    const ty = clamp(y + rand(-360, 360), 80, CONFIG.canvasHeight - 80);
                    game.bulletManager.addGrenade(tx, ty - 80, Math.PI / 2 + rand(-0.5, 0.5), rand(3, 6), 58, randInt(18, 34));
                    game.particles.emit(tx, ty, 8, { colors: [skin.color, skin.accent, "#ffffff"], speed: 5, life: 18, size: 3, glow: true });
                }, i * 45);
            }
            game.screenShake.shake(18);
        }
        else if (["meat_skin", "lava_skin", "frost_skin", "shadow_skin", "energy_skin", "gladiator_skin"].includes(skin.id)) {
            const status = skin.id === "frost_skin" ? { type: "freeze", frames: 240, damage: 2, color: skin.accent } :
                skin.id === "lava_skin" ? { type: "burn", frames: 220, damage: 5, color: skin.accent } : null;
            pulse(x, y, skin.id === "energy_skin" ? 620 : 430, skin.id === "energy_skin" ? 120 : 75, skin.color, status);
        }
        else if (skin.id === "robot_skin") {
            for (let i = 0; i < 4; i++) player.drones.push(new Drone(player));
            showNotif("Enjambre de drones activado", "powerup");
        }
        else pulse(x, y, 360, 60, skin.color);
        showNotif("Especial: " + skin.name, "powerup");
        return true;
    }

    function installPatches() {
        extendSkins();

        const oldBMDraw = BulletManager.prototype.draw;
        BulletManager.prototype.draw = function (ctx) {
            oldBMDraw.call(this, ctx);
            this.electricBolts ||= [];
            drawBolts(ctx, this.electricBolts);
        };

        const SkinProto = Object.getPrototypeOf(window.skinSystem);
        const oldSkinFire = SkinProto.fire;
        SkinProto.fire = function (player, bm, mult) {
            const s = this.equipped();
            const x = player.x, y = player.y, a = player.angle, dmg = 10 * (mult || 1);
            const spend = (rate = CONFIG.fireRate) => { player.fireTimer = Math.max(2, rate); if (!player.powerups.infinite) player.ammo--; };
            if (s.shot === "electric") { spend(CONFIG.fireRate - 1); electricChain(x, y, a, dmg * 1.5, 720, 5); sound.play("boss_alert"); return; }
            if (s.shot === "moon") { spend(); for (let i = -1; i <= 1; i++) bm.addBullet(x, y, a + i * .07, 11, dmg * .9, s.color, false, false, true); return; }
            if (s.shot === "mars" || s.shot === "heavy") { spend(); bm.addGrenade(x, y, a, 8, dmg * 1.7, 38); return; }
            if (s.shot === "galaxy") { spend(); for (let i = -2; i <= 2; i++) bm.addHoming(x, y, a + i * .12, 8, dmg * .75); return; }
            if (s.shot === "comet") { spend(); const b = new Bullet(x, y, a, 18, dmg * 1.2, s.color, true, true, false); b.radius = 5; bm.bullets.push(b); return; }
            if (s.shot === "bite") { spend(); pulse(x + Math.cos(a) * 55, y + Math.sin(a) * 55, 85, dmg * 1.5, s.color); return; }
            if (s.shot === "claw") { spend(3); for (let i = -2; i <= 2; i++) bm.addBullet(x, y, a + i * .16, 15, dmg * .7, s.accent, true, false, false); return; }
            if (s.shot === "horn" || s.shot === "bone") { spend(); const b = new Bullet(x, y, a, 13, dmg * 1.25, s.accent, true, false, false); b.radius = 6; bm.bullets.push(b); return; }
            if (s.shot === "air" || s.shot === "rapid") { spend(s.shot === "rapid" ? 2 : CONFIG.fireRate); bm.addBullet(x, y, a + rand(-.08, .08), 16, dmg * .75, s.accent, false, false, false); return; }
            if (s.shot === "water" || s.shot === "holy") { spend(); bm.addLaser(x, y, a, dmg * 1.35, 8); if (s.shot === "holy" && game.frame % 20 === 0) player.heal(1); return; }
            if (s.shot === "radio" || s.shot === "nebula") { spend(); const b = new Bullet(x, y, a, 9, dmg, s.color, false, true, false); b.poison = true; b.radius = 6; bm.bullets.push(b); return; }
            if (s.shot === "dynamite") {
                spend(CONFIG.fireRate + 6);
                bm.addGrenade(x, y, a + rand(-0.12, 0.12), 8.5, dmg * 2.25, 32);
                game.particles.emit(x, y, 6, { colors: [s.color, s.accent, "#ffffff"], speed: 4, life: 14, size: 2.5, glow: true, angle: a, angleSpread: 0.45 });
                sound.play("shoot_heavy");
                return;
            }
            if (s.shot === "meat") { spend(); for (let i = -1; i <= 1; i++) { const b = new Bullet(x, y, a + i * .08, 10, dmg, s.color, false, false, false); b.poison = true; b.radius = 5; bm.bullets.push(b); } return; }
            if (s.shot === "lava") { spend(); bm.addGrenade(x, y, a, 8, dmg * 1.8, 34); return; }
            if (s.shot === "frost") { spend(); bm.addIceBurst(x, y, a, dmg * 1.1); return; }
            if (s.shot === "robot") { spend(3); bm.addBullet(x, y, a + rand(-.04, .04), 17, dmg * .8, s.accent, false, false, false); return; }
            if (s.shot === "shadow") { spend(); const b = new Bullet(x, y, a, 12, dmg * 1.3, s.accent, true, false, false); b.radius = 5; bm.bullets.push(b); return; }
            if (s.shot === "energy") { spend(); bm.addRailgun(x, y, a, dmg * 2.2); return; }
            if (s.shot === "gladiator") { spend(); for (let i = -1; i <= 1; i++) { const b = new Bullet(x, y, a + i * .11, 13, dmg, s.accent, true, false, false); b.radius = 4; bm.bullets.push(b); } return; }
            if (s.shot === "alien") { spend(); bm.addPlasma(x, y, a, 6.5, dmg * 1.35); return; }
            if (s.shot === "missile") { spend(); bm.addHoming(x, y, a, 8, dmg * 1.8); return; }
            if (s.shot === "ghost") { spend(); bm.addBullet(x, y, a, 10, dmg * 1.2, s.accent, true, false, false); return; }
            if (s.shot === "dragon" || s.shot === "demon") { spend(); bm.addFlameCone(x, y, a, dmg * .9); return; }
            oldSkinFire.call(this, player, bm, mult);
        };

        const oldSpecial = SkinProto.useSpecial;
        SkinProto.useSpecial = function (player) {
            const s = this.equipped();
            if (specialByName(player, s)) return true;
            return oldSpecial.call(this, player);
        };

        const oldDraw = Player.prototype.draw;
        Player.prototype.draw = function (ctx) {
            oldDraw.call(this, ctx);
            const s = window.skinSystem?.equipped();
            if (!s || s.id === "standard") return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = .92;
            ctx.fillStyle = s.color;
            ctx.strokeStyle = s.accent;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 24;
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (s.category === "Dinosaurios") { ctx.moveTo(24, 0); ctx.lineTo(2, -15); ctx.lineTo(-18, -8); ctx.lineTo(-10, 0); ctx.lineTo(-18, 8); ctx.lineTo(2, 15); }
            else if (s.category === "Naves") { ctx.moveTo(27, 0); ctx.lineTo(-15, -16); ctx.lineTo(-6, 0); ctx.lineTo(-15, 16); }
            else ctx.arc(0, 0, 21, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = s.accent;
            ctx.beginPath();
            ctx.arc(8, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            if (game.frame % 5 === 0) game.particles.emit(this.x - Math.cos(this.angle) * 18, this.y - Math.sin(this.angle) * 18, 1, { colors: [s.color, s.accent], speed: 1.5, life: 12, size: 2, glow: true });
        };

        const skinShootWrapper = Player.prototype.shoot;
        Player.prototype.shoot = function (bm) {
            if (window.skinSystem?.equipped()?.id !== "standard" && this.weaponType === "skin") {
                if (this.ammo <= 0 && !this.powerups.infinite) {
                    this.reloading = true;
                    this.reloadTimer = CONFIG.reloadTime;
                    return;
                }
                const mult = (this.powerups.damage ? 2 : 1) * (this.powerups.massive ? 3 : 1);
                window.skinSystem.fire(this, bm, mult);
                return;
            }
            if (window.skinSystem?.equipped()?.id !== "standard") {
                const saved = window.skinSystem.state.equipped;
                window.skinSystem.state.equipped = "standard";
                skinShootWrapper.call(this, bm);
                window.skinSystem.state.equipped = saved;
                return;
            }
            skinShootWrapper.call(this, bm);
        };

        const oldPlayerUpdate = Player.prototype.update;
        Player.prototype.update = function (keys, mouse) {
            oldPlayerUpdate.call(this, keys, mouse);
            const equippedSkin = window.skinSystem?.equipped?.();
            const hasSpecialSkinShot = equippedSkin && equippedSkin.id !== "standard" && equippedSkin.shot && equippedSkin.shot !== "standard";
            if ((keys.Digit1 && hasSpecialSkinShot) || (keys.KeyF && equippedSkin?.id !== "standard")) {
                this.weaponType = "skin";
            }
        };

        const oldSetup = Game.prototype.setupUI;
        Game.prototype.setupUI = function () {
            oldSetup.call(this);
            ensureMapScreen();
            const start = document.getElementById("btnStart");
            const coliseum = document.getElementById("btnColiseum");
            const startClone = start.cloneNode(true);
            start.parentNode.replaceChild(startClone, start);
            startClone.addEventListener("click", () => showMapSelect("normal"));
            if (coliseum) {
                const colClone = coliseum.cloneNode(true);
                coliseum.parentNode.replaceChild(colClone, coliseum);
                colClone.addEventListener("click", () => showMapSelect("coliseum"));
            }
        };

        const oldStart = Game.prototype.startGame;
        Game.prototype.startGame = function () {
            this.gameMode = this.pendingMode || this.gameMode || "normal";
            this.selectedMap ||= "galaxy";
            document.body.dataset.map = this.selectedMap;
            document.body.dataset.mode = this.gameMode;
            oldStart.call(this);
            if (this.player && window.skinSystem?.equipped()?.id !== "standard") {
                this.player.weaponType = "skin";
            }
            const map = mapOf(this.selectedMap);
            this.showNotification((this.gameMode === "coliseum" ? "COLISEO - " : "PLANETA - ") + map.name, "boss");
        };

        const oldWave = WaveManager.prototype.startWave;
        WaveManager.prototype.startWave = function () {
            if (window.game?.gameMode === "coliseum") {
                this.wave++;
                const forceBoss = this.wave % 5 === 0;
                lastColiseumKind = forceBoss || Math.random() < 0.5 ? "boss" : "miniboss";
                if (lastColiseumKind === "boss") {
                    let pool = COLISEUM_BOSSES;
                    lastColiseumBoss = randChoice(pool.filter(b => b !== lastColiseumBoss) || pool);
                } else {
                    let pool = COLISEUM_MINIS;
                    lastColiseumMini = randChoice(pool.filter(m => m !== lastColiseumMini) || pool);
                }
                this.state = lastColiseumKind;
                this.spawnedCount = 0; this.enemiesToSpawn = 0;
                this.bossSpawned = this.bossDefeated = this.miniBossSpawned = this.miniBossDefeated = false;
                game.showNotification("RONDA ALEATORIA " + this.wave + (this.state === "boss" ? " - JEFE" : " - MINI JEFE"), "boss");
                playerData.addC(35 + this.wave * 8); updGamUI();
                return;
            }
            oldWave.call(this);
            this.enemiesToSpawn = Math.max(3, Math.floor(this.enemiesToSpawn * mapOf(game.selectedMap || "galaxy").diff));
        };

        const oldTypes = WaveManager.prototype.getEnemyTypesForWave;
        WaveManager.prototype.getEnemyTypesForWave = function () {
            const map = mapOf(game?.selectedMap || "galaxy");
            if (!map.enemies) return oldTypes.call(this);
            return map.enemies.slice(0, Math.min(map.enemies.length, 3 + Math.floor(this.wave / 2)));
        };

        WaveManager.prototype.spawnBoss = function () {
            if (game?.gameMode === "coliseum") {
                const data = lastColiseumBoss || randChoice(COLISEUM_BOSSES);
                const bossWave = this.wave + 5 + Math.floor(this.wave / 3);
                game.boss = new Boss(data.type, bossWave);
                game.boss.name = data.name;
                game.boss.maxHealth = Math.floor(game.boss.maxHealth * data.hp * (1 + this.wave * 0.035));
                game.boss.health = game.boss.maxHealth;
                game.boss.color = data.color;
                game.showBossBar(game.boss);
                game.showNotification("¡" + data.name + " ENTRA AL COLISEO!", "boss");
                game.particles.emitShockwave(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, data.color);
                game.screenShake.shake(22);
                sound.play("boss_alert");
                return;
            }
            const map = mapOf(game?.selectedMap || "galaxy");
            const type = map.bosses[(this.wave + map.bosses.length) % map.bosses.length];
            const names = { robot_colossal: "JEFE ROBOT GIGANTE", mech_beast: "T-REX ALFA COSMICO", tank_giant: "TRICERATOPS BLINDADO", bomber_supreme: "BOMBARDERO NUCLEAR", black_hole: "SEÑOR DEL AGUJERO NEGRO", living_planet: "DEVORADOR DE GALAXIAS", electric_boss: "GRAN TORMENTA ROJA", supreme_dreadnought: "COMETA DESTRUCTOR", mothership: "NAVE ELITE COLOSAL" };
            game.boss = new Boss(type, Math.max(this.wave, game.gameMode === "coliseum" ? this.wave + 4 : this.wave));
            game.boss.name = names[type] || type.toUpperCase();
            game.showBossBar(game.boss);
            game.showNotification("¡JEFE: " + game.boss.name + "!", "boss");
            sound.play("boss_alert");
            game.screenShake.shake(16);
        };

        WaveManager.prototype.spawnMiniBoss = function () {
            if (game?.gameMode === "coliseum") {
                const data = lastColiseumMini || randChoice(COLISEUM_MINIS);
                const miniWave = this.wave + 4 + Math.floor(this.wave / 4);
                this.miniBoss = new MiniBoss(data.type, miniWave);
                this.miniBoss.name = data.name;
                this.miniBoss.maxHealth = Math.floor(this.miniBoss.maxHealth * data.hp * (1 + this.wave * 0.04));
                this.miniBoss.health = this.miniBoss.maxHealth;
                this.miniBoss.color = data.color;
                game.miniBoss = this.miniBoss;
                game.showBossBar(this.miniBoss);
                game.showNotification("¡" + data.name + " RETA AL JUGADOR!", "boss");
                game.particles.emitShockwave(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, data.color);
                game.screenShake.shake(14);
                sound.play("boss_alert");
                return;
            }
            const map = mapOf(game?.selectedMap || "galaxy");
            const type = map.mini[(this.wave + map.mini.length) % map.mini.length];
            this.miniBoss = new MiniBoss(type, Math.max(this.wave, game.gameMode === "coliseum" ? this.wave + 3 : this.wave));
            game.miniBoss = this.miniBoss;
            game.showBossBar(this.miniBoss);
            game.showNotification("¡MINI JEFE: " + this.miniBoss.name + "!", "boss");
            sound.play("boss_alert");
            game.screenShake.shake(10);
        };

        const oldBossReward = WaveManager.prototype.onBossDefeated;
        WaveManager.prototype.onBossDefeated = function () {
            oldBossReward.call(this);
            const bonus = game.gameMode === "coliseum" ? 300 + this.wave * 25 : 150;
            playerData.addC(bonus); playerData.addXP(80 + this.wave * 8); updGamUI();
            game.showNotification("RECOMPENSA JEFE +" + bonus, "powerup");
        };

        const oldMiniReward = WaveManager.prototype.onMiniBossDefeated;
        WaveManager.prototype.onMiniBossDefeated = function () {
            oldMiniReward.call(this);
            const bonus = game.gameMode === "coliseum" ? 140 + this.wave * 12 : 70;
            playerData.addC(bonus); playerData.addXP(35 + this.wave * 5); updGamUI();
            game.showNotification("RECOMPENSA MINI JEFE +" + bonus, "powerup");
        };

        const oldBg = BackgroundSystem.prototype.draw;
        BackgroundSystem.prototype.draw = function (ctx) {
            oldBg.call(this, ctx);
            const map = mapOf(game?.selectedMap || "galaxy");
            ctx.save();
            const g = ctx.createRadialGradient(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, 120, CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, CONFIG.canvasWidth * .75);
            g.addColorStop(0, map.color + "25");
            g.addColorStop(1, map.accent + "08");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
            if (game?.gameMode === "coliseum") {
                ctx.strokeStyle = map.accent; ctx.globalAlpha = .25; ctx.lineWidth = 6;
                for (let r = 260; r < 900; r += 160) { ctx.beginPath(); ctx.arc(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, r, 0, Math.PI * 2); ctx.stroke(); }
            }
            ctx.restore();
        };

        const oldHud = Game.prototype.updateHUD;
        Game.prototype.updateHUD = function () {
            oldHud.call(this);
            if (!this.player) return;
            const weapon = document.getElementById("weaponName");
            if (weapon && this.player.weaponType === "skin" && window.skinSystem?.equipped()?.id !== "standard") {
                weapon.textContent = "Skin: " + window.skinSystem.equipped().name + " (F)";
            }
        };

        if (typeof PowerUp !== "undefined" && !PowerUp.prototype.__skinWeaponPreservePatch) {
            const weaponPickups = new Set(["triple", "quintuple", "grenade", "laser", "shockwave", "homing", "flame", "tesla", "iceburst", "gravity", "nuclearWeapon"]);
            const oldApply = PowerUp.prototype.apply;
            PowerUp.prototype.apply = function (player) {
                const equipped = window.skinSystem?.equipped?.();
                const keepSkinShot = equipped && equipped.id !== "standard" && player.weaponType === "skin" && weaponPickups.has(this.type);
                oldApply.call(this, player);
                if (keepSkinShot) {
                    player.weaponType = "skin";
                    game?.showNotification?.("Skin activa: " + equipped.name, "powerup");
                }
            };
            PowerUp.prototype.__skinWeaponPreservePatch = true;
        }

        const oldLoop = Game.prototype.loop;
        Game.prototype.loop = function (timestamp) {
            if (this.player && this.state === "playing") {
                const map = mapOf(this.selectedMap || "galaxy");
                if (map.id === "sun" && this.frame % 180 === 0) this.player.takeDamage(2);
                if (map.id === "jupiter" && this.frame % 240 === 0) electricChain(rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), rand(0, Math.PI * 2), 18, 440, 3);
                if (map.id === "mars" && this.frame % 360 === 0) pulse(rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), 130, 22, "#e85d3f");
                if (map.id === "nuclear" && this.frame % 420 === 0) pulse(rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), 150, 26, "#9cff3a", { type: "poison", frames: 120, damage: 2, color: "#9cff3a" });
                if (map.id === "jurassic" && this.frame % 520 === 0) this.spawnMeteorBurst(3, false);
                if (map.id === "meat" && this.frame % 300 === 0) pulse(rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), 120, 20, "#7f1d1d", { type: "poison", frames: 90, damage: 2, color: "#ff6b6b" });
                if (map.id === "arena" && this.frame % 260 === 0) this.showNotification("EL PUBLICO EXIGE COMBATE", "boss");
                if (map.id === "lava" && this.frame % 260 === 0) pulse(rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), 140, 30, "#dc2626", { type: "burn", frames: 120, damage: 3, color: "#ffba08" });
                if (map.id === "iceworld" && this.frame % 320 === 0) pulse(rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), 150, 18, "#60a5fa", { type: "freeze", frames: 150, damage: 1, color: "#dbeafe" });
                if (map.id === "darkworld" && this.frame % 260 === 0 && this.player) {
                    for (const e of this.enemyManager.enemies) {
                        if (!e.dead) {
                            const aa = angle(e.x, e.y, this.player.x, this.player.y);
                            e.vx += Math.cos(aa) * 0.8;
                            e.vy += Math.sin(aa) * 0.8;
                        }
                    }
                }

                const moveBossEntity = (entity, speed, pulseColor) => {
                    if (!entity || entity.dead || !this.player) return;
                    if (!entity._expLastPos) entity._expLastPos = { x: entity.x, y: entity.y, stuck: 0, final: false };
                    const moved = dist(entity.x, entity.y, entity._expLastPos.x, entity._expLastPos.y);
                    entity._expLastPos.stuck = moved < 1.5 ? entity._expLastPos.stuck + 1 : 0;
                    entity._expLastPos.x = entity.x;
                    entity._expLastPos.y = entity.y;
                    const chase = angle(entity.x, entity.y, this.player.x, this.player.y);
                    const orbit = chase + Math.PI / 2 * (Math.sin(this.frame * 0.015) > 0 ? 1 : -1);
                    entity.vx = (entity.vx || 0) + Math.cos(chase) * speed + Math.cos(orbit) * speed * 0.55;
                    entity.vy = (entity.vy || 0) + Math.sin(chase) * speed + Math.sin(orbit) * speed * 0.55;
                    if (entity._expLastPos.stuck > 45) {
                        entity.vx += rand(-8, 8);
                        entity.vy += rand(-8, 8);
                        entity.x = clamp(entity.x + rand(-80, 80), entity.radius || 60, CONFIG.canvasWidth - (entity.radius || 60));
                        entity.y = clamp(entity.y + rand(-80, 80), entity.radius || 60, CONFIG.canvasHeight - (entity.radius || 60));
                        entity._expLastPos.stuck = 0;
                    }
                    if (entity.health < entity.maxHealth * 0.5 && this.frame % 210 === 0) pulse(entity.x, entity.y, 220, 26, pulseColor);
                    if (!entity._expLastPos.final && entity.health < entity.maxHealth * 0.18) {
                        entity._expLastPos.final = true;
                        pulse(entity.x, entity.y, 360, 58, pulseColor);
                        this.showNotification("ATAQUE FINAL: " + (entity.name || "JEFE"), "boss");
                    }
                };
                moveBossEntity(this.boss, 0.08 + this.waveManager.wave * 0.003, this.boss?.color || "#ff6b6b");
                moveBossEntity(this.miniBoss, 0.12 + this.waveManager.wave * 0.004, this.miniBoss?.color || "#ffd166");

                const bossName = (this.boss?.name || "").toLowerCase();
                if (this.boss && !this.boss.dead && bossName.includes("policia") && this.frame % Math.max(90, 240 - this.waveManager.wave * 6) === 0) {
                    const count = this.gameMode === "coliseum" ? 3 : 2;
                    for (let i = 0; i < count; i++) {
                        const a = rand(0, Math.PI * 2);
                        const sx = clamp(this.boss.x + Math.cos(a) * rand(90, 180), 40, CONFIG.canvasWidth - 40);
                        const sy = clamp(this.boss.y + Math.sin(a) * rand(90, 180), 40, CONFIG.canvasHeight - 40);
                        const type = randChoice(["police", "police_sniper", "scout_ship", "laser_turret"]);
                        this.enemyManager.spawnEnemy(type, sx, sy, Math.max(1, this.waveManager.wave));
                        this.particles.emitShockwave(sx, sy, "#7df9ff");
                    }
                    this.showNotification("REFUERZOS POLICIALES", "boss");
                    sound.play("boss_alert");
                }

                const miniName = (this.miniBoss?.name || "").toLowerCase();
                if (this.miniBoss && !this.miniBoss.dead && miniName.includes("policia") && this.frame % Math.max(110, 270 - this.waveManager.wave * 5) === 0) {
                    for (let i = 0; i < 2; i++) {
                        const a = rand(0, Math.PI * 2);
                        const sx = clamp(this.miniBoss.x + Math.cos(a) * rand(70, 150), 40, CONFIG.canvasWidth - 40);
                        const sy = clamp(this.miniBoss.y + Math.sin(a) * rand(70, 150), 40, CONFIG.canvasHeight - 40);
                        const type = randChoice(["police", "police_sniper", "canine"]);
                        this.enemyManager.spawnEnemy(type, sx, sy, Math.max(1, this.waveManager.wave));
                        this.particles.emit(sx, sy, 14, { colors: ["#7df9ff", "#ffffff"], speed: 4, life: 18, size: 3, glow: true });
                    }
                    this.showNotification("MINI JEFE POLICIA PIDE APOYO", "boss");
                }
            }
            return oldLoop.call(this, timestamp);
        };

        window.rendShop = function (tab) {
            if (!tab || tab === "skin") return renderShop();
            const c = document.getElementById("shopContent");
            if (c) c.innerHTML = '<div class="shop-empty">Categoria en preparacion. Las skins estan listas.</div>';
        };
        rendShop = window.rendShop;

        const oldOpen = window.openPanel || openPanel;
        window.openPanel = function (id) {
            oldOpen(id);
            if (id === "shopPanel") renderShop();
        };
        openPanel = window.openPanel;
    }

    if (window.skinSystem) installPatches();
    else window.addEventListener("load", installPatches);
    window.availableMaps = MAPS;
})();

// Safe right-click special input: prevents browser/menu side effects and loop crashes.
(function () {
    if (window.__safeRightClickSpecialInstalled) return;
    window.__safeRightClickSpecialInstalled = true;

    function guardSkinSpecial() {
        if (!window.skinSystem) return;
        const proto = Object.getPrototypeOf(window.skinSystem);
        if (proto.useSpecial?.__safeSpecialGuard) return;
        const oldUseSpecial = proto.useSpecial;
        proto.useSpecial = function (player) {
            try {
                return oldUseSpecial.call(this, player);
            } catch (error) {
                console.error("Error usando especial de skin:", error);
                if (player) {
                    player.skinSkillTimer = 18;
                    player.skinSkillMax = Math.max(player.skinSkillMax || 60, 60);
                }
                if (window.game?.state === "paused") window.game.state = "playing";
                document.getElementById("pauseScreen")?.classList.add("hidden");
                return false;
            }
        };
        proto.useSpecial.__safeSpecialGuard = true;
    }

    function installRightClickBlock(gameInstance) {
        const canvas = gameInstance?.canvas || document.getElementById("gameCanvas");
        if (!canvas || canvas.__safeRightClickBlock) return;
        const block = (event) => {
            const isRightMouse = event.type === "contextmenu" || event.type === "auxclick" || event.button === 2;
            if (!isRightMouse) return;
            const activeGame = window.game || gameInstance;
            event.preventDefault();
            event.stopImmediatePropagation();
            if (!activeGame?.mouse) return;
            activeGame.mouse.down = false;
            if (event.type === "mousedown") {
                activeGame.mouse.right = false;
                if (typeof sound !== "undefined") sound.init();
                if (activeGame.state === "playing" && activeGame.player && window.skinSystem) {
                    window.skinSystem.useSpecial(activeGame.player);
                }
            }
            if (event.type === "mouseup" || event.type === "auxclick") {
                activeGame.mouse.right = false;
            }
        };
        canvas.addEventListener("mousedown", block, true);
        canvas.addEventListener("mouseup", block, true);
        canvas.addEventListener("contextmenu", block, true);
        canvas.addEventListener("auxclick", block, true);
        canvas.__safeRightClickBlock = true;
    }

    function install() {
        guardSkinSpecial();
        installRightClickBlock(window.game);
    }

    if (typeof Game !== "undefined" && !Game.prototype.__safeRightClickSetupPatch) {
        const oldSetupInput = Game.prototype.setupInput;
        Game.prototype.setupInput = function () {
            oldSetupInput.call(this);
            installRightClickBlock(this);
        };
        Game.prototype.__safeRightClickSetupPatch = true;
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
    else install();
    setTimeout(install, 0);
    setTimeout(install, 250);
    window.addEventListener("load", install);
})();

// Performance safety layer and reliable cosmic octopus boss.
(function () {
    if (window.__performanceAndOctopusPatch) return;
    window.__performanceAndOctopusPatch = true;

    const LIMITS = {
        particles: 380,
        bullets: 240,
        enemyBullets: 170,
        enemies: 68,
        coliseumEnemies: 36,
        drops: 34,
        bolts: 36
    };

    function isBossLike(e) {
        return e instanceof Boss || e instanceof MiniBoss || e._coliseumSpecial;
    }

    function trimArray(arr, max, preferKeep) {
        if (!arr || arr.length <= max) return arr;
        if (!preferKeep) {
            arr.splice(0, arr.length - max);
            return arr;
        }
        const keep = [];
        const normal = [];
        for (const item of arr) (preferKeep(item) ? keep : normal).push(item);
        const space = Math.max(0, max - keep.length);
        arr.length = 0;
        arr.push(...keep.slice(-max), ...normal.slice(-space));
        return arr;
    }

    function patchPerformance() {
        if (typeof CONFIG !== "undefined") CONFIG.particleLimit = Math.min(CONFIG.particleLimit || LIMITS.particles, LIMITS.particles);

        if (typeof ParticleSystem !== "undefined" && !ParticleSystem.prototype.__perfPatch) {
            const oldEmit = ParticleSystem.prototype.emit;
            ParticleSystem.prototype.emit = function (x, y, count = 1, options = {}) {
                if (this.particles.length > LIMITS.particles) this.particles.splice(0, this.particles.length - LIMITS.particles);
                if (options && options.priority === "blackhole") {
                    oldEmit.call(this, x, y, Math.min(count, 34), options);
                    return;
                }
                const pressure = this.particles.length / LIMITS.particles;
                const maxCount = pressure > 0.82 ? 1 : pressure > 0.62 ? 3 : 8;
                oldEmit.call(this, x, y, Math.min(count, maxCount), options);
            };

            ParticleSystem.prototype.emitExplosion = function (x, y, scale = 1) {
                const s = Math.min(scale, 2.2);
                this.emit(x, y, Math.max(4, Math.round(8 * s)), {
                    colors: ["#ff6600", "#ffaa00", "#ffffff"],
                    speed: 2.8 * s,
                    life: 12 * s,
                    size: 2.1 * s,
                    glow: this.particles.length < 260
                });
                if (this.particles.length < LIMITS.particles - 8) {
                    this.particles.push({ type: "ring", x, y, radius: 8 * s, growth: 4.2 * s, lineWidth: 3 * s, life: 10, maxLife: 10, color: "#ffaa00" });
                }
            };

            ParticleSystem.prototype.emitShockwave = function (x, y, color = "#00f0ff") {
                if (this.particles.length < LIMITS.particles - 6) {
                    this.particles.push({ type: "ring", x, y, radius: 12, growth: 10, lineWidth: 4, life: 12, maxLife: 12, color });
                }
                this.emit(x, y, 4, { colors: [color, "#ffffff"], speed: 4, life: 11, size: 2, glow: false });
            };

            const oldDraw = ParticleSystem.prototype.draw;
            ParticleSystem.prototype.draw = function (ctx) {
                const oldShadow = ctx.shadowBlur;
                if (this.particles.length > 250) {
                    for (const p of this.particles) p.glow = false;
                }
                oldDraw.call(this, ctx);
                ctx.shadowBlur = oldShadow;
            };
            ParticleSystem.prototype.__perfPatch = true;
        }

        if (typeof BulletManager !== "undefined" && !BulletManager.prototype.__perfPatch) {
            const oldUpdate = BulletManager.prototype.update;
            BulletManager.prototype.update = function () {
                oldUpdate.call(this);
                trimArray(this.bullets, LIMITS.bullets);
                trimArray(this.enemyBullets, LIMITS.enemyBullets);
                trimArray(this.grenades, 45);
                trimArray(this.skillGrenades, 28);
                trimArray(this.lasers, 22);
                trimArray(this.shockwaves, 24);
                trimArray(this.railguns, 20);
                trimArray(this.plasmas, 28);
                trimArray(this.homingMissiles, 45);
                trimArray(this.electricBolts, LIMITS.bolts);
            };
            BulletManager.prototype.__perfPatch = true;
        }

        if (typeof EnemyManager !== "undefined" && !EnemyManager.prototype.__perfPatch) {
            const oldSpawn = EnemyManager.prototype.spawnEnemy;
            EnemyManager.prototype.spawnEnemy = function (type, x, y, wave) {
                const limit = game?.gameMode === "coliseum" ? LIMITS.coliseumEnemies : LIMITS.enemies;
                if (this.enemies.length >= limit) {
                    const idx = this.enemies.findIndex(e => !isBossLike(e) && e.spawnTimer <= 0);
                    if (idx >= 0) this.enemies.splice(idx, 1);
                    else return null;
                }
                return oldSpawn.call(this, type, x, y, wave);
            };

            const oldUpdate = EnemyManager.prototype.update;
            EnemyManager.prototype.update = function (player) {
                oldUpdate.call(this, player);
                const limit = game?.gameMode === "coliseum" ? LIMITS.coliseumEnemies : LIMITS.enemies;
                trimArray(this.enemies, limit, isBossLike);
                trimArray(this.vehicles, 8);
            };
            EnemyManager.prototype.__perfPatch = true;
        }

        if (typeof DropManager !== "undefined" && !DropManager.prototype.__perfPatch) {
            const oldUpdate = DropManager.prototype.update;
            DropManager.prototype.update = function (player) {
                oldUpdate.call(this, player);
                trimArray(this.drops, LIMITS.drops);
            };
            DropManager.prototype.__perfPatch = true;
        }
    }

    function forceOctopusBoss(wave) {
        const boss = new Boss("mothership", Math.max(5, wave + 3));
        boss.advancedBoss = "cosmic_octopus";
        boss.advancedReward = "abyss_octopus_ship";
        boss.name = "PULPO COSMICO";
        boss.color = "#9333ea";
        boss.glowColor = "#f0abfc";
        boss.radius = 66;
        boss.maxHealth = Math.floor(boss.maxHealth * (1.45 + wave * 0.025));
        boss.health = boss.maxHealth;
        boss.speed *= 1.12;
        game.boss = boss;
        game.showBossBar(boss);
        game.showNotification("JEFE: PULPO COSMICO", "boss");
        game.particles.emitShockwave(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, "#f0abfc");
        sound.play("boss_alert");
    }

    function patchOctopusSpawn() {
        if (typeof WaveManager === "undefined" || WaveManager.prototype.__octopusReliablePatch) return;
        const oldSpawnBoss = WaveManager.prototype.spawnBoss;
        WaveManager.prototype.spawnBoss = function () {
            const wave = this.wave || 1;
            if (game?.gameMode !== "coliseum" && (wave === 6 || wave % 12 === 0)) {
                forceOctopusBoss(wave);
                return;
            }
            oldSpawnBoss.call(this);
        };
        WaveManager.prototype.__octopusReliablePatch = true;
    }

    function patchOctopusBehavior() {
        if (typeof Boss === "undefined" || Boss.prototype.__octopusBehaviorPatch) return;
        const oldUpdate = Boss.prototype.update;
        Boss.prototype.update = function (player) {
            oldUpdate.call(this, player);
            if (this.advancedBoss !== "cosmic_octopus" || this.spawnTimer > 0 || this.dead || !player) return;
            this.targetX = clamp(player.x + Math.sin(this.animFrame * 0.018) * 360, this.radius + 80, CONFIG.canvasWidth - this.radius - 80);
            this.targetY = clamp(player.y + Math.cos(this.animFrame * 0.014) * 260, this.radius + 80, CONFIG.canvasHeight - this.radius - 80);
            const hp = this.health / this.maxHealth;
            const interval = hp < 0.28 ? 52 : hp < 0.6 ? 76 : 105;
            if (this.animFrame % interval === 0) {
                const tentacles = hp < 0.35 ? 8 : hp < 0.65 ? 6 : 4;
                for (let i = 0; i < tentacles; i++) {
                    const a = angle(this.x, this.y, player.x, player.y) + (i - (tentacles - 1) / 2) * 0.22 + Math.sin(this.animFrame * 0.03 + i) * 0.18;
                    const endX = this.x + Math.cos(a) * 340;
                    const endY = this.y + Math.sin(a) * 340;
                    game.bulletManager.electricBolts ||= [];
                    if (game.bulletManager.electricBolts.length < LIMITS.bolts) game.bulletManager.electricBolts.push({ x1: this.x, y1: this.y, x2: endX, y2: endY, color: "#d8b4fe", life: 16, maxLife: 16, jitter: 20 });
                    if (pointToSegmentDistance(player.x, player.y, this.x, this.y, endX, endY) < 42) player.takeDamage(this.damage * 0.75);
                }
                game.particles.emitShockwave(this.x, this.y, "#9333ea");
            }
            if (this.phase >= 2 && this.animFrame % 240 === 0 && game.enemyManager.enemies.length < 44) {
                for (let i = 0; i < 2; i++) game.enemyManager.spawnEnemy(randChoice(["ghost", "flyer", "slime"]), this.x + rand(-90, 90), this.y + rand(-90, 90), Math.max(1, game.waveManager.wave));
                game.showNotification("MINI PULPOS INVOCADOS", "boss");
            }
        };
        Boss.prototype.__octopusBehaviorPatch = true;
    }

    function install() {
        patchPerformance();
        patchOctopusSpawn();
        patchOctopusBehavior();
        restoreBlackHoleSpecial();
    }

    function restoreBlackHoleSpecial() {
        if (!window.skinSystem || window.skinSystem.__blackHoleSpecialRestored) return;
        const proto = Object.getPrototypeOf(window.skinSystem);
        const blackHoleSkin = window.skinSystem.getSkin?.("black_hole");
        if (blackHoleSkin) blackHoleSkin.cooldown = Math.min(blackHoleSkin.cooldown || 840, 520);
        const collectTargets = (x, y, radius) => {
            const g = window.game;
            if (!g) return [];
            const radiusSq = radius * radius;
            const allTargets = [
                ...(g.enemyManager?.enemies || []),
                g.boss,
                g.miniBoss,
                ...(g.activeBosses || []),
                ...(g.coliseumBosses || [])
            ].filter(Boolean);
            const unique = [];
            const seen = new Set();
            for (const target of allTargets) {
                if (!target || target.dead || seen.has(target)) continue;
                const dx = target.x - x;
                const dy = target.y - y;
                if (dx * dx + dy * dy <= radiusSq) {
                    seen.add(target);
                    unique.push(target);
                }
            }
            return unique;
        };
        const blackHoleDamage = (x, y, radius, damage) => {
            for (const target of collectTargets(x, y, radius)) {
                if (typeof target.takeDamage === "function") target.takeDamage(damage);
                else target.health = Math.max(0, (target.health || 0) - damage);
            }
        };
        proto.gravityBurst = function (x, y) {
            const radius = 760;
            const targets = collectTargets(x, y, radius);
            for (const target of targets) {
                const pull = Math.atan2(y - target.y, x - target.x);
                const dx = target.x - x;
                const dy = target.y - y;
                const d = Math.max(80, Math.hypot(dx, dy));
                const strength = 18 * (1 - Math.min(0.8, d / radius));
                target.vx = (target.vx || 0) + Math.cos(pull) * strength;
                target.vy = (target.vy || 0) + Math.sin(pull) * strength;
            }
            blackHoleDamage(x, y, 720, 145);
            game.screenShake?.shake?.(30);
            game.bulletManager.electricBolts ||= [];
            for (let ring = 0; ring < 5; ring++) {
                game.particles.particles.push({
                    type: "ring",
                    x,
                    y,
                    radius: 35 + ring * 45,
                    growth: 14 + ring * 2,
                    lineWidth: 7 - ring * 0.7,
                    life: 28 + ring * 4,
                    maxLife: 28 + ring * 4,
                    color: ring % 2 ? "#1b102f" : "#b388ff"
                });
            }
            for (let i = 0; i < 32; i++) {
                const a = (i / 32) * Math.PI * 2;
                const sx = x + Math.cos(a) * 620;
                const sy = y + Math.sin(a) * 620;
                game.bulletManager.electricBolts.push({
                    x1: sx,
                    y1: sy,
                    x2: x + Math.cos(a + Math.PI) * 36,
                    y2: y + Math.sin(a + Math.PI) * 36,
                    color: i % 2 ? "#b388ff" : "#ffffff",
                    life: 24,
                    maxLife: 24,
                    jitter: 22
                });
            }
            game.particles.emit(x, y, 36, {
                colors: ["#b388ff", "#ffffff", "#1b102f"],
                speed: 7,
                life: 26,
                size: 3.4,
                glow: true,
                priority: "blackhole"
            });
            game.showNotification("MEGA AGUJERO NEGRO", "boss");
        };
        window.skinSystem.__blackHoleSpecialRestored = true;
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
    else install();
})();

// Coliseum selector and tiered boss rush modes.
(function () {
    if (window.__tieredColiseumInstalled) return;
    window.__tieredColiseumInstalled = true;

    const TIERS = {
        1: { roman: "I", skulls: "&#9760;", subtitle: "Duelo individual", difficulty: "MEDIA", count: 1, reward: 1, arena: "arena", theme: "tier1" },
        2: { roman: "II", skulls: "&#9760;&#9760;", subtitle: "Combate doble", difficulty: "ALTA", count: 2, reward: 2, arena: "arena", theme: "tier2" },
        3: { roman: "III", skulls: "&#9760;&#9760;&#9760;", subtitle: "Guerra de campeones", difficulty: "EXTREMA", count: 3, reward: 3, arena: "arena", theme: "tier3" }
    };

    const BOSS_POOL = [
        { type: "robot_colossal", name: "MEGA ROBOT DEL COLISEO", color: "#38bdf8", hp: 1.35 },
        { type: "mothership", name: "PLATILLO ABISAL", color: "#d8b4fe", hp: 1.18 },
        { type: "mothership", name: "PULPO COSMICO", color: "#c56bff", hp: 1.22 },
        { type: "living_planet", name: "DEVORADOR DE PLANETAS", color: "#ff4fd8", hp: 1.48 },
        { type: "bomber_supreme", name: "SOL VIVIENTE", color: "#ff9f1c", hp: 1.25 },
        { type: "mech_beast", name: "DRAGON GALACTICO", color: "#ff5400", hp: 1.18 },
        { type: "electric_boss", name: "ANGEL MECANICO", color: "#fff3b0", hp: 1.15 },
        { type: "bomber_supreme", name: "DEMONIO NUCLEAR", color: "#9cff3a", hp: 1.3 },
        { type: "mech_beast", name: "REY DINOSAURIO MUTANTE", color: "#7ae582", hp: 1.22 },
        { type: "tank_giant", name: "TANQUE COLOSAL", color: "#ffd166", hp: 1.18 },
        { type: "supreme_dreadnought", name: "NAVE NODRIZA SUPREMA", color: "#9bf6ff", hp: 1.2 },
        { type: "black_hole", name: "SER DE AGUJERO NEGRO", color: "#b388ff", hp: 1.28 },
        { type: "police_commander", name: "JEFE POLICIA SUPREMO", color: "#7df9ff", hp: 1.12 },
        { type: "mothership", name: "EMPERADOR ALIENIGENA", color: "#80ffdb", hp: 1.2 }
    ];

    const MINI_POOL = [
        { type: "mini_ship", name: "MINI JEFE POLICIA", color: "#7df9ff", hp: 1.05 },
        { type: "mini_tank", name: "TANQUE POLICIAL", color: "#adb5bd", hp: 1.08 },
        { type: "armored_dog", name: "DINO BLINDADO", color: "#7ae582", hp: 1.1 },
        { type: "mini_ninja", name: "RAPTOR SUPREMO", color: "#66c56f", hp: 1.08 },
        { type: "mini_space_dragon", name: "PTERODACTILO REY", color: "#8ecae6", hp: 1.08 },
        { type: "mini_nuclear", name: "MINI REACTOR RADIOACTIVO", color: "#9cff3a", hp: 1.14 },
        { type: "mini_bomber", name: "BOMBARDERO TOXICO", color: "#ff334d", hp: 1.1 },
        { type: "mini_mecha", name: "ROBOT PESADO", color: "#adb5bd", hp: 1.12 },
        { type: "mini_heavy_ship", name: "NAVE ELITE", color: "#6ae2ff", hp: 1.08 },
        { type: "ghost_lord", name: "MUTANTE RADIOACTIVO", color: "#b388ff", hp: 1.12 },
        { type: "splitter_boss", name: "CRIATURA FISION", color: "#c56bff", hp: 1.1 },
        { type: "mini_summoner", name: "INVOCADOR DEL COLISEO", color: "#ff4fd8", hp: 1.08 }
    ];

    function ensureColiseumSelector() {
        if (document.getElementById("coliseumSelectScreen")) return;
        const screen = document.createElement("div");
        screen.id = "coliseumSelectScreen";
        screen.className = "screen hidden";
        screen.innerHTML = `
            <div class="menuBg"></div>
            <div class="menuContent coliseum-select-content">
                <h2>SELECCIONA TU COLISEO</h2>
                <p class="gameSubtitle">Elige la intensidad del boss rush espacial.</p>
                <div class="coliseum-tier-grid">
                    ${[1, 2, 3].map(level => {
                        const t = TIERS[level];
                        return `<article class="coliseum-tier-card ${t.theme}">
                            <div class="tier-skulls">${t.skulls}</div>
                            <h3>COLISEO ${t.roman}</h3>
                            <p>${t.subtitle}</p>
                            <span>Dificultad: ${t.difficulty}</span>
                            <small>${t.count} enemigo${t.count > 1 ? "s" : ""} especial${t.count > 1 ? "es" : ""} por ronda</small>
                            <em>Recompensa x${t.reward}</em>
                            <button class="menuBtn primary" data-coliseum-tier="${level}">ENTRAR</button>
                        </article>`;
                    }).join("")}
                </div>
                <button id="btnBackColiseumSelect" class="menuBtn">Volver al menu</button>
            </div>`;
        document.getElementById("gameContainer").appendChild(screen);
        screen.querySelectorAll("[data-coliseum-tier]").forEach(btn => {
            btn.addEventListener("click", () => startColiseumMode(Number(btn.dataset.coliseumTier)));
        });
        document.getElementById("btnBackColiseumSelect").addEventListener("click", () => {
            if (window.returnToIndexMenu) window.returnToIndexMenu();
            else game.showMenu();
        });
    }

    function openColiseumSelector() {
        ensureColiseumSelector();
        game.hideAllScreens();
        document.getElementById("coliseumSelectScreen").classList.remove("hidden");
    }

    function startColiseumMode(level) {
        const tier = TIERS[level] || TIERS[1];
        game.coliseumLevel = level;
        game.coliseumReward = 0;
        game.pendingMode = "coliseum";
        game.gameMode = "coliseum";
        game.selectedMap = "arena";
        document.body.dataset.mode = "coliseum";
        document.body.dataset.coliseumTier = String(level);
        document.body.dataset.map = "arena";
        game.startGame();
        game.showNotification("COLISEO " + tier.roman + " - " + tier.difficulty, "boss");
    }

    function makeSpecial(kind, wave, level) {
        const pool = kind === "boss" ? BOSS_POOL : MINI_POOL;
        const data = randChoice(pool);
        const entity = kind === "boss" ? new Boss(data.type, wave + level * 2) : new MiniBoss(data.type, wave + level);
        entity.name = data.name;
        entity.color = data.color;
        entity.glowColor = data.color;
        entity.maxHealth = Math.floor(entity.maxHealth * data.hp * (1 + wave * 0.035) * (1 + (level - 1) * 0.22));
        entity.health = entity.maxHealth;
        entity._coliseumSpecial = true;
        entity._coliseumKind = kind;
        entity._coliseumTier = level;
        if (data.name.includes("PULPO")) {
            entity.advancedBoss = "cosmic_octopus";
            entity.advancedReward = "abyss_octopus_ship";
            entity.radius = Math.max(entity.radius, 62);
            entity.speed *= 1.08;
        }
        const side = randInt(0, 3);
        const margin = 110;
        entity.x = side === 0 ? rand(margin, CONFIG.canvasWidth - margin) : side === 1 ? CONFIG.canvasWidth + margin : side === 2 ? rand(margin, CONFIG.canvasWidth - margin) : -margin;
        entity.y = side === 0 ? -margin : side === 1 ? rand(margin, CONFIG.canvasHeight - margin) : side === 2 ? CONFIG.canvasHeight + margin : rand(margin, CONFIG.canvasHeight - margin);
        entity.spawnTimer = 70 + randInt(0, 35);
        return entity;
    }

    function getRoundPlan(level, wave) {
        if (level === 1) return [wave % 2 === 0 || Math.random() < 0.45 ? "boss" : "miniboss"];
        if (level === 2) {
            const roll = Math.random();
            if (roll < 0.34) return ["miniboss", "miniboss"];
            if (roll < 0.72) return ["boss", "miniboss"];
            return ["boss", "boss"];
        }
        const mod = wave % 4;
        if (mod === 1) return ["miniboss", "miniboss", "miniboss"];
        if (mod === 2) return ["boss", "miniboss", "miniboss"];
        if (mod === 3) return ["boss", "boss", "miniboss"];
        return ["boss", "boss", "boss"];
    }

    function spawnColiseumRound(manager) {
        const level = clamp(Number(game.coliseumLevel || 1), 1, 3);
        const tier = TIERS[level];
        const plan = getRoundPlan(level, manager.wave);
        game.coliseumSpecials = [];
        game.boss = null;
        game.miniBoss = null;
        for (const kind of plan) {
            const entity = makeSpecial(kind, manager.wave, level);
            game.coliseumSpecials.push(entity);
        }
        const firstBoss = game.coliseumSpecials.find(e => e._coliseumKind === "boss");
        const firstMini = game.coliseumSpecials.find(e => e._coliseumKind === "miniboss");
        if (firstBoss) game.boss = firstBoss;
        if (firstMini) game.miniBoss = firstMini;
        for (const entity of game.coliseumSpecials) {
            if (entity !== game.boss && entity !== game.miniBoss) game.enemyManager.enemies.push(entity);
        }
        if (game.boss) game.showBossBar(game.boss);
        else if (game.miniBoss) game.showBossBar(game.miniBoss);
        game.showNotification(`COLISEO ${tier.roman} | RONDA ${manager.wave} | ${plan.length} RIVALES`, "boss");
        sound.play("boss_alert");
        game.screenShake.shake(12 + level * 4);
    }

    function aliveSpecials() {
        const list = [];
        if (game.boss && !game.boss.dead) list.push(game.boss);
        if (game.miniBoss && !game.miniBoss.dead) list.push(game.miniBoss);
        for (const e of game.enemyManager.enemies) if (e._coliseumSpecial && !e.dead) list.push(e);
        return [...new Set(list)];
    }

    function rewardColiseumRound(manager) {
        const level = clamp(Number(game.coliseumLevel || 1), 1, 3);
        const coins = (90 + manager.wave * 28) * level;
        const xp = (70 + manager.wave * 18) * level;
        game.coliseumReward = (game.coliseumReward || 0) + coins;
        playerData?.addC?.(coins);
        playerData?.addBPXP?.(xp);
        playerData?.sv?.();
        updGamUI?.();
        if (Math.random() < 0.02 * level) {
            const rareDrops = ["effect_storm_aura", "effect_cosmic_trail", "frame_coliseum", "proj_cosmic"];
            if (window.advancedCosmetics) {
                window.advancedCosmetics.unlocked ||= [];
                const drop = randChoice(rareDrops);
                if (!window.advancedCosmetics.unlocked.includes(drop)) window.advancedCosmetics.unlocked.push(drop);
                localStorage.setItem("gs_cosmetics_v3", JSON.stringify(window.advancedCosmetics));
                game.showNotification("DROP RARO DEL COLISEO", "powerup");
            }
        }
        game.showNotification(`RECOMPENSA COLISEO x${level}: +${coins}`, "powerup");
    }

    function drawColiseumArena(ctx, level) {
        const w = CONFIG.canvasWidth;
        const h = CONFIG.canvasHeight;
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        const bg = ctx.createRadialGradient(w * 0.5, h * 0.54, 80, w * 0.5, h * 0.5, w * 0.8);
        if (level === 1) {
            bg.addColorStop(0, "rgba(20, 184, 166, 0.18)");
            bg.addColorStop(0.45, "rgba(15, 23, 42, 0.78)");
            bg.addColorStop(1, "rgba(2, 6, 23, 0.94)");
        } else if (level === 2) {
            bg.addColorStop(0, "rgba(255, 77, 109, 0.2)");
            bg.addColorStop(0.42, "rgba(88, 28, 135, 0.72)");
            bg.addColorStop(1, "rgba(24, 6, 22, 0.95)");
        } else {
            bg.addColorStop(0, "rgba(255, 209, 102, 0.22)");
            bg.addColorStop(0.36, "rgba(88, 28, 135, 0.72)");
            bg.addColorStop(1, "rgba(6, 3, 16, 0.96)");
        }
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const starCount = level === 3 ? 42 : level === 2 ? 32 : 24;
        for (let i = 0; i < starCount; i++) {
            const x = (i * 137.5 + game.frame * (0.08 + level * 0.03)) % w;
            const y = (i * 73.3) % (h * 0.58);
            ctx.globalAlpha = 0.28 + Math.sin(game.frame * 0.025 + i) * 0.18;
            ctx.fillStyle = level === 1 ? "#7df9ff" : level === 2 ? "#ff9cff" : "#fff3b0";
            ctx.fillRect(x, y, level === 3 ? 2.1 : 1.5, level === 3 ? 2.1 : 1.5);
        }
        ctx.globalAlpha = 1;

        if (level >= 2) {
            for (let i = 0; i < (level === 3 ? 3 : 2); i++) {
                const px = w * (0.18 + i * 0.32) + Math.sin(game.frame * 0.004 + i) * 18;
                const py = h * (0.12 + (i % 2) * 0.08);
                const pr = level === 3 ? 42 + i * 10 : 28 + i * 8;
                const grad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 4, px, py, pr);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(0.18, level === 2 ? "#c56bff" : "#ffd166");
                grad.addColorStop(1, level === 2 ? "#3b0764" : "#312e81");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.save();
        ctx.translate(w * 0.5, h * 0.72);
        ctx.scale(1, 0.34);
        const arena = ctx.createRadialGradient(0, 0, 80, 0, 0, w * 0.5);
        arena.addColorStop(0, level === 1 ? "rgba(20,184,166,.38)" : level === 2 ? "rgba(255,77,109,.34)" : "rgba(255,209,102,.4)");
        arena.addColorStop(0.62, "rgba(15,23,42,.88)");
        arena.addColorStop(1, "rgba(0,0,0,.2)");
        ctx.fillStyle = arena;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.44, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = level === 1 ? "#7df9ff" : level === 2 ? "#ff4d6d" : "#ffd166";
        ctx.lineWidth = 9;
        for (let r = w * 0.18; r <= w * 0.44; r += w * 0.09) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        const rows = level === 1 ? 1 : level === 2 ? 2 : 3;
        for (let row = 0; row < rows; row++) {
            const y = h * (0.56 + row * 0.035);
            const count = level === 1 ? 12 : level === 2 ? 20 : 28;
            for (let i = 0; i < count; i++) {
                const x = w * 0.08 + i * (w * 0.84 / count);
                const wave = Math.sin(game.frame * 0.06 + i + row) * 2;
                ctx.fillStyle = row % 2 ? "rgba(106,226,255,.55)" : level === 2 ? "rgba(255,77,109,.55)" : "rgba(255,209,102,.6)";
                ctx.beginPath();
                ctx.arc(x, y + wave, level === 3 ? 3 : 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (level === 3) {
            ctx.strokeStyle = "rgba(255,255,255,.16)";
            ctx.lineWidth = 3;
            for (let i = 0; i < 7; i++) {
                const x = w * (i / 6);
                ctx.beginPath();
                ctx.moveTo(w * 0.5, h * 0.05);
                ctx.quadraticCurveTo(x, h * 0.22, x, h * 0.58);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.42, w * 0.43, Math.PI, 0);
            ctx.stroke();
        }

        const beamColor = level === 1 ? "rgba(125,249,255,.16)" : level === 2 ? "rgba(255,77,109,.16)" : "rgba(255,209,102,.18)";
        ctx.fillStyle = beamColor;
        for (let i = 0; i < 2 + level; i++) {
            const x = w * (0.12 + i * 0.18) + Math.sin(game.frame * 0.01 + i) * 30;
            ctx.beginPath();
            ctx.moveTo(x - 22, 0);
            ctx.lineTo(x + 22, 0);
            ctx.lineTo(x + 90, h);
            ctx.lineTo(x - 90, h);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    function patchTieredColiseum() {
        if (typeof Game === "undefined" || typeof WaveManager === "undefined") return;
        if (Game.prototype.__tieredColiseumPatch) return;

        const oldSetup = Game.prototype.setupUI;
        Game.prototype.setupUI = function () {
            oldSetup.call(this);
            ensureColiseumSelector();
            const btn = document.getElementById("btnColiseum");
            if (btn && !btn.dataset.tieredColiseum) {
                const clone = btn.cloneNode(true);
                btn.parentNode.replaceChild(clone, btn);
                clone.dataset.tieredColiseum = "1";
                clone.addEventListener("click", openColiseumSelector);
            }
        };

        const oldStart = Game.prototype.startGame;
        Game.prototype.startGame = function () {
            oldStart.call(this);
            if (this.gameMode === "coliseum") {
                document.body.dataset.coliseumTier = String(this.coliseumLevel || 1);
                this.coliseumReward ||= 0;
            }
        };

        const oldStartWave = WaveManager.prototype.startWave;
        WaveManager.prototype.startWave = function () {
            if (game?.gameMode === "coliseum" && game.coliseumLevel) {
                this.wave++;
                this.state = "coliseumRound";
                this.spawnedCount = 0;
                this.enemiesToSpawn = 0;
                this.bossSpawned = false;
                this.bossDefeated = false;
                this.miniBossSpawned = false;
                this.miniBossDefeated = false;
                spawnColiseumRound(this);
                return;
            }
            oldStartWave.call(this);
        };

        const oldUpdate = WaveManager.prototype.update;
        WaveManager.prototype.update = function () {
            if (game?.gameMode === "coliseum" && game.coliseumLevel && this.state === "coliseumRound") {
                if (aliveSpecials().length === 0) {
                    this.state = "shop";
                    game.enemyManager.enemies = [];
                    rewardColiseumRound(this);
                    window.onWaveComplete?.(this.wave);
                    game.showShop();
                }
                return;
            }
            oldUpdate.call(this);
        };

        const oldBossDefeated = WaveManager.prototype.onBossDefeated;
        WaveManager.prototype.onBossDefeated = function () {
            oldBossDefeated.call(this);
            if (game?.gameMode === "coliseum" && game.coliseumLevel) {
                this.totalBossesDefeated = 0;
                this.bossDefeated = false;
            }
        };

        const oldHud = Game.prototype.updateHUD;
        Game.prototype.updateHUD = function () {
            oldHud.call(this);
            if (this.gameMode !== "coliseum" || !this.coliseumLevel) return;
            const tier = TIERS[this.coliseumLevel] || TIERS[1];
            const alive = aliveSpecials().length;
            const wave = document.getElementById("waveText");
            const enemies = document.getElementById("enemyCount");
            if (wave) wave.textContent = `COLISEO ${tier.roman} | RONDA ${this.waveManager.wave}`;
            if (enemies) enemies.textContent = `ENEMIGOS: ${alive} | ${tier.difficulty} | $${this.coliseumReward || 0}`;
        };

        const oldBgDraw = BackgroundSystem.prototype.draw;
        BackgroundSystem.prototype.draw = function (ctx) {
            oldBgDraw.call(this, ctx);
            if (game?.gameMode === "coliseum" && game.coliseumLevel) {
                drawColiseumArena(ctx, clamp(Number(game.coliseumLevel || 1), 1, 3));
            }
        };

        Game.prototype.__tieredColiseumPatch = true;
    }

    patchTieredColiseum();
    document.addEventListener("DOMContentLoaded", patchTieredColiseum);
    window.openColiseumSelector = openColiseumSelector;
    window.startColiseumMode = startColiseumMode;
})();

// Advanced content pack: bosses, meta bosses, cosmetics shop and battle pass.
(function () {
    if (window.__advancedContentPackInstalled) return;
    window.__advancedContentPackInstalled = true;

    const COSMETIC_KEY = "gs_cosmetics_v3";
    const BP_KEY = "gs_battlepass_v3";

    const ADVANCED_SKINS = [
        { id: "ultraray_ship", name: "Nave Ultrarayo", rarity: "Cosmica", category: "Naves", price: 1150, color: "#7df9ff", accent: "#ffffff", shot: "ultraray", special: "ultra_beam", cooldown: 780, desc: "Disparo: energia ultrarrapida. Especial: ultramega rayo perforante." },
        { id: "abyss_octopus_ship", name: "Nave Pulpo Abisal", rarity: "Mitica", category: "Abisal", price: 1250, color: "#6d28d9", accent: "#d8b4fe", shot: "abyss", special: "tentacle_burst", cooldown: 820, desc: "Disparo: energia alienigena. Especial: tentaculos cosmicos alrededor." },
        { id: "whirlwind_ship", name: "Nave Torbellino", rarity: "Legendaria", category: "Elementales", price: 980, color: "#67e8f9", accent: "#ecfeff", shot: "tornado", special: "mega_tornado", cooldown: 760, desc: "Disparo: tornados pequenos. Especial: super tornado que atrae y dana." },
        { id: "devourer_skin", name: "Devorador", rarity: "Cosmica", category: "Metajefes", price: 1500, color: "#190b2f", accent: "#ff4fd8", shot: "devourer", special: "planet_maw", cooldown: 980, desc: "Disparo: fragmentos de planeta. Especial: boca cosmica gravitacional." },
        { id: "solar_king_skin", name: "Solar Viviente", rarity: "Mitica", category: "Astronomicas", price: 1180, color: "#ff9f1c", accent: "#fff3b0", shot: "solar_king", special: "controlled_supernova", cooldown: 860, desc: "Disparo: plasma solar. Especial: supernova controlada." },
        { id: "alien_emperor_skin", name: "Emperador Alien", rarity: "Legendaria", category: "Alien", price: 940, color: "#80ffdb", accent: "#c7f9cc", shot: "alien_lance", special: "alien_fleet", cooldown: 720, desc: "Disparo: lanzas alienigenas. Especial: flota de apoyo." },
        { id: "galactic_dragon_skin", name: "Dragon Galactico", rarity: "Mitica", category: "Dragones", price: 1320, color: "#ff5400", accent: "#ffd166", shot: "star_dragon", special: "dragon_cross", cooldown: 840, desc: "Disparo: fuego estelar. Especial: dragon cruza el mapa." },
        { id: "nuclear_demon_skin", name: "Demonio Nuclear", rarity: "Nuclear", category: "Nuclear", price: 1380, color: "#9d0208", accent: "#9cff3a", shot: "nuclear_demon", special: "radioactive_inferno", cooldown: 900, desc: "Disparo: fuego radioactivo. Especial: infierno nuclear." },
        { id: "storm_dragon_skin", name: "Dragon de Tormenta", rarity: "Legendaria", category: "Dragones", price: 1040, color: "#1d4ed8", accent: "#7df9ff", shot: "electric", special: "electric_storm", cooldown: 720, desc: "Disparo: relampagos de dragon. Especial: tormenta total." },
        { id: "plasma_queen_skin", name: "Reina Plasma", rarity: "Mitica", category: "Plasma", price: 1120, color: "#c56bff", accent: "#7df9ff", shot: "plasma", special: "plasma_nova", cooldown: 760, desc: "Disparo: plasma real. Especial: nova brillante." },
        { id: "lava_titan_skin", name: "Titan Lava", rarity: "Legendaria", category: "Elementales", price: 1020, color: "#dc2626", accent: "#ffba08", shot: "lava", special: "lava_wave", cooldown: 760, desc: "Disparo: magma pesado. Especial: ola de lava." },
        { id: "ice_angel_skin", name: "Angel de Hielo", rarity: "Mitica", category: "Elementales", price: 1080, color: "#60a5fa", accent: "#ffffff", shot: "frost", special: "deep_freeze", cooldown: 740, desc: "Disparo: hielo celestial. Especial: congelacion total." },
        { id: "alien_tornado_skin", name: "Alien Tornado", rarity: "Cosmica", category: "Alien", price: 1260, color: "#80ffdb", accent: "#ecfeff", shot: "tornado", special: "mega_tornado", cooldown: 820, desc: "Disparo: mini tornados alienigenas. Especial: tornado gigante." }
    ];

    const FRAMES = [
        ["frame_solar", "Marco Solar", "Legendaria", 520, "#ff9f1c", "Corona de plasma para perfil y nave."],
        ["frame_galactic", "Marco Galactico", "Cosmica", 740, "#6ae2ff", "Anillo cosmico con estrellas."],
        ["frame_fire", "Marco de Fuego", "Epica", 380, "#ff5400", "Borde ardiente animado."],
        ["frame_ice", "Marco de Hielo", "Epica", 380, "#60a5fa", "Cristales frios y brillo azul."],
        ["frame_meat", "Marco de Carne", "Epica", 420, "#7f1d1d", "Borde organico oscuro."],
        ["frame_dino", "Marco Dinosaurio", "Jurasica", 520, "#7ae582", "Garras y huesos jurassicos."],
        ["frame_nuclear", "Marco Nuclear", "Nuclear", 680, "#9cff3a", "Simbolo radioactivo brillante."],
        ["frame_alien", "Marco Alienigena", "Mitica", 690, "#80ffdb", "Circuitos alienigenas."],
        ["frame_coliseum", "Marco Coliseo", "Legendaria", 600, "#ffd166", "Oro y acero de arena."],
        ["frame_legendary_gold", "Marco Legendario Dorado", "Cosmica", 980, "#ffd700", "Marco dorado premium."]
    ].map(([id, name, rarity, price, color, desc]) => ({ id, type: "frame", name, rarity, price, color, desc }));

    const EFFECTS = [
        ["effect_fire_trail", "Estela de Fuego", "Epica", 420, "#ff5400", "Rastro ardiente detras del jugador."],
        ["effect_electric_trail", "Estela Electrica", "Legendaria", 560, "#f8ff6a", "Chispas y rayos cortos."],
        ["effect_cosmic_trail", "Estela Cosmica", "Cosmica", 780, "#6ae2ff", "Polvo de estrellas y nebulosa."],
        ["effect_blackhole_trail", "Estela Agujero Negro", "Mitica", 820, "#b388ff", "Distorsion oscura al moverse."],
        ["effect_nuclear_blast", "Explosion Nuclear", "Nuclear", 900, "#9cff3a", "Explosiones verdes al impactar."],
        ["effect_plasma_blast", "Explosion Plasma", "Legendaria", 620, "#c56bff", "Pulso de plasma brillante."],
        ["effect_particle_shot", "Disparo con Particulas", "Rara", 260, "#ffffff", "Particulas extra al disparar."],
        ["effect_angel_aura", "Aura Angelical", "Mitica", 760, "#fff3b0", "Halo de luz curativa visual."],
        ["effect_demon_aura", "Aura Demoniaca", "Mitica", 760, "#ff334d", "Aura infernal roja."],
        ["effect_storm_aura", "Aura de Tormenta", "Legendaria", 680, "#7df9ff", "Nubes electricas alrededor."]
    ].map(([id, name, rarity, price, color, desc]) => ({ id, type: "effect", name, rarity, price, color, desc }));

    const PROJECTILES = [
        ["proj_cosmic", "Proyectil Cosmico", "Cosmica", 650, "#6ae2ff", "Trail estelar para disparos."],
        ["proj_solar", "Proyectil Solar", "Legendaria", 540, "#ff9f1c", "Brillo solar en impactos."],
        ["proj_abyss", "Proyectil Abisal", "Mitica", 700, "#6d28d9", "Particulas moradas oscuras."],
        ["proj_nuclear", "Proyectil Nuclear", "Nuclear", 780, "#9cff3a", "Destellos radioactivos."]
    ].map(([id, name, rarity, price, color, desc]) => ({ id, type: "projectile", name, rarity, price, color, desc }));

    const PACKAGES = [
        { id: "pack_cosmic", type: "package", name: "Paquete Cosmico", rarity: "Cosmica", price: 1700, color: "#6ae2ff", desc: "Skin Devorador + marco galactico + estela cosmica.", grants: ["devourer_skin", "frame_galactic", "effect_cosmic_trail", "proj_cosmic"] },
        { id: "pack_coliseum", type: "package", name: "Paquete Coliseo", rarity: "Legendaria", price: 1250, color: "#ffd166", desc: "Gladiador + marco coliseo + monedas.", grants: ["gladiator_skin", "frame_coliseum", "coins:350"] },
        { id: "pack_solar", type: "package", name: "Paquete Solar", rarity: "Mitica", price: 1500, color: "#ff9f1c", desc: "Solar Viviente + marco solar + efecto fuego.", grants: ["solar_king_skin", "frame_solar", "effect_fire_trail"] },
        { id: "pack_abyss", type: "package", name: "Paquete Abisal", rarity: "Mitica", price: 1600, color: "#6d28d9", desc: "Nave Pulpo + proyectil abisal + estela agujero negro.", grants: ["abyss_octopus_ship", "proj_abyss", "effect_blackhole_trail"] },
        { id: "pack_robot", type: "package", name: "Paquete Robot", rarity: "Legendaria", price: 1180, color: "#94a3b8", desc: "Robot + efecto particulas + monedas.", grants: ["robot_skin", "effect_particle_shot", "coins:250"] },
        { id: "pack_dino", type: "package", name: "Paquete Dino", rarity: "Jurasica", price: 1320, color: "#7ae582", desc: "Dino nuclear + marco dinosaurio.", grants: ["dino_nuclear", "frame_dino"] },
        { id: "pack_nuclear", type: "package", name: "Paquete Nuclear", rarity: "Nuclear", price: 1750, color: "#9cff3a", desc: "Demonio nuclear + marco nuclear + proyectil nuclear.", grants: ["nuclear_demon_skin", "frame_nuclear", "proj_nuclear"] },
        { id: "pack_meat", type: "package", name: "Paquete Carne", rarity: "Epica", price: 980, color: "#7f1d1d", desc: "Skin carne + marco carne.", grants: ["meat_skin", "frame_meat"] }
    ];

    const SHOP_CATALOG = [...FRAMES, ...EFFECTS, ...PROJECTILES, ...PACKAGES];

    const ADVANCED_BOSSES = [
        { id: "mega_coliseum_robot", base: "robot_colossal", name: "MEGA ROBOT DEL COLISEO", color: "#94a3b8", glow: "#38bdf8", hp: 1.75, reward: "frame_coliseum", meta: false },
        { id: "abyss_saucer", base: "mothership", name: "PLATILLO ABISAL", color: "#6d28d9", glow: "#d8b4fe", hp: 1.45, reward: "effect_blackhole_trail", meta: false },
        { id: "cosmic_octopus", base: "mothership", name: "PULPO COSMICO", color: "#9333ea", glow: "#f0abfc", hp: 1.5, reward: "abyss_octopus_ship", meta: false },
        { id: "planet_devourer", base: "living_planet", name: "DEVORADOR DE PLANETAS", color: "#190b2f", glow: "#ff4fd8", hp: 2.25, reward: "devourer_skin", meta: true },
        { id: "living_sun", base: "bomber_supreme", name: "SOL VIVIENTE", color: "#ff9f1c", glow: "#fff3b0", hp: 1.7, reward: "solar_king_skin", meta: true },
        { id: "galactic_dragon", base: "mech_beast", name: "DRAGON GALACTICO", color: "#ff5400", glow: "#ffd166", hp: 1.55, reward: "galactic_dragon_skin", meta: false },
        { id: "mechanic_angel", base: "electric_boss", name: "ANGEL MECANICO", color: "#f8fafc", glow: "#ffd166", hp: 1.42, reward: "effect_angel_aura", meta: false },
        { id: "nuclear_demon", base: "bomber_supreme", name: "DEMONIO NUCLEAR", color: "#9d0208", glow: "#9cff3a", hp: 1.72, reward: "nuclear_demon_skin", meta: false },
        { id: "mutant_dino_king", base: "mech_beast", name: "REY DINOSAURIO MUTANTE", color: "#7ae582", glow: "#ff6b35", hp: 1.62, reward: "frame_dino", meta: false },
        { id: "colossal_tank", base: "tank_giant", name: "TANQUE COLOSAL", color: "#6b7280", glow: "#ffd166", hp: 1.55, reward: "frame_legendary_gold", meta: false },
        { id: "electric_robot", base: "robot_colossal", name: "ROBOT ELECTRICO", color: "#334155", glow: "#f8ff6a", hp: 1.5, reward: "effect_electric_trail", meta: false },
        { id: "space_worm", base: "black_hole", name: "GUSANO ESPACIAL", color: "#111827", glow: "#a855f7", hp: 1.56, reward: "proj_abyss", meta: false },
        { id: "meat_beast", base: "living_planet", name: "BESTIA DE CARNE", color: "#7f1d1d", glow: "#ff6b6b", hp: 1.6, reward: "frame_meat", meta: false },
        { id: "coliseum_gladiator", base: "tank_giant", name: "GLADIADOR DEL COLISEO", color: "#b45309", glow: "#ffd166", hp: 1.48, reward: "gladiator_skin", meta: false },
        { id: "void_entity", base: "black_hole", name: "SER DE AGUJERO NEGRO", color: "#020617", glow: "#b388ff", hp: 1.75, reward: "effect_blackhole_trail", meta: false },
        { id: "alien_emperor", base: "mothership", name: "EMPERADOR ALIENIGENA", color: "#80ffdb", glow: "#c7f9cc", hp: 1.58, reward: "alien_emperor_skin", meta: false }
    ];

    const BATTLE_PASS = Array.from({ length: 30 }, (_, i) => {
        const level = i + 1;
        const rewards = [
            { type: "coins", amount: 60 + level * 12, label: `${60 + level * 12} monedas` },
            level % 5 === 0 ? { type: "effect", id: EFFECTS[(level / 5 - 1) % EFFECTS.length].id, label: EFFECTS[(level / 5 - 1) % EFFECTS.length].name } : null,
            level % 6 === 0 ? { type: "frame", id: FRAMES[(level / 6 - 1) % FRAMES.length].id, label: FRAMES[(level / 6 - 1) % FRAMES.length].name } : null,
            level === 12 ? { type: "skin", id: "ultraray_ship", label: "Nave Ultrarayo" } : null,
            level === 20 ? { type: "skin", id: "whirlwind_ship", label: "Nave Torbellino" } : null,
            level === 30 ? { type: "skin", id: "devourer_skin", label: "Skin Devorador" } : null
        ].filter(Boolean);
        return { level, rarity: level % 10 === 0 ? "Cosmica" : level % 5 === 0 ? "Legendaria" : level % 3 === 0 ? "Epica" : "Rara", rewards };
    });

    function loadCosmetics() {
        try {
            const parsed = JSON.parse(localStorage.getItem(COSMETIC_KEY) || "{}");
            return {
                unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked : [],
                equipped: { frame: parsed.equipped?.frame || "", effect: parsed.equipped?.effect || "", projectile: parsed.equipped?.projectile || "" }
            };
        } catch (_) {
            return { unlocked: [], equipped: { frame: "", effect: "", projectile: "" } };
        }
    }

    function saveCosmetics(state) {
        localStorage.setItem(COSMETIC_KEY, JSON.stringify(state));
    }

    const cosmetics = loadCosmetics();

    function loadBP() {
        try {
            const parsed = JSON.parse(localStorage.getItem(BP_KEY) || "{}");
            return { claimed: Array.isArray(parsed.claimed) ? parsed.claimed : [] };
        } catch (_) {
            return { claimed: [] };
        }
    }

    function saveBP(state) {
        localStorage.setItem(BP_KEY, JSON.stringify(state));
    }

    const bpState = loadBP();

    function addUnique(arr, id) {
        if (!arr.includes(id)) arr.push(id);
    }

    function unlockCosmetic(id, equip = false) {
        const item = SHOP_CATALOG.find(x => x.id === id);
        if (!item) return false;
        addUnique(cosmetics.unlocked, id);
        if (equip && item.type !== "package") cosmetics.equipped[item.type] = id;
        saveCosmetics(cosmetics);
        return true;
    }

    function unlockSkin(id, equip = false) {
        if (!window.skinSystem) return false;
        const skin = window.skinSystem.getSkin?.(id);
        if (!skin) return false;
        addUnique(window.skinSystem.state.unlocked, id);
        if (equip) window.skinSystem.state.equipped = id;
        window.skinSystem.save?.();
        return true;
    }

    function grant(grantId) {
        if (grantId.startsWith("coins:")) {
            playerData?.addC?.(Number(grantId.split(":")[1]) || 0);
            return;
        }
        if (window.skinSystem?.getSkin?.(grantId)) unlockSkin(grantId);
        else unlockCosmetic(grantId);
    }

    function extendAdvancedSkins() {
        if (!window.skinSystem || window.skinSystem.__advancedContentSkins) return;
        const existing = new Set(window.skinSystem.skins.map(s => s.id));
        for (const skin of ADVANCED_SKINS) if (!existing.has(skin.id)) window.skinSystem.skins.push(skin);
        window.skinSystem.__advancedContentSkins = true;
    }

    function itemOwned(item) {
        if (item.type === "package") return cosmetics.unlocked.includes(item.id);
        return cosmetics.unlocked.includes(item.id);
    }

    function itemEquipped(item) {
        return item.type !== "package" && cosmetics.equipped[item.type] === item.id;
    }

    function buyCosmetic(item) {
        if (itemOwned(item)) {
            if (item.type !== "package") {
                cosmetics.equipped[item.type] = itemEquipped(item) ? "" : item.id;
                saveCosmetics(cosmetics);
                showNotif(itemEquipped(item) ? "Equipado: " + item.name : "Desequipado: " + item.name, "success");
            }
            return;
        }
        if (!playerData || playerData.d.coins < item.price) {
            showNotif("Necesitas " + item.price + " monedas", "error");
            return;
        }
        playerData.d.coins -= item.price;
        addUnique(cosmetics.unlocked, item.id);
        if (item.type === "package") item.grants.forEach(grant);
        else cosmetics.equipped[item.type] = item.id;
        saveCosmetics(cosmetics);
        playerData.sv?.();
        updGamUI?.();
        showNotif("Comprado: " + item.name, "success");
    }

    function ensureShopTabs() {
        const tabs = document.querySelector(".shopTabs");
        if (!tabs || tabs.dataset.advancedTabs) return;
        const extra = [
            ["projectile", "Proyectiles"],
            ["package", "Paquetes"],
            ["owned", "Comprados"],
            ["locked", "No comprados"]
        ];
        for (const [tab, label] of extra) {
            const b = document.createElement("button");
            b.className = "shopTab";
            b.dataset.tab = tab;
            b.textContent = label;
            b.addEventListener("click", () => {
                document.querySelectorAll(".shopTab").forEach(x => x.classList.remove("active"));
                b.classList.add("active");
                window.rendShop(tab);
            });
            tabs.appendChild(b);
        }
        tabs.dataset.advancedTabs = "1";
    }

    function skinCard(skin) {
        const unlocked = window.skinSystem.isUnlocked(skin.id);
        const equipped = window.skinSystem.state.equipped === skin.id;
        const button = document.createElement("button");
        button.className = `shop-item mega-shop-card ${equipped ? "equipped" : ""} ${unlocked ? "unlocked" : "locked"} rarity-${(skin.rarity || "Comun").toLowerCase()}`;
        button.style.setProperty("--item-color", skin.color || "#6ae2ff");
        button.style.setProperty("--item-accent", skin.accent || "#ffffff");
        button.innerHTML = `
            <div class="mega-preview skin-preview"></div>
            <div class="skin-rarity">${skin.rarity || "Comun"}</div>
            <div class="item-name">${skin.name}</div>
            <div class="item-desc">${skin.desc || "Skin avanzada con disparo y especial propio."}</div>
            <div class="shop-state">${equipped ? "Equipada" : unlocked ? "Comprada" : skin.price + " monedas"}</div>
            <strong>${equipped ? "Desequipar" : unlocked ? "Equipar" : "Comprar"}</strong>`;
        button.onclick = () => {
            const res = equipped ? window.skinSystem.unequip() : unlocked ? window.skinSystem.equip(skin.id) : window.skinSystem.buy(skin.id);
            showNotif(res.message, res.ok ? "success" : "error");
            renderMegaShop("skin");
            updGamUI?.();
        };
        return button;
    }

    function cosmeticCard(item) {
        const owned = itemOwned(item);
        const equipped = itemEquipped(item);
        const button = document.createElement("button");
        button.className = `shop-item mega-shop-card ${equipped ? "equipped" : ""} ${owned ? "unlocked" : "locked"} rarity-${(item.rarity || "Rara").toLowerCase()}`;
        button.style.setProperty("--item-color", item.color);
        button.style.setProperty("--item-accent", item.color);
        button.innerHTML = `
            <div class="mega-preview ${item.type}-preview"></div>
            <div class="skin-rarity">${item.rarity}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.desc}</div>
            <div class="shop-state">${equipped ? "Equipado" : owned ? "Comprado" : item.price + " monedas"}</div>
            <strong>${item.type === "package" ? (owned ? "Abierto" : "Comprar") : equipped ? "Desequipar" : owned ? "Equipar" : "Comprar"}</strong>`;
        button.onclick = () => {
            buyCosmetic(item);
            renderMegaShop(item.type);
        };
        return button;
    }

    function renderMegaShop(tab = "skin") {
        extendAdvancedSkins();
        ensureShopTabs();
        const content = document.getElementById("shopContent");
        if (!content) return;
        document.getElementById("skinShopControls")?.remove();
        const panel = content.parentNode;
        const controls = document.createElement("div");
        controls.id = "skinShopControls";
        controls.className = "skin-shop-controls mega-shop-controls";
        controls.innerHTML = `
            <input id="megaShopSearch" placeholder="Buscar objeto">
            <select id="megaShopFilter">
                <option value="all">Todos</option>
                <option value="owned">Comprados</option>
                <option value="locked">No comprados</option>
                <option value="Legendaria">Legendarios</option>
                <option value="Mitica">Miticos</option>
                <option value="Cosmica">Cosmicos</option>
                <option value="Nuclear">Nucleares</option>
            </select>`;
        panel.insertBefore(controls, content);

        const paint = () => {
            const q = (document.getElementById("megaShopSearch")?.value || "").toLowerCase();
            const filter = document.getElementById("megaShopFilter")?.value || "all";
            content.classList.add("mega-shop-grid");
            content.innerHTML = "";

            let items = [];
            if (tab === "skin") items = window.skinSystem.skins.map(s => ({ kind: "skin", data: s }));
            else if (tab === "frame") items = FRAMES.map(data => ({ kind: "cosmetic", data }));
            else if (tab === "effect") items = EFFECTS.map(data => ({ kind: "cosmetic", data }));
            else if (tab === "projectile") items = PROJECTILES.map(data => ({ kind: "cosmetic", data }));
            else if (tab === "package") items = PACKAGES.map(data => ({ kind: "cosmetic", data }));
            else {
                const all = [...window.skinSystem.skins.map(data => ({ kind: "skin", data })), ...SHOP_CATALOG.map(data => ({ kind: "cosmetic", data }))];
                items = all.filter(item => tab === "owned" ? isOwned(item) : !isOwned(item));
            }

            const visible = items.filter(item => {
                const d = item.data;
                const owned = isOwned(item);
                const text = `${d.name} ${d.desc || ""} ${d.rarity || ""}`.toLowerCase();
                if (q && !text.includes(q)) return false;
                if (filter === "owned" && !owned) return false;
                if (filter === "locked" && owned) return false;
                if (!["all", "owned", "locked"].includes(filter) && d.rarity !== filter) return false;
                return true;
            });

            const ownedGroup = visible.filter(isOwned);
            const lockedGroup = visible.filter(item => !isOwned(item));
            addGroup("Comprados / Equipables", ownedGroup);
            addGroup("No comprados / Bloqueados", lockedGroup);
            if (!visible.length) content.innerHTML = '<div class="shop-empty">No hay objetos con ese filtro.</div>';
        };

        function isOwned(item) {
            return item.kind === "skin" ? window.skinSystem.isUnlocked(item.data.id) : itemOwned(item.data);
        }

        function addGroup(title, list) {
            if (!list.length) return;
            const h = document.createElement("div");
            h.className = "mega-shop-section";
            h.textContent = title;
            content.appendChild(h);
            for (const item of list) content.appendChild(item.kind === "skin" ? skinCard(item.data) : cosmeticCard(item.data));
        }

        document.getElementById("megaShopSearch").oninput = paint;
        document.getElementById("megaShopFilter").onchange = paint;
        paint();
    }

    function claimBPReward(level) {
        const reward = BATTLE_PASS.find(r => r.level === level);
        if (!reward || bpState.claimed.includes(level)) return;
        if ((playerData?.d.bpl || 1) < level) return;
        for (const r of reward.rewards) {
            if (r.type === "coins") playerData.addC(r.amount);
            if (r.type === "skin") unlockSkin(r.id);
            if (["frame", "effect", "projectile"].includes(r.type)) unlockCosmetic(r.id);
        }
        addUnique(bpState.claimed, level);
        saveBP(bpState);
        playerData.sv?.();
        updGamUI?.();
        renderBattlePass();
        showNotif("Recompensa reclamada nivel " + level, "success");
    }

    function renderBattlePass() {
        const list = document.getElementById("bpRewardsList");
        if (!list) return;
        const current = playerData?.d.bpl || 1;
        const xp = playerData?.d.bpxp || 0;
        const need = current * 1000;
        const fill = document.getElementById("bpProgressFill");
        const txt = document.getElementById("bpXPText");
        const lvl = document.getElementById("bpLevelNum");
        if (fill) fill.style.width = Math.min(100, xp / need * 100) + "%";
        if (txt) txt.textContent = xp + "/" + need + " XP";
        if (lvl) lvl.textContent = current;
        list.className = "bp-modern-track";
        list.innerHTML = "";
        for (const reward of BATTLE_PASS) {
            const available = current >= reward.level;
            const claimed = bpState.claimed.includes(reward.level);
            const card = document.createElement("div");
            card.className = `bp-modern-card rarity-${reward.rarity.toLowerCase()} ${available ? "available" : "locked"} ${claimed ? "claimed" : ""}`;
            card.innerHTML = `
                <div class="bp-level-num">Nivel ${reward.level}</div>
                <div class="bp-reward-stack">${reward.rewards.map(r => `<span>${r.label}</span>`).join("")}</div>
                <button class="claim-btn" ${available && !claimed ? "" : "disabled"}>${claimed ? "Reclamado" : available ? "Reclamar" : "Bloqueado"}</button>`;
            card.querySelector("button").onclick = () => claimBPReward(reward.level);
            list.appendChild(card);
        }
    }

    function spawnAdvancedBoss(data, wave) {
        const boss = new Boss(data.base, wave);
        boss.advancedBoss = data.id;
        boss.advancedReward = data.reward;
        boss.name = data.name;
        boss.color = data.color;
        boss.glowColor = data.glow;
        boss.radius = data.meta ? Math.max(boss.radius, 72) : Math.max(boss.radius, 50);
        boss.maxHealth = Math.floor(boss.maxHealth * data.hp);
        boss.health = boss.maxHealth;
        boss.score = Math.floor((boss.score || 600) * (data.meta ? 2.3 : 1.45));
        game.boss = boss;
        game.showBossBar(boss);
        game.showNotification((data.meta ? "METAJEFE: " : "JEFE: ") + data.name, "boss");
        game.particles.emitShockwave(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, data.glow);
        game.screenShake.shake(data.meta ? 30 : 20);
        sound.play("boss_alert");
    }

    function advancedBossPattern(boss, player) {
        if (!boss.advancedBoss || boss.spawnTimer > 0 || boss.dead || !player) return;
        const role = boss.advancedBoss;
        const hp = boss.health / boss.maxHealth;
        const rate = hp < 0.22 ? 55 : hp < 0.5 ? 80 : 120;
        if (boss.animFrame % rate !== 0) return;
        const a = angle(boss.x, boss.y, player.x, player.y);
        if (role === "mega_coliseum_robot") {
            for (let i = -1; i <= 1; i++) game.bulletManager.addEnemyBullet(boss.x, boss.y, a + i * 0.16, 8, boss.damage, "#38bdf8");
            if (boss.phase >= 2) for (let i = 0; i < 3; i++) game.enemyManager.spawnEnemy("heavy_drone", boss.x + rand(-80, 80), boss.y + rand(-80, 80), game.waveManager.wave);
            if (boss.phase >= 3) game.bulletManager.addLaser?.(boss.x, boss.y, a, boss.damage * 1.8, 18);
            pulseAt(boss.x, boss.y, 180, "#94a3b8", boss.damage * 0.55);
        } else if (role === "abyss_saucer" || role === "cosmic_octopus") {
            for (let i = 0; i < 6; i++) tentacleStrike(boss, player, i);
            if (boss.phase >= 2) gravityZone(player.x + rand(-160, 160), player.y + rand(-140, 140), boss.glowColor, 150);
            if (boss.phase >= 3) game.enemyManager.spawnEnemy(randChoice(["scout_ship", "flyer", "ghost"]), boss.x + rand(-100, 100), boss.y + rand(-60, 100), game.waveManager.wave);
        } else if (role === "planet_devourer") {
            gravityZone(boss.x, boss.y, boss.glowColor, 260);
            for (let i = 0; i < 5; i++) game.bulletManager.addEnemyBullet(boss.x, boss.y, a + rand(-0.8, 0.8), rand(4, 7), boss.damage * 0.85, "#ff4fd8");
            if (boss.phase >= 3) pulseAt(player.x, player.y, 140, "#190b2f", boss.damage * 0.7);
        } else if (role === "living_sun") {
            for (let i = -2; i <= 2; i++) game.bulletManager.addEnemyBullet(boss.x, boss.y, a + i * 0.22, 7, boss.damage, "#ff9f1c");
            pulseAt(rand(80, CONFIG.canvasWidth - 80), rand(80, CONFIG.canvasHeight - 80), 130, "#ff9f1c", boss.damage * 0.65);
        } else {
            for (let i = 0; i < 10; i++) game.bulletManager.addEnemyBullet(boss.x, boss.y, (i / 10) * Math.PI * 2 + boss.animFrame * 0.02, 5.5, boss.damage * 0.65, boss.glowColor);
            if (boss.phase >= 2) pulseAt(boss.x, boss.y, 150, boss.glowColor, boss.damage * 0.45);
        }
    }

    function pulseAt(x, y, radius, color, damage) {
        game.particles.emitShockwave(x, y, color);
        if (game.player && dist(x, y, game.player.x, game.player.y) < radius) game.player.takeDamage(damage);
    }

    function gravityZone(x, y, color, radius) {
        game.particles.emitShockwave(x, y, color);
        const p = game.player;
        if (p) {
            const d = Math.max(1, dist(p.x, p.y, x, y));
            if (d < radius) {
                const a = angle(p.x, p.y, x, y);
                p.vx += Math.cos(a) * 1.3;
                p.vy += Math.sin(a) * 1.3;
                if (d < 55) p.takeDamage(8);
            }
        }
    }

    function tentacleStrike(boss, player, i) {
        const a = angle(boss.x, boss.y, player.x, player.y) + (i - 2.5) * 0.22 + Math.sin(boss.animFrame * 0.03 + i) * 0.25;
        const endX = boss.x + Math.cos(a) * 250;
        const endY = boss.y + Math.sin(a) * 250;
        game.bulletManager.electricBolts ||= [];
        game.bulletManager.electricBolts.push({ x1: boss.x, y1: boss.y, x2: endX, y2: endY, color: boss.glowColor, life: 20, maxLife: 20, jitter: 18 });
        if (pointToSegmentDistance(player.x, player.y, boss.x, boss.y, endX, endY) < 34) player.takeDamage(boss.damage * 0.7);
    }

    function patchAdvancedContent() {
        extendAdvancedSkins();

        const SkinProto = Object.getPrototypeOf(window.skinSystem);
        if (!SkinProto.__advancedContentFire) {
            const oldFire = SkinProto.fire;
            SkinProto.fire = function (player, bm, mult) {
                const s = this.equipped();
                const x = player.x, y = player.y, a = player.angle, dmg = 10 * (mult || 1);
                const spend = (rate = CONFIG.fireRate) => { player.fireTimer = Math.max(2, rate); if (!player.powerups.infinite) player.ammo--; };
                if (s.shot === "ultraray") { spend(3); bm.addBullet(x, y, a + rand(-0.03, 0.03), 19, dmg * 1.1, s.accent, true, false, false); return; }
                if (s.shot === "abyss") { spend(); bm.addPlasma(x, y, a, 7, dmg * 1.35); return; }
                if (s.shot === "tornado") { spend(CONFIG.fireRate + 2); bm.addShockwave(x + Math.cos(a) * 40, y + Math.sin(a) * 40, dmg * 0.9); return; }
                if (s.shot === "devourer") { spend(); bm.addGrenade(x, y, a, 7, dmg * 1.9, 46); return; }
                if (s.shot === "solar_king") { spend(5); bm.addFlameCone(x, y, a, dmg * 1.05); return; }
                if (s.shot === "alien_lance") { spend(); for (let i = -1; i <= 1; i++) bm.addPlasma(x, y, a + i * 0.09, 6, dmg); return; }
                if (s.shot === "star_dragon" || s.shot === "nuclear_demon") { spend(); bm.addFlameCone(x, y, a, dmg * 1.15); return; }
                oldFire.call(this, player, bm, mult);
            };

            const oldSpecial = SkinProto.useSpecial;
            SkinProto.useSpecial = function (player) {
                const s = this.equipped();
                if (!ADVANCED_SKINS.some(x => x.id === s.id)) return oldSpecial.call(this, player);
                if (player.skinSkillTimer > 0) {
                    showNotif("Especial en recarga: " + Math.ceil(player.skinSkillTimer / 60) + "s", "error");
                    return false;
                }
                player.skinSkillTimer = s.cooldown || 780;
                player.skinSkillMax = player.skinSkillTimer;
                const a = player.angle;
                if (s.special === "ultra_beam") {
                    for (let i = -1; i <= 1; i++) game.bulletManager.addRailgun(player.x, player.y, a + i * 0.025, 95);
                    game.particles.emitShockwave(player.x, player.y, s.accent);
                } else if (s.special === "tentacle_burst") {
                    for (let i = 0; i < 12; i++) tentacleStrike({ x: player.x, y: player.y, animFrame: game.frame, glowColor: s.accent, damage: 48 }, game.enemyManager.enemies[i % Math.max(1, game.enemyManager.enemies.length)] || { x: player.x + Math.cos(i) * 260, y: player.y + Math.sin(i) * 260, takeDamage() {} }, i);
                    for (const e of [...game.enemyManager.enemies, game.boss, game.miniBoss].filter(Boolean)) if (!e.dead && dist(player.x, player.y, e.x, e.y) < 330) e.takeDamage(75);
                } else if (s.special === "mega_tornado") {
                    for (let k = 0; k < 10; k++) setTimeout(() => {
                        pulseAt(player.x, player.y, 280, s.color, 0);
                        for (const e of [...game.enemyManager.enemies, game.boss, game.miniBoss].filter(Boolean)) if (!e.dead && dist(player.x, player.y, e.x, e.y) < 360) { e.vx += (player.x - e.x) * 0.035; e.vy += (player.y - e.y) * 0.035; e.takeDamage(13); }
                    }, k * 110);
                } else {
                    game.particles.emitShockwave(player.x, player.y, s.color);
                    for (const e of [...game.enemyManager.enemies, game.boss, game.miniBoss].filter(Boolean)) if (!e.dead && dist(player.x, player.y, e.x, e.y) < 420) e.takeDamage(92);
                }
                showNotif("Especial: " + s.name, "powerup");
                return true;
            };
            SkinProto.__advancedContentFire = true;
        }

        if (!Player.prototype.__advancedCosmeticDraw) {
            const oldDraw = Player.prototype.draw;
            Player.prototype.draw = function (ctx) {
                oldDraw.call(this, ctx);
                const effect = SHOP_CATALOG.find(i => i.id === cosmetics.equipped.effect);
                const frame = SHOP_CATALOG.find(i => i.id === cosmetics.equipped.frame);
                if (!effect && !frame) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                const color = effect?.color || frame?.color || "#6ae2ff";
                ctx.strokeStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 22;
                ctx.lineWidth = frame ? 4 : 2;
                ctx.globalAlpha = 0.45 + Math.sin((this.animFrame || 0) * 0.08) * 0.14;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + (frame ? 20 : 12), 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                if (effect && game.frame % 4 === 0) game.particles.emit(this.x - Math.cos(this.angle) * 18, this.y - Math.sin(this.angle) * 18, 1, { colors: [effect.color, "#ffffff"], speed: 1.4, life: 14, size: 2.2, glow: true });
            };
            Player.prototype.__advancedCosmeticDraw = true;
        }

        if (!Boss.prototype.__advancedBossPack) {
            const oldUpdate = Boss.prototype.update;
            Boss.prototype.update = function (player) {
                oldUpdate.call(this, player);
                advancedBossPattern(this, player);
            };

            const oldDraw = Boss.prototype.draw;
            Boss.prototype.draw = function (ctx) {
                oldDraw.call(this, ctx);
                if (!this.advancedBoss) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.strokeStyle = this.glowColor;
                ctx.shadowColor = this.glowColor;
                ctx.shadowBlur = 26;
                ctx.lineWidth = this.advancedBoss === "planet_devourer" ? 7 : 4;
                for (let i = 0; i < (this.advancedBoss.includes("octopus") || this.advancedBoss.includes("saucer") ? 8 : 3); i++) {
                    const a = (i / 8) * Math.PI * 2 + this.animFrame * 0.02;
                    ctx.beginPath();
                    ctx.arc(Math.cos(a) * this.radius * 0.7, Math.sin(a) * this.radius * 0.55, this.radius * 0.22, 0, Math.PI * 2);
                    ctx.stroke();
                }
                if (this.advancedBoss === "planet_devourer") {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius + 34 + Math.sin(this.animFrame * 0.08) * 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            };

            const oldDie = Boss.prototype.die;
            Boss.prototype.die = function () {
                const reward = this.advancedReward;
                const wasAdvanced = this.advancedBoss;
                oldDie.call(this);
                if (wasAdvanced) {
                    if (reward) grant(reward);
                    playerData?.addC?.(wasAdvanced === "planet_devourer" ? 900 : 420);
                    playerData?.addBPXP?.(wasAdvanced === "planet_devourer" ? 900 : 360);
                    playerData?.sv?.();
                    saveCosmetics(cosmetics);
                    updGamUI?.();
                    showNotif("Recompensa especial: " + (reward || "monedas"), "success");
                }
            };
            Boss.prototype.__advancedBossPack = true;
        }

        if (!WaveManager.prototype.__advancedBossSpawner) {
            const oldSpawnBoss = WaveManager.prototype.spawnBoss;
            WaveManager.prototype.spawnBoss = function () {
                const wave = this.wave || 1;
                const coliseum = game?.gameMode === "coliseum";
                const useMeta = coliseum ? wave % 7 === 0 : wave >= 8 && wave % 8 === 0;
                const useAdvanced = coliseum || wave % 4 === 0 || Math.random() < 0.28;
                if (useAdvanced) {
                    const pool = ADVANCED_BOSSES.filter(b => useMeta ? b.meta : !b.meta || coliseum);
                    spawnAdvancedBoss(randChoice(pool.length ? pool : ADVANCED_BOSSES), Math.max(wave + (coliseum ? 6 : 2), 4));
                    return;
                }
                oldSpawnBoss.call(this);
            };
            WaveManager.prototype.__advancedBossSpawner = true;
        }

        window.rendShop = function (tab) { renderMegaShop(tab || "skin"); };
        try { rendShop = window.rendShop; } catch (_) {}
        window.rendBP = renderBattlePass;
        try { rendBP = window.rendBP; } catch (_) {}

        const oldOpen = window.openPanel || openPanel;
        window.openPanel = function (id) {
            oldOpen(id);
            if (id === "shopPanel") renderMegaShop("skin");
            if (id === "battlePassPanel") renderBattlePass();
        };
        try { openPanel = window.openPanel; } catch (_) {}

        ensureShopTabs();
        renderBattlePass();
    }

    if (window.skinSystem) patchAdvancedContent();
    else window.addEventListener("load", patchAdvancedContent);
    window.advancedCosmetics = cosmetics;
})();
