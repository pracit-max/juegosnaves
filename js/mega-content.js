// Mega content pack: unique skins, tactical objects, power ups and themed bosses.
(function () {
    "use strict";

    if (window.__megaContentPackInstalled) return;
    window.__megaContentPackInstalled = true;

    const MAX = { traps: 18, turrets: 4, allies: 6, zones: 10, drones: 10, beams: 18 };
    const mega = window.megaContent = window.megaContent || {
        traps: [],
        turrets: [],
        allies: [],
        zones: [],
        drones: [],
        beams: []
    };

    const SKINS = [
        { id: "skin_electrificado", name: "Skin Electrificado", rarity: "Mitica", category: "Tecnologia", price: 980, color: "#00d5ff", accent: "#ffffff", shot: "mega_electric", special: "global_storm", cooldown: 620, desc: "Disparo: descarga triple con cadena. Especial: tormenta electrica global." },
        { id: "skin_cazador", name: "Skin Cazador", rarity: "Epica", category: "Tacticas", price: 720, color: "#1f4d2b", accent: "#b68b45", shot: "hunter_pierce", special: "trap_field", cooldown: 640, desc: "Disparo: flecha perforante. Especial: trampas, jaulas y minas." },
        { id: "skin_ingeniero", name: "Skin Ingeniero", rarity: "Legendaria", category: "Tecnologia", price: 820, color: "#f5b301", accent: "#9ca3af", shot: "gear_bolt", special: "auto_turret", cooldown: 700, desc: "Disparo: tuercas mecanicas. Especial: torreta automatica." },
        { id: "skin_robotica", name: "Skin Robotica", rarity: "Legendaria", category: "Tecnologia", price: 900, color: "#6b7280", accent: "#38bdf8", shot: "robot_burst", special: "robot_ally", cooldown: 760, desc: "Disparo: rafaga robotica. Especial: robot aliado." },
        { id: "skin_nigromante", name: "Skin Nigromante", rarity: "Mitica", category: "Oscuras", price: 1040, color: "#4c1d95", accent: "#7ae582", shot: "soul_homing", special: "raise_souls", cooldown: 840, desc: "Disparo: orbes de almas. Especial: aliados espectrales temporales." },
        { id: "skin_tornado", name: "Skin Tornado", rarity: "Legendaria", category: "Elementales", price: 860, color: "#94a3b8", accent: "#dbeafe", shot: "wind_tornado", special: "giant_tornado", cooldown: 760, desc: "Disparo: mini tornados. Especial: tornado gigante que atrae." },
        { id: "skin_quimica", name: "Skin Quimica", rarity: "Epica", category: "Toxicas", price: 740, color: "#7ae582", accent: "#c56bff", shot: "acid_glob", special: "toxic_cloud", cooldown: 700, desc: "Disparo: bolas quimicas con charcos. Especial: nube toxica expansiva." },
        { id: "skin_samurai", name: "Skin Samurai", rarity: "Mitica", category: "Guerreras", price: 1100, color: "#b91c1c", accent: "#facc15", shot: "energy_slash", special: "dimensional_cut", cooldown: 780, desc: "Disparo: cortes de energia. Especial: corte dimensional." },
        { id: "skin_angel_luz", name: "Skin Angel", rarity: "Mitica", category: "Sagradas", price: 1160, color: "#ffffff", accent: "#facc15", shot: "holy_light", special: "heaven_rain", cooldown: 820, desc: "Disparo: luz sagrada. Especial: lluvia celestial que cura y dana." },
        { id: "skin_demonio_fuego", name: "Skin Demonio", rarity: "Mitica", category: "Infernal", price: 1180, color: "#7f1d1d", accent: "#ff6b35", shot: "dark_fire", special: "infernal_circle", cooldown: 800, desc: "Disparo: fuego oscuro. Especial: circulo infernal y aumento de dano." },
        { id: "skin_gravitacional", name: "Skin Gravitacional", rarity: "Cosmica", category: "Cosmicas", price: 1220, color: "#05010b", accent: "#8b5cf6", shot: "gravity_mini", special: "gravity_well", cooldown: 760, desc: "Disparo: orbes gravitacionales. Especial: pozo gravitacional." },
        { id: "skin_dronista", name: "Skin Dronista", rarity: "Legendaria", category: "Tecnologia", price: 980, color: "#0f4c81", accent: "#67e8f9", shot: "digital_rapid", special: "drone_squad", cooldown: 760, desc: "Disparo: rafaga digital. Especial: escuadron de drones." },
        { id: "skin_plasma_nova", name: "Skin Plasma", rarity: "Epica", category: "Energia", price: 760, color: "#c56bff", accent: "#7df9ff", shot: "plasma_split", special: "plasma_orbit", cooldown: 690, desc: "Disparo: plasma que se abre. Especial: orbes orbitando." },
        { id: "skin_arena", name: "Skin Arena", rarity: "Rara", category: "Tacticas", price: 540, color: "#c08457", accent: "#fde68a", shot: "sand_spike", special: "sand_prison", cooldown: 640, desc: "Disparo: espinas de arena. Especial: prision de arena." },
        { id: "skin_bestia", name: "Skin Bestia", rarity: "Epica", category: "Salvajes", price: 690, color: "#7f1d1d", accent: "#f97316", shot: "beast_claw", special: "beast_rage", cooldown: 620, desc: "Disparo: garras rojas. Especial: furia que drena vida." },
        { id: "skin_minero_espacial", name: "Skin Minero Espacial", rarity: "Rara", category: "Cosmicas", price: 600, color: "#475569", accent: "#fbbf24", shot: "drill_shot", special: "mine_field", cooldown: 680, desc: "Disparo: taladro perforante. Especial: campo de minas." },
        { id: "skin_pirata_cosmico", name: "Skin Pirata Cosmico", rarity: "Legendaria", category: "Cosmicas", price: 880, color: "#111827", accent: "#facc15", shot: "pirate_cannon", special: "cosmic_broadside", cooldown: 760, desc: "Disparo: canon cosmico. Especial: andanada lateral." },
        { id: "skin_arcangel_serafin", name: "Skin Arcangel Serafin", rarity: "Cosmica", category: "Sagradas", price: 1240, color: "#fff8cc", accent: "#ffd166", shot: "halo_burst", special: "guardian_seraph", cooldown: 840, desc: "Disparo: halos sagrados en abanico. Especial: serafines guardianes, cura y juicio divino." },
        { id: "skin_kraken_abisal", name: "Skin Kraken Abisal", rarity: "Mitica", category: "Abismales", price: 1180, color: "#1d0b3f", accent: "#7df9ff", shot: "abyss_ink", special: "kraken_call", cooldown: 820, desc: "Disparo: tinta abisal y orbes de vacio. Especial: invoca tentaculos y pozo abisal." },
        { id: "skin_comisario_omega", name: "Skin Comisario Omega", rarity: "Legendaria", category: "Policial", price: 980, color: "#0a2a66", accent: "#38bdf8", shot: "police_barrage", special: "lockdown_raid", cooldown: 760, desc: "Disparo: rafaga policial azul. Especial: redada con drones, torretas y jaulas." },
        { id: "skin_oraculo_ocular", name: "Skin Oraculo Ocular", rarity: "Mitica", category: "Celestiales", price: 1120, color: "#f8fafc", accent: "#7df9ff", shot: "eye_prism", special: "orbital_judgement", cooldown: 800, desc: "Disparo: prismas oculares. Especial: lluvia de ojos y castigo orbital." },
        { id: "skin_rey_infernal", name: "Skin Rey Infernal", rarity: "Cosmica", category: "Infernal", price: 1260, color: "#5b0f0f", accent: "#ff6b35", shot: "hell_spike", special: "demon_legion", cooldown: 840, desc: "Disparo: estacas infernales y fuego. Especial: legion demoniaca y circulo vivo." },
        { id: "skin_dragon_estelar", name: "Skin Dragon Estelar", rarity: "Cosmica", category: "Draconicas", price: 1280, color: "#1e3a8a", accent: "#facc15", shot: "dragon_star", special: "draco_meteor", cooldown: 860, desc: "Disparo: estrellas draconicas. Especial: lluvia de meteoros del dragon." }
    ];

    const BOSS_PACK = [
        { id: "boss_electrificado", base: "electric_boss", name: "JEFE ELECTRIFICADO", color: "#00d5ff", glow: "#ffffff" },
        { id: "boss_cazador", base: "police_commander", name: "CAZADOR SUPREMO", color: "#1f4d2b", glow: "#b68b45" },
        { id: "boss_ingeniero", base: "robot_colossal", name: "INGENIERO MECANICO", color: "#f5b301", glow: "#9ca3af" },
        { id: "boss_robotico", base: "supreme_dreadnought", name: "ROBOTICO COLOSAL", color: "#6b7280", glow: "#38bdf8" },
        { id: "boss_nigromante", base: "black_hole", name: "NIGROMANTE COSMICO", color: "#4c1d95", glow: "#7ae582" },
        { id: "boss_tornado", base: "living_planet", name: "TITAN TORNADO", color: "#94a3b8", glow: "#dbeafe" },
        { id: "boss_quimico", base: "bomber_supreme", name: "JEFE QUIMICO", color: "#7ae582", glow: "#c56bff" },
        { id: "boss_samurai", base: "mech_beast", name: "SAMURAI GALACTICO", color: "#b91c1c", glow: "#facc15" },
        { id: "boss_angel", base: "mothership", name: "ANGEL CAIDO", color: "#ffffff", glow: "#facc15" },
        { id: "boss_demonio", base: "bomber_supreme", name: "DEMONIO NUCLEAR", color: "#7f1d1d", glow: "#ff6b35" }
    ];

    const MINI_PACK = [
        { id: "mini_electrico", base: "mini_ship", name: "MINI ELECTRICO", color: "#00d5ff", glow: "#ffffff" },
        { id: "mini_trampero", base: "mini_ninja", name: "MINI TRAMPERO", color: "#1f4d2b", glow: "#b68b45" },
        { id: "mini_torreta", base: "mini_heavy_ship", name: "MINI TORRETA", color: "#f5b301", glow: "#9ca3af" },
        { id: "mini_robot", base: "mini_mecha", name: "MINI ROBOT", color: "#6b7280", glow: "#38bdf8" },
        { id: "mini_fantasma", base: "ghost_lord", name: "MINI FANTASMA", color: "#4c1d95", glow: "#7ae582" },
        { id: "mini_tornado", base: "splitter_boss", name: "MINI TORNADO", color: "#94a3b8", glow: "#dbeafe" },
        { id: "mini_quimico", base: "mini_bomber", name: "MINI QUIMICO", color: "#7ae582", glow: "#c56bff" },
        { id: "mini_samurai", base: "mini_ninja", name: "MINI SAMURAI", color: "#b91c1c", glow: "#facc15" },
        { id: "mini_angel", base: "mini_ship", name: "MINI ANGEL", color: "#ffffff", glow: "#facc15" },
        { id: "mini_demonio", base: "mini_nuclear", name: "MINI DEMONIO", color: "#7f1d1d", glow: "#ff6b35" }
    ];

    const POWERUPS = {
        electricChain: { color: "#00d5ff", icon: "E", name: "Cadena electrica" },
        quickTraps: { color: "#b68b45", icon: "T", name: "Trampas rapidas" },
        tempTurret: { color: "#f5b301", icon: "R", name: "Torreta temporal" },
        robotHelper: { color: "#38bdf8", icon: "B", name: "Robot ayudante" },
        poisonAura: { color: "#7ae582", icon: "A", name: "Aura venenosa" },
        energyCut: { color: "#facc15", icon: "S", name: "Corte energetico" },
        divineLight: { color: "#ffffff", icon: "L", name: "Luz divina" },
        infernalFire: { color: "#ff6b35", icon: "F", name: "Fuego infernal" },
        extremeGravity: { color: "#8b5cf6", icon: "G", name: "Gravedad extrema" },
        droneSupport: { color: "#67e8f9", icon: "D", name: "Drones temporales" },
        mineField: { color: "#fbbf24", icon: "M", name: "Campo de minas" },
        autoCage: { color: "#94a3b8", icon: "C", name: "Jaula automatica" }
    };

    function g() { return window.game; }
    function clampList(arr, max) { if (arr.length > max) arr.splice(0, arr.length - max); }
    function allTargets() {
        const game = g();
        if (!game) return [];
        return [
            ...(game.enemyManager?.enemies || []),
            game.boss,
            game.miniBoss,
            ...(game.activeBosses || []),
            ...(game.coliseumBosses || [])
        ].filter(t => t && !t.dead && (t.spawnTimer || 0) <= 0);
    }
    function targetsIn(x, y, r) {
        const r2 = r * r;
        return allTargets().filter(t => {
            const dx = t.x - x, dy = t.y - y;
            return dx * dx + dy * dy <= r2;
        });
    }
    function nearest(x, y, r, exclude) {
        let best = null, bd = r * r;
        for (const t of allTargets()) {
            if (t === exclude) continue;
            const dx = t.x - x, dy = t.y - y, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = t; }
        }
        return best;
    }
    function hit(t, damage) {
        if (!t || t.dead) return;
        if (typeof t.takeDamage === "function") t.takeDamage(damage);
        else t.health = Math.max(0, (t.health || 0) - damage);
    }
    function area(x, y, r, damage, color, force) {
        for (const t of targetsIn(x, y, r)) {
            const d = Math.max(1, dist(x, y, t.x, t.y));
            hit(t, damage * Math.max(0.35, 1 - d / (r * 1.4)));
            if (force) {
                t.vx = (t.vx || 0) + (t.x - x) / d * force;
                t.vy = (t.vy || 0) + (t.y - y) / d * force;
            }
        }
        g()?.particles?.emit?.(x, y, 8, { colors: [color, "#ffffff"], speed: 4, life: 18, size: 3, glow: true });
    }
    function chainFrom(x, y, damage, color, jumps = 4, range = 280) {
        const used = new Set();
        let fromX = x, fromY = y, last = null;
        for (let i = 0; i < jumps; i++) {
            const target = nearest(fromX, fromY, range, last);
            if (!target || used.has(target)) break;
            used.add(target);
            hit(target, damage * Math.max(0.45, 1 - i * 0.13));
            mega.beams.push({ x1: fromX, y1: fromY, x2: target.x, y2: target.y, color, life: 9, width: 4 });
            fromX = target.x; fromY = target.y; last = target;
            g()?.particles?.emit?.(fromX, fromY, 5, { colors: [color, "#ffffff"], speed: 3, life: 12, size: 2.3, glow: true });
        }
        clampList(mega.beams, MAX.beams);
    }
    function lineHit(x, y, a, len, width, damage, color) {
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        mega.beams.push({ x1: x, y1: y, x2, y2, color, life: 14, width });
        for (const t of allTargets()) {
            const d = typeof pointToSegmentDistance === "function" ? pointToSegmentDistance(t.x, t.y, x, y, x2, y2) : Math.abs((y2 - y) * t.x - (x2 - x) * t.y + x2 * y - y2 * x) / Math.max(1, dist(x, y, x2, y2));
            if (d < width + (t.radius || 20)) hit(t, damage);
        }
        clampList(mega.beams, MAX.beams);
    }

    function addTrap(type, x, y, color) {
        mega.traps.push({ type, x, y, color, life: type === "mine" ? 900 : 540, radius: type === "mine" ? 28 : 42, armed: 12 });
        clampList(mega.traps, MAX.traps);
    }
    function addTurret(x, y, color, life = 720) {
        mega.turrets.push({ x, y, color, life, hp: 110, cd: 0, radius: 18 });
        clampList(mega.turrets, MAX.turrets);
    }
    function addAlly(kind, x, y, color, life = 720) {
        mega.allies.push({ kind, x, y, color, life, hp: kind === "robot" ? 160 : 75, cd: 0, angle: rand(0, Math.PI * 2), radius: kind === "robot" ? 19 : 14 });
        clampList(mega.allies, MAX.allies);
    }
    function addZone(type, x, y, color, radius, life, damage, pull) {
        mega.zones.push({ type, x, y, color, radius, life, maxLife: life, damage, tick: 0, pull: pull || 0 });
        clampList(mega.zones, MAX.zones);
    }
    function addDrone(player, color, life = 520) {
        mega.drones.push({ player, color, life, cd: 0, angle: rand(0, Math.PI * 2), radius: 55 + (mega.drones.length % 4) * 17 });
        clampList(mega.drones, MAX.drones);
    }

    function updateObjects() {
        const game = g();
        if (!game || game.state !== "playing") return;
        for (let i = mega.traps.length - 1; i >= 0; i--) {
            const tr = mega.traps[i];
            tr.life--; tr.armed--;
            for (const t of targetsIn(tr.x, tr.y, tr.radius)) {
                if (tr.armed > 0) continue;
                if (tr.type === "bear") { t.slowTimer = Math.max(t.slowTimer || 0, 180); hit(t, 34); tr.life = 0; }
                if (tr.type === "cage") { t.slowTimer = Math.max(t.slowTimer || 0, 250); hit(t, 16); tr.life -= 80; }
                if (tr.type === "mine") { area(tr.x, tr.y, 150, 58, tr.color, 8); game.screenShake?.shake?.(8); tr.life = 0; }
            }
            if (tr.life <= 0) mega.traps.splice(i, 1);
        }
        for (let i = mega.turrets.length - 1; i >= 0; i--) {
            const tu = mega.turrets[i];
            tu.life--; tu.cd--;
            const t = nearest(tu.x, tu.y, 520);
            if (t && tu.cd <= 0) {
                tu.cd = 16;
                game.bulletManager.addBullet(tu.x, tu.y, angle(tu.x, tu.y, t.x, t.y), 15, 18, tu.color, false, false, false);
                game.particles.emit(tu.x, tu.y, 2, { colors: [tu.color, "#ffffff"], speed: 3, life: 8, size: 2, glow: true });
            }
            if (tu.life <= 0 || tu.hp <= 0) mega.turrets.splice(i, 1);
        }
        for (let i = mega.allies.length - 1; i >= 0; i--) {
            const al = mega.allies[i], player = game.player;
            al.life--; al.cd--; al.angle += 0.035;
            const followR = al.kind === "robot" ? 76 : 52;
            al.x += (player.x + Math.cos(al.angle) * followR - al.x) * 0.055;
            al.y += (player.y + Math.sin(al.angle) * followR - al.y) * 0.055;
            const t = nearest(al.x, al.y, al.kind === "soul" ? 360 : 440);
            if (t && al.cd <= 0) {
                al.cd = al.kind === "robot" ? 18 : 25;
                if (dist(al.x, al.y, t.x, t.y) < 65 && al.kind === "robot") hit(t, 28);
                else game.bulletManager.addBullet(al.x, al.y, angle(al.x, al.y, t.x, t.y), 12, al.kind === "soul" ? 16 : 20, al.color, al.kind === "soul", false, false);
            }
            if (al.life <= 0 || al.hp <= 0) mega.allies.splice(i, 1);
        }
        for (let i = mega.zones.length - 1; i >= 0; i--) {
            const z = mega.zones[i];
            z.life--; z.tick++;
            if (z.tick % 12 === 0) {
                for (const t of targetsIn(z.x, z.y, z.radius)) {
                    if (z.pull) {
                        const a = angle(t.x, t.y, z.x, z.y);
                        t.vx = (t.vx || 0) + Math.cos(a) * z.pull;
                        t.vy = (t.vy || 0) + Math.sin(a) * z.pull;
                    }
                    if (z.type === "toxic") t.slowTimer = Math.max(t.slowTimer || 0, 90);
                    hit(t, z.damage);
                    if (z.type === "electric") chainFrom(t.x, t.y, z.damage * 0.55, z.color, 2, 170);
                }
            }
            if (z.life <= 0) {
                if (z.type === "gravity") area(z.x, z.y, z.radius + 80, z.damage * 6, z.color, 14);
                mega.zones.splice(i, 1);
            }
        }
        for (let i = mega.drones.length - 1; i >= 0; i--) {
            const d = mega.drones[i], player = d.player || game.player;
            d.life--; d.cd--; d.angle += 0.065;
            d.x = player.x + Math.cos(d.angle) * d.radius;
            d.y = player.y + Math.sin(d.angle) * d.radius;
            const t = nearest(d.x, d.y, 420);
            if (t && d.cd <= 0) {
                d.cd = 18;
                game.bulletManager.addBullet(d.x, d.y, angle(d.x, d.y, t.x, t.y), 14, 14, d.color, false, false, false);
            }
            if (d.life <= 0) mega.drones.splice(i, 1);
        }
        for (let i = mega.beams.length - 1; i >= 0; i--) if (--mega.beams[i].life <= 0) mega.beams.splice(i, 1);
    }

    function drawObjects(ctx) {
        ctx.save();
        for (const z of mega.zones) {
            const pct = Math.max(0.12, z.life / z.maxLife);
            ctx.globalAlpha = 0.12 + pct * 0.16;
            ctx.fillStyle = z.color;
            ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 0.55; ctx.strokeStyle = z.color; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(z.x, z.y, z.radius + Math.sin((g()?.frame || 0) * 0.14) * 8, 0, Math.PI * 2); ctx.stroke();
        }
        for (const tr of mega.traps) {
            ctx.globalAlpha = 0.9; ctx.strokeStyle = tr.color; ctx.fillStyle = tr.type === "mine" ? "#111827" : "rgba(255,255,255,0.08)";
            ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = tr.color; ctx.fillRect(tr.x - 8, tr.y - 8, 16, 16);
        }
        for (const tu of mega.turrets) {
            ctx.globalAlpha = 1; ctx.fillStyle = "#1f2937"; ctx.strokeStyle = tu.color; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.rect(tu.x - 16, tu.y - 16, 32, 32); ctx.fill(); ctx.stroke();
            ctx.fillStyle = tu.color; ctx.beginPath(); ctx.arc(tu.x, tu.y, 7, 0, Math.PI * 2); ctx.fill();
        }
        for (const al of mega.allies) {
            ctx.globalAlpha = al.kind === "soul" ? 0.65 : 1; ctx.fillStyle = al.color; ctx.shadowColor = al.color; ctx.shadowBlur = 16;
            ctx.beginPath(); ctx.arc(al.x, al.y, al.radius, 0, Math.PI * 2); ctx.fill();
        }
        for (const d of mega.drones) {
            ctx.globalAlpha = 1; ctx.fillStyle = d.color; ctx.shadowColor = d.color; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.moveTo(d.x + 12, d.y); ctx.lineTo(d.x - 8, d.y - 8); ctx.lineTo(d.x - 5, d.y + 9); ctx.closePath(); ctx.fill();
        }
        for (const b of mega.beams) {
            ctx.globalAlpha = Math.min(1, b.life / 8);
            ctx.strokeStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 16; ctx.lineWidth = b.width || 3;
            ctx.beginPath(); ctx.moveTo(b.x1 + rand(-2, 2), b.y1 + rand(-2, 2)); ctx.lineTo(b.x2 + rand(-2, 2), b.y2 + rand(-2, 2)); ctx.stroke();
        }
        ctx.restore();
    }

    function fireMegaSkin(system, player, bm, mult) {
        const s = system.equipped();
        if (!SKINS.some(x => x.id === s.id)) return false;
        if (player.ammo <= 0 && !player.powerups.infinite) { player.reloading = true; player.reloadTimer = CONFIG.reloadTime; return true; }
        const x = player.x + Math.cos(player.angle) * 26, y = player.y + Math.sin(player.angle) * 26, a = player.angle;
        const dmg = 20 * (mult || 1);
        const spend = (rate = CONFIG.fireRate) => { player.fireTimer = Math.max(2, rate); if (!player.powerups.infinite) player.ammo--; };
        if (s.shot === "mega_electric") { spend(7); for (let i = -1; i <= 1; i++) chainFrom(x + i * 8, y, dmg * 0.9, s.color, 4, 320); return true; }
        if (s.shot === "hunter_pierce") { spend(9); const b = new Bullet(x, y, a, 18, dmg * 1.5, s.accent, true, false, false); b.radius = 4; bm.bullets.push(b); return true; }
        if (s.shot === "gear_bolt") { spend(8); for (let i = -1; i <= 1; i += 2) bm.addBullet(x, y, a + i * 0.05, 13, dmg, s.color, true, false, false); return true; }
        if (s.shot === "robot_burst") { spend(6); for (let i = -1; i <= 1; i++) bm.addBullet(x, y, a + i * 0.08, 16, dmg * 0.7, s.accent, false, false, false); return true; }
        if (s.shot === "soul_homing") { spend(12); bm.addHoming(x, y, a, 7, dmg * 1.25); return true; }
        if (s.shot === "wind_tornado") { spend(12); bm.addShockwave(x + Math.cos(a) * 34, y + Math.sin(a) * 34, dmg); area(x + Math.cos(a) * 80, y + Math.sin(a) * 80, 95, 8, s.color, 5); return true; }
        if (s.shot === "acid_glob") { spend(11); bm.addPlasma(x, y, a, 6.2, dmg); addZone("toxic", x + Math.cos(a) * 190, y + Math.sin(a) * 190, s.color, 78, 115, 5, 0); return true; }
        if (s.shot === "energy_slash") { spend(8); lineHit(x, y, a, 620, 13, dmg * 1.15, s.accent); return true; }
        if (s.shot === "holy_light") { spend(9); bm.addBullet(x, y, a, 15, dmg, s.accent, false, false, false); if (player.health < player.maxHealth && Math.random() < 0.16) player.heal(1.5); return true; }
        if (s.shot === "dark_fire") { spend(8); bm.addFlameCone(x, y, a, dmg * 0.95); return true; }
        if (s.shot === "gravity_mini") { spend(11); bm.addGravityOrb(x, y, a, dmg * 1.1); return true; }
        if (s.shot === "digital_rapid") { spend(5); bm.addBullet(x, y, a + rand(-0.035, 0.035), 18, dmg * 0.75, s.accent, false, false, false); return true; }
        if (s.shot === "plasma_split") { spend(10); for (let i = -1; i <= 1; i++) bm.addPlasma(x, y, a + i * 0.12, 6.8, dmg * 0.8); return true; }
        if (s.shot === "sand_spike") { spend(9); const b = new Bullet(x, y, a, 14, dmg, s.color, true, false, false); b.radius = 6; bm.bullets.push(b); return true; }
        if (s.shot === "beast_claw") { spend(8); for (let i = -1; i <= 1; i++) lineHit(x, y, a + i * 0.1, 230, 16, dmg * 0.8, s.accent); return true; }
        if (s.shot === "drill_shot") { spend(10); const b = new Bullet(x, y, a, 12, dmg * 1.4, s.accent, true, false, false); b.radius = 7; bm.bullets.push(b); return true; }
        if (s.shot === "pirate_cannon") { spend(16); bm.addGrenade(x, y, a, 8, dmg * 2, 28); return true; }
        if (s.shot === "halo_burst") { spend(8); for (let i = -2; i <= 2; i++) bm.addBullet(x, y, a + i * 0.12, 15, dmg * 0.82, s.accent, false, false, false); if (Math.random() < 0.22) player.heal(1); return true; }
        if (s.shot === "abyss_ink") { spend(11); bm.addGravityOrb(x, y, a, dmg * 0.92); addZone("toxic", x + Math.cos(a) * 170, y + Math.sin(a) * 170, s.accent, 68, 95, 4, 2); return true; }
        if (s.shot === "police_barrage") { spend(5); for (let i = -1; i <= 1; i++) bm.addBullet(x, y, a + i * 0.055, 18, dmg * 0.72, s.accent, false, false, false); return true; }
        if (s.shot === "eye_prism") { spend(9); for (let i = -2; i <= 2; i++) bm.addBullet(x, y, a + i * 0.14, 13, dmg * 0.76, s.color, true, false, false); if (Math.random() < 0.18) lineHit(x, y, a, 420, 7, dmg * 0.45, s.accent); return true; }
        if (s.shot === "hell_spike") { spend(8); bm.addFlameCone(x, y, a, dmg * 0.78); lineHit(x, y, a, 220, 12, dmg * 0.5, s.accent); return true; }
        if (s.shot === "dragon_star") { spend(10); for (let i = -1; i <= 1; i++) { bm.addHoming(x, y, a + i * 0.1, 8, dmg * 0.9); } return true; }
        return false;
    }

    function specialMegaSkin(system, player) {
        const s = system.equipped();
        if (!SKINS.some(x => x.id === s.id)) return false;
        if (player.skinSkillTimer > 0) { game?.showNotification?.("Especial en recarga: " + Math.ceil(player.skinSkillTimer / 60) + "s", "error"); return true; }
        player.skinSkillTimer = s.cooldown || 700;
        player.skinSkillMax = player.skinSkillTimer;
        const x = player.x, y = player.y, a = player.angle;
        if (s.special === "global_storm") {
            for (let i = 0; i < 18; i++) setTimeout(() => {
                const tx = rand(80, CONFIG.canvasWidth - 80), ty = rand(80, CONFIG.canvasHeight - 80);
                lineHit(tx, -40, Math.PI / 2, ty + 50, 18, 70, s.color); area(tx, ty, 135, 46, s.color, 0); chainFrom(tx, ty, 30, s.color, 3, 240);
            }, i * 55);
        } else if (s.special === "trap_field") {
            for (let i = 0; i < 5; i++) { const px = x + Math.cos(a + i * 1.25) * rand(70, 190), py = y + Math.sin(a + i * 1.25) * rand(70, 190); addTrap(i % 3 === 0 ? "mine" : i % 3 === 1 ? "cage" : "bear", px, py, s.accent); }
        } else if (s.special === "auto_turret") addTurret(x + Math.cos(a) * 70, y + Math.sin(a) * 70, s.color, 760);
        else if (s.special === "robot_ally") addAlly("robot", x, y, s.accent, 820);
        else if (s.special === "raise_souls") { for (let i = 0; i < 5; i++) addAlly("soul", x + rand(-60, 60), y + rand(-60, 60), s.accent, 650); }
        else if (s.special === "giant_tornado") addZone("tornado", x, y, s.accent, 310, 280, 15, 9);
        else if (s.special === "toxic_cloud") addZone("toxic", x, y, s.color, 350, 310, 13, 1);
        else if (s.special === "dimensional_cut") { lineHit(x - Math.cos(a) * 80, y - Math.sin(a) * 80, a, 1800, 34, 190, s.accent); game?.screenShake?.shake?.(18); }
        else if (s.special === "heaven_rain") { player.heal(35); for (let i = 0; i < 12; i++) { const t = randChoice(allTargets()) || { x: rand(80, CONFIG.canvasWidth - 80), y: rand(80, CONFIG.canvasHeight - 80) }; setTimeout(() => { lineHit(t.x, -40, Math.PI / 2, t.y + 60, 20, 80, s.accent); area(t.x, t.y, 120, 45, s.accent, 0); }, i * 65); } }
        else if (s.special === "infernal_circle") { player.powerups.damage = Math.max(player.powerups.damage || 0, 360); player.takeDamage?.(Math.min(8, player.health - 1)); addZone("inferno", x, y, s.accent, 300, 280, 18, 0); }
        else if (s.special === "gravity_well") addZone("gravity", x, y, s.accent, 360, 250, 12, 12);
        else if (s.special === "drone_squad") for (let i = 0; i < 5; i++) addDrone(player, s.accent, 620);
        else if (s.special === "plasma_orbit") for (let i = 0; i < 8; i++) addDrone(player, s.color, 420);
        else if (s.special === "sand_prison") { addZone("sand", x, y, s.accent, 285, 230, 10, 4); for (const t of targetsIn(x, y, 310)) t.slowTimer = Math.max(t.slowTimer || 0, 260); }
        else if (s.special === "beast_rage") { player.powerups.damage = Math.max(player.powerups.damage || 0, 420); player.powerups.speed = Math.max(player.powerups.speed || 0, 420); area(x, y, 260, 65, s.accent, 8); player.heal(18); }
        else if (s.special === "mine_field") for (let i = 0; i < 9; i++) addTrap("mine", x + rand(-260, 260), y + rand(-210, 210), s.accent);
        else if (s.special === "cosmic_broadside") for (let i = -4; i <= 4; i++) { game.bulletManager.addGrenade(x, y, a + i * 0.14, 9, 54, 24); game.bulletManager.addGrenade(x, y, a + Math.PI + i * 0.14, 9, 54, 24); }
        else if (s.special === "guardian_seraph") {
            player.heal(28);
            for (let i = 0; i < 3; i++) addAlly("soul", x + rand(-40, 40), y + rand(-40, 40), s.accent, 720);
            for (let i = 0; i < 10; i++) {
                const t = randChoice(allTargets()) || { x: rand(80, CONFIG.canvasWidth - 80), y: rand(80, CONFIG.canvasHeight - 80) };
                setTimeout(() => { lineHit(t.x, -40, Math.PI / 2, t.y + 60, 18, 72, s.accent); area(t.x, t.y, 110, 32, s.accent, 0); }, i * 55);
            }
        }
        else if (s.special === "kraken_call") {
            addZone("gravity", x, y, s.accent, 300, 240, 10, 10);
            for (let i = 0; i < 7; i++) addTrap(i % 2 === 0 ? "cage" : "bear", x + rand(-240, 240), y + rand(-180, 180), s.color);
            area(x, y, 250, 45, s.color, 10);
        }
        else if (s.special === "lockdown_raid") {
            addTurret(x + 80, y, s.accent, 700);
            addTurret(x - 80, y, s.accent, 700);
            for (let i = 0; i < 4; i++) addDrone(player, s.accent, 540);
            for (let i = 0; i < 6; i++) addTrap(i % 2 ? "cage" : "mine", x + rand(-260, 260), y + rand(-180, 180), s.accent);
        }
        else if (s.special === "orbital_judgement") {
            for (let i = 0; i < 14; i++) {
                const tx = rand(80, CONFIG.canvasWidth - 80), ty = rand(80, CONFIG.canvasHeight - 80);
                setTimeout(() => { lineHit(tx, -40, Math.PI / 2, ty + 60, 15, 68, s.accent); }, i * 45);
            }
            for (let i = 0; i < 5; i++) addDrone(player, s.color, 460);
        }
        else if (s.special === "demon_legion") {
            player.powerups.damage = Math.max(player.powerups.damage || 0, 520);
            player.powerups.speed = Math.max(player.powerups.speed || 0, 280);
            addZone("inferno", x, y, s.accent, 320, 300, 18, 4);
            for (let i = 0; i < 3; i++) addAlly("robot", x + rand(-30, 30), y + rand(-30, 30), s.accent, 520);
            area(x, y, 280, 70, s.accent, 12);
        }
        else if (s.special === "draco_meteor") {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const tx = rand(100, CONFIG.canvasWidth - 100), ty = rand(90, CONFIG.canvasHeight - 90);
                    game.bulletManager.addGrenade(tx, ty - 120, Math.PI / 2 + rand(-0.35, 0.35), rand(4, 7), 70, 30);
                    area(tx, ty, 120, 22, s.accent, 5);
                }, i * 55);
            }
        }
        game?.particles?.emit?.(x, y, 18, { colors: [s.color, s.accent, "#ffffff"], speed: 6, life: 18, size: 3, glow: true });
        game?.showNotification?.("Especial: " + s.name, "powerup");
        return true;
    }

    function patchSkins() {
        if (!window.skinSystem || window.skinSystem.__megaContentSkins) return;
        const existing = new Set(window.skinSystem.skins.map(s => s.id));
        for (const skin of SKINS) if (!existing.has(skin.id)) window.skinSystem.skins.push(skin);
        const proto = Object.getPrototypeOf(window.skinSystem);
        const oldFire = proto.fire;
        proto.fire = function (player, bm, mult) { return fireMegaSkin(this, player, bm, mult) || oldFire.call(this, player, bm, mult); };
        const oldSpecial = proto.useSpecial;
        proto.useSpecial = function (player) { return specialMegaSkin(this, player) || oldSpecial.call(this, player); };
        window.skinSystem.__megaContentSkins = true;
    }

    function patchGameObjects() {
        if (typeof Player === "undefined" || Player.prototype.__megaContentPatch) return;
        const oldUpdate = Player.prototype.update;
        Player.prototype.update = function (keys, mouse) {
            updateObjects();
            if (this.powerups.quickTraps && game.frame % 120 === 0) addTrap("bear", this.x + rand(-90, 90), this.y + rand(-90, 90), "#b68b45");
            if (this.powerups.electricChain && mouse?.down && game.frame % 10 === 0) chainFrom(this.x, this.y, 18, "#00d5ff", 3, 260);
            if (this.powerups.poisonAura && game.frame % 16 === 0) area(this.x, this.y, 170, 5, "#7ae582", 0);
            if (this.powerups.energyCut && mouse?.down && game.frame % 14 === 0) lineHit(this.x, this.y, this.angle, 540, 10, 22, "#facc15");
            if (this.powerups.divineLight && game.frame % 35 === 0) { this.heal(1); area(this.x, this.y, 190, 9, "#ffffff", 0); }
            if (this.powerups.infernalFire && game.frame % 20 === 0) area(this.x, this.y, 190, 12, "#ff6b35", 3);
            if (this.powerups.extremeGravity && game.frame % 18 === 0) addZone("gravity", this.x, this.y, "#8b5cf6", 185, 18, 4, 5);
            oldUpdate.call(this, keys, mouse);
        };
        const oldDraw = Player.prototype.draw;
        Player.prototype.draw = function (ctx) {
            drawObjects(ctx);
            const s = window.skinSystem?.equipped?.();
            if (s && SKINS.some(x => x.id === s.id)) {
                ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
                ctx.globalAlpha = 0.88; ctx.strokeStyle = s.accent; ctx.fillStyle = s.color; ctx.shadowColor = s.accent; ctx.shadowBlur = 18; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(-16, -18); ctx.lineTo(-7, 0); ctx.lineTo(-16, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
                if (s.id === "skin_electrificado") for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 26 + i * 8 + Math.sin((game?.frame || 0) * 0.2 + i) * 3, 0, Math.PI * 2); ctx.stroke(); }
                if (s.id === "skin_angel_luz") { ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.ellipse(-15, -24, 30, 10, -0.4, 0, Math.PI * 2); ctx.ellipse(-15, 24, 30, 10, 0.4, 0, Math.PI * 2); ctx.fill(); }
                if (s.id === "skin_arcangel_serafin") { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(-10, 0, 28, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-16, -24, 30, 11, -0.5, 0, Math.PI * 2); ctx.ellipse(-16, 24, 30, 11, 0.5, 0, Math.PI * 2); ctx.fill(); }
                if (s.id === "skin_demonio_fuego") { ctx.fillStyle = s.accent; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-20, -30); ctx.lineTo(-16, -10); ctx.fill(); ctx.beginPath(); ctx.moveTo(-8, 18); ctx.lineTo(-20, 30); ctx.lineTo(-16, 10); ctx.fill(); }
                if (s.id === "skin_rey_infernal") { ctx.fillStyle = s.accent; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-26, -34); ctx.lineTo(-18, -8); ctx.fill(); ctx.beginPath(); ctx.moveTo(-8, 18); ctx.lineTo(-26, 34); ctx.lineTo(-18, 8); ctx.fill(); ctx.beginPath(); ctx.arc(-18, 0, 10, 0, Math.PI * 2); ctx.stroke(); }
                if (s.id === "skin_kraken_abisal") for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-24 - i * 4, -18 + i * 12, -30 - i * 4, -32 + i * 18); ctx.stroke(); }
                if (s.id === "skin_oraculo_ocular") { ctx.beginPath(); ctx.ellipse(-6, 0, 18, 9, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = s.accent; ctx.beginPath(); ctx.arc(-4, 0, 5, 0, Math.PI * 2); ctx.fill(); }
                if (s.id === "skin_comisario_omega") { ctx.fillStyle = s.accent; ctx.fillRect(-22, -5, 10, 10); ctx.fillRect(-22, -19, 8, 8); ctx.fillRect(-22, 11, 8, 8); }
                if (s.id === "skin_dragon_estelar") { ctx.beginPath(); ctx.moveTo(-10, -18); ctx.lineTo(-30, -8); ctx.lineTo(-12, -2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, 18); ctx.lineTo(-30, 8); ctx.lineTo(-12, 2); ctx.stroke(); }
                ctx.restore();
            }
            oldDraw.call(this, ctx);
        };
        Player.prototype.__megaContentPatch = true;
    }

    function patchPowerups() {
        if (typeof Drop === "undefined" || Drop.prototype.__megaPowerups) return;
        const oldApply = Drop.prototype.apply;
        Drop.prototype.apply = function (player) {
            if (!POWERUPS[this.type]) return oldApply.call(this, player);
            player.powerups[this.type] = 620;
            if (this.type === "tempTurret") addTurret(player.x + 55, player.y, POWERUPS[this.type].color, 540);
            if (this.type === "robotHelper") addAlly("robot", player.x, player.y, POWERUPS[this.type].color, 560);
            if (this.type === "droneSupport") for (let i = 0; i < 3; i++) addDrone(player, POWERUPS[this.type].color, 540);
            if (this.type === "mineField") for (let i = 0; i < 6; i++) addTrap("mine", player.x + rand(-210, 210), player.y + rand(-170, 170), POWERUPS[this.type].color);
            if (this.type === "autoCage") for (const t of targetsIn(player.x, player.y, 260)) addTrap("cage", t.x, t.y, POWERUPS[this.type].color);
            game?.floatingTexts?.add?.(this.x, this.y - 20, POWERUPS[this.type].name, POWERUPS[this.type].color, 16, 40);
            game?.particles?.emit?.(this.x, this.y, 12, { colors: [POWERUPS[this.type].color, "#ffffff"], speed: 4, life: 18, size: 3, glow: true });
        };
        const oldTryDrop = DropManager.prototype.tryDrop;
        DropManager.prototype.tryDrop = function (x, y, enemyType) {
            oldTryDrop.call(this, x, y, enemyType);
            if (Math.random() < 0.055) {
                const type = randChoice(Object.keys(POWERUPS));
                const d = new Drop(x + rand(-18, 18), y + rand(-18, 18), type);
                const def = POWERUPS[type];
                d.color = def.color; d.icon = def.icon; d.name = def.name;
                this.drops.push(d);
            }
        };
        Drop.prototype.__megaPowerups = true;
    }

    function configureBoss(boss, spec, wave) {
        boss.megaBoss = spec.id;
        boss.name = spec.name;
        boss.color = spec.color;
        boss.glowColor = spec.glow;
        boss.maxHealth *= 1.18 + Math.min(0.65, wave * 0.018);
        boss.health = boss.maxHealth;
        boss.speed *= 1.05;
        boss.score += 260;
        return boss;
    }
    function configureMini(mini, spec, wave) {
        mini.megaMini = spec.id;
        mini.name = spec.name;
        mini.color = spec.color;
        mini.glowColor = spec.glow;
        mini.maxHealth *= 1.1 + Math.min(0.45, wave * 0.015);
        mini.health = mini.maxHealth;
        mini.score += 120;
        return mini;
    }
    window.__megaBossSpecs = BOSS_PACK.slice();
    window.__megaMiniSpecs = MINI_PACK.slice();
    window.createMegaBossEntity = function (wave = 1, forcedId) {
        const spec = forcedId ? BOSS_PACK.find(s => s.id === forcedId) : randChoice(BOSS_PACK);
        if (!spec) return null;
        return configureBoss(new Boss(spec.base, Math.max(wave, 4)), spec, wave);
    };
    window.createMegaMiniBossEntity = function (wave = 1, forcedId) {
        const spec = forcedId ? MINI_PACK.find(s => s.id === forcedId) : randChoice(MINI_PACK);
        if (!spec) return null;
        return configureMini(new MiniBoss(spec.base, Math.max(wave, 3)), spec, wave);
    };
    function patchBosses() {
        if (typeof WaveManager === "undefined" || WaveManager.prototype.__megaBossSpawnPatch) return;
        const oldSpawnBoss = WaveManager.prototype.spawnBoss;
        WaveManager.prototype.spawnBoss = function () {
            if (this.wave >= 4 && (this.wave % 3 === 0 || Math.random() < 0.42)) {
                const spec = randChoice(BOSS_PACK);
                game.boss = configureBoss(new Boss(spec.base, Math.max(this.wave, 4)), spec, this.wave);
                game.showBossBar(game.boss);
                game.showNotification("JEFE: " + game.boss.name, "boss");
                sound?.play?.("boss_alert");
                return;
            }
            oldSpawnBoss.call(this);
        };
        const oldSpawnMini = WaveManager.prototype.spawnMiniBoss;
        WaveManager.prototype.spawnMiniBoss = function () {
            if (this.wave >= 3 && Math.random() < 0.48) {
                const spec = randChoice(MINI_PACK);
                this.miniBoss = configureMini(new MiniBoss(spec.base, Math.max(this.wave, 3)), spec, this.wave);
                game.miniBoss = this.miniBoss;
                game.showBossBar(this.miniBoss);
                game.showNotification("MINI JEFE: " + this.miniBoss.name, "boss");
                sound?.play?.("boss_alert");
                return;
            }
            oldSpawnMini.call(this);
        };
        WaveManager.prototype.__megaBossSpawnPatch = true;

        if (!Boss.prototype.__megaBossBehavior) {
            const oldBossUpdate = Boss.prototype.update;
            Boss.prototype.update = function (player) {
                oldBossUpdate.call(this, player);
                if (!this.megaBoss || this.spawnTimer > 0 || this.dead) return;
                const f = this.animFrame;
                if (this.megaBoss === "boss_electrificado" && f % 80 === 0) chainFrom(this.x, this.y, this.damage * 1.5, this.glowColor, 6, 360);
                if (this.megaBoss === "boss_cazador" && f % 120 === 0) addTrap(randChoice(["bear", "cage", "mine"]), player.x + rand(-80, 80), player.y + rand(-80, 80), this.glowColor);
                if (this.megaBoss === "boss_ingeniero" && f % 170 === 0) addTurret(this.x + rand(-90, 90), this.y + rand(-90, 90), this.glowColor, 420);
                if (this.megaBoss === "boss_robotico" && f % 160 === 0) addAlly("robot", this.x, this.y, this.glowColor, 360);
                if (this.megaBoss === "boss_nigromante" && f % 150 === 0) for (let i = 0; i < 2; i++) game.enemyManager.spawnEnemy(randChoice(["ghost", "invisible", "leech"]), this.x + rand(-60, 60), this.y + rand(-60, 60), game.waveManager.wave);
                if (this.megaBoss === "boss_tornado" && f % 105 === 0) addZone("tornado", player.x, player.y, this.glowColor, 210, 120, 9, 8);
                if (this.megaBoss === "boss_quimico" && f % 95 === 0) addZone("toxic", player.x + rand(-120, 120), player.y + rand(-120, 120), this.glowColor, 160, 170, 8, 0);
                if (this.megaBoss === "boss_samurai" && f % 70 === 0) lineHit(this.x, this.y, angle(this.x, this.y, player.x, player.y), 1200, 18, this.damage * 1.2, this.glowColor);
                if (this.megaBoss === "boss_angel" && f % 130 === 0) { this.health = Math.min(this.maxHealth, this.health + this.maxHealth * 0.025); area(player.x, player.y, 140, this.damage * 0.9, this.glowColor, 0); }
                if (this.megaBoss === "boss_demonio" && f % 100 === 0) addZone("inferno", player.x, player.y, this.glowColor, 190, 150, 12, 2);
            };
            Boss.prototype.__megaBossBehavior = true;
        }
    }

    function install() {
        patchSkins();
        patchGameObjects();
        patchPowerups();
        patchBosses();
        if (window.rendShop && !window.__megaShopRefresh) {
            window.__megaShopRefresh = true;
            setTimeout(() => window.rendShop("skin"), 100);
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
    else install();
    window.addEventListener("load", install);
    setTimeout(install, 200);
})();
