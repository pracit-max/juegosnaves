// Global boss RNG, weighted pools and anti-repetition.
(function () {
    "use strict";

    if (window.__bossSpawnRngInstalled) return;
    window.__bossSpawnRngInstalled = true;

    const DEBUG = false;
    const state = {
        seed: ((Date.now() ^ 0x9e3779b9) >>> 0) || 123456789,
        tick: 0,
        stats: Object.create(null),
        history: { mini: [], boss: [], super: [], mega: [] },
        pools: null
    };

    function rng() {
        let x = state.seed >>> 0;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        state.seed = x >>> 0;
        return (state.seed >>> 0) / 4294967296;
    }
    function chance(p) { return rng() < p; }
    function normalizeType(type) {
        if (type === "miniboss") return "mini";
        if (type === "superboss") return "super";
        return type;
    }
    function uniqueBy(arr, keyFn) {
        const out = [];
        const seen = new Set();
        for (const item of arr) {
            const key = keyFn(item);
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(item);
        }
        return out;
    }
    function desc(id, tier, label, factory, extra = {}) {
        return { id, tier, label, factory, weight: 1, ...extra };
    }

    function buildPools() {
        const mini = [
            desc("mini_ship", "mini", "MINI JEFE POLICIA", wave => new MiniBoss("mini_ship", Math.max(1, wave))),
            desc("mini_tank", "mini", "TANQUE POLICIAL", wave => new MiniBoss("mini_tank", Math.max(1, wave))),
            desc("armored_dog", "mini", "DINO BLINDADO", wave => new MiniBoss("armored_dog", Math.max(1, wave))),
            desc("mini_ninja", "mini", "RAPTOR SUPREMO", wave => new MiniBoss("mini_ninja", Math.max(1, wave))),
            desc("mini_space_dragon", "mini", "PTERODACTILO REY", wave => new MiniBoss("mini_space_dragon", Math.max(1, wave))),
            desc("mini_nuclear", "mini", "MINI REACTOR", wave => new MiniBoss("mini_nuclear", Math.max(1, wave))),
            desc("mini_bomber", "mini", "BOMBARDERO TOXICO", wave => new MiniBoss("mini_bomber", Math.max(1, wave))),
            desc("mini_mecha", "mini", "ROBOT PESADO", wave => new MiniBoss("mini_mecha", Math.max(1, wave))),
            desc("mini_heavy_ship", "mini", "NAVE ELITE", wave => new MiniBoss("mini_heavy_ship", Math.max(1, wave))),
            desc("ghost_lord", "mini", "MUTANTE RADIOACTIVO", wave => new MiniBoss("ghost_lord", Math.max(1, wave))),
            desc("splitter_boss", "mini", "CRIATURA FISION", wave => new MiniBoss("splitter_boss", Math.max(1, wave))),
            desc("mini_summoner", "mini", "INVOCADOR DEL COLISEO", wave => new MiniBoss("mini_summoner", Math.max(1, wave))),
            desc("heavy_drone_boss", "mini", "DRON PESADO", wave => new MiniBoss("heavy_drone_boss", Math.max(1, wave))),
            desc("img_eye_mini", "mini", "MINI OJO CELESTIAL", wave => window.createImageBossEntity ? window.createImageBossEntity("miniboss", Math.max(1, wave), "eye") : new MiniBoss("mini_summoner", Math.max(1, wave)), { image: true })
        ];

        const boss = [
            desc("mothership", "boss", "NAVE NODRIZA", wave => new Boss("mothership", Math.max(1, wave))),
            desc("mech_beast", "boss", "BESTIA MECHA", wave => new Boss("mech_beast", Math.max(1, wave))),
            desc("robot_colossal", "boss", "ROBOT COLOSAL", wave => new Boss("robot_colossal", Math.max(1, wave))),
            desc("electric_boss", "boss", "JEFE ELECTRICO", wave => new Boss("electric_boss", Math.max(1, wave))),
            desc("tank_giant", "boss", "TANQUE GIGANTE", wave => new Boss("tank_giant", Math.max(1, wave))),
            desc("police_commander", "boss", "COMANDANTE POLICIAL", wave => new Boss("police_commander", Math.max(1, wave))),
            desc("bomber_supreme", "boss", "BOMBARDERO SUPREMO", wave => new Boss("bomber_supreme", Math.max(1, wave))),
            desc("living_planet", "boss", "PLANETA VIVIENTE", wave => new Boss("living_planet", Math.max(1, wave))),
            desc("black_hole", "boss", "AGUJERO NEGRO", wave => new Boss("black_hole", Math.max(1, wave))),
            desc("supreme_dreadnought", "boss", "ACORAZADO SUPREMO", wave => new Boss("supreme_dreadnought", Math.max(1, wave))),
            desc("image_octopus_boss", "boss", "PULPO DEL ABISMO", wave => window.createImageBossEntity ? window.createImageBossEntity("boss", Math.max(1, wave), "octopus") : new Boss("black_hole", Math.max(1, wave)), { image: true }),
            desc("image_uriel_boss", "boss", "URIEL ANGEL SUPREMO", wave => window.createImageBossEntity ? window.createImageBossEntity("boss", Math.max(1, wave), "uriel") : new Boss("electric_boss", Math.max(1, wave)), { image: true }),
            desc("image_eye_boss", "boss", "OJO CELESTIAL", wave => window.createImageBossEntity ? window.createImageBossEntity("boss", Math.max(1, wave), "eye") : new Boss("mothership", Math.max(1, wave)), { image: true }),
            desc("image_police_boss", "boss", "NAVE POLICIAL PESADA", wave => window.createImageBossEntity ? window.createImageBossEntity("boss", Math.max(1, wave), "policeShip") : new Boss("police_commander", Math.max(1, wave)), { image: true })
        ];

        const superPool = [
            desc("super_octopus", "super", "KRAKEN DEL VACIO SUPREMO", wave => window.createImageBossEntity ? window.createImageBossEntity("superboss", Math.max(8, wave), "octopus") : new Boss("black_hole", Math.max(8, wave)), { image: true }),
            desc("super_uriel", "super", "URIEL ARCANGEL SUPREMO", wave => window.createImageBossEntity ? window.createImageBossEntity("superboss", Math.max(8, wave), "uriel") : new Boss("electric_boss", Math.max(8, wave)), { image: true }),
            desc("super_eye", "super", "OJO CELESTIAL SUPREMO", wave => window.createImageBossEntity ? window.createImageBossEntity("superboss", Math.max(8, wave), "eye") : new Boss("mothership", Math.max(8, wave)), { image: true }),
            desc("super_police_ship", "super", "MEGA NAVE POLICIAL OMEGA", wave => window.createImageBossEntity ? window.createImageBossEntity("superboss", Math.max(8, wave), "policeShip") : new Boss("police_commander", Math.max(8, wave)), { image: true }),
            desc("super_factory", "super", "SUPER JEFE ALEATORIO", wave => window.createSuperBoss ? window.createSuperBoss({ healthMult: 3.2 + Math.min(2.2, wave * 0.03), scale: 1.75 + Math.min(0.8, wave * 0.01) }) : new Boss("robot_colossal", Math.max(8, wave)))
        ];

        const megaPool = [];
        for (const spec of window.__megaBossSpecs || []) {
            megaPool.push(desc("mega_" + spec.id, "mega", spec.name, wave => window.createMegaBossEntity ? window.createMegaBossEntity(Math.max(wave, 4), spec.id) : new Boss(spec.base, Math.max(wave, 4)), { mega: true }));
        }
        for (const spec of window.__advancedBossSpecs || []) {
            megaPool.push(desc("advanced_" + spec.id, "mega", spec.name, wave => window.createAdvancedBossEntity ? window.createAdvancedBossEntity(Math.max(wave, 4), spec.id) : new Boss(spec.base, Math.max(wave, 4)), { advanced: true, meta: !!spec.meta, weight: spec.meta ? 0.8 : 1.1 }));
        }

        state.pools = {
            mini: uniqueBy(mini, item => item.id),
            boss: uniqueBy(boss, item => item.id),
            super: uniqueBy(superPool, item => item.id),
            mega: uniqueBy(megaPool, item => item.id)
        };
        window.miniBossPool = state.pools.mini.slice();
        window.bossPool = state.pools.boss.slice();
        window.superBossPool = state.pools.super.slice();
        window.megaBossPool = state.pools.mega.slice();
        return state.pools;
    }

    function ensurePools() {
        if (!state.pools || !state.pools.mega.length) return buildPools();
        return state.pools;
    }

    function getStat(id) {
        if (!state.stats[id]) state.stats[id] = { count: 0, lastSeen: -9999 };
        return state.stats[id];
    }

    function computeWeight(entry, type) {
        const hist = state.history[type] || [];
        const stat = getStat(entry.id);
        const since = Math.max(1, state.tick - stat.lastSeen);
        let w = entry.weight || 1;
        w *= 0.85 + Math.min(2.6, since * 0.09);
        w *= 1 / (1 + stat.count * 0.08);
        if (hist[hist.length - 1] === entry.id) w *= 0.001;
        else if (hist[hist.length - 2] === entry.id) w *= 0.12;
        else if (hist.slice(-5).filter(id => id === entry.id).length >= 2) w *= 0.3;
        return Math.max(0.0001, w);
    }

    function weightedPick(type, pool) {
        const entries = pool.map(entry => ({ entry, w: computeWeight(entry, type) })).filter(row => row.w > 0);
        const total = entries.reduce((sum, row) => sum + row.w, 0);
        if (!total) return pool[Math.floor(rng() * pool.length)];
        let roll = rng() * total;
        for (const row of entries) {
            roll -= row.w;
            if (roll <= 0) return row.entry;
        }
        return entries[entries.length - 1].entry;
    }

    function registerSpawn(type, entry) {
        state.tick++;
        const hist = state.history[type] || (state.history[type] = []);
        hist.push(entry.id);
        if (hist.length > 8) hist.shift();
        const stat = getStat(entry.id);
        stat.count++;
        stat.lastSeen = state.tick;
        if (DEBUG || window.__bossSpawnDebug) console.log("Boss spawn:", type, entry.label || entry.id);
    }

    function filterPool(type, options = {}) {
        const pools = ensurePools();
        let pool = (pools[normalizeType(type)] || []).slice();
        if (options.mode === "heaven" || options.mode === "eye_temple") pool = pool.filter(e => /uriel|eye|angel/i.test(e.id + " " + e.label)) || pool;
        if (options.mode === "abyss") pool = pool.filter(e => /octopus|abyss|kraken|hole/i.test(e.id + " " + e.label)) || pool;
        if (options.mode === "policeworld") pool = pool.filter(e => /police|commander|ship/i.test(e.id + " " + e.label)) || pool;
        if (options.mode === "inferno") pool = pool.filter(e => /demon|beast|bomber|infer/i.test(e.id + " " + e.label)) || pool;
        if (options.mode === "coliseum") {
            pool = pool.map(entry => {
                let weight = entry.weight || 1;
                if (/police|commander|ship|drone/i.test(entry.id + " " + entry.label)) weight *= 2.05;
                else if (/robot|mothership|electric|tank|bomber|planet|hole|dreadnought|beast|octopus|eye|uriel/i.test(entry.id + " " + entry.label)) weight *= 1.38;
                return { ...entry, weight };
            });
        }
        if (!pool.length) pool = (pools[normalizeType(type)] || []).slice();
        return pool;
    }

    function getRandomBoss(type, options = {}) {
        const norm = normalizeType(type);
        const pool = filterPool(norm, options);
        if (!pool.length) return null;
        const picked = weightedPick(norm, pool);
        registerSpawn(norm, picked);
        return picked;
    }

    function scaleEntity(entity, type, options = {}) {
        if (!entity) return entity;
        const wave = Math.max(1, options.wave || game?.waveManager?.wave || 1);
        if (type === "boss") {
            entity.maxHealth = Math.floor(entity.maxHealth * (1 + Math.min(1.6, wave * 0.028)));
            entity.health = entity.maxHealth;
        } else if (type === "mini") {
            entity.maxHealth = Math.floor(entity.maxHealth * (1 + Math.min(1.1, wave * 0.02)));
            entity.health = entity.maxHealth;
        } else if (type === "mega") {
            entity.maxHealth = Math.floor(entity.maxHealth * (1.08 + Math.min(1.4, wave * 0.02)));
            entity.health = entity.maxHealth;
        }
        return entity;
    }

    function createRandomBossEntity(type, options = {}) {
        const picked = getRandomBoss(type, options);
        if (!picked) return null;
        const wave = Math.max(1, options.wave || game?.waveManager?.wave || 1);
        const entity = picked.factory(wave, options);
        if (!entity) return null;
        scaleEntity(entity, normalizeType(type), options);
        entity._bossSpawnTier = normalizeType(type);
        entity._bossSpawnId = picked.id;
        entity._bossSpawnLabel = picked.label;
        return entity;
    }

    function getBossTierWeights(options = {}) {
        const wave = Math.max(1, options.wave || 1);
        const mode = options.mode || "play";
        let weights;
        if (wave <= 5) weights = { mini: 100, boss: 0, super: 0, mega: 0 };
        else if (wave <= 10) weights = { mini: 70, boss: 30, super: 0, mega: 0 };
        else if (wave <= 20) weights = { mini: 42, boss: 58, super: 0, mega: 0 };
        else if (wave <= 40) weights = { mini: 40, boss: 40, super: 17, mega: 3 };
        else weights = { mini: 30, boss: 35, super: 25, mega: 10 };
        if (mode === "galaxy") {
            weights = { mini: 34, boss: 31, super: 24, mega: 11 };
            if (wave > 35) weights = { mini: 28, boss: 31, super: 27, mega: 14 };
        }
        if (mode === "coliseum") {
            weights = { mini: 40, boss: 35, super: 20, mega: 5 };
            if ((options.level || 1) >= 3 || wave > 8) weights = { mini: 33, boss: 35, super: 24, mega: 8 };
        }
        if (mode === "casino") weights = { mini: 38, boss: 33, super: 21, mega: 8 };
        if (mode === "super") weights = { mini: 0, boss: 0, super: 78, mega: 22 };
        return weights;
    }

    function rollTier(options = {}) {
        const requested = normalizeType(options.requested || "");
        if (requested === "mini" || requested === "boss" || requested === "super" || requested === "mega") return requested;
        const weights = getBossTierWeights(options);
        const entries = Object.entries(weights).filter(([, v]) => v > 0);
        const total = entries.reduce((sum, [, v]) => sum + v, 0);
        let roll = rng() * total;
        for (const [key, value] of entries) {
            roll -= value;
            if (roll <= 0) return key;
        }
        return entries[entries.length - 1][0];
    }

    function getBossEncounterPlan(options = {}) {
        const wave = Math.max(1, options.wave || 1);
        const mode = options.mode || "play";
        const level = options.level || 1;
        let count = mode === "coliseum" ? Math.max(1, Math.min(3, level)) : 1;
        if (mode === "casino") count = 1 + (chance(0.18) ? 1 : 0);
        if (mode === "super") count = 1;
        if (mode !== "coliseum" && wave >= 20 && chance(0.18)) count++;
        if (mode !== "coliseum" && wave >= 36 && chance(0.1)) count++;
        const plan = [];
        for (let i = 0; i < count; i++) {
            let tier = rollTier({ wave, mode, level });
            if (i === 0 && mode === "play" && wave >= 10 && tier === "mini") tier = "boss";
            if (mode === "coliseum" && level === 1 && tier === "mega") tier = chance(0.55) ? "boss" : "super";
            if (mode === "coliseum" && level === 1 && i > 0) tier = "mini";
            plan.push(tier);
        }
        return plan;
    }

    function spawnExtraEntities(mainTier, wave, mode) {
        if (!game?.enemyManager) return;
        const activeCount = [game.boss, game.miniBoss, ...(game.enemyManager.enemies || [])].filter(e => e && !e.dead && (e instanceof Boss || e instanceof MiniBoss || e._superBoss || e.megaBoss || e.advancedBoss)).length;
        if (activeCount > 5) return;
        if (wave < 20 || !chance(mode === "galaxy" ? 0.22 : 0.14)) return;
        const extras = mainTier === "mini" ? ["mini"] : chance(0.58) ? ["mini", "mini"] : [chance(0.7) ? "mini" : "boss"];
        for (const tier of extras.slice(0, 3)) {
            const extra = createRandomBossEntity(tier, { wave: Math.max(1, wave - 1), mode, requested: tier });
            if (!extra) continue;
            extra.x = rand(140, CONFIG.canvasWidth - 140);
            extra.y = -80 - rand(0, 120);
            extra.spawnTimer = Math.max(extra.spawnTimer || 0, 45);
            if (tier === "mini" && (!game.miniBoss || game.miniBoss.dead)) game.miniBoss = extra;
            else game.enemyManager.enemies.push(extra);
        }
    }

    function patchWaveSpawns() {
        if (typeof WaveManager === "undefined" || WaveManager.prototype.__bossRngPatch) return;
        const oldSpawnBoss = WaveManager.prototype.spawnBoss;
        WaveManager.prototype.spawnBoss = function () {
            if (game?.gameMode === "coliseum" || game?.casinoMode || game?.superBossMode) return oldSpawnBoss.call(this);
            const mode = (game?.selectedMap || "galaxy") === "galaxy" ? "galaxy" : "play";
            const tier = rollTier({ wave: this.wave, mode, requested: this.wave >= 40 && chance(0.08) ? "mega" : this.wave >= 22 && chance(0.22) ? "super" : "boss" });
            const entity = createRandomBossEntity(tier, { wave: this.wave, mode });
            if (!entity) return oldSpawnBoss.call(this);
            entity.spawnTimer = Math.max(entity.spawnTimer || 0, 80);
            game.boss = entity;
            game.showBossBar(entity);
            game.showNotification((tier === "mega" ? "MEGA JEFE: " : tier === "super" ? "SUPER JEFE: " : "JEFE: ") + entity.name, "boss");
            sound?.play?.("boss_alert");
            spawnExtraEntities(tier, this.wave, mode);
        };

        const oldSpawnMini = WaveManager.prototype.spawnMiniBoss;
        WaveManager.prototype.spawnMiniBoss = function () {
            if (game?.gameMode === "coliseum" || game?.casinoMode || game?.superBossMode) return oldSpawnMini.call(this);
            const mode = (game?.selectedMap || "galaxy") === "galaxy" ? "galaxy" : "play";
            const entity = createRandomBossEntity("mini", { wave: this.wave, mode });
            if (!entity) return oldSpawnMini.call(this);
            entity.spawnTimer = Math.max(entity.spawnTimer || 0, 60);
            this.miniBoss = entity;
            game.miniBoss = entity;
            game.showBossBar(entity);
            game.showNotification("MINI JEFE: " + entity.name, "boss");
            sound?.play?.("boss_alert");
            if (this.wave >= 24 && chance(mode === "galaxy" ? 0.16 : 0.1)) spawnExtraEntities("mini", this.wave, mode);
        };
        WaveManager.prototype.__bossRngPatch = true;
    }

    window.getRandomBoss = getRandomBoss;
    window.createRandomBossEntity = createRandomBossEntity;
    window.rollBossTier = rollTier;
    window.getBossEncounterPlan = getBossEncounterPlan;
    window.getBossTierWeights = getBossTierWeights;
    window.__bossSpawnRngState = state;

    buildPools();
    patchWaveSpawns();
})();
