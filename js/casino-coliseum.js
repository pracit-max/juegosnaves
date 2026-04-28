// Coliseo Casino - 5 calaveras.
(function () {
    if (window.__casinoColiseumInstalled) return;
    window.__casinoColiseumInstalled = true;

    const CASINO_MODE = "casino";
    const SUPER_BOSS_MODE = "super_bosses";
    const MAX_ACTIVE_SPECIALS = 5;
    const MAX_CASINO_ENEMIES = 34;
    const MAX_CASINO_MINES = 12;
    const MAX_CASINO_COINS = 44;
    const MAX_CASINO_ALLIES = 5;
    const CAGE_TYPES = ["steel", "energy", "royal", "infernal"];
    const POSITIVE_DROPS = ["health", "shield", "speed", "damage", "laser", "grenade", "shockwave", "homing", "rapid", "pierce", "explosive", "freeze", "magnet", "slowmotion", "massive", "invulnerable", "vampire", "overload", "chainLightning"];
    const BOSS_POOL = ["mothership", "mech_beast", "robot_colossal", "electric_boss", "tank_giant", "police_commander", "bomber_supreme", "living_planet", "black_hole", "supreme_dreadnought"];
    const MINI_POOL = ["mini_tank", "mini_ship", "armored_dog", "heavy_drone_boss", "ghost_lord", "splitter_boss", "mini_bomber", "mini_mecha", "mini_space_dragon", "mini_heavy_ship", "mini_nuclear", "mini_summoner", "mini_ninja"];
    const SUPER_ARCHETYPES = [
        { key: "electric", names: ["ENTIDAD ELECTRICA SUPREMA", "TORMENTA COLOSAL"], color: "#ffea00", glow: "#ffff77", attack: "lightning" },
        { key: "demon", names: ["DEMONIO COLOSAL", "REY INFERNAL GIGANTE"], color: "#8b0000", glow: "#ff334d", attack: "hell" },
        { key: "angel", names: ["ARCANGEL COLOSAL", "SERAFIN DE GUERRA"], color: "#fff3b0", glow: "#ffd166", attack: "holy" },
        { key: "tornado", names: ["HURACAN VIVIENTE", "CICLON TITANICO"], color: "#7df9ff", glow: "#ffffff", attack: "tornado" },
        { key: "octopus", names: ["PULPO ABISAL GIGANTE", "KRAKEN ESTELAR"], color: "#b388ff", glow: "#ff00e4", attack: "tentacle" },
        { key: "dino", names: ["DINOSAURIO GALACTICO", "BESTIA JURASICA COLOSAL"], color: "#7ae582", glow: "#ffdd57", attack: "stomp" },
        { key: "planet", names: ["PLANETA DEVORADOR", "MUNDO FINAL"], color: "#4cc9f0", glow: "#ffd166", attack: "meteor" },
        { key: "police", names: ["COMANDANTE TOTALITARIO", "LEY COLOSAL"], color: "#0044ff", glow: "#9bf6ff", attack: "police" },
        { key: "robot", names: ["ROBOT APOCALIPTICO", "MAQUINA TITAN"], color: "#8d99ae", glow: "#ff4444", attack: "laser" },
        { key: "chaos", names: ["QUIMERA DEL CAOS", "ENTIDAD IMPOSIBLE"], color: "#ff00e4", glow: "#ffd166", attack: "chaos" },
    ];
    const EMOJI_BOSS_ALIASES = ["💀 CALAVERA COSMICA", "😈 DEMONIO JACKPOT", "🐙 PULPO EMOJI", "🤖 ROBOT EMOJI", "🦖 DINO EMOJI", "👼 ANGEL EMOJI", "🐉 DRAGON EMOJI", "☀️ SOL EMOJI", "🕳️ AGUJERO EMOJI", "🎰 REY 777"];
    const EMOJI_MINI_ALIASES = ["💀 MINI CALAVERA", "🎲 MINI DADO", "🎡 MINI RULETA", "🪙 MINI FICHA", "👼 MINI ANGEL", "😈 MINI DEMONIO", "🦖 MINI DINO", "🤖 MINI ROBOT", "🐙 MINI PULPO", "💰 MINI JACKPOT"];
    const CASINO_COSMETICS = ["frame_casino", "frame_jackpot", "effect_golden_chips", "effect_roulette_trail", "galactic_gambler_skin"];

    class CasinoCage {
        constructor(x, index, total, wave) {
            this.id = "casino_cage_" + Date.now() + "_" + index + "_" + Math.random();
            this.x = x;
            this.y = -220 - index * 105;
            this.targetY = CONFIG.canvasHeight * 0.38 + (index % 2) * 145 + rand(-36, 36);
            this.radius = 45;
            this.w = 86;
            this.h = 96;
            this.vy = 12 + rand(0, 5);
            this.health = 95 + wave * 18 + total * 8;
            this.maxHealth = this.health;
            this.dead = false;
            this.opening = false;
            this.flash = 0;
            this.landPulse = 0;
            this.kind = randChoice(CAGE_TYPES);
            this.spawnKind = Math.random() < casinoBossChance() ? "boss" : "miniboss";
            this.trap = Math.random() < Math.min(0.28, 0.12 + wave * 0.012);
            this.spin = rand(0, Math.PI * 2);
        }

        update() {
            this.spin += 0.045;
            if (this.flash > 0) this.flash--;
            if (this.landPulse > 0) this.landPulse--;
            if (this.y < this.targetY) {
                this.y += this.vy;
                this.vy += 0.32;
                if (this.y >= this.targetY) {
                    this.y = this.targetY;
                    this.vy = 0;
                    this.landPulse = 22;
                    game.screenShake.shake(8);
                    window.__casinoVisualOnly = true;
                    game.particles.emitShockwave(this.x, this.y + this.h * 0.48, "#ff334d");
                    game.particles.emit(this.x, this.y + this.h * 0.5, 18, { colors: ["#ff334d", "#ffd166", "#ffffff"], speed: 5, life: 18, size: 2.5, glow: true });
                    window.__casinoVisualOnly = false;
                }
            }
        }

        takeDamage(amount) {
            if (this.dead || this.opening) return;
            this.health -= amount;
            this.flash = 6;
            game.floatingTexts.add(this.x, this.y - 60, Math.floor(amount).toString(), "#ffd166", 18, 24);
            game.particles.emit(this.x + rand(-30, 30), this.y + rand(-32, 32), 8, { colors: ["#ff334d", "#ffd166", "#7df9ff"], speed: 4, life: 14, size: 2.3, glow: true });
            sound.play("hit");
            if (this.health <= 0) this.breakOpen();
        }

        breakOpen() {
            this.dead = true;
            this.opening = true;
            window.__casinoVisualOnly = true;
            game.particles.emitExplosion(this.x, this.y, 1.5);
            game.particles.emitShockwave(this.x, this.y, "#ffd166");
            window.__casinoVisualOnly = false;
            game.screenShake.shake(13);
            sound.play("explosion");
            if (this.trap) triggerTrapBox(this.x, this.y);
            else spawnRandomBossOrMiniBoss(this.x, this.y, this.spawnKind);
            game.casino.lastRouletteTrigger = 0;
        }

        draw(ctx) {
            if (this.dead) return;
            const hp = clamp(this.health / this.maxHealth, 0, 1);
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.landPulse > 0) {
                ctx.globalAlpha = this.landPulse / 22;
                ctx.strokeStyle = "#ff334d";
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(0, this.h * 0.55, 58 + (22 - this.landPulse) * 5, 18 + (22 - this.landPulse), 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            const body = this.kind === "royal" ? "#33132e" : this.kind === "infernal" ? "#35100d" : "#111827";
            const accent = this.trap ? "#ff00e4" : this.kind === "energy" ? "#7df9ff" : this.kind === "royal" ? "#ffd166" : "#ff334d";
            ctx.shadowColor = accent;
            ctx.shadowBlur = 22;
            ctx.fillStyle = this.flash > 0 ? "#ffffff" : body;
            ctx.strokeStyle = accent;
            ctx.lineWidth = 5;
            roundRect(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 12, true, true);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255,255,255,.55)";
            ctx.lineWidth = 3;
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 16, -this.h / 2 + 9);
                ctx.lineTo(i * 16, this.h / 2 - 9);
                ctx.stroke();
            }
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(-this.w / 2 + 8, i * 22);
                ctx.lineTo(this.w / 2 - 8, i * 22);
                ctx.stroke();
            }
            ctx.fillStyle = "#ff1f3d";
            ctx.shadowColor = "#ff1f3d";
            ctx.shadowBlur = 16;
            for (let i = -1; i <= 1; i += 2) {
                ctx.beginPath();
                ctx.arc(i * 28, -34, 7 + Math.sin(this.spin) * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,.72)";
            ctx.fillRect(-40, -66, 80, 8);
            ctx.fillStyle = hp > 0.45 ? "#7ae582" : hp > 0.2 ? "#ffd166" : "#ff334d";
            ctx.fillRect(-40, -66, 80 * hp, 8);
            ctx.restore();
        }
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    function casinoBossChance() {
        const aliveBosses = getCasinoSpecials().filter(e => e instanceof Boss).length;
        if (aliveBosses >= 3) return 0.18;
        if (getCasinoSpecials().length >= MAX_ACTIVE_SPECIALS) return 0.1;
        return 0.45;
    }

    function getCasinoSpecials() {
        if (!window.game) return [];
        const list = [];
        if (game.boss && !game.boss.dead && game.boss._casinoSpecial) list.push(game.boss);
        if (game.miniBoss && !game.miniBoss.dead && game.miniBoss._casinoSpecial) list.push(game.miniBoss);
        for (const e of game.enemyManager.enemies) if (e._casinoSpecial && !e.dead) list.push(e);
        return [...new Set(list)];
    }

    function startCasinoColiseum() {
        game.coliseumLevel = 0;
        game.casinoMode = true;
        game.superBossMode = false;
        game.casinoReward = 0;
        game.pendingMode = "coliseum";
        game.gameMode = "coliseum";
        game.selectedMap = CASINO_MODE;
        game.casino = freshCasinoState();
        document.body.dataset.mode = "coliseum";
        document.body.dataset.map = CASINO_MODE;
        document.body.dataset.coliseumTier = "casino";
        game.startGame();
        game.showNotification("COLISEO CASINO - 5 CALAVERAS", "boss");
    }

    function startSuperBossMode() {
        game.coliseumLevel = 0;
        game.casinoMode = false;
        game.superBossMode = true;
        game.pendingMode = "coliseum";
        game.gameMode = "coliseum";
        game.selectedMap = SUPER_BOSS_MODE;
        game.superBoss = freshSuperBossState();
        document.body.dataset.mode = "coliseum";
        document.body.dataset.map = SUPER_BOSS_MODE;
        document.body.dataset.coliseumTier = "superboss";
        game.startGame();
        game.showNotification("MODO SUPER JEFES", "boss");
    }

    function freshCasinoState() {
        return {
            cages: [], roulette: null, powerRoulette: null, rouletteTimer: 0, powerRouletteTimer: 0, lastRouletteResult: "LISTA", lastPowerResult: "LISTA", lastRouletteTrigger: 0,
            curses: {}, boons: {}, allies: [], mines: [], shadows: [], coins: [], legendaryCages: [],
            favorableSpin: false, corruptedSpin: 0, badLuck: 0, crown: 0, luckyDie: 0, doubleReward: false,
            immortalityTotem: false, guardianAngel: false, goldenBullets: 0,
            roundBet: null, destinyCard: null, riskDoor: null, roundModifier: null, combo: 0, bestCombo: 0, rewardMultiplier: 1, jackpotGlobal: 0,
            chaosTotal: 0, weather: null, weatherTimer: 0, dimensionAltered: 0, doubleOrNothingOffered: false, stolenPower: null,
            midChoiceCooldown: 0, midChoiceActive: false, swarmMiniLeft: 0, lastMidChallenge: "", midChallengeCount: 0,
        };
    }

    function freshSuperBossState() {
        return {
            current: null, phase: 1, defeated: 0, summoned: 0, eventTimer: 360,
            rewardMultiplier: 1, lastArchetype: "", generatedNames: [],
        };
    }

    function beginCasinoRound(manager) {
        const c = game.casino;
        c.doubleOrNothingOffered = false;
        c.roundBet = null;
        c.destinyCard = null;
        c.riskDoor = null;
        c.roundModifier = randChoice([
            { id: "enemy_speed", name: "ENEMIGOS VELOCES", apply: () => c.curses.enemyHaste = Math.max(c.curses.enemyHaste || 0, 420) },
            { id: "player_damage", name: "DANO DEL JUGADOR", apply: () => game.player.powerups.damage = Math.max(game.player.powerups.damage || 0, 520) },
            { id: "low_visibility", name: "POCA VISIBILIDAD", apply: () => c.curses.blackout = Math.max(c.curses.blackout || 0, 420) },
            { id: "fast_projectiles", name: "PROYECTILES RAPIDOS", apply: () => c.curses.fastBullets = 520 },
            { id: "low_gravity", name: "GRAVEDAD BAJA", apply: () => { c.weather = "gravity"; c.weatherTimer = 520; } },
        ]);
        showBetChoice(() => showDestinyCards(() => showRiskDoors(() => {
            c.roundModifier?.apply?.();
            game.showNotification("MODIFICADOR: " + c.roundModifier.name, "boss");
            spawnCasinoCages(manager);
        })));
    }

    function spawnCasinoCages(manager) {
        const count = randInt(3, 5);
        game.casino.cages = [];
        for (let i = 0; i < count; i++) {
            const spacing = CONFIG.canvasWidth / (count + 1);
            const x = spacing * (i + 1) + rand(-90, 90);
            game.casino.cages.push(new CasinoCage(clamp(x, 150, CONFIG.canvasWidth - 150), i, count, manager.wave));
        }
        game.casino.roundCages = count;
        game.casino.lastRouletteTrigger = 900;
        game.showNotification("CAEN " + count + " JAULAS DEL CASINO", "boss");
        spinCasinoRoulette("start");
        spinCasinoPowerRoulette("start");
    }

    function spawnRandomBossOrMiniBoss(x, y, forcedKind) {
        const active = getCasinoSpecials().length;
        const kind = active >= MAX_ACTIVE_SPECIALS ? "miniboss" : (forcedKind || (Math.random() < casinoBossChance() ? "boss" : "miniboss"));
        const wave = Math.max(1, game.waveManager.wave + (kind === "boss" ? 4 : 2));
        if (kind === "boss" && active < Math.max(2, MAX_ACTIVE_SPECIALS - 1) && Math.random() < Math.min(0.3, 0.09 + game.waveManager.wave * 0.02)) {
            return spawnCasinoSuperBoss(x, y);
        }
        const tier = kind === "boss"
            ? (window.rollBossTier?.({ wave, mode: "casino", requested: wave >= 40 && Math.random() < 0.14 ? "mega" : wave >= 18 && Math.random() < 0.24 ? "super" : "boss" }) || "boss")
            : "mini";
        const entity = window.createRandomBossEntity?.(tier, { wave, mode: "casino", requested: kind === "boss" ? "boss" : "mini" })
            || (window.createImageBossEntity && Math.random() < 0.48 ? window.createImageBossEntity(kind, wave) : null)
            || (kind === "boss" ? new Boss(randChoice(BOSS_POOL), wave) : new MiniBoss(randChoice(MINI_POOL), wave));
        entity.id ||= "casino_entity_" + Date.now() + "_" + Math.random();
        entity._casinoSpecial = true;
        entity._casinoKind = kind === "boss" ? tier : kind;
        entity.name = ((tier === "mega" ? "MEGA CASINO " : tier === "super" ? "SUPER CASINO " : kind === "boss" ? "CASINO " : "MINI CASINO ")) + entity.name;
        if (Math.random() < 0.5) entity.name = kind === "boss" ? randChoice(EMOJI_BOSS_ALIASES) : randChoice(EMOJI_MINI_ALIASES);
        entity.maxHealth = Math.floor(entity.maxHealth * (tier === "mega" ? 1.18 : tier === "super" ? 1.04 : kind === "boss" ? 0.88 : 0.95));
        entity.health = entity.maxHealth;
        entity.x = clamp(x + rand(-80, 80), 120, CONFIG.canvasWidth - 120);
        entity.y = clamp(y + rand(-60, 80), 120, CONFIG.canvasHeight - 120);
        entity.spawnTimer = tier === "mega" ? 110 : tier === "super" ? 95 : kind === "boss" ? 80 : 55;
        entity.glowColor = randChoice(["#ffd166", "#ff334d", "#b388ff", "#7ae582"]);
        if (kind === "boss" && (!game.boss || game.boss.dead)) {
            game.boss = entity;
            game.showBossBar(entity);
        } else if (kind === "miniboss" && (!game.miniBoss || game.miniBoss.dead)) {
            game.miniBoss = entity;
            game.showBossBar(entity);
        } else {
            game.enemyManager.enemies.push(entity);
        }
        game.showNotification("JAULA ABIERTA: " + entity.name, "boss");
        return entity;
    }

    function pickSuperArchetype() {
        const fromSkin = window.skinSystem?.skins?.length && Math.random() < 0.45 ? randChoice(window.skinSystem.skins) : null;
        if (fromSkin) {
            const raw = ((fromSkin.id || "") + " " + (fromSkin.name || "") + " " + (fromSkin.category || "") + " " + (fromSkin.shot || "") + " " + (fromSkin.special || "")).toLowerCase();
            if (/angel|holy|celestial|divine|luz/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "angel");
            if (/demon|infernal|shadow|ghost|dark/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "demon");
            if (/electric|storm|tesla|lightning|rayo/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "electric");
            if (/tornado|wind|air|huracan/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "tornado");
            if (/robot|mech|metal|gear/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "robot");
            if (/dino|dragon|beast|claw/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "dino");
            if (/poison|tentacle|octo|pulpo/.test(raw)) return SUPER_ARCHETYPES.find(a => a.key === "octopus");
        }
        const last = game?.superBoss?.lastArchetype;
        const pool = SUPER_ARCHETYPES.filter(a => a.key !== last);
        return randChoice(pool.length ? pool : SUPER_ARCHETYPES);
    }

    function createSuperBoss(options = {}) {
        if (!options.forceBase && window.createRandomBossEntity) {
            const tier = window.rollBossTier?.({ wave: Math.max(8, (game.waveManager?.wave || 1) + 8), mode: "super", requested: Math.random() < 0.24 ? "mega" : "super" }) || "super";
            const generated = window.createRandomBossEntity(tier, { wave: Math.max(8, (game.waveManager?.wave || 1) + randInt(8, 18)), mode: "super", requested: tier });
            if (generated) {
                generated._superBoss = true;
                generated._superScale = options.scale || rand(2.05, 2.85);
                generated._superSummonTimer = randInt(160, 260);
                generated._superMassiveTimer = randInt(120, 190);
                generated._superEventTimer = randInt(420, 700);
                generated._superRewarded = false;
                generated.radius = Math.floor((generated.radius || 45) * generated._superScale);
                generated.maxHealth = Math.floor(generated.maxHealth * (options.healthMult || (tier === "mega" ? 4.4 : 3.6)));
                generated.health = generated.maxHealth;
                generated.speed = Math.max(0.45, (generated.speed || 1.5) * 0.58);
                generated.spawnTimer = 140;
                generated.x = CONFIG.canvasWidth * 0.5;
                generated.y = -generated.radius - 40;
                if (game.superBoss) game.superBoss.current = generated, game.superBoss.phase = generated.phase || 1;
                return generated;
            }
        }
        if (!options.forceBase && window.createImageBossEntity && Math.random() < 0.42) {
            const imageBoss = window.createImageBossEntity("superboss", Math.max(8, (game.waveManager?.wave || 1) + randInt(8, 18)));
            if (imageBoss) {
                if (game.superBoss) game.superBoss.current = imageBoss, game.superBoss.phase = imageBoss.phase || 1;
                return imageBoss;
            }
        }
        const archetype = options.archetype || pickSuperArchetype();
        const baseType = archetype.key === "planet" ? "living_planet"
            : archetype.key === "police" ? "police_commander"
            : archetype.key === "robot" ? "robot_colossal"
            : archetype.key === "electric" ? "electric_boss"
            : archetype.key === "demon" ? "mech_beast"
            : archetype.key === "tornado" ? "black_hole"
            : archetype.key === "dino" ? "tank_giant"
            : randChoice(BOSS_POOL);
        const wave = Math.max(8, (game.waveManager?.wave || 1) + randInt(8, 18));
        const boss = new Boss(baseType, wave);
        const scale = options.scale || rand(2.05, 2.85);
        boss.id ||= "super_boss_" + Date.now() + "_" + Math.random();
        boss._superBoss = true;
        boss._superArchetype = archetype.key;
        boss._superAttack = archetype.attack;
        boss._superScale = scale;
        boss._superSummonTimer = randInt(160, 260);
        boss._superMassiveTimer = randInt(120, 190);
        boss._superEventTimer = randInt(420, 700);
        boss._superRewarded = false;
        boss.name = options.name || randChoice(archetype.names) + " " + randChoice(["OMEGA", "ALFA", "DEL VACIO", "777", "FINAL"]);
        boss.color = archetype.color;
        boss.glowColor = archetype.glow;
        boss.radius = Math.floor(boss.radius * scale);
        boss.maxHealth = Math.floor(boss.maxHealth * (options.healthMult || 5));
        boss.health = boss.maxHealth;
        boss.damage = Math.floor((boss.damage || 24) * 1.2);
        boss.speed = Math.max(0.45, (boss.speed || 1.5) * 0.58);
        boss.score = Math.floor((boss.score || 500) * 5);
        boss.phase = 1;
        boss.spawnTimer = 140;
        boss.x = CONFIG.canvasWidth * 0.5;
        boss.y = -boss.radius - 40;
        if (game.superBoss) game.superBoss.lastArchetype = archetype.key, game.superBoss.current = boss, game.superBoss.phase = 1;
        return boss;
    }

    function spawnSuperBossRound() {
        const boss = createSuperBoss();
        game.boss = boss;
        game.miniBoss = null;
        game.enemyManager.enemies = game.enemyManager.enemies.filter(e => !e._superSummon && !e._casinoSpecial);
        game.showBossBar(boss);
        game.showNotification("SUPER JEFE: " + boss.name, "boss");
        return boss;
    }

    function spawnCasinoSuperBoss(x, y) {
        const boss = createSuperBoss({ healthMult: 3.4, scale: rand(1.8, 2.35) });
        boss._casinoSpecial = true;
        boss._casinoKind = "boss";
        boss._casinoGiantChallenge = true;
        boss.name = "SUPER JEFE CASINO: " + boss.name;
        if (Number.isFinite(x) && Number.isFinite(y)) {
            boss.x = clamp(x + rand(-90, 90), 140, CONFIG.canvasWidth - 140);
            boss.y = clamp(y + rand(-80, 100), 120, CONFIG.canvasHeight - 120);
        }
        if (!game.boss || game.boss.dead) {
            game.boss = boss;
            game.showBossBar(boss);
        } else {
            game.enemyManager.enemies.push(boss);
        }
        game.showNotification("EL CASINO SOLTO UN SUPER JEFE", "boss");
        return boss;
    }

    function updateSuperBossMode() {
        if (!game.superBoss) game.superBoss = freshSuperBossState();
        const boss = game.boss && !game.boss.dead && game.boss._superBoss ? game.boss : null;
        game.superBoss.current = boss;
        if (boss) {
            game.superBoss.phase = boss.phase || 1;
            runSuperBossBrain(boss);
        }
        game.superBoss.eventTimer--;
        if (game.superBoss.eventTimer <= 0) {
            game.superBoss.eventTimer = randInt(500, 820);
            triggerSuperBossWorldEvent(boss);
        }
        updateCasinoWorldEntities();
        optimizeSuperBossCollections();
    }

    function runSuperBossBrain(boss) {
        const hp = boss.health / boss.maxHealth;
        const nextPhase = hp < 0.15 ? 4 : hp < 0.38 ? 3 : hp < 0.68 ? 2 : 1;
        if (nextPhase > boss.phase) {
            boss.phase = nextPhase;
            game.superBoss.phase = nextPhase;
            game.screenShake.shake(18 + nextPhase * 4);
            game.particles.emitExplosion(boss.x, boss.y, Math.min(4, 1.4 + nextPhase * 0.7));
            game.showNotification("SUPER JEFE FASE " + nextPhase, "boss");
            boss.invulnTimer = Math.max(boss.invulnTimer || 0, 35);
        }
        boss._superSummonTimer--;
        boss._superMassiveTimer--;
        if (boss._superSummonTimer <= 0) {
            boss._superSummonTimer = Math.max(85, randInt(210, 330) - boss.phase * 38);
            superBossSummon(boss);
        }
        if (boss._superMassiveTimer <= 0) {
            boss._superMassiveTimer = Math.max(70, randInt(150, 250) - boss.phase * 28);
            superBossMassiveAttack(boss);
        }
    }

    function superBossSummon(boss) {
        const alive = game.enemyManager.enemies.filter(e => !e.dead).length;
        if (alive > 28) return;
        const roll = Math.random();
        if (roll < 0.52) {
            const count = Math.min(8 + boss.phase * 2, 28 - alive);
            for (let i = 0; i < count; i++) {
                const side = randInt(0, 3), margin = 80;
                const x = side === 1 ? CONFIG.canvasWidth + margin : side === 3 ? -margin : rand(margin, CONFIG.canvasWidth - margin);
                const y = side === 0 ? -margin : side === 2 ? CONFIG.canvasHeight + margin : rand(margin, CONFIG.canvasHeight - margin);
                game.enemyManager.spawnEnemy(randChoice(["small", "fast", "big", "flyer", "ghost", "canine", "police", "erratic", "kamikaze"]), x, y, Math.max(3, game.waveManager.wave + boss.phase));
                const e = game.enemyManager.enemies[game.enemyManager.enemies.length - 1];
                if (e) e._superSummon = true;
            }
        } else if (roll < 0.86) {
            for (let i = 0; i < Math.min(2, 30 - alive); i++) {
                const mini = window.createRandomBossEntity?.("mini", { wave: Math.max(4, game.waveManager.wave + boss.phase + 2), mode: "super", requested: "mini" }) || new MiniBoss(randChoice(MINI_POOL), Math.max(4, game.waveManager.wave + boss.phase + 2));
                mini._superSummon = true;
                mini.name = "INVOCADO POR " + boss.name;
                mini.maxHealth = Math.floor(mini.maxHealth * 0.7);
                mini.health = mini.maxHealth;
                mini.x = clamp(boss.x + rand(-260, 260), 70, CONFIG.canvasWidth - 70);
                mini.y = clamp(boss.y + rand(80, 260), 70, CONFIG.canvasHeight - 70);
                mini.spawnTimer = 45;
                game.enemyManager.enemies.push(mini);
            }
        } else if (game.enemyManager.enemies.filter(e => e instanceof Boss && e._superSummon && !e.dead).length < 1) {
            const helper = window.createRandomBossEntity?.("boss", { wave: Math.max(3, game.waveManager.wave + 2), mode: "super", requested: "boss" }) || new Boss(randChoice(BOSS_POOL), Math.max(3, game.waveManager.wave + 2));
            helper._superSummon = true;
            helper.name = "JEFE INVOCADO";
            helper.maxHealth = Math.floor(helper.maxHealth * 0.45);
            helper.health = helper.maxHealth;
            helper.radius = Math.floor(helper.radius * 0.9);
            helper.x = clamp(boss.x + rand(-320, 320), 90, CONFIG.canvasWidth - 90);
            helper.y = clamp(boss.y + rand(120, 300), 90, CONFIG.canvasHeight - 90);
            helper.spawnTimer = 70;
            game.enemyManager.enemies.push(helper);
        }
        if (game.superBoss) game.superBoss.summoned = game.enemyManager.enemies.filter(e => e._superSummon && !e.dead).length;
    }

    function superBossMassiveAttack(boss) {
        const phase = boss.phase || 1;
        const attack = boss._superAttack || "chaos";
        const px = game.player?.x || CONFIG.canvasWidth * 0.5, py = game.player?.y || CONFIG.canvasHeight * 0.5;
        if (attack === "lightning" || attack === "holy") {
            for (let i = 0; i < 5 + phase * 3; i++) {
                const x = rand(60, CONFIG.canvasWidth - 60), y = rand(80, CONFIG.canvasHeight - 80);
                game.particles.emitShockwave(x, y, attack === "holy" ? "#ffd166" : "#ffff00");
                if (dist(x, y, px, py) < 90) game.player.takeDamage(boss.damage * 0.35);
                game.bulletManager.addEnemyBullet(x, 40, Math.PI / 2, 7, boss.damage * 0.25, attack === "holy" ? "#ffd166" : "#ffff00");
            }
        } else if (attack === "meteor" || attack === "hell") {
            game.spawnMeteorBurst?.(Math.min(8, 3 + phase * 2), attack === "hell");
            for (let i = 0; i < 4 + phase; i++) game.bulletManager.addEnemyBullet(boss.x, boss.y, (i / (4 + phase)) * Math.PI * 2, 5.5, boss.damage * 0.55, boss.glowColor);
        } else if (attack === "tornado" || attack === "tentacle") {
            for (let i = 0; i < 8 + phase * 3; i++) {
                const a = (i / (8 + phase * 3)) * Math.PI * 2 + boss.animFrame * 0.04;
                game.bulletManager.addEnemyBullet(boss.x + Math.cos(a) * boss.radius * 0.7, boss.y + Math.sin(a) * boss.radius * 0.7, a, 4.8 + phase, boss.damage * 0.42, boss.glowColor);
            }
            if (attack === "tornado") game.screenShake.shake(8 + phase * 3);
        } else if (attack === "laser" || attack === "police") {
            for (let i = -2; i <= 2; i++) game.bulletManager.addEnemyBullet(boss.x, boss.y, angle(boss.x, boss.y, px, py) + i * 0.16, 8 + phase, boss.damage * 0.5, boss.glowColor);
            if (attack === "police") game.spawnTrafficWave?.(1 + Math.floor(phase / 2), false);
        } else {
            for (let i = 0; i < 14 + phase * 4; i++) {
                const a = (i / (14 + phase * 4)) * Math.PI * 2;
                game.bulletManager.addEnemyBullet(boss.x, boss.y, a, rand(4.5, 8.5), boss.damage * 0.35, randChoice(["#ffd166", "#ff334d", "#7df9ff", "#b388ff"]));
            }
        }
        if (phase >= 4) superBossSummon(boss);
    }

    function triggerSuperBossWorldEvent(boss) {
        const event = randChoice(["meteors", "lightning", "darkness", "invasion", "chaos"]);
        if (event === "meteors") game.spawnMeteorBurst?.(5, false), game.showNotification("EVENTO: METEORITOS COLOSALES", "boss");
        else if (event === "lightning") {
            game.showNotification("EVENTO: LLUVIA DE RAYOS", "boss");
            for (let i = 0; i < 8; i++) game.bulletManager.addEnemyBullet(rand(80, CONFIG.canvasWidth - 80), 60, Math.PI / 2, 8, 12, "#ffff00");
        } else if (event === "darkness") {
            if (game.casino) game.casino.curses.darkness = 360;
            game.showNotification("EVENTO: OSCURIDAD TITANICA", "boss");
        } else if (event === "invasion") {
            boss && superBossSummon(boss);
            boss && superBossSummon(boss);
            game.showNotification("EVENTO: INVASION DEL SUPER JEFE", "boss");
        } else {
            boss && superBossMassiveAttack(boss);
            game.showNotification("EVENTO: CAOS COLOSAL", "boss");
        }
    }

    function rewardSuperBoss(boss) {
        if (!game?.superBossMode || !game.superBoss || boss._superRewarded) return;
        boss._superRewarded = true;
        game.superBoss.defeated++;
        const mult = 1 + game.superBoss.defeated * 0.25;
        playerData?.addC?.(Math.floor(900 * mult));
        playerData?.addBPXP?.(Math.floor(180 * mult));
        for (let i = 0; i < 8; i++) game.dropManager.drops.push(new Drop(boss.x + rand(-80, 80), boss.y + rand(-80, 80), randChoice(POSITIVE_DROPS)));
        if (Math.random() < 0.22) unlockCasinoCosmetic();
        game.showNotification("SUPER JEFE DERROTADO: RECOMPENSA EPICA", "powerup");
    }

    function optimizeSuperBossCollections() {
        const enemies = game.enemyManager.enemies;
        if (enemies.length > 34) {
            const specials = enemies.filter(e => e instanceof Boss || e instanceof MiniBoss || e._superSummon).slice(-18);
            const normal = enemies.filter(e => !specials.includes(e)).slice(-(34 - specials.length));
            game.enemyManager.enemies = [...normal, ...specials].slice(-34);
        }
        if (game.bulletManager.enemyBullets.length > 95) game.bulletManager.enemyBullets = game.bulletManager.enemyBullets.slice(-95);
        if (game.particles.particles.length > 560) game.particles.particles = game.particles.particles.slice(-560);
        if (game.dropManager.drops.length > 30) game.dropManager.drops = game.dropManager.drops.slice(-30);
    }

    function triggerTrapBox(x, y) {
        const roll = Math.random();
        game.showNotification("CAJA TRAMPA", "boss");
        if (roll < 0.34) {
            game.player.takeDamage(14);
            damageCasinoCagesInRadius(x, y, 180, 38, true);
            window.__casinoVisualOnly = true;
            game.particles.emitExplosion(x, y, 2.2);
            window.__casinoVisualOnly = false;
        } else if (roll < 0.68) {
            spawnRandomBossOrMiniBoss(x, y, "boss");
        } else {
            spawnEnemyBurst(["fast", "kamikaze", "ghost", "exploder", "erratic", "canine"], 10, Math.max(5, game.waveManager.wave + 3));
        }
    }

    function createCasinoOverlay() {
        let overlay = document.getElementById("casinoChoiceOverlay");
        if (overlay) overlay.remove();
        if (!document.getElementById("casinoChoiceStyle")) {
            const style = document.createElement("style");
            style.id = "casinoChoiceStyle";
            style.textContent = "#casinoChoiceOverlay{position:absolute;inset:0;z-index:180;display:grid;place-items:center;pointer-events:none}#casinoChoiceOverlay .casino-choice-box{width:min(760px,92vw);padding:22px;border:2px solid rgba(255,209,102,.65);border-radius:18px;background:linear-gradient(180deg,rgba(45,10,45,.94),rgba(5,8,24,.96));box-shadow:0 0 40px rgba(255,209,102,.28);pointer-events:auto;text-align:center}#casinoChoiceOverlay h3{margin:0 0 8px;color:#ffd166;letter-spacing:2px}#casinoChoiceOverlay p{margin:0 0 16px;color:#e9d5ff}#casinoChoiceOverlay .casino-choice-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}#casinoChoiceOverlay button{min-height:120px;border:1px solid rgba(255,209,102,.45);border-radius:12px;background:radial-gradient(circle at 50% 10%,rgba(255,209,102,.18),transparent 36%),rgba(10,16,38,.92);color:#fff;font-weight:800;cursor:pointer}#casinoChoiceOverlay button:hover{transform:translateY(-3px);box-shadow:0 0 24px rgba(255,209,102,.28)}#casinoChoiceOverlay small{display:block;margin-top:8px;color:#a9c5d8;font-weight:600}@media(max-width:720px){#casinoChoiceOverlay .casino-choice-grid{grid-template-columns:1fr}#casinoChoiceOverlay button{min-height:86px}}";
            document.head.appendChild(style);
        }
        overlay = document.createElement("div");
        overlay.id = "casinoChoiceOverlay";
        document.getElementById("gameContainer").appendChild(overlay);
        return overlay;
    }

    function showCasinoChoice(title, subtitle, options, done, timeout = 9000) {
        const overlay = createCasinoOverlay();
        overlay.innerHTML = '<div class="casino-choice-box"><h3>' + title + '</h3><p>' + subtitle + '</p><div class="casino-choice-grid"></div></div>';
        const grid = overlay.querySelector(".casino-choice-grid");
        let finished = false;
        const finish = option => {
            if (finished) return;
            finished = true;
            overlay.remove();
            option.apply?.();
            done?.(option);
        };
        for (const option of options) {
            const btn = document.createElement("button");
            btn.innerHTML = option.title + "<small>" + option.desc + "</small>";
            btn.onclick = () => finish(option);
            grid.appendChild(btn);
        }
        setTimeout(() => finish(options[0]), timeout);
    }

    function showBetChoice(done) {
        const coins = playerData?.d?.coins || 0;
        showCasinoChoice("APUESTA DEL CASINO", "Elige tu riesgo antes de la ronda.", [
            { title: "Seguro", desc: "Sin apuesta, recompensa normal.", apply: () => game.casino.roundBet = { type: "safe", mult: 1, stake: 0 } },
            { title: "100 monedas", desc: coins >= 100 ? "Si ganas: x2. Si pierdes: pierdes la apuesta." : "Sin monedas suficientes: apuesta segura.", apply: () => {
                if (playerData?.d && playerData.d.coins >= 100) playerData.d.coins -= 100, playerData.sv?.(), game.casino.roundBet = { type: "coins", mult: 2, stake: 100 };
                else game.casino.roundBet = { type: "safe", mult: 1, stake: 0 };
            } },
            { title: "Vida", desc: "Pierdes 15 vida ahora. Si ganas: x3.", apply: () => { game.player.takeDamage(15); game.casino.roundBet = { type: "life", mult: 3, stake: 15 }; } },
        ], done);
    }

    function showDestinyCards(done) {
        const cards = [
            { title: "Carta Solar", desc: "+dano y rayos celestiales.", apply: () => { game.player.powerups.damage = 720; activateCelestialAid(); } },
            { title: "Carta Veloz", desc: "+velocidad, pero enemigos mas rapidos.", apply: () => { game.player.powerups.speed = 720; game.casino.curses.enemyHaste = 420; } },
            { title: "Carta Rara", desc: "Invocacion aliada y ruleta favorable.", apply: () => { game.casino.favorableSpin = true; for (let i = 0; i < 2; i++) game.player.drones.push(new Drone(game.player)); } },
            { title: "Carta Maldita", desc: "-vida maxima, mejores recompensas.", apply: () => { game.player.maxHealth = Math.max(40, game.player.maxHealth - 10); game.casino.rewardMultiplier += 0.5; } },
            { title: "Carta Negra", desc: "Enemigos fuertes, jackpot posible.", apply: () => { game.casino.curses.enemyHaste = 600; if (Math.random() < 0.25) activateJackpotGlobal(); } },
        ].sort(() => Math.random() - 0.5).slice(0, 3);
        showCasinoChoice("CARTAS DEL DESTINO", "Escoge una carta para alterar la ronda.", cards, option => { game.casino.destinyCard = option.title; done?.(); });
    }

    function showRiskDoors(done) {
        showCasinoChoice("PUERTAS DEL RIESGO", "Una puerta define la recompensa y el peligro.", [
            { title: "Puerta segura", desc: "+escudo y recompensa estable.", apply: () => { game.player.addShield(20); game.casino.riskDoor = "segura"; } },
            { title: "Puerta alta", desc: "Mas recompensa, jefe extra posible.", apply: () => { game.casino.rewardMultiplier += 0.8; if (Math.random() < 0.35) setTimeout(() => spawnRandomBossOrMiniBoss(rand(180, CONFIG.canvasWidth - 180), 180, "miniboss"), 1600); game.casino.riskDoor = "alta"; } },
            { title: "Caos total", desc: "Mucho riesgo, multiplicador alto.", apply: () => { game.casino.rewardMultiplier += 1.5; activateChaosTotal(); game.casino.riskDoor = "caos"; } },
        ], done);
    }

    function offerMidCasinoChallenge(source) {
        const c = game.casino;
        if (!c || c.midChoiceActive || c.midChoiceCooldown > 0 || game.state !== "playing" && game.waveManager?.state !== "casinoRound") return;
        c.midChoiceActive = true;
        c.midChoiceCooldown = 360;
        c.midChallengeCount++;
        const name = source?.name || "JEFE DEL CASINO";
        const headers = [
            ["EL CASINO SUBE LA APUESTA", "Derrotaste a " + name + ". Cobras poco ahora o aceptas una locura con premio mayor."],
            ["LA MESA QUIERE SANGRE", name + " cayo. El publico pide otro riesgo: menos seguridad, mas recompensa."],
            ["RONDA DE ALTO VOLTAJE", "El crupier te ofrece cambiar calma por caos justo en plena pelea."],
            ["TRATO DEL JACKPOT", "Puedes tomar algo seguro o apostarlo todo por un premio mas grande."],
            ["DESAFIO DE MEDIA PARTIDA", "No es el inicio: ahora decides si la partida se vuelve mas brutal."],
        ];
        const challengePool = [
            { id: "safe_heal", title: "Cobrar poco", desc: "+120 monedas y +20 vida. Menos riesgo, menos premio.", apply: () => { grantCasinoMoney(120, 20); game.player.heal?.(20); game.showNotification("PREMIO SEGURO COBRADO", "powerup"); } },
            { id: "safe_shield", title: "Seguro con escudo", desc: "+70 monedas y +45 escudo. No invoca enemigos, pero paga menos.", apply: () => { grantCasinoMoney(70, 10); game.player.addShield(45); game.showNotification("ESCUDO SEGURO COBRADO", "powerup"); } },
            { id: "giant", title: "Pelea contra super jefe", desc: "Pierdes 35 escudo. Sale un jefe gigante con fases, vida extrema, invocaciones y ataques masivos.", apply: () => { game.player.shield = Math.max(0, game.player.shield - 35); spawnCasinoSuperBoss(); } },
            { id: "classic_giant", title: "Jefe gigante clasico", desc: "Menos caos que un super jefe, pero paga caja legendaria si cae.", apply: () => { game.player.shield = Math.max(0, game.player.shield - 25); spawnSuperGiantBoss(); } },
            { id: "swarm20", title: "20 mini jefes a la vez", desc: "Pierdes 20 vida ahora. Si sobrevives: lluvia de monedas, x1.5 recompensa y power ups.", apply: () => { game.player.takeDamage(20); spawnMiniBossSwarmChallenge(); } },
            { id: "boss_duel", title: "Duelo de dos jefes", desc: "-25 escudo. Entran 2 jefes medianos. Si caen: monedas x3 por 20 segundos.", apply: () => { game.player.shield = Math.max(0, game.player.shield - 25); spawnBossDuoChallenge(); } },
            { id: "curse_prize", title: "Maldicion por premio", desc: "-10 vida maxima ahora. Ganas ruleta favorable, caja legendaria y x0.8 recompensa.", apply: () => { game.player.maxHealth = Math.max(45, game.player.maxHealth - 10); game.player.health = Math.min(game.player.health, game.player.maxHealth); c.favorableSpin = true; c.rewardMultiplier += 0.8; spawnLegendaryCage(); game.showNotification("MALDICION ACEPTADA: PREMIO MEJORADO", "boss"); } },
            { id: "dark_jackpot", title: "Jackpot oscuro", desc: "Apagon y enemigos rapidos por 12s. Si aguantas: x5 monedas temporal.", apply: () => { c.curses.blackout = 720; c.curses.enemyHaste = 720; setTimeout(() => game?.casinoMode && activateJackpotGlobal(), 12000); game.showNotification("JACKPOT OSCURO ACTIVADO", "boss"); } },
            { id: "power_rain", title: "Lluvia con trampa", desc: "Caen power ups, pero tambien minas. Mucho premio, mucho piso peligroso.", apply: () => { rainPowerUps(); spawnCasinoMines(8); c.rewardMultiplier += 0.35; game.showNotification("LLUVIA CON TRAMPA", "boss"); } },
            { id: "cage_rush", title: "Mas jaulas ahora", desc: "Caen 3 jaulas extra. Si las rompes rapido: mas jefes y mas drops.", apply: () => spawnExtraCasinoCages(3) },
            { id: "blood_combo", title: "Combo sangriento", desc: "Pierdes 18 vida. Tu combo no se rompe por 15s y las monedas suben.", apply: () => { game.player.takeDamage(18); c.curses.comboGuard = 900; c.crown = Math.max(c.crown || 0, 900); game.showNotification("COMBO SANGRIENTO", "combo"); } },
        ].filter(o => o.id !== c.lastMidChallenge);
        const safe = randChoice(challengePool.filter(o => o.id.startsWith("safe")));
        const risky = challengePool.filter(o => !o.id.startsWith("safe")).sort(() => Math.random() - 0.5).slice(0, 2);
        const options = [safe, ...risky].sort(() => Math.random() - 0.5);
        const header = randChoice(headers);
        showCasinoChoice(header[0], header[1], options, option => {
            c.lastMidChallenge = option.id;
            c.midChoiceActive = false;
        }, 8500);
    }

    function handleCasinoSpecialKill(entity, kind) {
        if (!game?.casinoMode || !game.casino || entity._casinoKillHandled) return;
        entity._casinoKillHandled = true;
        if (entity._casinoGiantChallenge) {
            grantCasinoMoney(520, 140);
            game.casino.rewardMultiplier += 1;
            spawnLegendaryCage();
            game.showNotification("SUPER JEFE DERROTADO: PREMIO x2", "powerup");
        }
        if (entity._casinoMiniSwarm) {
            game.casino.swarmMiniLeft = Math.max(0, (game.casino.swarmMiniLeft || 1) - 1);
            if (game.casino.swarmMiniLeft <= 0) {
                grantCasinoMoney(700, 160);
                game.casino.rewardMultiplier += 1.5;
                rainCasinoCoins(28);
                rainPowerUps();
                game.showNotification("20 MINI JEFES DERROTADOS: JACKPOT DE RIESGO", "powerup");
            }
        }
        if (entity._casinoDuoChallenge) {
            game.casino.duoBossLeft = Math.max(0, (game.casino.duoBossLeft || 1) - 1);
            if (game.casino.duoBossLeft <= 0) {
                game.casino.jackpotGlobal = Math.max(game.casino.jackpotGlobal || 0, 1200);
                grantCasinoMoney(460, 110);
                game.showNotification("DUELO GANADO: MONEDAS x5 TEMPORAL", "powerup");
            }
        }
        if (!entity._casinoGiantChallenge && !entity._casinoMiniSwarm && (kind === "boss" || Math.random() < 0.32)) {
            setTimeout(() => offerMidCasinoChallenge(entity), 500);
        }
    }

    function spawnLegendaryCage() {
        if (!game?.casino) return;
        game.casino.legendaryCages.push({ x: rand(180, CONFIG.canvasWidth - 180), y: -100, vy: 10, timer: 900, radius: 30 });
    }

    function spawnCasinoMines(count) {
        if (!game?.casino) return;
        for (let i = 0; i < count; i++) {
            game.casino.mines.push({ x: rand(90, CONFIG.canvasWidth - 90), y: rand(95, CONFIG.canvasHeight - 95), radius: 20, armed: 70 + i * 8, life: 520 });
        }
    }

    function spawnSuperGiantBoss() {
        const wave = Math.max(6, game.waveManager.wave + 8);
        const boss = window.createRandomBossEntity?.(window.rollBossTier?.({ wave, mode: "casino", requested: Math.random() < 0.18 ? "mega" : "super" }) || "super", { wave, mode: "casino" }) || new Boss(randChoice(BOSS_POOL), wave);
        boss.id ||= "casino_giant_" + Date.now();
        boss._casinoSpecial = true;
        boss._casinoKind = "boss";
        boss._casinoGiantChallenge = true;
        boss.name = "SUPER JEFE GIGANTE: " + randChoice(EMOJI_BOSS_ALIASES);
        boss.maxHealth = Math.floor(boss.maxHealth * 2.35);
        boss.health = boss.maxHealth;
        boss.damage = Math.floor((boss.damage || 18) * 1.25);
        boss.radius = Math.floor((boss.radius || 45) * 1.55);
        boss.x = CONFIG.canvasWidth * 0.5;
        boss.y = 170;
        boss.spawnTimer = 110;
        boss.glowColor = "#ffd166";
        if (!game.boss || game.boss.dead) {
            game.boss = boss;
            game.showBossBar(boss);
        } else {
            game.enemyManager.enemies.push(boss);
        }
        game.showNotification("RETO ACEPTADO: PELEA CONTRA SUPER JEFE GIGANTE", "boss");
    }

    function spawnBossDuoChallenge() {
        const wave = Math.max(5, game.waveManager.wave + 5);
        for (let i = 0; i < 2; i++) {
            const boss = window.createRandomBossEntity?.("boss", { wave, mode: "casino", requested: "boss" }) || new Boss(randChoice(BOSS_POOL), wave);
            boss.id ||= "casino_duo_boss_" + Date.now() + "_" + i;
            boss._casinoSpecial = true;
            boss._casinoKind = "boss";
            boss._casinoDuoChallenge = true;
            boss.name = "DUELO CASINO: " + randChoice(EMOJI_BOSS_ALIASES);
            boss.maxHealth = Math.floor(boss.maxHealth * 0.82);
            boss.health = boss.maxHealth;
            boss.damage = Math.max(8, Math.floor((boss.damage || 18) * 0.82));
            boss.x = CONFIG.canvasWidth * (i ? 0.68 : 0.32);
            boss.y = 150;
            boss.spawnTimer = 90;
            boss.glowColor = i ? "#7ae582" : "#ffd166";
            if ((!game.boss || game.boss.dead) && i === 0) {
                game.boss = boss;
                game.showBossBar(boss);
            } else {
                game.enemyManager.enemies.push(boss);
            }
        }
        game.casino.duoBossLeft = 2;
        game.showNotification("RETO ACEPTADO: DUELO DE DOS JEFES", "boss");
    }

    function spawnMiniBossSwarmChallenge() {
        const wave = Math.max(4, game.waveManager.wave + 4);
        game.casino.swarmMiniLeft = 20;
        for (let i = 0; i < 20; i++) {
            const mini = window.createRandomBossEntity?.("mini", { wave, mode: "casino", requested: "mini" }) || new MiniBoss(randChoice(MINI_POOL), wave);
            mini.id ||= "casino_swarm_mini_" + Date.now() + "_" + i;
            mini._casinoSpecial = true;
            mini._casinoKind = "miniboss";
            mini._casinoMiniSwarm = true;
            mini.name = "MINI JEFE 20x: " + randChoice(EMOJI_MINI_ALIASES);
            mini.maxHealth = Math.max(55, Math.floor(mini.maxHealth * 0.42));
            mini.health = mini.maxHealth;
            mini.damage = Math.max(5, Math.floor((mini.damage || 12) * 0.58));
            mini.radius = Math.max(18, Math.floor((mini.radius || 30) * 0.82));
            const ring = (i / 20) * Math.PI * 2;
            mini.x = clamp(CONFIG.canvasWidth * 0.5 + Math.cos(ring) * rand(210, 390), 90, CONFIG.canvasWidth - 90);
            mini.y = clamp(CONFIG.canvasHeight * 0.5 + Math.sin(ring) * rand(130, 280), 90, CONFIG.canvasHeight - 90);
            mini.spawnTimer = 35 + i * 2;
            mini.glowColor = i % 2 ? "#ffd166" : "#7ae582";
            game.enemyManager.enemies.push(mini);
        }
        game.showNotification("RETO ACEPTADO: 20 MINI JEFES A LA VEZ", "boss");
    }

    function spawnExtraCasinoCages(count) {
        if (!game?.casino) return;
        const base = game.casino.cages.length;
        for (let i = 0; i < count; i++) {
            const x = rand(160, CONFIG.canvasWidth - 160);
            const cage = new CasinoCage(x, base + i, base + count, Math.max(1, game.waveManager.wave));
            cage.health = Math.floor(cage.health * 0.72);
            cage.maxHealth = cage.health;
            cage.trap = Math.random() < 0.35;
            game.casino.cages.push(cage);
        }
        game.casino.roundCages = (game.casino.roundCages || 0) + count;
        game.showNotification("3 JAULAS EXTRA CAEN EN PLENA PELEA", "boss");
    }

    function spinCasinoRoulette(reason) {
        if (!game.casino || game.casino.rouletteTimer > 0) return;
        const good = [["angel", "AYUDA ANGELICAL"], ["celestial", "PODER CELESTIAL"], ["coins", "LLUVIA DE MONEDAS"], ["shield", "BENDICION DE ESCUDO"], ["drones", "DRONES ALIADOS"], ["turret", "TORRETA DE CASINO"], ["slow", "TIEMPO LENTO"], ["jackpot", "JACKPOT"], ["globaljackpot", "JACKPOT GLOBAL"], ["fullheal", "CURA TOTAL"], ["fury", "FURIA CONTROLADA"], ["legendary", "CAJA LEGENDARIA"], ["powerrain", "LLUVIA DE PODERES"]];
        const bad = [["dinos", "LLUVIA DE DINOSAURIOS"], ["police", "REDADA POLICIAL"], ["demons", "INVASION DEMONIACA"], ["meteors", "TORMENTA DE METEORITOS"], ["taunt", "MODO PROVOCACION"], ["reaper", "LA PARCA"], ["blackout", "APAGON"], ["bosschaos", "CAOS DE JEFES"], ["mines", "CAMPO DE MINAS"], ["speedcurse", "MALDICION DE VELOCIDAD"], ["chaostotal", "MODO CAOS TOTAL"], ["dealer", "EL CRUPIER SUPREMO"], ["massive", "INVASION MASIVA"], ["theft", "ROBO DE PODER"], ["fusion", "JEFE FUSION"], ["traitor", "ALIADO TRAIDOR"], ["dimension", "DIMENSION ALTERADA"], ["curseglobal", "MALDICION GLOBAL"], ["weather", "CLIMA DINAMICO"]];
        let roll = Math.random();
        if (game.casino.favorableSpin) roll -= 0.18, game.casino.favorableSpin = false;
        if (game.casino.corruptedSpin > 0 || game.casino.badLuck > 0) roll += 0.18;
        const bucket = game.casino.corruptedSpin > 0 ? "bad" : roll < 0.5 ? "good" : "bad";
        const result = bucket === "good" ? randChoice(good) : randChoice(bad);
        game.casino.roulette = { key: result[0], label: result[1], bucket, timer: 138, angle: rand(0, Math.PI * 2), reason };
        game.casino.rouletteTimer = 138;
        game.casino.lastRouletteResult = "EVENTO GIRANDO...";
        game.showNotification("RULETA DE EVENTOS", "powerup");
        sound.play("boss_alert");
    }

    function spinCasinoPowerRoulette(reason) {
        if (!game.casino || game.casino.powerRouletteTimer > 0) return;
        const good = [["totem", "TOTEM DE INMORTALIDAD"], ["crown", "CORONA DEL CASINO"], ["lucky", "DADO DE SUERTE"], ["guardian", "ANGEL GUARDIAN"], ["double", "DUPLICADOR DE PREMIOS"], ["golden", "BALAS DORADAS"], ["favorable", "RULETA FAVORABLE"], ["celestialPower", "BENDICION CELESTIAL"], ["dropPower", "POWER UP DEL CASINO"], ["divine", "MODO DIVINO"]];
        const bad = [["badluck", "MALA SUERTE"], ["unstable", "ARMAS INESTABLES"], ["weight", "PESO MALDITO"], ["bleed", "SANGRADO"], ["corrupt", "RULETA CORRUPTA"], ["fragile", "ESCUDO FRAGIL"], ["jam", "RECARGA MALDITA"], ["blind", "VISION MALDITA"]];
        let roll = Math.random();
        if (game.casino.favorableSpin) roll -= 0.18;
        if (game.casino.corruptedSpin > 0 || game.casino.badLuck > 0) roll += 0.22;
        const bucket = game.casino.corruptedSpin > 0 ? "badPower" : roll < 0.55 ? "goodPower" : "badPower";
        const result = bucket === "goodPower" ? randChoice(good) : randChoice(bad);
        game.casino.powerRoulette = { key: result[0], label: result[1], bucket, timer: 112, angle: rand(0, Math.PI * 2), reason };
        game.casino.powerRouletteTimer = 112;
        game.casino.lastPowerResult = "PODER GIRANDO...";
        game.showNotification("RULETA DE PODERES", "powerup");
    }

    function applyRouletteResult(result) {
        game.casino.lastRouletteResult = result.label;
        if (result.bucket === "good") applyGoodEvent(result.key);
        else if (result.bucket === "bad") applyBadEvent(result.key);
        else applySpecialPowerUp(result.key);
        window.__casinoVisualOnly = true;
        game.particles.emitShockwave(CONFIG.canvasWidth * 0.5, CONFIG.canvasHeight * 0.5, result.bucket === "bad" ? "#ff334d" : "#ffd166");
        window.__casinoVisualOnly = false;
        game.showNotification("RULETA: " + result.label, result.bucket === "bad" ? "boss" : "powerup");
        offerDoubleOrNothing(result);
    }

    function applyGoodEvent(key) {
        const p = game.player;
        if (key === "angel") p.heal(20), game.casino.allies.push({ type: "angel", x: p.x - 80, y: p.y - 90, timer: 720, fire: 0 });
        else if (key === "coins") rainCasinoCoins(34);
        else if (key === "celestial") activateCelestialAid();
        else if (key === "shield") p.maxShield = Math.max(p.maxShield, 80), p.addShield(55);
        else if (key === "drones") for (let i = 0; i < 3; i++) p.drones.push(new Drone(p));
        else if (key === "turret") for (let i = 0; i < 3; i++) game.casino.allies.push({ type: "turret", x: rand(220, CONFIG.canvasWidth - 220), y: rand(230, CONFIG.canvasHeight - 230), timer: 520, fire: 0 });
        else if (key === "slow") p.powerups.slowmotion = 720, allHostiles().forEach(e => e.slowTimer = Math.max(e.slowTimer || 0, 360));
        else if (key === "jackpot") grantCasinoMoney(420 + game.waveManager.wave * 45, 240), rainCasinoCoins(48);
        else if (key === "globaljackpot") activateJackpotGlobal();
        else if (key === "fullheal") p.health = p.maxHealth;
        else if (key === "fury") p.powerups.damage = 780, p.powerups.rapid = 780, p.powerups.speed = 780;
        else if (key === "legendary") spawnLegendaryCage();
        else if (key === "powerrain") rainPowerUps();
    }

    function applyBadEvent(key) {
        const wave = Math.max(4, game.waveManager.wave + 2);
        if (key === "dinos") spawnEnemyBurst(["canine", "big", "fast", "kamikaze", "space_dragon"], 7, wave), Math.random() < 0.35 && spawnRandomBossOrMiniBoss(rand(180, CONFIG.canvasWidth - 180), 140, "miniboss");
        else if (key === "police") spawnEnemyBurst(["police", "police_sniper", "laser_turret", "scout_ship"], 8, wave), game.spawnTrafficWave?.(2, false);
        else if (key === "demons") game.casino.curses.darkness = 520, spawnEnemyBurst(["ghost", "leech", "toxic", "exploder", "erratic"], 8, wave);
        else if (key === "meteors") game.spawnMeteorBurst?.(12, false);
        else if (key === "taunt") game.casino.curses.taunt = 720;
        else if (key === "reaper") game.casino.curses.reaper = 720, game.casino.shadows.push({ x: -80, y: CONFIG.canvasHeight * 0.5, timer: 720 });
        else if (key === "blackout") game.casino.curses.blackout = 620;
        else if (key === "bosschaos") spawnRandomBossOrMiniBoss(rand(220, CONFIG.canvasWidth - 220), rand(180, CONFIG.canvasHeight - 240), "boss");
        else if (key === "mines") for (let i = 0; i < 10; i++) game.casino.mines.push({ x: rand(120, CONFIG.canvasWidth - 120), y: rand(170, CONFIG.canvasHeight - 150), radius: 28, armed: 45, life: 620, dead: false });
        else if (key === "speedcurse") game.casino.curses.enemyHaste = 600;
        else if (key === "chaostotal") activateChaosTotal();
        else if (key === "dealer") spawnSecretDealer();
        else if (key === "massive") spawnMassiveInvasion();
        else if (key === "theft") triggerPowerTheft();
        else if (key === "fusion") spawnFusionBoss();
        else if (key === "traitor") triggerTraitorAlly();
        else if (key === "dimension") activateAlteredDimension();
        else if (key === "curseglobal") activateGlobalCurse();
        else if (key === "weather") activateDynamicWeather();
    }

    function applySpecialPowerUp(key) {
        const c = game.casino;
        if (key === "totem") c.immortalityTotem = true, activatePlayerTotem(game.player);
        else if (key === "crown") c.crown = 900;
        else if (key === "lucky") c.luckyDie = 1200;
        else if (key === "guardian") c.guardianAngel = true;
        else if (key === "double") c.doubleReward = true;
        else if (key === "golden") c.goldenBullets = 900;
        else if (key === "favorable") c.favorableSpin = true;
        else if (key === "badluck") c.badLuck = 900;
        else if (key === "unstable") c.curses.unstable = 720;
        else if (key === "weight") c.curses.weight = 620;
        else if (key === "bleed") c.curses.bleed = 620;
        else if (key === "corrupt") c.corruptedSpin = 720;
        else if (key === "celestialPower") activateCelestialAid();
        else if (key === "dropPower") game.dropManager.drops.push(new Drop(game.player.x + rand(-80, 80), game.player.y + rand(-80, 80), randChoice(POSITIVE_DROPS)));
        else if (key === "divine") c.boons.divine = 520, game.player.powerups.god = 180, game.player.powerups.damage = 520;
        else if (key === "fragile") c.curses.fragile = 620, game.player.shield = Math.floor(game.player.shield * 0.45);
        else if (key === "jam") c.curses.jam = 520;
        else if (key === "blind") c.curses.blackout = Math.max(c.curses.blackout || 0, 360);
    }

    function activateCelestialAid() {
        const p = game.player;
        p.heal(30);
        p.addShield(35);
        p.powerups.god = Math.max(p.powerups.god || 0, 150);
        p.powerups.damage = Math.max(p.powerups.damage || 0, 500);
        game.casino.allies.push({ type: "angel", x: p.x - 80, y: p.y - 90, timer: 520, fire: 0 });
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (!game?.casinoMode) return;
                const target = nearestHostile(game.player.x, game.player.y, 1200);
                if (target) {
                    game.bulletManager.addLaser(game.player.x, game.player.y, angle(game.player.x, game.player.y, target.x, target.y), 34, 8);
                    target.takeDamage(34);
                }
            }, i * 160);
        }
    }

    function offerDoubleOrNothing(result) {
        const c = game.casino;
        if (c.doubleOrNothingOffered || c.rouletteTimer > 40 || Math.random() > 0.55) return;
        c.doubleOrNothingOffered = true;
        setTimeout(() => {
            if (!game?.casinoMode || game.state !== "playing") return;
            showCasinoChoice("DOBLE O NADA", "Acepta el resultado o vuelve a girar con riesgo total.", [
                { title: "Aceptar", desc: "Mantener resultado actual.", apply: () => {} },
                { title: "Re-girar evento", desc: "Puede mejorar o empeorar TODO.", apply: () => { c.corruptedSpin += result.bucket === "bad" ? 0 : 180; spinCasinoRoulette("double"); } },
                { title: "Re-girar poder", desc: "Nuevo poder o maldicion.", apply: () => { spinCasinoPowerRoulette("double"); } },
            ], null, 6500);
        }, 700);
    }

    function activateJackpotGlobal() {
        const c = game.casino;
        c.jackpotGlobal = 720;
        c.rewardMultiplier = Math.max(c.rewardMultiplier, 5);
        rainCasinoCoins(60);
        for (let i = 0; i < 2; i++) setTimeout(() => spawnRandomBossOrMiniBoss(rand(240, CONFIG.canvasWidth - 240), rand(180, CONFIG.canvasHeight - 260), i ? "miniboss" : "boss"), i * 900);
        game.showNotification("JACKPOT GLOBAL", "powerup");
    }

    function activateChaosTotal() {
        const c = game.casino;
        c.chaosTotal = 520;
        c.curses.enemyHaste = Math.max(c.curses.enemyHaste || 0, 520);
        c.curses.fastBullets = Math.max(c.curses.fastBullets || 0, 520);
        spawnEnemyBurst(["fast", "kamikaze", "exploder", "erratic", "space_dragon", "police"], 14, Math.max(6, game.waveManager.wave + 3));
        setTimeout(() => game?.casinoMode && spawnRandomBossOrMiniBoss(rand(260, CONFIG.canvasWidth - 260), 180, "boss"), 1200);
        game.showNotification("MODO CAOS TOTAL", "boss");
    }

    function spawnSecretDealer() {
        const boss = new Boss("mothership", game.waveManager.wave + 8);
        boss._casinoSpecial = true;
        boss._casinoDealer = true;
        boss.name = "EL CRUPIER SUPREMO";
        boss.maxHealth = Math.floor(boss.maxHealth * 1.55);
        boss.health = boss.maxHealth;
        boss.x = CONFIG.canvasWidth * 0.5;
        boss.y = 120;
        boss.spawnTimer = 80;
        boss.color = "#ffd166";
        boss.glowColor = "#7ae582";
        if (!game.boss || game.boss.dead) game.boss = boss, game.showBossBar(boss);
        else game.enemyManager.enemies.push(boss);
        game.showNotification("JEFE SECRETO: EL CRUPIER SUPREMO", "boss");
    }

    function spawnMassiveInvasion() {
        spawnEnemyBurst(["small", "fast", "big", "flyer", "police", "canine", "ghost", "kamikaze"], 22, Math.max(5, game.waveManager.wave + 2));
        game.casino.curses.blackout = Math.max(game.casino.curses.blackout || 0, 260);
    }

    function triggerPowerTheft() {
        const powers = Object.keys(game.player.powerups || {}).filter(k => game.player.powerups[k] > 0);
        if (!powers.length) return game.player.takeDamage(10);
        const stolen = randChoice(powers);
        const value = game.player.powerups[stolen];
        delete game.player.powerups[stolen];
        const enemy = game.enemyManager.spawnEnemy ? null : null;
        game.enemyManager.spawnEnemy("ghost", rand(180, CONFIG.canvasWidth - 180), -80, game.waveManager.wave + 2);
        const thief = game.enemyManager.enemies[game.enemyManager.enemies.length - 1];
        if (thief) {
            thief._casinoThief = true;
            thief._stolenPower = stolen;
            thief._stolenValue = value;
            thief.color = "#ffd166";
            thief.glowColor = "#ffd166";
            thief.maxHealth *= 2;
            thief.health = thief.maxHealth;
        }
        game.casino.stolenPower = stolen;
        game.showNotification("ROBO DE PODER: " + stolen, "boss");
    }

    function spawnFusionBoss() {
        const a = randChoice(BOSS_POOL);
        const b = randChoice(BOSS_POOL.filter(x => x !== a));
        const boss = window.createRandomBossEntity?.("boss", { wave: game.waveManager.wave + 7, mode: "casino", requested: "boss" }) || new Boss(a, game.waveManager.wave + 7);
        boss._casinoSpecial = true;
        boss._casinoFusion = b;
        boss.name = "FUSION " + a.toUpperCase() + " + " + b.toUpperCase();
        boss.maxHealth = Math.floor(boss.maxHealth * 1.75);
        boss.health = boss.maxHealth;
        boss.glowColor = "#ff00e4";
        boss.spawnTimer = 80;
        boss.x = CONFIG.canvasWidth * 0.5;
        boss.y = -120;
        if (!game.boss || game.boss.dead) game.boss = boss, game.showBossBar(boss);
        else game.enemyManager.enemies.push(boss);
        game.showNotification("JEFE FUSION", "boss");
    }

    function triggerTraitorAlly() {
        if (!game.casino.allies.length) game.casino.allies.push({ type: "turret", x: game.player.x + 130, y: game.player.y, timer: 520, fire: 0 });
        const ally = randChoice(game.casino.allies);
        ally.traitor = 300;
        game.showNotification("ALIADO TRAIDOR", "boss");
    }

    function activateAlteredDimension() {
        const c = game.casino;
        c.dimensionAltered = 620;
        c.weather = "dimension";
        c.weatherTimer = 620;
        c.curses.weight = Math.max(c.curses.weight || 0, 260);
        c.rewardMultiplier += 0.7;
    }

    function activateGlobalCurse() {
        const p = game.player;
        p.maxHealth = Math.max(45, Math.floor(p.maxHealth * 0.85));
        p.health = Math.min(p.health, p.maxHealth);
        p.speed *= 0.94;
        game.casino.curses.unstable = Math.max(game.casino.curses.unstable || 0, 520);
        game.casino.rewardMultiplier += 1;
    }

    function activateDynamicWeather() {
        const c = game.casino;
        c.weather = randChoice(["rain", "storm", "fog", "dark", "gravity"]);
        c.weatherTimer = 620;
        if (c.weather === "dark") c.curses.blackout = Math.max(c.curses.blackout || 0, 520);
        if (c.weather === "storm") game.electricStormTimer = 360;
    }

    function rainPowerUps() {
        for (let i = 0; i < 18; i++) {
            game.dropManager.drops.push(new Drop(rand(80, CONFIG.canvasWidth - 80), rand(80, CONFIG.canvasHeight - 80), randChoice(POSITIVE_DROPS)));
        }
    }

    function spawnEnemyBurst(types, count, wave) {
        const cap = Math.min(42, game.enemyManager.enemies.length + count);
        for (let i = game.enemyManager.enemies.length; i < cap; i++) {
            const side = randInt(0, 3), margin = 90;
            const x = side === 1 ? CONFIG.canvasWidth + margin : side === 3 ? -margin : rand(margin, CONFIG.canvasWidth - margin);
            const y = side === 0 ? -margin : side === 2 ? CONFIG.canvasHeight + margin : rand(margin, CONFIG.canvasHeight - margin);
            game.enemyManager.spawnEnemy(randChoice(types), x, y, wave);
        }
    }

    function allHostiles() {
        return [...game.enemyManager.enemies, game.boss, game.miniBoss].filter(e => e && !e.dead);
    }

    function rainCasinoCoins(count) {
        for (let i = 0; i < count; i++) game.casino.coins.push({ x: rand(80, CONFIG.canvasWidth - 80), y: -rand(40, 780), vy: rand(5, 11), value: randInt(3, 10), life: 900 });
    }

    function grantCasinoMoney(coins, bpXP) {
        const comboMult = 1 + Math.min(4, Math.floor((game.casino.combo || 0) / 10) * 0.35);
        const survivalMult = game.casino.rewardMultiplier || 1;
        const jackpotMult = game.casino.jackpotGlobal > 0 ? 5 : 1;
        const mult = (game.casino.crown > 0 ? 1.6 : 1) * (game.casino.doubleReward ? 2 : 1) * comboMult * survivalMult * jackpotMult;
        const finalCoins = Math.floor(coins * mult);
        playerData?.addC?.(finalCoins);
        playerData?.addBPXP?.(Math.floor(bpXP * mult));
        playerData?.sv?.();
        updGamUI?.();
        game.casinoReward = (game.casinoReward || 0) + finalCoins;
        game.casino.doubleReward = false;
    }

    function rewardCasinoRound(manager) {
        const coins = 180 + manager.wave * 70;
        const xp = 120 + manager.wave * 42;
        const bet = game.casino.roundBet;
        if (bet && bet.type !== "safe") {
            const won = Math.random() < (bet.type === "life" ? 0.58 : 0.66);
            if (won) {
                game.casino.rewardMultiplier *= bet.mult;
                game.showNotification("APUESTA GANADA x" + bet.mult, "powerup");
            } else {
                if (bet.type === "coins") playerData?.addC?.(-Math.min(playerData.d.coins, bet.stake));
                if (bet.type === "life") game.player.maxHealth = Math.max(40, game.player.maxHealth - 10);
                game.casino.rewardMultiplier = Math.max(1, game.casino.rewardMultiplier * 0.75);
                game.showNotification("APUESTA PERDIDA", "boss");
            }
        }
        grantCasinoMoney(coins, xp);
        game.casino.rewardMultiplier = Math.min(5, 1 + manager.wave * 0.08);
        if (Math.random() < 0.04 + (game.casino.luckyDie > 0 ? 0.04 : 0)) unlockCasinoCosmetic();
        game.showNotification("RECOMPENSA CASINO: +" + coins, "powerup");
    }

    function unlockCasinoCosmetic() {
        if (window.advancedCosmetics) {
            window.advancedCosmetics.unlocked ||= [];
            const drop = randChoice(CASINO_COSMETICS);
            if (!window.advancedCosmetics.unlocked.includes(drop)) {
                window.advancedCosmetics.unlocked.push(drop);
                localStorage.setItem("gs_cosmetics_v3", JSON.stringify(window.advancedCosmetics));
                game.showNotification("DROP RARO CASINO", "powerup");
            }
        }
    }

    function createImmortalityTotemDrop(x, y) {
        const drop = new Drop(x, y, "immortalityTotem");
        drop.name = "Totem de Inmortalidad";
        drop.icon = "T";
        drop.color = "#ffd166";
        return drop;
    }

    function activatePlayerTotem(player) {
        player.immortalityTotem = true;
        if (game?.casino) game.casino.immortalityTotem = true;
        game.showNotification("TOTEM DE INMORTALIDAD", "powerup");
        sound.play("powerup");
    }

    function reviveWithTotem(gameRef) {
        if (!gameRef?.player?.immortalityTotem) return false;
        gameRef.player.immortalityTotem = false;
        if (gameRef.casino) gameRef.casino.immortalityTotem = false;
        gameRef.player.health = Math.max(1, Math.floor(gameRef.player.maxHealth * 0.5));
        gameRef.player.shield = Math.floor(gameRef.player.maxShield * 0.35);
        gameRef.player.invulnTimer = 210;
        gameRef.state = "playing";
        gameRef.showNotification("EL TOTEM TE REVIVE", "powerup");
        gameRef.particles.emitShockwave(gameRef.player.x, gameRef.player.y, "#ffd166");
        sound.play("powerup");
        return true;
    }

    function showTotemHUD() {
        if (!game?.player?.immortalityTotem) return;
        const powers = document.getElementById("activePowerups");
        if (!powers || powers.querySelector("[data-global-totem]")) return;
        const div = document.createElement("div");
        div.className = "powerupIcon casinoHudIcon";
        div.dataset.globalTotem = "1";
        div.style.borderColor = "#ffd166";
        div.style.color = "#ffd166";
        div.innerHTML = 'T<span class="powerupTimer">REVIVE</span>';
        powers.appendChild(div);
    }

    function explodeDivineOrb(x, y, damage) {
        window.__casinoVisualOnly = true;
        game.particles.emit(x, y, 22, { colors: ["#ffd166", "#fff3b0", "#ffffff"], speed: 6, life: 20, size: 3, glow: true });
        game.particles.emitShockwave(x, y, "#ffd166");
        window.__casinoVisualOnly = false;
        for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2;
            const b = new Bullet(x, y, a, 13, damage * 0.26, "#ffd166", true, false, false);
            b.radius = 5;
            b._divineShard = true;
            game.bulletManager.bullets.push(b);
        }
        const targets = allHostiles().filter(t => dist(x, y, t.x, t.y) < 190).slice(0, 8);
        for (const target of targets) {
            target.takeDamage(damage * 0.42);
        }
        damageCasinoCagesInRadius(x, y, 190, damage * 0.7, true);
    }

    function dropGiantDivineTotem(player) {
        const tx = clamp(player.x + rand(-120, 120), 120, CONFIG.canvasWidth - 120);
        const ty = clamp(player.y + rand(-120, 120), 120, CONFIG.canvasHeight - 120);
        game.showNotification("TOTEM DIVINO", "powerup");
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                if (!window.game || game.state !== "playing") return;
                game.particles.emit(tx, ty - 650 + i * 58, 9, { colors: ["#ffd166", "#ffffff", "#7ae582"], speed: 4, life: 18, size: 3, glow: true });
            }, i * 40);
        }
        setTimeout(() => {
            if (!window.game || game.state !== "playing") return;
            getDivineTotems().push({
                x: tx, y: ty, radius: 210, life: 480, maxLife: 480,
                health: 260, maxHealth: 260, pulse: 0, born: game.frame || 0
            });
            player.health = player.maxHealth;
            player.addShield(50);
            game.particles.emit(tx, ty, 34, { colors: ["#ffd166", "#fff3b0", "#ffffff"], speed: 7, life: 24, size: 4, glow: true });
            game.particles.emitShockwave(tx, ty, "#ffd166");
        }, 520);
    }

    function getDivineTotems() {
        if (!game.divineTotems) game.divineTotems = [];
        return game.divineTotems;
    }

    function updateDivineTotems() {
        if (!window.game || !game.divineTotems) return;
        for (let i = game.divineTotems.length - 1; i >= 0; i--) {
            const t = game.divineTotems[i];
            t.life--;
            t.health -= t.maxHealth / t.maxLife;
            t.pulse = (t.pulse || 0) + 0.08;
            const aura = t.radius + Math.sin(t.pulse) * 18;
            for (const target of allHostiles()) {
                if (target.dead || target.health <= 0) continue;
                if (dist(t.x, t.y, target.x, target.y) <= aura + (target.radius || 20)) {
                    target._casinoConfused = Math.max(target._casinoConfused || 0, 42);
                    target._casinoConfusePulse = 0;
                    target._totemTrapped = 18;
                    target.vx = (target.vx || 0) * 0.72;
                    target.vy = (target.vy || 0) * 0.72;
                    if (game.frame % 40 === 0) t.health -= target instanceof Boss ? 5 : target instanceof MiniBoss ? 3 : 1;
                }
            }
            if (game.frame % 16 === 0) {
                window.__casinoVisualOnly = true;
                game.particles.emit(t.x + rand(-70, 70), t.y + rand(-70, 50), 2, { colors: ["#ffd166", "#fff3b0"], speed: 1.8, life: 14, size: 2, glow: true });
                window.__casinoVisualOnly = false;
            }
            if (t.life <= 0 || t.health <= 0) {
                window.__casinoVisualOnly = true;
                game.particles.emitShockwave(t.x, t.y, "#ffd166");
                game.particles.emit(t.x, t.y, 18, { colors: ["#ffd166", "#ffffff"], speed: 4, life: 18, size: 3, glow: true });
                window.__casinoVisualOnly = false;
                game.divineTotems.splice(i, 1);
            }
        }
    }

    function drawDivineTotems(ctx) {
        if (!game?.divineTotems?.length) return;
        for (const t of game.divineTotems) {
            const pulse = Math.sin((game.frame || 0) * 0.08 + t.x) * 10;
            ctx.save();
            ctx.translate(t.x, t.y);
            const aura = t.radius + pulse;
            const grad = ctx.createRadialGradient(0, 0, 24, 0, 0, aura);
            grad.addColorStop(0, "rgba(255,209,102,.18)");
            grad.addColorStop(0.62, "rgba(255,209,102,.10)");
            grad.addColorStop(1, "rgba(255,209,102,0)");
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(0, 0, aura, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "rgba(255,209,102,.72)";
            ctx.lineWidth = 4;
            ctx.setLineDash([16, 10]);
            ctx.beginPath(); ctx.arc(0, 0, aura, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowColor = "#ffd166";
            ctx.shadowBlur = 24;
            ctx.fillStyle = "#5b2b00";
            roundRect(ctx, -26, -54, 52, 104, 9, true, true);
            ctx.fillStyle = "#ffd166";
            ctx.fillRect(-18, -42, 36, 14);
            ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(36, -46); ctx.lineTo(18, -14); ctx.lineTo(-18, -14); ctx.lineTo(-36, -46); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(0, -43, 8, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,.65)";
            ctx.fillRect(-38, 62, 76, 8);
            ctx.fillStyle = "#ffd166";
            ctx.fillRect(-38, 62, 76 * clamp(t.health / t.maxHealth, 0, 1), 8);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.strokeRect(-38, 62, 76, 8);
            ctx.restore();
        }
    }

    function updateCasinoMode() {
        const c = game.casino;
        if (!c) return;
        if (c.rouletteTimer > 0) {
            c.rouletteTimer--;
            c.roulette.timer = c.rouletteTimer;
            c.roulette.angle += 0.42 + c.rouletteTimer / 210;
            if (c.rouletteTimer === 32) applyRouletteResult(c.roulette);
            if (c.rouletteTimer <= 0) c.roulette = null;
        }
        if (c.powerRouletteTimer > 0) {
            c.powerRouletteTimer--;
            c.powerRoulette.timer = c.powerRouletteTimer;
            c.powerRoulette.angle += 0.5 + c.powerRouletteTimer / 180;
            if (c.powerRouletteTimer === 28) {
                c.lastPowerResult = c.powerRoulette.label;
                applySpecialPowerUp(c.powerRoulette.key);
                game.showNotification("PODER: " + c.powerRoulette.label, c.powerRoulette.bucket === "badPower" ? "boss" : "powerup");
            }
            if (c.powerRouletteTimer <= 0) c.powerRoulette = null;
        }
        if (c.lastRouletteTrigger > 0) c.lastRouletteTrigger--;
        if (c.midChoiceCooldown > 0) c.midChoiceCooldown--;
        if (c.lastRouletteTrigger <= 0 && !c.roulette && c.cages.length === 0 && game.state === "playing") c.lastRouletteTrigger = 1500, spinCasinoRoulette("clear"), spinCasinoPowerRoulette("clear");
        tickTimers(c.curses);
        ["crown", "luckyDie", "badLuck", "corruptedSpin", "goldenBullets", "jackpotGlobal", "chaosTotal", "dimensionAltered", "weatherTimer"].forEach(k => { if (c[k] > 0) c[k]--; });
        if (c.weatherTimer <= 0) c.weather = null;
        for (let i = c.cages.length - 1; i >= 0; i--) c.cages[i].update(), c.cages[i].dead && c.cages.splice(i, 1);
        updateCasinoWorldEntities();
        updateCasinoAllies(c);
        updateCasinoHazards(c);
        updateCasinoCurses(c);
        updateLegendaryCages(c);
        optimizeCasinoCollections(c);
    }

    function tickTimers(obj) {
        for (const key of Object.keys(obj)) obj[key]--, obj[key] <= 0 && delete obj[key];
    }

    function updateCasinoAllies(c) {
        for (let i = c.allies.length - 1; i >= 0; i--) {
            const a = c.allies[i];
            a.timer--; a.fire--;
            if (a.traitor > 0) {
                a.traitor--;
                if (a.fire <= 0) {
                    a.fire = 50;
                    game.player.takeDamage(5);
                    game.bulletManager.addEnemyBullet(a.x, a.y, angle(a.x, a.y, game.player.x, game.player.y), 6, 6, "#ffd166");
                }
                if (a.traitor <= 0) game.showNotification("ALIADO RECUPERADO", "powerup");
                if (a.timer <= 0) c.allies.splice(i, 1);
                continue;
            }
            const target = nearestHostile(a.x, a.y, 720);
            if (target && a.fire <= 0) {
                a.fire = a.type === "angel" ? 36 : 48;
                target.takeDamage(a.type === "angel" ? 26 : 20);
                game.bulletManager.lasers.push(new Laser(a.x, a.y, angle(a.x, a.y, target.x, target.y), 8, 6));
                game.particles.emit(target.x, target.y, 8, { colors: ["#fff3b0", "#ffd166"], speed: 3, life: 12, size: 2, glow: true });
            }
            if (a.timer <= 0) c.allies.splice(i, 1);
        }
    }

    function nearestHostile(x, y, range) {
        let best = null, bd = range;
        for (const e of allHostiles()) {
            const d = dist(x, y, e.x, e.y);
            if (d < bd) best = e, bd = d;
        }
        return best;
    }

    function updateCasinoHazards(c) {
        for (let i = c.mines.length - 1; i >= 0; i--) {
            const m = c.mines[i];
            m.life = (m.life ?? 620) - 1;
            if (m.armed > 0) m.armed--;
            if (m.armed <= 0 && dist(m.x, m.y, game.player.x, game.player.y) < m.radius + game.player.radius) game.player.takeDamage(18), game.particles.emitExplosion(m.x, m.y, 1), m.dead = true;
            if (m.life <= 0) {
                window.__casinoVisualOnly = true;
                game.particles.emit(m.x, m.y, 8, { colors: ["#ff334d", "#ffd166"], speed: 3, life: 12, size: 2, glow: true });
                window.__casinoVisualOnly = false;
                m.dead = true;
            }
            if (m.dead) c.mines.splice(i, 1);
        }
        for (let i = c.coins.length - 1; i >= 0; i--) {
            const coin = c.coins[i];
            coin.y += coin.vy; coin.life--;
            if (dist(coin.x, coin.y, game.player.x, game.player.y) < 42) grantCasinoMoney(coin.value, 1), c.coins.splice(i, 1);
            else if (coin.life <= 0 || coin.y > CONFIG.canvasHeight + 80) c.coins.splice(i, 1);
        }
        for (let i = c.shadows.length - 1; i >= 0; i--) {
            const s = c.shadows[i];
            s.timer--;
            const a = angle(s.x, s.y, game.player.x, game.player.y);
            s.x += Math.cos(a) * 3.8; s.y += Math.sin(a) * 3.8;
            if (dist(s.x, s.y, game.player.x, game.player.y) < 54 && game.frame % 35 === 0) game.player.takeDamage(6);
            if (s.timer <= 0) c.shadows.splice(i, 1);
        }
    }

    function updateCasinoCurses(c) {
        const p = game.player;
        if (c.curses.reaper && game.frame % 60 === 0) p.takeDamage(3);
        if (c.curses.bleed && game.frame % 75 === 0) p.takeDamage(4);
        if (c.curses.weight) p.vx *= 0.94, p.vy *= 0.94;
        if (c.curses.fragile && game.frame % 90 === 0 && p.shield > 0) p.shield = Math.max(0, p.shield - 3);
        if (c.curses.jam) p.reloadTimer = Math.max(p.reloadTimer || 0, 6);
        if (c.curses.enemyHaste) allHostiles().forEach(e => { e.x += (e.vx || 0) * 0.15; e.y += (e.vy || 0) * 0.15; });
        if (c.chaosTotal && game.frame % 45 === 0) game.bulletManager.addEnemyBullet(rand(80, CONFIG.canvasWidth - 80), 80, rand(0.7, 2.4), 6, 7, "#ff334d");
        if (c.weather === "gravity") p.vy *= 0.86;
        if (c.weather === "storm" && game.frame % 75 === 0) {
            const target = nearestHostile(p.x, p.y, 1000);
            if (target) target.takeDamage(22), game.particles.emitShockwave(target.x, target.y, "#ffd166");
        }
        if (c.curses.taunt && game.frame % 70 === 0) allHostiles().forEach(e => { if (e.attackTimer) e.attackTimer = Math.min(e.attackTimer, 12); });
    }

    function updateCasinoWorldEntities() {
        for (const meteor of game.activeMeteors) meteor.update(game.player);
        game.activeMeteors = game.activeMeteors.filter(m => !m.dead).slice(-10);
        for (const ship of game.trafficShips) ship.update(game.player);
        game.trafficShips = game.trafficShips.filter(s => !s.dead).slice(-4);
        for (const cruiser of game.allyCruisers) cruiser.update();
        game.allyCruisers = game.allyCruisers.filter(c => !c.dead).slice(-2);
        for (const trap of game.groundTraps) trap.update(game.player);
        game.groundTraps = game.groundTraps.filter(t => !t.dead).slice(-8);
    }

    function optimizeCasinoCollections(c) {
        c.allies = c.allies.slice(-MAX_CASINO_ALLIES);
        c.mines = c.mines.slice(-MAX_CASINO_MINES);
        c.coins = c.coins.slice(-MAX_CASINO_COINS);
        c.shadows = c.shadows.slice(-1);
        c.legendaryCages = c.legendaryCages.slice(-2);
        if (game.enemyManager.enemies.length > MAX_CASINO_ENEMIES) {
            const specials = game.enemyManager.enemies.filter(e => e._casinoSpecial || e instanceof Boss || e instanceof MiniBoss);
            const normal = game.enemyManager.enemies.filter(e => !specials.includes(e)).slice(-(MAX_CASINO_ENEMIES - specials.length));
            game.enemyManager.enemies = [...normal, ...specials].slice(-MAX_CASINO_ENEMIES);
        }
        if (game.bulletManager.enemyBullets.length > 80) game.bulletManager.enemyBullets = game.bulletManager.enemyBullets.slice(-80);
        if (game.particles.particles.length > 520) game.particles.particles = game.particles.particles.slice(-520);
        if (game.dropManager.drops.length > 24) game.dropManager.drops = game.dropManager.drops.slice(-24);
    }

    function updateLegendaryCages(c) {
        for (let i = c.legendaryCages.length - 1; i >= 0; i--) {
            const box = c.legendaryCages[i];
            box.y += box.vy; box.timer--;
            if (box.y > CONFIG.canvasHeight * 0.58) box.vy = 0;
            if (dist(box.x, box.y, game.player.x, game.player.y) < box.radius + game.player.radius) {
                grantCasinoMoney(160, 90);
                game.dropManager.drops.push(new Drop(box.x, box.y, randChoice(POSITIVE_DROPS)));
                if (Math.random() < 0.22) unlockCasinoCosmetic();
                c.legendaryCages.splice(i, 1);
            } else if (box.timer <= 0) c.legendaryCages.splice(i, 1);
        }
    }

    function drawCasinoArena(ctx) {
        const w = CONFIG.canvasWidth, h = CONFIG.canvasHeight, frame = game.frame || 0;
        ctx.save();
        const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 80, w * 0.5, h * 0.54, w * 0.86);
        bg.addColorStop(0, "rgba(255, 209, 102, .25)");
        bg.addColorStop(0.26, "rgba(88, 28, 135, .75)");
        bg.addColorStop(0.58, "rgba(127, 29, 29, .84)");
        bg.addColorStop(1, "rgba(2, 6, 23, .98)");
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        ctx.save(); ctx.translate(w * 0.5, h * 0.22); ctx.rotate(frame * 0.004);
        for (let i = 0; i < 18; i++) {
            ctx.rotate((Math.PI * 2) / 18);
            ctx.fillStyle = i % 2 ? "rgba(255, 51, 77, .36)" : "rgba(255, 209, 102, .34)";
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 260, 0, Math.PI / 18); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 260, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        for (let i = 0; i < 12; i++) {
            const x = w * 0.06 + i * (w * 0.88 / 11), y = h * 0.13 + Math.sin(frame * 0.04 + i) * 14;
            ctx.fillStyle = i % 3 === 0 ? "#7ae582" : i % 3 === 1 ? "#ff334d" : "#ffd166";
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.save(); ctx.translate(w * 0.5, h * 0.72); ctx.scale(1, 0.36);
        const arena = ctx.createRadialGradient(0, 0, 80, 0, 0, w * 0.48);
        arena.addColorStop(0, "rgba(255, 209, 102, .42)"); arena.addColorStop(0.45, "rgba(20, 184, 166, .2)"); arena.addColorStop(0.78, "rgba(88, 28, 135, .88)"); arena.addColorStop(1, "rgba(0,0,0,.28)");
        ctx.fillStyle = arena; ctx.beginPath(); ctx.arc(0, 0, w * 0.46, 0, Math.PI * 2); ctx.fill();
        for (let r = w * 0.14; r <= w * 0.46; r += w * 0.08) ctx.strokeStyle = r % 2 ? "#ffd166" : "#7ae582", ctx.lineWidth = 8, ctx.beginPath(), ctx.arc(0, 0, r, 0, Math.PI * 2), ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 7; i++) {
            const x = w * (0.08 + i * 0.14);
            ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.strokeStyle = i % 2 ? "#ff334d" : "#7df9ff"; ctx.lineWidth = 4;
            roundRect(ctx, x, h * 0.42, 72, 160, 12, true, true);
            ctx.fillStyle = i % 3 === 0 ? "#ffd166" : i % 3 === 1 ? "#7ae582" : "#ff334d";
            ctx.fillRect(x + 14, h * 0.45, 44, 30);
        }
        if (game.casino?.curses.darkness || game.casino?.curses.blackout) ctx.fillStyle = game.casino.curses.blackout ? "rgba(0,0,0,.58)" : "rgba(26,0,38,.32)", ctx.fillRect(0, 0, w, h);
        if (game.casino?.jackpotGlobal > 0) {
            ctx.fillStyle = "rgba(255,209,102,.16)";
            ctx.fillRect(0, 0, w, h);
        }
        if (game.casino?.weather === "fog") {
            ctx.fillStyle = "rgba(210,230,255,.18)";
            ctx.fillRect(0, 0, w, h);
        }
        if (game.casino?.weather === "rain") {
            ctx.strokeStyle = "rgba(125,249,255,.28)";
            ctx.lineWidth = 2;
            for (let i = 0; i < 80; i++) {
                const x = (i * 47 + frame * 9) % w;
                const y = (i * 83 + frame * 15) % h;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 22, y + 42); ctx.stroke();
            }
        }
        if (game.casino?.dimensionAltered > 0) {
            ctx.globalAlpha = 0.12 + Math.sin(frame * 0.12) * 0.05;
            ctx.fillStyle = "#b388ff";
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    function drawSuperBossArena(ctx) {
        const w = CONFIG.canvasWidth, h = CONFIG.canvasHeight, frame = game.frame || 0;
        ctx.save();
        const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 80, w * 0.5, h * 0.55, w * 0.88);
        bg.addColorStop(0, "rgba(255,221,87,.22)");
        bg.addColorStop(0.36, "rgba(127,29,29,.72)");
        bg.addColorStop(0.68, "rgba(30,41,59,.86)");
        bg.addColorStop(1, "rgba(2,6,23,.98)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.rotate(frame * 0.002);
        ctx.strokeStyle = "rgba(255,221,87,.22)";
        ctx.lineWidth = 10;
        for (let r = 140; r < w * 0.72; r += 90) {
            ctx.beginPath();
            ctx.arc(0, 0, r + Math.sin(frame * 0.02 + r) * 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        for (let i = 0; i < 18; i++) {
            const x = (i * 137 + frame * 2) % w;
            const y = (i * 89 + frame * 0.7) % h;
            ctx.fillStyle = i % 3 ? "rgba(255,68,68,.48)" : "rgba(255,221,87,.58)";
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,0,0,.22)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    function drawCasinoObjects(ctx) {
        const c = game.casino;
        if (!c) return;
        c.cages.forEach(cage => cage.draw(ctx));
        c.coins.forEach(coin => drawCoin(ctx, coin));
        c.mines.forEach(mine => drawMine(ctx, mine));
        c.allies.forEach(ally => drawAlly(ctx, ally));
        c.shadows.forEach(s => drawShadow(ctx, s));
        c.legendaryCages.forEach(box => drawLegendaryBox(ctx, box));
        drawRoulette(ctx, c.roulette, CONFIG.canvasWidth * 0.43, CONFIG.canvasHeight * 0.18, "EVENTOS");
        drawRoulette(ctx, c.powerRoulette, CONFIG.canvasWidth * 0.57, CONFIG.canvasHeight * 0.18, "PODERES");
    }

    function drawCoin(ctx, coin) {
        ctx.save(); ctx.translate(coin.x, coin.y); ctx.fillStyle = "#ffd166"; ctx.shadowColor = "#ffd166"; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#7f1d1d"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", 0, 1); ctx.restore();
    }

    function drawMine(ctx, mine) {
        ctx.save(); ctx.translate(mine.x, mine.y); ctx.fillStyle = mine.armed > 0 ? "#555" : "#ff334d"; ctx.shadowColor = "#ff334d"; ctx.shadowBlur = mine.armed > 0 ? 4 : 18; ctx.beginPath(); ctx.arc(0, 0, mine.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34); ctx.stroke(); }
        ctx.restore();
    }

    function drawAlly(ctx, ally) {
        ctx.save(); ctx.translate(ally.x, ally.y); ctx.fillStyle = ally.type === "angel" ? "#fff3b0" : "#7df9ff"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(0, 0, ally.type === "angel" ? 22 : 26, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#09111f"; ctx.font = "bold 22px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ally.type === "angel" ? "A" : "T", 0, 1); ctx.restore();
    }

    function drawShadow(ctx, s) {
        ctx.save(); ctx.translate(s.x, s.y); ctx.globalAlpha = 0.62; ctx.fillStyle = "#05010b"; ctx.shadowColor = "#b388ff"; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffffff"; ctx.font = "bold 30px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("X", 0, 1); ctx.restore();
    }

    function drawLegendaryBox(ctx, box) {
        ctx.save(); ctx.translate(box.x, box.y); ctx.fillStyle = "#ffd166"; ctx.strokeStyle = "#ff334d"; ctx.shadowColor = "#ffd166"; ctx.shadowBlur = 22; roundRect(ctx, -32, -32, 64, 64, 10, true, true); ctx.fillStyle = "#7f1d1d"; ctx.font = "bold 18px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("777", 0, 2); ctx.restore();
    }

    function drawRoulette(ctx, roulette, cx, cy, title) {
        if (!roulette) return;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(roulette.angle);
        const colors = ["#ff334d", "#ffd166", "#7ae582", "#b388ff", "#111827", "#ffffff"];
        for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI * 2 / 18); ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 105, 0, Math.PI / 9); ctx.closePath(); ctx.fill(); }
        ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 105, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.fillStyle = "#ffffff"; ctx.shadowColor = "#ffd166"; ctx.shadowBlur = 18; ctx.font = "bold 28px Arial"; ctx.textAlign = "center"; ctx.fillText(roulette.timer > 32 ? title : roulette.label, cx, cy + 145); ctx.restore();
    }

    function damageCasinoCage(cage, amount) { cage?.takeDamage?.(amount); }
    function breakCasinoCage(cage) { cage?.breakOpen?.(); }

    function liveCasinoCages() {
        return game?.casinoMode && game.casino?.cages ? game.casino.cages.filter(c => !c.dead) : [];
    }

    function damageCasinoCagesInRadius(x, y, radius, damage, falloff = true) {
        for (const cage of liveCasinoCages()) {
            const d = dist(x, y, cage.x, cage.y);
            if (d > radius + cage.radius) continue;
            const mult = falloff ? clamp(1 - Math.max(0, d - cage.radius) / Math.max(1, radius), 0.18, 1) : 1;
            damageCasinoCage(cage, damage * mult);
        }
    }

    function damageCasinoCagesOnLine(x1, y1, x2, y2, width, damage, tag) {
        for (const cage of liveCasinoCages()) {
            if (pointToSegmentDistance(cage.x, cage.y, x1, y1, x2, y2) > cage.radius + width) continue;
            cage._casinoLineHits ||= {};
            if (tag && cage._casinoLineHits[tag] === game.frame) continue;
            if (tag) cage._casinoLineHits[tag] = game.frame;
            damageCasinoCage(cage, damage);
        }
    }

    function patchBulletCollisions() {
        if (BulletManager.prototype.__casinoCages) return;
        const oldUpdate = BulletManager.prototype.update;
        BulletManager.prototype.update = function () {
            if (game?.casinoMode && game.casino?.cages?.length) hitCagesWithProjectiles(this);
            oldUpdate.call(this);
        };

        const oldAddRailgun = BulletManager.prototype.addRailgun;
        BulletManager.prototype.addRailgun = function (x, y, angleValue, damage) {
            if (game?.casinoMode) {
                const endX = x + Math.cos(angleValue) * 3000;
                const endY = y + Math.sin(angleValue) * 3000;
                damageCasinoCagesOnLine(x, y, endX, endY, 22, damage, "railgun_" + game.frame + "_" + this.railguns.length);
            }
            return oldAddRailgun.call(this, x, y, angleValue, damage);
        };

        const oldAddTeslaArc = BulletManager.prototype.addTeslaArc;
        BulletManager.prototype.addTeslaArc = function (x, y, angleValue, damage) {
            if (game?.casinoMode) {
                let currentX = x;
                let currentY = y;
                const chained = new Set();
                for (let step = 0; step < 4; step++) {
                    let closest = null;
                    let closestDist = 340;
                    for (const cage of liveCasinoCages()) {
                        if (chained.has(cage.id)) continue;
                        const d = dist(currentX, currentY, cage.x, cage.y);
                        if (d < closestDist) {
                            closest = cage;
                            closestDist = d;
                        }
                    }
                    if (!closest) break;
                    damageCasinoCage(closest, damage * Math.max(0.45, 1 - step * 0.18));
                    this.lasers.push(new Laser(currentX, currentY, angle(currentX, currentY, closest.x, closest.y), damage * 0.12, 4));
                    chained.add(closest.id);
                    currentX = closest.x;
                    currentY = closest.y;
                }
            }
            return oldAddTeslaArc.call(this, x, y, angleValue, damage);
        };

        const oldGrenadeExplode = Grenade.prototype.explode;
        Grenade.prototype.explode = function (...args) {
            if (game?.casinoMode) damageCasinoCagesInRadius(this.x, this.y, 92, this.damage * 1.05, true);
            return oldGrenadeExplode.apply(this, args);
        };

        const oldSkillGrenadeExplode = SkillGrenade.prototype.explode;
        SkillGrenade.prototype.explode = function (atX, atY, ...rest) {
            if (game?.casinoMode) damageCasinoCagesInRadius(atX, atY, 82, this.damage * 1.1, true);
            return oldSkillGrenadeExplode.call(this, atX, atY, ...rest);
        };

        const oldSkillGrenadeUpdate = SkillGrenade.prototype.update;
        SkillGrenade.prototype.update = function (...args) {
            if (game?.casinoMode && !this.exploded) {
                const cage = liveCasinoCages().find(c => dist(this.x, this.y, c.x, c.y) < this.radius + c.radius);
                if (cage) {
                    this.explode(cage.x, cage.y);
                    return;
                }
            }
            return oldSkillGrenadeUpdate.apply(this, args);
        };

        const oldShockwaveUpdate = Shockwave.prototype.update;
        Shockwave.prototype.update = function (...args) {
            if (game?.casinoMode) {
                this.hitCasinoCages ||= new Set();
                for (const cage of liveCasinoCages()) {
                    const d = dist(this.x, this.y, cage.x, cage.y);
                    if (d < this.radius + cage.radius && d > this.radius - this.speed - cage.radius && !this.hitCasinoCages.has(cage.id)) {
                        damageCasinoCage(cage, this.damage);
                        this.hitCasinoCages.add(cage.id);
                    }
                }
            }
            return oldShockwaveUpdate.apply(this, args);
        };

        const oldPlasmaUpdate = PlasmaBall.prototype.update;
        PlasmaBall.prototype.update = function (...args) {
            if (game?.casinoMode && this.animFrame % 5 === 0) {
                this.hitCasinoCages ||= new Set();
                for (const cage of liveCasinoCages()) {
                    if (dist(this.x, this.y, cage.x, cage.y) < this.radius + cage.radius && !this.hitCasinoCages.has(cage.id)) {
                        damageCasinoCage(cage, this.damage);
                        this.hitCasinoCages.add(cage.id);
                    }
                }
            }
            return oldPlasmaUpdate.apply(this, args);
        };

        const oldParticleExplosion = ParticleSystem.prototype.emitExplosion;
        ParticleSystem.prototype.emitExplosion = function (x, y, scale = 1, ...rest) {
            if (game?.casinoMode && game.player && !window.__casinoVisualOnly) damageCasinoCagesInRadius(x, y, 82 * Math.max(1, scale), 18 * Math.max(1, scale), true);
            return oldParticleExplosion.call(this, x, y, scale, ...rest);
        };

        const oldParticleShockwave = ParticleSystem.prototype.emitShockwave;
        ParticleSystem.prototype.emitShockwave = function (x, y, color = "#00f0ff", ...rest) {
            if (game?.casinoMode && game.player && !window.__casinoVisualOnly) damageCasinoCagesInRadius(x, y, 430, 22, true);
            return oldParticleShockwave.call(this, x, y, color, ...rest);
        };

        BulletManager.prototype.__casinoCages = true;
    }

    function hitCagesWithProjectiles(manager) {
        const cages = game.casino.cages;
        for (let i = manager.bullets.length - 1; i >= 0; i--) {
            const b = manager.bullets[i], cage = cages.find(c => !c.dead && dist(b.x, b.y, c.x, c.y) < b.radius + c.radius);
            if (!cage) continue;
            let dmg = b.damage;
            if (game.casino.goldenBullets > 0) dmg *= 1.35, Math.random() < 0.18 && grantCasinoMoney(2, 0);
            if (game.casino.curses.unstable && Math.random() < 0.18) dmg *= 0.25;
            damageCasinoCage(cage, dmg);
            if (!b.pierce) manager.bullets.splice(i, 1);
        }
        for (let i = manager.homing.length - 1; i >= 0; i--) {
            const h = manager.homing[i], cage = cages.find(c => !c.dead && dist(h.x, h.y, c.x, c.y) < h.radius + c.radius);
            if (cage) damageCasinoCage(cage, h.damage), manager.homing.splice(i, 1);
        }
        for (const laser of manager.lasers) {
            const endX = laser.x + Math.cos(laser.angle) * 3000, endY = laser.y + Math.sin(laser.angle) * 3000;
            for (const cage of cages) if (!cage.dead && pointToSegmentDistance(cage.x, cage.y, laser.x, laser.y, endX, endY) < cage.radius) damageCasinoCage(cage, laser.damage * 0.22);
        }
        for (const shockwave of manager.shockwaves) {
            shockwave.hitCasinoCages ||= new Set();
            for (const cage of cages) {
                const d = dist(shockwave.x, shockwave.y, cage.x, cage.y);
                if (d < shockwave.radius + cage.radius && d > shockwave.radius - shockwave.speed - cage.radius && !shockwave.hitCasinoCages.has(cage.id)) {
                    damageCasinoCage(cage, shockwave.damage);
                    shockwave.hitCasinoCages.add(cage.id);
                }
            }
        }
        for (const plasma of manager.plasmas) {
            plasma.hitCasinoCages ||= new Set();
            for (const cage of cages) {
                if (dist(plasma.x, plasma.y, cage.x, cage.y) < plasma.radius + cage.radius && !plasma.hitCasinoCages.has(cage.id)) {
                    damageCasinoCage(cage, plasma.damage);
                    plasma.hitCasinoCages.add(cage.id);
                }
            }
        }
        for (let i = 0; i < manager.railguns.length; i++) {
            const rail = manager.railguns[i];
            const endX = rail.x + Math.cos(rail.angle) * rail.length;
            const endY = rail.y + Math.sin(rail.angle) * rail.length;
            damageCasinoCagesOnLine(rail.x, rail.y, endX, endY, 24, rail.damage * 0.85, "rail_visual_" + i);
        }
    }

    function updateCasinoHUD() {
        if (game?.superBossMode) {
            const wave = document.getElementById("waveText"), enemies = document.getElementById("enemyCount");
            const boss = game.boss && !game.boss.dead ? game.boss : game.superBoss?.current;
            if (wave) wave.textContent = "SUPER JEFES DRAGON | RONDA " + (game.waveManager?.wave || 1);
            if (enemies) {
                const hp = boss ? Math.ceil(boss.health) + "/" + Math.ceil(boss.maxHealth) : "LISTO";
                const phase = boss?.phase || game.superBoss?.phase || 1;
                const summoned = game.enemyManager?.enemies?.filter(e => e._superSummon && !e.dead).length || 0;
                enemies.textContent = "SUPER JEFE: " + (boss?.name || "GENERANDO") + " | FASE: " + phase + " | VIDA: " + hp + " | INVOCADOS: " + summoned;
            }
            return;
        }
        if (!game?.casinoMode || !game.casino) return;
        const c = game.casino, wave = document.getElementById("waveText"), enemies = document.getElementById("enemyCount"), powers = document.getElementById("activePowerups");
        const total = c.roundCages || 0;
        if (wave) wave.textContent = "COLISEO CASINO 5 CALAVERAS | RONDA " + game.waveManager.wave;
        if (enemies) enemies.textContent = "CAJAS: " + c.cages.length + "/" + total + " | JEFES: " + getCasinoSpecials().length + " | COMBO: " + (c.combo || 0) + " | x" + (c.rewardMultiplier || 1).toFixed(1) + " | EVENTO: " + c.lastRouletteResult + " | PODER: " + c.lastPowerResult;
        if (powers) {
            const entries = [];
            if (c.immortalityTotem) entries.push(["T", "#ffd166", "TOTEM"]);
            if (c.guardianAngel) entries.push(["A", "#fff3b0", "ANGEL"]);
            if (c.curses.reaper) entries.push(["P", "#b388ff", Math.ceil(c.curses.reaper / 60) + "s"]);
            if (c.curses.taunt) entries.push(["!", "#ff334d", Math.ceil(c.curses.taunt / 60) + "s"]);
            if (c.badLuck > 0) entries.push(["D", "#ff334d", Math.ceil(c.badLuck / 60) + "s"]);
            for (const [icon, color, label] of entries) {
                const div = document.createElement("div");
                div.className = "powerupIcon casinoHudIcon";
                div.style.borderColor = color; div.style.color = color;
                div.innerHTML = icon + '<span class="powerupTimer">' + label + '</span>';
                powers.appendChild(div);
            }
        }
    }

    function confusedTargetFor(entity, fallback) {
        const pool = allHostiles().filter(t => t !== entity && !t.dead);
        if (!pool.length) return fallback;
        const target = pool.reduce((best, t) => dist(entity.x, entity.y, t.x, t.y) < dist(entity.x, entity.y, best.x, best.y) ? t : best, pool[0]);
        return { x: target.x, y: target.y, radius: target.radius || 20, takeDamage() {}, health: 9999, maxHealth: 9999 };
    }

    function tickConfusion(entity) {
        if (!entity._casinoConfused) return;
        entity._casinoConfused--;
        entity._casinoConfusePulse = (entity._casinoConfusePulse || 0) - 1;
        if (entity._casinoConfusePulse <= 0) {
            entity._casinoConfusePulse = 34;
            const target = allHostiles().find(t => t !== entity && !t.dead && dist(entity.x, entity.y, t.x, t.y) < 140);
            if (target) target.takeDamage((entity.damage || 12) * 0.45);
        }
    }

    function injectCasinoSelectorCard() {
        const grid = document.querySelector("#coliseumSelectScreen .coliseum-tier-grid");
        if (!grid) return;
        if (!grid.querySelector("[data-coliseum-casino]")) {
            const card = document.createElement("article");
            card.className = "coliseum-tier-card casino-tier-card";
            card.innerHTML = '<div class="tier-skulls">&#9760;&#9760;&#9760;&#9760;&#9760;</div><h3>COLISEO CASINO</h3><p>La arena de la suerte y el caos</p><span>Dificultad: EXTREMA / CAOTICA</span><small>Jaulas aleatorias, ruleta, premios y maldiciones</small><em>Recompensa jackpot</em><button class="menuBtn primary" data-coliseum-casino="1">ENTRAR</button>';
            grid.appendChild(card);
            card.querySelector("button").addEventListener("click", startCasinoColiseum);
        }
        if (!grid.querySelector("[data-coliseum-superboss]")) {
            const card = document.createElement("article");
            card.className = "coliseum-tier-card super-boss-tier-card";
            card.innerHTML = '<div class="tier-skulls dragon-tier">&#128009;&#128009;&#128009;&#128009;&#128009;&#128009;</div><h3>SUPER JEFES</h3><p>Enfrentate a entidades colosales</p><span>Dificultad: EXTREMA / TITANICA</span><small>Jefes gigantes aleatorios con fases, invocaciones y ataques masivos</small><em>Recompensas epicas</em><button class="menuBtn primary" data-coliseum-superboss="1">ENTRAR</button>';
            grid.appendChild(card);
            card.querySelector("button").addEventListener("click", startSuperBossMode);
        }
    }

    function patchCasinoMode() {
        if (typeof Game === "undefined" || typeof WaveManager === "undefined") return;
        if (Game.prototype.__casinoColiseumPatch) return;
        patchBulletCollisions();
        const oldSetup = Game.prototype.setupUI;
        Game.prototype.setupUI = function () { oldSetup.call(this); setTimeout(injectCasinoSelectorCard, 0); };
        const oldStartGame = Game.prototype.startGame;
        Game.prototype.startGame = function () {
            const wasCasino = this.casinoMode || this.selectedMap === CASINO_MODE;
            const wasSuperBoss = this.superBossMode || this.selectedMap === SUPER_BOSS_MODE;
            if (wasCasino) this.casinoMode = true, this.casino = freshCasinoState(), this.worldEventTimer = 999999;
            if (wasSuperBoss) this.superBossMode = true, this.casinoMode = false, this.superBoss = freshSuperBossState(), this.worldEventTimer = 999999;
            oldStartGame.call(this);
            if (wasCasino) this.casinoMode = true, this.selectedMap = CASINO_MODE, this.worldEventTimer = 999999, document.body.dataset.map = CASINO_MODE, document.body.dataset.coliseumTier = "casino";
            if (wasSuperBoss) this.superBossMode = true, this.casinoMode = false, this.selectedMap = SUPER_BOSS_MODE, this.worldEventTimer = 999999, document.body.dataset.map = SUPER_BOSS_MODE, document.body.dataset.coliseumTier = "superboss";
        };
        const oldShowMenu = Game.prototype.showMenu;
        Game.prototype.showMenu = function () { this.casinoMode = false; this.superBossMode = false; oldShowMenu.call(this); document.body.removeAttribute("data-coliseum-tier"); };
        const oldStartWave = WaveManager.prototype.startWave;
        WaveManager.prototype.startWave = function () {
            if (game?.casinoMode) {
                this.wave++; this.state = "casinoRound"; this.spawnedCount = 0; this.enemiesToSpawn = 0; this.bossSpawned = false; this.bossDefeated = false; this.miniBossSpawned = false; this.miniBossDefeated = false;
                game.boss = null; game.miniBoss = null; game.enemyManager.enemies = game.enemyManager.enemies.filter(e => !e._casinoSpecial);
                beginCasinoRound(this); return;
            }
            if (game?.superBossMode) {
                this.wave++;
                this.state = "superBossRound";
                this.spawnedCount = 0;
                this.enemiesToSpawn = 0;
                this.bossSpawned = true;
                this.bossDefeated = false;
                this.miniBossSpawned = false;
                this.miniBossDefeated = false;
                game.boss = null;
                game.miniBoss = null;
                game.enemyManager.enemies = [];
                spawnSuperBossRound();
                return;
            }
            oldStartWave.call(this);
        };
        const oldWaveUpdate = WaveManager.prototype.update;
        WaveManager.prototype.update = function () {
            if (game?.casinoMode && this.state === "casinoRound") {
                if (!game.casino.cages.length && getCasinoSpecials().length === 0) this.state = "shop", rewardCasinoRound(this), window.onWaveComplete?.(this.wave), game.showShop();
                return;
            }
            if (game?.superBossMode && this.state === "superBossRound") {
                if (!game.boss || game.boss.dead) {
                    this.state = "shop";
                    window.onWaveComplete?.(this.wave);
                    game.showShop();
                }
                return;
            }
            oldWaveUpdate.call(this);
        };
        const oldBossDefeated = WaveManager.prototype.onBossDefeated;
        WaveManager.prototype.onBossDefeated = function () {
            if (game?.casinoMode) {
                this.bossDefeated = false;
                this.totalBossesDefeated = 0;
                game.boss = null;
                return;
            }
            if (game?.superBossMode) {
                this.bossDefeated = true;
                game.boss = null;
                return;
            }
            oldBossDefeated.call(this);
        };
        const oldMiniBossDefeated = WaveManager.prototype.onMiniBossDefeated;
        WaveManager.prototype.onMiniBossDefeated = function () {
            if (game?.casinoMode) {
                this.miniBossDefeated = false;
                game.miniBoss = null;
                return;
            }
            oldMiniBossDefeated.call(this);
        };
        const oldWorldUpdate = Game.prototype.updateWorldEntities;
        Game.prototype.updateWorldEntities = function () {
            if (this.casinoMode) updateCasinoMode();
            else if (this.superBossMode) updateSuperBossMode();
            else oldWorldUpdate.call(this);
            updateDivineTotems();
        };
        const oldDrawWorld = Game.prototype.drawWorldEntities;
        Game.prototype.drawWorldEntities = function (ctx) { oldDrawWorld.call(this, ctx); if (this.casinoMode) drawCasinoObjects(ctx); drawDivineTotems(ctx); };
        const oldBackground = BackgroundSystem.prototype.draw;
        BackgroundSystem.prototype.draw = function (ctx) { oldBackground.call(this, ctx); if (game?.casinoMode) drawCasinoArena(ctx); if (game?.superBossMode) drawSuperBossArena(ctx); };
        const oldHUD = Game.prototype.updateHUD;
        Game.prototype.updateHUD = function () { oldHUD.call(this); updateCasinoHUD(); showTotemHUD(); };
        const oldDropApply = Drop.prototype.apply;
        Drop.prototype.apply = function (player) {
            if (this.type === "immortalityTotem") {
                activatePlayerTotem(player);
                game.floatingTexts.add(this.x, this.y - 20, "Totem", "#ffd166", 18, 44);
                game.particles.emitShockwave(this.x, this.y, "#ffd166");
                return;
            }
            oldDropApply.call(this, player);
        };
        const oldTryDrop = DropManager.prototype.tryDrop;
        DropManager.prototype.tryDrop = function (x, y, enemyType) {
            oldTryDrop.call(this, x, y, enemyType);
            if (game?.player?.immortalityTotem || game?.casino?.immortalityTotem) return;
            const rareChance = game?.casinoMode ? 0.075 : game?.gameMode === "coliseum" ? 0.038 : 0.022;
            const bossChance = enemyType === "boss" ? 0.45 : enemyType === "miniboss" ? 0.22 : rareChance;
            if (Math.random() < bossChance) this.drops.push(createImmortalityTotemDrop(x + rand(-24, 24), y + rand(-24, 24)));
        };
        const oldOnEnemyKill = window.onEnemyKill;
        window.onEnemyKill = function (type) {
            oldOnEnemyKill?.(type);
            if (game?.casinoMode && game.casino) {
                game.casino.combo = (game.casino.combo || 0) + 1;
                game.casino.bestCombo = Math.max(game.casino.bestCombo || 0, game.casino.combo);
                if (game.casino.jackpotGlobal > 0) playerData?.addC?.(40);
                if (game.casino.combo % 10 === 0) game.showNotification("COMBO CASINO x" + game.casino.combo, "combo");
            }
        };
        const oldPlayerDamage = Player.prototype.takeDamage;
        Player.prototype.takeDamage = function (amount) {
            if (game?.casinoMode && game.casino && !game.casino.curses.comboGuard) game.casino.combo = 0;
            if (game?.casinoMode && game.casino?.guardianAngel && amount >= this.health) {
                game.casino.guardianAngel = false; this.health = Math.max(1, this.health); this.invulnTimer = 120; game.showNotification("ANGEL GUARDIAN", "powerup"); game.particles.emitShockwave(this.x, this.y, "#fff3b0"); return;
            }
            oldPlayerDamage.call(this, amount);
        };
        const oldGameOver = Game.prototype.gameOver;
        Game.prototype.gameOver = function () {
            if (reviveWithTotem(this)) return;
            if (this.casinoMode && this.casino?.immortalityTotem && this.player) {
                this.casino.immortalityTotem = false; this.player.health = Math.max(1, Math.floor(this.player.maxHealth * 0.5)); this.player.shield = Math.floor(this.player.maxShield * 0.4); this.player.invulnTimer = 180; this.state = "playing"; this.showNotification("TOTEM DE INMORTALIDAD ACTIVADO", "powerup"); this.particles.emitShockwave(this.player.x, this.player.y, "#ffd166"); sound.play("powerup"); return;
            }
            oldGameOver.call(this);
        };
        const oldEnemyBulletUpdate = EnemyBullet.prototype.update;
        EnemyBullet.prototype.update = function () {
            if (game?.casinoMode && game.casino?.curses.taunt && game.player) {
                const a = angle(this.x, this.y, game.player.x, game.player.y), sp = Math.max(4, Math.hypot(this.vx, this.vy));
                this.vx = lerp(this.vx, Math.cos(a) * sp, 0.055); this.vy = lerp(this.vy, Math.sin(a) * sp, 0.055);
            }
            if (game?.casinoMode && game.casino?.curses.fastBullets) {
                this.vx *= 1.004;
                this.vy *= 1.004;
            }
            oldEnemyBulletUpdate.call(this);
        };
        const oldShoot = Player.prototype.shoot;
        Player.prototype.shoot = function (bm) {
            if (game?.casinoMode && game.casino?.curses.unstable && Math.random() < 0.12) {
                this.fireTimer = Math.max(3, CONFIG.fireRate); if (!this.powerups.infinite) this.ammo = Math.max(0, this.ammo - 1);
                game.particles.emit(this.x, this.y, 5, { colors: ["#ff334d", "#ffffff"], speed: 3, life: 10, size: 2, glow: true }); return;
            }
            oldShoot.call(this, bm);
        };
        const oldBossDamage = Boss.prototype.takeDamage;
        Boss.prototype.takeDamage = function (amount, ...rest) {
            if (this.dead || this.isDead || this.deathProcessed || this.dying || this.__casinoBossDamageRunning) return;
            const wasAlive = game?.casinoMode && !this.dead && this.health > 0;
            const wasSuperAlive = game?.superBossMode && this._superBoss && !this.dead && this.health > 0;
            this.__casinoBossDamageRunning = true;
            const out = oldBossDamage.call(this, amount, ...rest);
            this.__casinoBossDamageRunning = false;
            if (wasAlive && (this.dead || this.health <= 0)) handleCasinoSpecialKill(this, "boss");
            if (wasSuperAlive && (this.dead || this.health <= 0)) rewardSuperBoss(this);
            return out;
        };
        const oldMiniDamage = MiniBoss.prototype.takeDamage;
        MiniBoss.prototype.takeDamage = function (amount, ...rest) {
            if (this.dead || this.isDead || this.deathProcessed || this.dying || this.__casinoMiniDamageRunning) return;
            const wasAlive = game?.casinoMode && !this.dead && this.health > 0;
            this.__casinoMiniDamageRunning = true;
            const out = oldMiniDamage.call(this, amount, ...rest);
            this.__casinoMiniDamageRunning = false;
            if (wasAlive && (this.dead || this.health <= 0)) handleCasinoSpecialKill(this, "miniboss");
            return out;
        };
        const oldBossUpdate = Boss.prototype.update;
        Boss.prototype.update = function (player) {
            if (this._casinoConfused > 0) player = confusedTargetFor(this, player);
            oldBossUpdate.call(this, player);
            tickConfusion(this);
            if (this._superBoss && game?.casinoMode && !this.dead && this.spawnTimer <= 0) runSuperBossBrain(this);
            if (!game?.casinoMode || this.dead || this.spawnTimer > 0) return;
            if (this._casinoDealer && this.animFrame % 180 === 0) {
                randChoice([spinCasinoRoulette, spinCasinoPowerRoulette])("dealer");
                spawnEnemyBurst(["jester", "erratic", "ghost", "police"], 4, game.waveManager.wave + 2);
            }
            if (this._casinoFusion && this.animFrame % 95 === 0) {
                for (let i = 0; i < 6; i++) game.bulletManager.addEnemyBullet(this.x, this.y, (i / 6) * Math.PI * 2 + this.animFrame * 0.02, 6.5, this.damage * 0.5, "#ff00e4");
                if (this._casinoFusion === "electric_boss") game.bulletManager.addTeslaArc(this.x, this.y, angle(this.x, this.y, player.x, player.y), 18);
                if (this._casinoFusion === "bomber_supreme") game.spawnMeteorBurst?.(3, false);
            }
        };
        const oldBossDraw = Boss.prototype.draw;
        Boss.prototype.draw = function (ctx) {
            oldBossDraw.call(this, ctx);
            if (!this._superBoss) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            const pulse = 1 + Math.sin((this.animFrame || 0) * 0.06) * 0.05;
            ctx.globalAlpha = 0.34;
            ctx.strokeStyle = this.glowColor || "#ffd166";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(0, 0, (this.radius + 18) * pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = this.glowColor || "#ffd166";
            ctx.font = "bold " + Math.max(16, Math.floor(this.radius * 0.17)) + "px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("FASE " + (this.phase || 1), 0, -this.radius - 28);
            if (this._superAttack === "tornado" || this._superAttack === "tentacle") {
                ctx.strokeStyle = this.glowColor;
                ctx.lineWidth = 5;
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2 + this.animFrame * 0.05;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * this.radius * 0.4, Math.sin(a) * this.radius * 0.4);
                    ctx.quadraticCurveTo(Math.cos(a + 0.8) * this.radius * 1.35, Math.sin(a + 0.8) * this.radius * 1.35, Math.cos(a + 1.5) * this.radius * 0.9, Math.sin(a + 1.5) * this.radius * 0.9);
                    ctx.stroke();
                }
            } else if (this._superAttack === "angel" || this._superAttack === "holy") {
                ctx.fillStyle = "rgba(255,243,176,.72)";
                ctx.beginPath();
                ctx.moveTo(-this.radius * 0.35, -this.radius * 0.15);
                ctx.lineTo(-this.radius * 1.35, -this.radius * 0.65);
                ctx.lineTo(-this.radius * 0.78, this.radius * 0.35);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(this.radius * 0.35, -this.radius * 0.15);
                ctx.lineTo(this.radius * 1.35, -this.radius * 0.65);
                ctx.lineTo(this.radius * 0.78, this.radius * 0.35);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        };
        const oldEnemyUpdate = Enemy.prototype.update;
        Enemy.prototype.update = function (player) {
            if (this._casinoConfused > 0) player = confusedTargetFor(this, player);
            oldEnemyUpdate.call(this, player);
            tickConfusion(this);
        };
        const oldMiniUpdate = MiniBoss.prototype.update;
        MiniBoss.prototype.update = function (player) {
            if (this._casinoConfused > 0) player = confusedTargetFor(this, player);
            oldMiniUpdate.call(this, player);
            tickConfusion(this);
        };
        const oldEnemyDie = Enemy.prototype.die;
        Enemy.prototype.die = function (...args) {
            if (this.__casinoEnemyDieRunning) return;
            const alreadyProcessed = this.deathProcessed || this.dead || this.isDead;
            const stolen = this._casinoThief ? { key: this._stolenPower, value: this._stolenValue } : null;
            this.__casinoEnemyDieRunning = true;
            oldEnemyDie.apply(this, args);
            this.__casinoEnemyDieRunning = false;
            if (stolen && !alreadyProcessed && game?.player) {
                game.player.powerups[stolen.key] = Math.max(game.player.powerups[stolen.key] || 0, stolen.value || 360);
                if (game.casino) game.casino.stolenPower = null;
                game.showNotification("PODER RECUPERADO: " + stolen.key, "powerup");
            }
        };
        Game.prototype.__casinoColiseumPatch = true;
    }

    function installCasinoCosmetics() {
        if (window.skinSystem && !window.skinSystem.skins.some(s => s.id === "galactic_gambler_skin")) {
            window.skinSystem.skins.push({ id: "galactic_gambler_skin", name: "Apostador Galactico", rarity: "Mitica", category: "Casino", price: 1400, color: "#ffd166", accent: "#7ae582", shot: "plasma", special: "plasma_nova", cooldown: 780, desc: "Skin rara del Coliseo Casino." });
        }
        if (window.skinSystem && !window.skinSystem.skins.some(s => s.id === "divine_totem_skin")) {
            window.skinSystem.skins.push({ id: "divine_totem_skin", name: "Totem Divino", rarity: "Mitica", category: "Celestial", price: 1600, color: "#ffd166", accent: "#ffffff", shot: "divine_totem", special: "giant_totem", cooldown: 860, desc: "Dispara bolas doradas en abanico. Especial: totem con aura que confunde enemigos." });
        }
        if (window.skinSystem) patchDivineTotemSkin();
    }

    function patchDivineTotemSkin() {
        const SkinProto = Object.getPrototypeOf(window.skinSystem);
        if (!SkinProto || SkinProto.__divineTotemSkinPatch) return;
        const oldFire = SkinProto.fire;
        SkinProto.fire = function (player, bm, mult) {
            const s = this.equipped();
            if (s.id !== "divine_totem_skin") return oldFire.call(this, player, bm, mult);
            if (player.ammo <= 0 && !player.powerups.infinite) {
                player.reloading = true;
                player.reloadTimer = CONFIG.reloadTime;
                return;
            }
            player.fireTimer = Math.max(7, CONFIG.fireRate);
            if (!player.powerups.infinite) player.ammo--;
            const total = 8;
            for (let i = 0; i < total; i++) {
                const a = player.angle + (i / total) * Math.PI * 2 + rand(-0.03, 0.03);
                const ox = Math.cos(a) * 14;
                const oy = Math.sin(a) * 14;
                const orb = new PlasmaBall(player.x + ox, player.y + oy, a, 7.8, 10 * (mult || 1));
                orb.radius = 9;
                orb.color = "#ffd166";
                orb.accent = "#fff3b0";
                orb._divineOrb = true;
                orb.life = 74;
                orb.maxLife = 74;
                bm.plasmas.push(orb);
            }
            sound.play("shoot_heavy");
        };
        const oldSpecial = SkinProto.useSpecial;
        SkinProto.useSpecial = function (player) {
            const s = this.equipped();
            if (s.id !== "divine_totem_skin") return oldSpecial.call(this, player);
            if (player.skinSkillTimer > 0) {
                showNotif("Especial en recarga: " + Math.ceil(player.skinSkillTimer / 60) + "s", "error");
                return false;
            }
            player.skinSkillTimer = s.cooldown || 860;
            player.skinSkillMax = player.skinSkillTimer;
            dropGiantDivineTotem(player);
            return true;
        };
        const oldPlasmaUpdate = PlasmaBall.prototype.update;
        PlasmaBall.prototype.update = function (...args) {
            if (this._divineOrb) {
                this.animFrame++;
                this.x += this.vx;
                this.y += this.vy;
                this.life--;
                if (this.animFrame % 2 === 0) {
                    game.particles.emit(this.x, this.y, 1, { colors: ["#ffd166", "#fff3b0"], speed: 1.2, life: 9, size: 3, glow: true });
                }
                const target = allHostiles().find(t => dist(this.x, this.y, t.x, t.y) < this.radius + (t.radius || 20));
                if (target && !this._divineExploded) {
                    this._divineExploded = true;
                    explodeDivineOrb(this.x, this.y, this.damage);
                    this.life = 0;
                }
                return;
            }
            return oldPlasmaUpdate.apply(this, args);
        };
        const oldPlasmaDraw = PlasmaBall.prototype.draw;
        PlasmaBall.prototype.draw = function (ctx) {
            if (!this._divineOrb) return oldPlasmaDraw.call(this, ctx);
            const alpha = Math.min(1, this.life / 18);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.shadowColor = "#ffd166";
            ctx.shadowBlur = 24;
            ctx.fillStyle = "rgba(255,209,102,.32)";
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffd166";
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 0.42, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        };
        SkinProto.__divineTotemSkinPatch = true;
    }

    window.startCasinoColiseum = startCasinoColiseum;
    window.startSuperBossMode = startSuperBossMode;
    window.spawnSuperBossRound = spawnSuperBossRound;
    window.createSuperBoss = createSuperBoss;
    window.spawnCasinoSuperBoss = spawnCasinoSuperBoss;
    window.spawnCasinoCages = spawnCasinoCages;
    window.createCasinoCage = (x, index, total, wave) => new CasinoCage(x, index, total, wave);
    window.damageCasinoCage = damageCasinoCage;
    window.breakCasinoCage = breakCasinoCage;
    window.spawnRandomBossOrMiniBoss = spawnRandomBossOrMiniBoss;
    window.spinCasinoRoulette = spinCasinoRoulette;
    window.applyRouletteResult = applyRouletteResult;
    window.applyGoodEvent = applyGoodEvent;
    window.applyBadEvent = applyBadEvent;
    window.applySpecialPowerUp = applySpecialPowerUp;
    window.activateImmortalityTotem = () => { if (game?.casino) game.casino.immortalityTotem = true; };
    window.triggerDeathReviveIfTotemActive = () => !!(game?.casino?.immortalityTotem);
    window.updateCasinoHUD = updateCasinoHUD;

    patchCasinoMode();
    installCasinoCosmetics();
    document.addEventListener("DOMContentLoaded", () => { patchCasinoMode(); installCasinoCosmetics(); setTimeout(injectCasinoSelectorCard, 60); });
})();
