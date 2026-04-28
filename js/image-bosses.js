// Jefes y enemigos creados desde img/pulpo.png, img/uriel.png, img/ojo.png, img/navepoli.png.
(function () {
    if (window.__imageBossesInstalled) return;
    window.__imageBossesInstalled = true;

    const IMG = {
        octopus: loadImage("img/pulpo.png"),
        uriel: loadImage("img/uriel.png"),
        eye: loadImage("img/ojo.png"),
        policeShip: loadImage("img/navepoli.png"),
    };
    const BOSS_KEYS = ["octopus", "uriel", "eye", "policeShip"];
    const MINI_TYPES = ["img_eye_mini"];
    const DERIVED_ENEMIES = ["mini_octopus", "octo_tentacle", "small_angel", "floating_eye", "police_drone_img", "police_car_img"];

    function loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    function alive(e) {
        return e && !e.dead && !e.isDead && !e.deathProcessed;
    }

    function hostiles() {
        return [...(game?.enemyManager?.enemies || []), game?.boss, game?.miniBoss].filter(alive);
    }

    function safeDamage(target, amount) {
        if (alive(target) && typeof target.takeDamage === "function") target.takeDamage(amount);
    }

    function randomSpawnPoint() {
        const side = randInt(0, 3), m = 80;
        return {
            x: side === 1 ? CONFIG.canvasWidth + m : side === 3 ? -m : rand(m, CONFIG.canvasWidth - m),
            y: side === 0 ? -m : side === 2 ? CONFIG.canvasHeight + m : rand(m, CONFIG.canvasHeight - m),
        };
    }

    function currentMapTheme() {
        const id = game?.selectedMap || "galaxy";
        if (id === "heaven") return { enemies: ["small_angel", "floating_eye"], bosses: ["uriel", "eye"], mini: ["eye"] };
        if (id === "abyss") return { enemies: ["mini_octopus", "octo_tentacle"], bosses: ["octopus"], mini: ["eye"] };
        if (id === "policeworld") return { enemies: ["police_drone_img", "police_car_img"], bosses: ["policeShip"], mini: ["eye"] };
        if (id === "eye_temple") return { enemies: ["floating_eye", "small_angel"], bosses: ["eye", "uriel"], mini: ["eye"] };
        if (id === "storm_palace") return { enemies: ["small_angel", "police_drone_img", "floating_eye"], bosses: ["uriel", "policeShip", "eye"], mini: ["eye"] };
        return null;
    }

    function imageMeta(key, variant) {
        const superMode = variant === "superboss";
        const bossMode = variant === "boss" || superMode;
        const table = {
            octopus: {
                base: "black_hole", img: IMG.octopus, name: superMode ? "KRAKEN DEL VACIO SUPREMO" : "PULPO DEL ABISMO",
                color: "#5b21b6", glow: "#7df9ff", attack: "octopus", radius: superMode ? 130 : 72, hp: superMode ? 6.5 : 2.4,
            },
            uriel: {
                base: "electric_boss", img: IMG.uriel, name: superMode ? "URIEL ARCANGEL SUPREMO" : "URIEL ANGEL SUPREMO",
                color: "#fff3b0", glow: "#ffd166", attack: "uriel", radius: superMode ? 122 : 68, hp: superMode ? 6.2 : 2.3, revive: true,
            },
            eye: {
                base: variant === "mini" ? "mini_summoner" : "mothership", img: IMG.eye, name: superMode ? "OJO CELESTIAL SUPREMO" : variant === "mini" ? "MINI OJO CELESTIAL" : "OJO CELESTIAL",
                color: "#f8fafc", glow: "#38bdf8", attack: "eye", radius: superMode ? 112 : variant === "mini" ? 38 : 62, hp: superMode ? 4.8 : variant === "mini" ? 1.2 : 2.0, revive: variant !== "mini",
            },
            policeShip: {
                base: "police_commander", img: IMG.policeShip, name: superMode ? "MEGA NAVE POLICIAL OMEGA" : "NAVE POLICIAL PESADA",
                color: "#003b8f", glow: "#38bdf8", attack: "policeShip", radius: superMode ? 126 : 70, hp: superMode ? 6.0 : 2.2,
            },
        };
        return table[key] || table.octopus;
    }

    function createImageBossEntity(kind = "boss", wave = 1, forcedKey) {
        const variant = kind === "miniboss" ? "mini" : kind === "superboss" ? "superboss" : "boss";
        const key = forcedKey || (variant === "mini" ? "eye" : randChoice(BOSS_KEYS));
        const meta = imageMeta(key, variant);
        const entity = variant === "mini" ? new MiniBoss(meta.base, wave) : new Boss(meta.base, wave);
        entity._imageBoss = true;
        entity._imageBossKey = key;
        entity._imageBossAttack = meta.attack;
        entity._imageBossVariant = variant;
        entity._imageBossImg = meta.img;
        entity._imageRevive = !!meta.revive;
        entity._imageRevived = false;
        entity._imageAttackTimer = randInt(60, 120);
        entity._imageSummonTimer = randInt(150, 260);
        entity._imageHazards = [];
        entity._superBoss = variant === "superboss";
        entity.name = meta.name;
        entity.color = meta.color;
        entity.glowColor = meta.glow;
        entity.radius = meta.radius;
        entity.maxHealth = Math.floor(entity.maxHealth * meta.hp);
        entity.health = entity.maxHealth;
        entity.damage = Math.floor(entity.damage * (variant === "superboss" ? 1.25 : 0.95));
        entity.speed = Math.max(0.55, entity.speed * (variant === "superboss" ? 0.48 : 0.75));
        entity.score = Math.floor(entity.score * (variant === "superboss" ? 5 : variant === "mini" ? 1.4 : 2.2));
        entity.spawnTimer = variant === "mini" ? 60 : 110;
        return entity;
    }

    function spawnDerived(type, x, y, wave) {
        const base = type === "police_car_img" ? "police" : type === "police_drone_img" ? "scout_ship" : type === "octo_tentacle" ? "slime" : "flyer";
        const e = new Enemy(x, y, base, wave);
        e._imageEnemy = true;
        e._imageEnemyType = type;
        e._imageKey = type.includes("octo") ? "octopus" : type.includes("angel") ? "uriel" : type.includes("eye") ? "eye" : "policeShip";
        e._imageImg = IMG[e._imageKey];
        e.name = type === "mini_octopus" ? "MINI PULPO"
            : type === "octo_tentacle" ? "TENTACULO"
            : type === "small_angel" ? "ANGEL MENOR"
            : type === "floating_eye" ? "OJO FLOTANTE"
            : type === "police_drone_img" ? "DRON POLICIAL"
            : "CARRO POLICIAL";
        e.radius = type === "octo_tentacle" ? 24 : type === "police_car_img" ? 26 : 20;
        e.maxHealth = Math.floor((e.maxHealth || e.health || 30) * (type === "octo_tentacle" ? 1.8 : 1.1));
        e.health = e.maxHealth;
        e.damage = Math.floor((e.damage || 10) * (type === "small_angel" ? 0.8 : 1));
        e.speed = type === "octo_tentacle" ? 0.8 : type === "police_car_img" ? Math.max(2.8, e.speed || 2.2) : Math.max(2.1, e.speed || 2.2);
        e.score = Math.floor((e.score || 25) * 1.4);
        return e;
    }

    function imageBossAttack(entity, player) {
        if (!alive(entity) || entity.spawnTimer > 0) return;
        entity._imageAttackTimer--;
        entity._imageSummonTimer--;
        updateImageHazards(entity, player);
        const hp = entity.health / entity.maxHealth;
        const targetPhase = hp < 0.16 ? 4 : hp < 0.36 ? 3 : hp < 0.67 ? 2 : 1;
        if (targetPhase > entity.phase) {
            entity.phase = targetPhase;
            entity.invulnTimer = Math.max(entity.invulnTimer || 0, 35);
            game.particles.emitShockwave(entity.x, entity.y, entity.glowColor);
            game.showNotification(entity.name + " FASE " + entity.phase, "boss");
        }
        if (entity._imageAttackTimer <= 0) {
            entity._imageAttackTimer = Math.max(34, randInt(95, 150) - entity.phase * 14);
            runImagePattern(entity, player);
        }
        if (entity._imageSummonTimer <= 0) {
            entity._imageSummonTimer = Math.max(120, randInt(220, 340) - entity.phase * 28);
            summonImageAdds(entity);
        }
    }

    function runImagePattern(e, player) {
        const a = angle(e.x, e.y, player.x, player.y);
        if (e._imageBossAttack === "octopus") {
            for (let i = 0; i < 4 + e.phase; i++) spawnHazard(e, "tentacle", player.x + rand(-230, 230), player.y + rand(-180, 180));
            if (e.phase >= 2) spawnHazard(e, e.phase >= 4 ? "giant_blackhole" : "blackhole", rand(150, CONFIG.canvasWidth - 150), rand(120, CONFIG.canvasHeight - 120));
            if (e.phase >= 3) for (let i = 0; i < 3; i++) addImageEnemy("mini_octopus", e.x + rand(-80, 80), e.y + rand(-80, 80));
            for (let i = -2; i <= 2; i++) game.bulletManager.addEnemyBullet(e.x, e.y, a + i * 0.22, 5, e.damage * 0.35, "#18021f");
            if (game.casino) game.casino.curses.darkness = Math.max(game.casino.curses.darkness || 0, 260);
        } else if (e._imageBossAttack === "uriel") {
            e.invulnTimer = Math.max(e.invulnTimer || 0, e.phase >= 2 ? 24 : 0);
            for (let i = 0; i < 5 + e.phase * 2; i++) celestialStrike(rand(80, CONFIG.canvasWidth - 80), rand(80, CONFIG.canvasHeight - 80), e.damage * 0.42);
            for (let i = -2; i <= 2; i++) game.bulletManager.addEnemyBullet(e.x, e.y, a + i * 0.13, 7.5, e.damage * 0.38, "#ffd166");
            if (e.phase >= 3) for (let i = 0; i < 2; i++) addImageEnemy("small_angel", e.x + rand(-90, 90), e.y + rand(-90, 90));
        } else if (e._imageBossAttack === "eye") {
            for (let i = 0; i < 8 + e.phase * 3; i++) {
                const sideA = (i / (8 + e.phase * 3)) * Math.PI * 2;
                game.bulletManager.addEnemyBullet(e.x + Math.cos(sideA) * e.radius, e.y + Math.sin(sideA) * e.radius, sideA, 5.8, e.damage * 0.32, "#fff3b0");
            }
            for (let i = 0; i < e.phase + 1; i++) celestialStrike(randChoice([30, CONFIG.canvasWidth - 30, rand(80, CONFIG.canvasWidth - 80)]), randChoice([30, CONFIG.canvasHeight - 30, rand(80, CONFIG.canvasHeight - 80)]), e.damage * 0.32);
            if (e.phase >= 2) e.invulnTimer = Math.max(e.invulnTimer || 0, 15);
            if (e.phase >= 3) addImageEnemy("small_angel", e.x + rand(-90, 90), e.y + rand(-90, 90));
        } else if (e._imageBossAttack === "policeShip") {
            for (let i = -3; i <= 3; i++) game.bulletManager.addEnemyBullet(e.x, e.y, a + i * 0.12, 8.5, e.damage * 0.35, "#38bdf8");
            if (e.phase >= 2) for (let i = 0; i < 3; i++) addImageEnemy(randChoice(["police_drone_img", "police_car_img", "police"]), e.x + rand(-110, 110), e.y + rand(-80, 90));
            if (e.phase >= 3) for (let i = 0; i < 4; i++) game.bulletManager.addHoming(e.x, e.y, a + rand(-0.35, 0.35), 5.5, e.damage * 0.42);
            if (e.phase >= 4) for (let i = 0; i < 12; i++) game.bulletManager.addEnemyBullet(e.x, e.y, (i / 12) * Math.PI * 2, 6.5, e.damage * 0.28, "#0ea5e9");
        }
    }

    function spawnHazard(owner, type, x, y) {
        owner._imageHazards ||= [];
        if (owner._imageHazards.length > 10) owner._imageHazards.shift();
        owner._imageHazards.push({ type, x: clamp(x, 60, CONFIG.canvasWidth - 60), y: clamp(y, 60, CONFIG.canvasHeight - 60), life: type === "giant_blackhole" ? 420 : 240, radius: type === "tentacle" ? 44 : type === "giant_blackhole" ? 170 : 95, pulse: 0 });
    }

    function updateImageHazards(owner, player) {
        owner._imageHazards ||= [];
        for (let i = owner._imageHazards.length - 1; i >= 0; i--) {
            const h = owner._imageHazards[i];
            h.life--; h.pulse += 0.1;
            if (h.type.includes("blackhole")) {
                const pull = h.type === "giant_blackhole" ? 0.075 : 0.045;
                for (const t of [player, ...hostiles()]) {
                    if (!t || t === owner || !alive(t) && t !== player) continue;
                    const d = dist(h.x, h.y, t.x, t.y);
                    if (d < h.radius + (t.radius || 20)) {
                        const a = angle(t.x, t.y, h.x, h.y);
                        t.vx = (t.vx || 0) + Math.cos(a) * pull * Math.max(20, h.radius - d);
                        t.vy = (t.vy || 0) + Math.sin(a) * pull * Math.max(20, h.radius - d);
                        if (t === player && game.frame % 35 === 0) t.takeDamage(h.type === "giant_blackhole" ? 8 : 4);
                        else if (t !== player && game.frame % 45 === 0) safeDamage(t, h.type === "giant_blackhole" ? 18 : 8);
                    }
                }
            } else if (h.type === "tentacle") {
                if (dist(h.x, h.y, player.x, player.y) < h.radius + player.radius && game.frame % 28 === 0) player.takeDamage(owner.damage * 0.26);
            }
            if (h.life <= 0) owner._imageHazards.splice(i, 1);
        }
    }

    function drawImageHazards(ctx, owner) {
        for (const h of owner._imageHazards || []) {
            ctx.save();
            ctx.translate(h.x, h.y);
            if (h.type.includes("blackhole")) {
                ctx.rotate((game.frame || 0) * 0.06);
                ctx.fillStyle = h.type === "giant_blackhole" ? "rgba(0,0,0,.86)" : "rgba(20,0,35,.78)";
                ctx.strokeStyle = "#7df9ff";
                ctx.lineWidth = 5;
                ctx.beginPath(); ctx.arc(0, 0, h.radius + Math.sin(h.pulse) * 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else {
                ctx.strokeStyle = "#b388ff";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(0, 40);
                ctx.bezierCurveTo(-25, -20, 25, -55, Math.sin(h.pulse) * 28, -95);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function celestialStrike(x, y, damage) {
        game.particles.emitShockwave(x, y, "#ffd166");
        game.bulletManager.addEnemyBullet(x, 20, Math.PI / 2, 9, damage, "#ffd166");
        if (game.player && dist(x, y, game.player.x, game.player.y) < 75) game.player.takeDamage(damage);
    }

    function addImageEnemy(type, x, y) {
        if (!game?.enemyManager || game.enemyManager.enemies.filter(e => e._imageEnemy && !e.dead).length > 18) return;
        const p = x == null ? randomSpawnPoint() : { x, y };
        game.enemyManager.enemies.push(spawnDerived(type, p.x, p.y, Math.max(1, game.waveManager?.wave || 1)));
    }

    function summonImageAdds(e) {
        const map = e._imageBossAttack === "octopus" ? ["mini_octopus", "octo_tentacle"]
            : e._imageBossAttack === "uriel" ? ["small_angel", "floating_eye"]
            : e._imageBossAttack === "eye" ? ["floating_eye", "small_angel"]
            : ["police_drone_img", "police_car_img", "police"];
        const count = Math.min(e.phase + 1, 5);
        for (let i = 0; i < count; i++) addImageEnemy(randChoice(map), e.x + rand(-140, 140), e.y + rand(-120, 120));
    }

    function spawnAllyAngel(x, y) {
        game.imageAllies ||= [];
        game.imageAllies.push({ x, y, timer: 900, fire: 20, heal: 0 });
        game.showNotification("ALIADO ANGEL INVOCADO", "powerup");
    }

    function updateImageAllies() {
        if (!game?.imageAllies) return;
        for (let i = game.imageAllies.length - 1; i >= 0; i--) {
            const a = game.imageAllies[i];
            a.timer--; a.fire--; a.heal--;
            if (game.player) {
                a.x += (game.player.x + 90 - a.x) * 0.025;
                a.y += (game.player.y - 80 - a.y) * 0.025;
                if (a.heal <= 0 && game.player.health < game.player.maxHealth) {
                    a.heal = 90;
                    game.player.heal?.(4);
                }
            }
            const target = hostiles().filter(t => !t._imageAlly).sort((m, n) => dist(a.x, a.y, m.x, m.y) - dist(a.x, a.y, n.x, n.y))[0];
            if (target && a.fire <= 0) {
                a.fire = 34;
                game.bulletManager.lasers.push(new Laser(a.x, a.y, angle(a.x, a.y, target.x, target.y), 7, 5));
                safeDamage(target, 16);
            }
            if (a.timer <= 0) game.imageAllies.splice(i, 1);
        }
    }

    function drawImageAllies(ctx) {
        if (!game?.imageAllies) return;
        for (const a of game.imageAllies) {
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.shadowColor = "#ffd166"; ctx.shadowBlur = 18;
            ctx.drawImage(IMG.uriel, -22, -30, 44, 60);
            ctx.restore();
        }
    }

    function patchImageBosses() {
        if (typeof Boss === "undefined" || Boss.prototype.__imageBossPatch) return;

        const oldEnemySpawn = EnemyManager.prototype.spawnEnemy;
        EnemyManager.prototype.spawnEnemy = function (type, x, y, wave) {
            if (DERIVED_ENEMIES.includes(type)) {
                this.enemies.push(spawnDerived(type, x, y, wave));
                return;
            }
            oldEnemySpawn.call(this, type, x, y, wave);
        };

        const oldBossUpdate = Boss.prototype.update;
        Boss.prototype.update = function (player) {
            oldBossUpdate.call(this, player);
            if (this._imageBoss) imageBossAttack(this, player);
        };

        const oldMiniUpdate = MiniBoss.prototype.update;
        MiniBoss.prototype.update = function (player) {
            oldMiniUpdate.call(this, player);
            if (this._imageBoss) imageBossAttack(this, player);
        };

        const oldEnemyUpdate = Enemy.prototype.update;
        Enemy.prototype.update = function (player) {
            oldEnemyUpdate.call(this, player);
            if (!this._imageEnemy || !player || this.dead) return;
            const imageType = this._imageEnemyType;
            if (imageType === "octo_tentacle") {
                this.vx *= 0.7; this.vy *= 0.7;
                if (dist(this.x, this.y, player.x, player.y) < this.radius + player.radius + 16 && game.frame % 30 === 0) player.takeDamage(this.damage * 0.7);
            } else if (imageType === "mini_octopus") {
                if (game.frame % 90 === 0) game.bulletManager.addEnemyBullet(this.x, this.y, angle(this.x, this.y, player.x, player.y), 5, this.damage * 0.55, "#18021f");
                if (dist(this.x, this.y, player.x, player.y) < 180) {
                    const a = angle(player.x, player.y, this.x, this.y);
                    player.vx += Math.cos(a) * 0.35;
                    player.vy += Math.sin(a) * 0.35;
                }
            } else if (imageType === "small_angel") {
                if (game.frame % 75 === 0) celestialStrike(player.x + rand(-90, 90), player.y + rand(-90, 90), this.damage * 0.6);
            } else if (imageType === "floating_eye") {
                if (game.frame % 65 === 0) for (let i = -1; i <= 1; i++) game.bulletManager.addEnemyBullet(this.x, this.y, angle(this.x, this.y, player.x, player.y) + i * 0.18, 6, this.damage * 0.55, "#fff3b0");
            } else if (imageType === "police_drone_img" || imageType === "police_car_img") {
                if (game.frame % 80 === 0) game.bulletManager.addEnemyBullet(this.x, this.y, angle(this.x, this.y, player.x, player.y), 7.5, this.damage * 0.65, "#38bdf8");
            }
        };

        const oldBossDie = Boss.prototype.die;
        Boss.prototype.die = function () {
            if (this._imageBoss && this._imageRevive && !this._imageRevived) {
                this._imageRevived = true;
                this.dead = false;
                this.isDead = false;
                this.dying = false;
                this.deathProcessed = false;
                this.health = Math.max(1, Math.floor(this.maxHealth * (this._imageBossKey === "eye" ? 0.38 : 0.5)));
                this.phase = Math.max(this.phase || 1, 3);
                this.spawnTimer = 0;
                this.invulnTimer = 150;
                game.particles.emitShockwave(this.x, this.y, this.glowColor || "#ffd166");
                game.showNotification(this.name + " REVIVE", "boss");
                return;
            }
            const wasImage = this._imageBoss && !this.deathProcessed;
            const wasEye = this._imageBossKey === "eye";
            oldBossDie.call(this);
            if (wasImage) {
                playerData?.addC?.(this._imageBossVariant === "superboss" ? 850 : 360);
                playerData?.addBPXP?.(this._imageBossVariant === "superboss" ? 420 : 160);
                if (wasEye) spawnAllyAngel(this.x, this.y);
            }
        };

        const oldMiniDie = MiniBoss.prototype.die;
        MiniBoss.prototype.die = function () {
            const wasEye = this._imageBossKey === "eye" && !this.deathProcessed;
            oldMiniDie.call(this);
            if (wasEye) spawnAllyAngel(this.x, this.y);
        };

        const oldBossDraw = Boss.prototype.draw;
        Boss.prototype.draw = function (ctx) {
            oldBossDraw.call(this, ctx);
            if (!this._imageBoss) return;
            drawImageHazards(ctx, this);
            drawImageEntity(ctx, this, this._imageBossVariant === "superboss" ? 2.3 : 1.75);
        };

        const oldMiniDraw = MiniBoss.prototype.draw;
        MiniBoss.prototype.draw = function (ctx) {
            oldMiniDraw.call(this, ctx);
            if (this._imageBoss) drawImageEntity(ctx, this, 1.45);
        };

        const oldEnemyDraw = Enemy.prototype.draw;
        Enemy.prototype.draw = function (ctx) {
            oldEnemyDraw.call(this, ctx);
            if (this._imageEnemy) drawImageEntity(ctx, this, this._imageEnemyType === "police_car_img" ? 1.7 : 1.25);
        };

        const oldWorldUpdate = Game.prototype.updateWorldEntities;
        Game.prototype.updateWorldEntities = function () {
            oldWorldUpdate.call(this);
            updateImageAllies();
            if (this.gameMode !== "coliseum" && !this.casinoMode && !this.superBossMode && this.waveManager?.wave >= 10 && this.frame % 1200 === 0 && Math.random() < 0.35 && !this.boss && !this.miniBoss) {
                this.boss = createImageBossEntity(this.waveManager.wave >= 18 ? "superboss" : "boss", this.waveManager.wave);
                this.showBossBar(this.boss);
            }
        };

        const oldDrawWorld = Game.prototype.drawWorldEntities;
        Game.prototype.drawWorldEntities = function (ctx) {
            oldDrawWorld.call(this, ctx);
            drawImageAllies(ctx);
        };

        const oldSpawnBoss = WaveManager.prototype.spawnBoss;
        WaveManager.prototype.spawnBoss = function () {
            const theme = currentMapTheme();
            const forcedKey = theme?.bosses?.length ? randChoice(theme.bosses) : null;
            const chance = theme ? 0.92 : 0.5;
            if (Math.random() < chance) {
                game.boss = createImageBossEntity(this.wave >= 18 && Math.random() < 0.3 ? "superboss" : "boss", this.wave, forcedKey);
                this.bossSpawned = true;
                game.showBossBar(game.boss);
                return;
            }
            oldSpawnBoss.call(this);
        };

        const oldSpawnMini = WaveManager.prototype.spawnMiniBoss;
        WaveManager.prototype.spawnMiniBoss = function () {
            const theme = currentMapTheme();
            const forcedKey = theme?.mini?.length ? randChoice(theme.mini) : "eye";
            const chance = theme ? 0.88 : 0.45;
            if (Math.random() < chance) {
                game.miniBoss = createImageBossEntity("miniboss", this.wave, forcedKey);
                this.miniBossSpawned = true;
                game.showBossBar(game.miniBoss);
                return;
            }
            oldSpawnMini.call(this);
        };

        const oldEnemyKillHook = window.onEnemyKill;
        window.onEnemyKill = function (type) {
            oldEnemyKillHook?.(type);
            if (!window.game) return;
            if (type === "boss") game.shopBonusChoices = Math.min(3, (game.shopBonusChoices || 0) + 2);
            else if (type === "miniboss") game.shopBonusChoices = Math.min(3, (game.shopBonusChoices || 0) + 1);
        };

        const oldShowShop = Game.prototype.showShop;
        Game.prototype.showShop = function () {
            if (!this.player) return oldShowShop.call(this);
            this.state = "shop";
            const shopOptions = document.getElementById("shopOptions");
            if (!shopOptions) return oldShowShop.call(this);
            shopOptions.innerHTML = "";

            const upgrades = [
                { icon: "H", name: "Vida Max +25", desc: "Mas vida total y curacion inmediata.", action: () => { this.player.maxHealth += 25; this.player.health += 25; } },
                { icon: "S", name: "Escudo +20", desc: "Mas escudo maximo y recarga inicial.", action: () => { this.player.maxShield += 20; this.player.addShield(20); } },
                { icon: "V", name: "Velocidad +12%", desc: "Movimiento mas rapido.", action: () => { this.player.speed *= 1.12; } },
                { icon: "D", name: "Daño Brutal", desc: "Activa dano extra por mas tiempo.", action: () => { this.player.powerups.damage = Math.max(this.player.powerups.damage || 0, 900); } },
                { icon: "R", name: "Cadencia Total", desc: "Reduce el tiempo entre disparos.", action: () => { CONFIG.fireRate = Math.max(2, CONFIG.fireRate - 2); this.player.powerups.rapid = Math.max(this.player.powerups.rapid || 0, 780); } },
                { icon: "A", name: "Municion +10", desc: "Mas capacidad total de municion.", action: () => { this.player.maxAmmo += 10; this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + 10); } },
                { icon: "M", name: "Magneto Largo", desc: "Recoge drops desde mas lejos.", action: () => { this.player.powerups.magnet = Math.max(this.player.powerups.magnet || 0, 960); } },
                { icon: "P", name: "Perforacion", desc: "Tus disparos atraviesan enemigos.", action: () => { this.player.powerups.pierce = Math.max(this.player.powerups.pierce || 0, 840); } },
                { icon: "E", name: "Explosivo", desc: "Las balas revientan al impactar.", action: () => { this.player.powerups.explosive = Math.max(this.player.powerups.explosive || 0, 840); } },
                { icon: "F", name: "Congelacion", desc: "Ralentiza enemigos con disparos.", action: () => { this.player.powerups.freeze = Math.max(this.player.powerups.freeze || 0, 840); } },
                { icon: "G", name: "Regen", desc: "Regeneracion de vida constante.", action: () => { this.player.powerups.regen = Math.max(this.player.powerups.regen || 0, 960); } },
                { icon: "B", name: "Regen Escudo", desc: "El escudo vuelve con el tiempo.", action: () => { this.player.powerups.shieldRegen = Math.max(this.player.powerups.shieldRegen || 0, 960); } },
                { icon: "O", name: "Onda Masiva", desc: "Sube el dano de choque y area.", action: () => { this.player.powerups.massive = Math.max(this.player.powerups.massive || 0, 840); } },
                { icon: "I", name: "Invulnerable", desc: "Invulnerabilidad corta al volver.", action: () => { this.player.powerups.god = Math.max(this.player.powerups.god || 0, 420); this.player.invulnTimer = Math.max(this.player.invulnTimer || 0, 240); } },
                { icon: "T", name: "Tesla", desc: "Cambia a arma Tesla.", action: () => { this.player.weaponType = "tesla"; } },
                { icon: "L", name: "Laser", desc: "Cambia a arma Laser.", action: () => { this.player.weaponType = "laser"; } },
                { icon: "N", name: "Nuclear", desc: "Cambia a arma Nuclear.", action: () => { this.player.weaponType = "nuclear"; } },
                { icon: "Q", name: "Railgun", desc: "Cambia a arma Railgun.", action: () => { this.player.weaponType = "railgun"; } },
                { icon: "X", name: "XP y Monedas", desc: "Premio directo por la ronda.", action: () => { playerData?.addC?.(140 + this.waveManager.wave * 12); playerData?.addBPXP?.(55 + this.waveManager.wave * 8); } },
                { icon: "C", name: "Critico Vampiro", desc: "Dano alto y curacion al matar.", action: () => { this.player.powerups.vampire = Math.max(this.player.powerups.vampire || 0, 900); this.player.powerups.damage = Math.max(this.player.powerups.damage || 0, 780); } },
                { icon: "Y", name: "Tiempo Lento", desc: "Frena el campo por un rato.", action: () => { this.player.powerups.slowmotion = Math.max(this.player.powerups.slowmotion || 0, 780); } },
                { icon: "U", name: "Caos Controlado", desc: "Mejora multiple temporal.", action: () => { this.player.powerups.overload = Math.max(this.player.powerups.overload || 0, 780); this.player.powerups.chainLightning = Math.max(this.player.powerups.chainLightning || 0, 780); } },
                { icon: "K", name: "Dash Corto", desc: "Baja bastante el cooldown del dash.", action: () => { CONFIG.dashCooldown = Math.max(45, CONFIG.dashCooldown - 18); } },
                { icon: "J", name: "Skill Rapida", desc: "Baja el cooldown de la habilidad.", action: () => { CONFIG.skillCooldown = Math.max(260, CONFIG.skillCooldown - 40); } },
            ];

            const count = Math.min(6, 4 + Math.min(2, this.shopBonusChoices || 0));
            const selected = [];
            while (selected.length < count && selected.length < upgrades.length) {
                const u = randChoice(upgrades);
                if (!selected.includes(u)) selected.push(u);
            }

            for (const u of selected) {
                const div = document.createElement("div");
                div.className = "shopOption";
                div.innerHTML = `<div class="shopIcon">${u.icon}</div><div class="shopName">${u.name}</div><div class="shopDesc">${u.desc}</div>`;
                div.addEventListener("click", () => {
                    u.action();
                    this.shopBonusChoices = 0;
                    this.hideAllScreens();
                    this.state = "playing";
                    this.waveManager.startWave();
                });
                shopOptions.appendChild(div);
            }

            this.hideAllScreens();
            document.getElementById("shopScreen").classList.remove("hidden");
        };

        Boss.prototype.__imageBossPatch = true;
    }

    function drawImageEntity(ctx, entity, scale) {
        const img = entity._imageBossImg || entity._imageImg;
        if (!img || !img.complete) return;
        const w = entity.radius * 2.1 * scale;
        const h = entity.radius * 2.1 * scale;
        ctx.save();
        ctx.globalAlpha = entity.flashTimer > 0 ? 0.72 : 0.95;
        ctx.shadowColor = entity.glowColor || "#ffd166";
        ctx.shadowBlur = 24;
        ctx.translate(entity.x, entity.y);
        ctx.rotate(Math.sin((entity.animFrame || 0) * 0.025) * 0.05);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    window.createImageBossEntity = createImageBossEntity;
    window.spawnImageDerivedEnemy = addImageEnemy;
    patchImageBosses();
    document.addEventListener("DOMContentLoaded", patchImageBosses);
})();
