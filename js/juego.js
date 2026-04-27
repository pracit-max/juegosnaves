// ============================================
// NEON SURVIVOR - Shooter Arcade por Oleadas
// JavaScript Completo - CORREGIDO
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    canvasWidth: 3200,
    canvasHeight: 1800,
    playerSpeed: 3.5,   
    playerMaxHealth: 100,
    playerMaxShield: 50,
    dashSpeed: 12,
    dashDuration: 12,
    dashCooldown: 120,
    dashInvulnerability: 15,
    fireRate: 8,
    maxAmmo: 30,
    reloadTime: 60,
    skillCooldown: 540,
    comboDecay: 180,
    maxCombo: 50,
    particleLimit: 900,
    screenShakeIntensity: 8,
    screenShakeDecay: 0.85,
    difficulty: 'normal', // easy, normal, hard
};

const DIFFICULTY_MULT = {
    easy: { enemyHealth: 0.7, enemyDamage: 0.6, enemySpeed: 0.8, spawnRate: 1.3, scoreMult: 0.8 },
    normal: { enemyHealth: 1.0, enemyDamage: 1.0, enemySpeed: 1.0, spawnRate: 1.0, scoreMult: 1.0 },
    hard: { enemyHealth: 1.4, enemyDamage: 1.5, enemySpeed: 1.2, spawnRate: 0.7, scoreMult: 1.5 },
};

// ============================================
// UTILIDADES
// ============================================
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function degToRad(d) { return d * Math.PI / 180; }

function circleCollision(c1, c2) {
    const d = dist(c1.x, c1.y, c2.x, c2.y);
    return d < (c1.radius || c1.size) + (c2.radius || c2.size);
}

function rectCollision(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy || 1;
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = clamp(t, 0, 1);
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    return Math.hypot(px - x, py - y);
}

// Color utilities
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
}

function lerpColor(c1, c2, t) {
    const a = hexToRgb(c1), b = hexToRgb(c2);
    return rgbToHex(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t));
}

// ============================================
// SISTEMA DE SONIDO (Web Audio API)
// ============================================
class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.4;
        this.masterGain = null;
        this.soundMap = {
            shoot: { kind: 'laser', frequency: 760, duration: 0.07, type: 'triangle', volume: 0.02, endFrequency: 420 },
            shoot_heavy: { kind: 'heavy', frequency: 210, duration: 0.12, type: 'sawtooth', volume: 0.028, endFrequency: 110 },
            dash: { kind: 'whoosh', frequency: 520, duration: 0.11, type: 'sine', volume: 0.02, endFrequency: 180 },
            explosion: { kind: 'boom', frequency: 150, duration: 0.32, type: 'triangle', volume: 0.04, endFrequency: 45 },
            hit: { kind: 'hit', frequency: 320, duration: 0.07, type: 'square', volume: 0.018, endFrequency: 180 },
            powerup: { kind: 'chime', frequency: 740, duration: 0.22, type: 'sine', volume: 0.022, endFrequency: 1180 },
            death: { kind: 'fall', frequency: 240, duration: 0.45, type: 'triangle', volume: 0.03, endFrequency: 60 },
            victory: { kind: 'victory', frequency: 660, duration: 0.5, type: 'sine', volume: 0.028, endFrequency: 1320 },
            boss_alert: { kind: 'alarm', frequency: 180, duration: 0.35, type: 'square', volume: 0.03, endFrequency: 120 },
        };
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    _createNoiseBuffer() {
        const length = Math.max(1, Math.floor(this.ctx.sampleRate * 0.5));
        const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    _connectEnvelope(source, volume, start, peakAt, endAt, target = null) {
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), peakAt);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
        source.connect(gain);
        gain.connect(target || this.masterGain || this.ctx.destination);
        return gain;
    }

    _playOscLayer(type, startFreq, endFreq, volume, start, duration, detune = 0, filterFreq = 0) {
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, start);
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), start + duration);
        if (detune) osc.detune.value = detune;

        let source = osc;
        if (filterFreq > 0) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq, start);
            osc.connect(filter);
            source = filter;
        }

        this._connectEnvelope(source, volume, start, start + Math.min(0.02, duration * 0.25), start + duration);
        osc.start(start);
        osc.stop(start + duration);
    }

    _playNoiseLayer(volume, start, duration, highpassFreq = 180, lowpassFreq = 2400) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._createNoiseBuffer();

        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(highpassFreq, start);

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(lowpassFreq, start);

        noise.connect(hp);
        hp.connect(lp);
        this._connectEnvelope(lp, volume, start, start + Math.min(0.015, duration * 0.2), start + duration);

        noise.start(start);
        noise.stop(start + duration);
    }

    _playToneSequence(notes, type, volume, noteDuration, start, overlap = 0.02) {
        notes.forEach((freq, index) => {
            const noteStart = start + index * Math.max(0.02, noteDuration - overlap);
            this._playOscLayer(type, freq, freq * 1.02, volume, noteStart, noteDuration);
        });
    }

    play(name) {
        if (!this.enabled) return;

        this.init();
        if (!this.ctx) return;

        const spec = this.soundMap[name] || { kind: 'laser', frequency: 440, duration: 0.08, type: 'sine', volume: 0.02, endFrequency: 280 };
        const now = this.ctx.currentTime;
        const baseVol = spec.volume || 0.02;

        switch (spec.kind) {
            case 'laser':
                this._playOscLayer(spec.type, spec.frequency, spec.endFrequency, baseVol, now, spec.duration);
                this._playOscLayer('sine', spec.frequency * 1.5, spec.endFrequency * 1.1, baseVol * 0.45, now, spec.duration * 0.7);
                this._playNoiseLayer(baseVol * 0.18, now, spec.duration * 0.45, 700, 5000);
                break;
            case 'heavy':
                this._playOscLayer(spec.type, spec.frequency, spec.endFrequency, baseVol, now, spec.duration, -6, 1600);
                this._playOscLayer('triangle', spec.frequency * 0.5, spec.endFrequency * 0.8, baseVol * 0.8, now, spec.duration * 1.1, 4, 900);
                this._playNoiseLayer(baseVol * 0.35, now, spec.duration * 0.8, 120, 1200);
                break;
            case 'whoosh':
                this._playNoiseLayer(baseVol * 0.55, now, spec.duration, 500, 4200);
                this._playOscLayer(spec.type, spec.frequency, spec.endFrequency, baseVol * 0.65, now, spec.duration * 0.9);
                break;
            case 'boom':
                this._playNoiseLayer(baseVol * 0.95, now, spec.duration, 60, 900);
                this._playOscLayer('triangle', spec.frequency, spec.endFrequency, baseVol * 0.8, now, spec.duration * 0.9, 0, 700);
                this._playOscLayer('sine', spec.frequency * 0.55, Math.max(35, spec.endFrequency * 0.9), baseVol * 0.45, now + 0.02, spec.duration * 1.05);
                break;
            case 'hit':
                this._playOscLayer(spec.type, spec.frequency, spec.endFrequency, baseVol, now, spec.duration * 0.9);
                this._playNoiseLayer(baseVol * 0.15, now, spec.duration * 0.3, 800, 5000);
                break;
            case 'chime':
                this._playToneSequence([spec.frequency, spec.frequency * 1.25, spec.endFrequency], 'sine', baseVol, spec.duration * 0.45, now);
                this._playToneSequence([spec.frequency * 2], 'triangle', baseVol * 0.4, spec.duration * 0.35, now + 0.03);
                break;
            case 'fall':
                this._playOscLayer(spec.type, spec.frequency, spec.endFrequency, baseVol, now, spec.duration);
                this._playOscLayer('sine', spec.frequency * 0.75, Math.max(40, spec.endFrequency * 1.2), baseVol * 0.35, now + 0.03, spec.duration * 0.9);
                break;
            case 'victory':
                this._playToneSequence([660, 880, 1100, 1320], 'sine', baseVol, 0.16, now);
                this._playToneSequence([990, 1320], 'triangle', baseVol * 0.35, 0.22, now + 0.08);
                break;
            case 'alarm':
                this._playToneSequence([spec.frequency, spec.frequency * 1.2, spec.frequency], 'square', baseVol, 0.12, now, 0.01);
                this._playNoiseLayer(baseVol * 0.08, now, 0.28, 1200, 4200);
                break;
            default:
                this._playOscLayer(spec.type, spec.frequency, spec.endFrequency || spec.frequency * 0.7, baseVol, now, spec.duration);
                break;
        }
    }
}

const sound = new SoundSystem();

// ============================================
// SISTEMA DE NÚMEROS FLOTANTES
// ============================================
// ============================================
// SISTEMA DE PARTÃCULAS
// ============================================
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count = 1, options = {}) {
        const colors = options.colors || [options.color || '#ffffff'];
        const baseSpeed = options.speed ?? 2;
        const baseLife = options.life ?? 20;
        const baseSize = options.size ?? 2;
        const direction = options.angle;
        const spread = options.angleSpread ?? (Math.PI * 2);

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= CONFIG.particleLimit) {
                this.particles.shift();
            }

            const a = direction !== undefined
                ? direction + rand(-spread / 2, spread / 2)
                : rand(0, Math.PI * 2);
            const speed = baseSpeed * rand(0.6, 1.4);
            const life = Math.max(1, Math.round(baseLife * rand(0.75, 1.25)));
            const size = Math.max(0.5, baseSize * rand(0.7, 1.3));

            this.particles.push({
                type: 'particle',
                x,
                y,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                life,
                maxLife: life,
                size,
                color: randChoice(colors),
                glow: options.glow !== false,
            });
        }
    }

    emitSpark(x, y, color = '#ffffff') {
        this.emit(x, y, 6, {
            colors: [color, '#ffffff'],
            speed: 4,
            life: 12,
            size: 2,
            glow: true,
        });
    }

    emitExplosion(x, y, scale = 1) {
        this.emit(x, y, Math.max(8, Math.round(18 * scale)), {
            colors: ['#ff6600', '#ffaa00', '#ffffff', '#ff2200'],
            speed: 3.5 * scale,
            life: 18 * scale,
            size: 2.5 * scale,
            glow: true,
        });

        if (this.particles.length >= CONFIG.particleLimit) {
            this.particles.shift();
        }

        const ringLife = Math.max(1, Math.round(14 * scale));
        this.particles.push({
            type: 'ring',
            x,
            y,
            radius: 8 * scale,
            growth: 5 * scale,
            lineWidth: 4 * scale,
            life: ringLife,
            maxLife: ringLife,
            color: '#ffaa00',
        });
    }

    emitShockwave(x, y, color = '#00f0ff') {
        if (this.particles.length >= CONFIG.particleLimit) {
            this.particles.shift();
        }

        this.particles.push({
            type: 'ring',
            x,
            y,
            radius: 12,
            growth: 12,
            lineWidth: 6,
            life: 18,
            maxLife: 18,
            color,
        });

        this.emit(x, y, 16, {
            colors: [color, '#ffffff'],
            speed: 6,
            life: 16,
            size: 2.5,
            glow: true,
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life--;

            if (p.type === 'ring') {
                p.radius += p.growth;
                p.lineWidth *= 0.95;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.97;
                p.vy *= 0.97;
                p.size *= 0.99;
            }

            if (p.life <= 0 || (p.type !== 'ring' && p.size <= 0.2)) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();

        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;

            if (p.type === 'ring') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = Math.max(1, p.lineWidth);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.stroke();
                continue;
            }

            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.glow ? 10 : 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// ============================================
// SISTEMA DE NUMEROS FLOTANTES
// ============================================
class FloatingTextSystem {
    constructor() {
        this.texts = [];
    }

    add(x, y, text, color = '#ffffff', size = 16, life = 40) {
        this.texts.push({
            x, y,
            text,
            color,
            size,
            life,
            maxLife: life,
            vy: -1.5,
            vx: rand(-0.5, 0.5),
        });
    }

    update() {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.x += t.vx;
            t.y += t.vy;
            t.life--;
            if (t.life <= 0) this.texts.splice(i, 1);
        }
    }

    draw(ctx) {
        ctx.save();
        for (const t of this.texts) {
            const alpha = t.life / t.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = t.color;
            ctx.font = `bold ${t.size}px 'Segoe UI', sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 8;
            ctx.fillText(t.text, t.x, t.y);
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }
}

// ============================================
// SISTEMA DE SCREEN SHAKE
// ============================================
class ScreenShake {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.intensity = 0;
    }

    shake(intensity = CONFIG.screenShakeIntensity) {
        this.intensity = intensity;
    }

    update() {
        if (this.intensity > 0.5) {
            this.x = rand(-this.intensity, this.intensity);
            this.y = rand(-this.intensity, this.intensity);
            this.intensity *= CONFIG.screenShakeDecay;
        } else {
            this.x = 0;
            this.y = 0;
            this.intensity = 0;
        }
    }

    apply(ctx) {
        ctx.translate(this.x, this.y);
    }
}

// ============================================
// SISTEMA DE FONDO / AMBIENTE
// ============================================
class BackgroundSystem {
    constructor() {
        this.stars = [];
        this.clouds = [];
        this.confetti = [];
        this.spaceDust = [];
        this.deepStars = [];
        this.planets = [];
        this.gridOffset = 0;
        this.pulseTime = 0;
        this.generateDecor();
    }

    generateDecor() {
        this.planets = [
            { x: 0.14, y: 0.17, r: 128, type: 'ice', ring: false, speed: 0.003 },
            { x: 0.86, y: 0.14, r: 92, type: 'gas', ring: true, speed: -0.0025 },
            { x: 0.52, y: 0.1, r: 66, type: 'gas', ring: false, speed: 0.002 },
            { x: 0.28, y: 0.72, r: 88, type: 'ice', ring: false, speed: -0.0018 },
            { x: 0.74, y: 0.72, r: 54, type: 'lava', ring: false, speed: 0.004 },
            { x: 0.91, y: 0.84, r: 116, type: 'destroyed', ring: false, speed: 0.0015, alpha: 0.7 },
        ];
        for (let i = 0; i < 220; i++) {
            this.deepStars.push({
                x: rand(0, CONFIG.canvasWidth),
                y: rand(0, CONFIG.canvasHeight),
                size: rand(0.6, 2.3),
                tint: randChoice(['#ffffff', '#d7f4ff', '#ffd6fa', '#fff1bf']),
                phase: rand(0, Math.PI * 2),
                depth: rand(0.2, 1),
            });
        }
        for (let i = 0; i < 140; i++) {
            this.spaceDust.push({
                x: rand(0, CONFIG.canvasWidth),
                y: rand(0, CONFIG.canvasHeight),
                size: rand(10, 38),
                alpha: rand(0.03, 0.09),
                drift: rand(0.04, 0.18),
            });
        }
        for (let i = 0; i < 12; i++) {
            this.clouds.push({
                x: rand(0, CONFIG.canvasWidth),
                y: rand(60, CONFIG.canvasHeight * 0.45),
                size: rand(50, 120),
                speed: rand(0.1, 0.35),
                puff: randInt(3, 5),
            });
        }
        for (let i = 0; i < 90; i++) {
            this.confetti.push({
                x: rand(0, CONFIG.canvasWidth),
                y: rand(0, CONFIG.canvasHeight),
                size: rand(4, 10),
                speed: rand(0.15, 0.5),
                drift: rand(-0.3, 0.3),
                color: randChoice(['#ff8dc7', '#ffd166', '#7ae582', '#7bdff2', '#b388ff']),
                shape: randChoice(['circle', 'diamond', 'heart']),
                offset: rand(0, Math.PI * 2),
            });
        }
    }

    update() {
        this.pulseTime += 0.01;
        this.gridOffset = (this.gridOffset + 0.5) % 40;
        for (const star of this.deepStars) {
            star.phase += 0.01 * star.depth;
        }
        for (const dust of this.spaceDust) {
            dust.x += dust.drift;
            if (dust.x - dust.size > CONFIG.canvasWidth + 40) dust.x = -dust.size - 40;
        }
        for (const planet of this.planets) {
            planet.rotation = (planet.rotation || 0) + planet.speed;
        }
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;
            if (cloud.x - cloud.size > CONFIG.canvasWidth + 40) {
                cloud.x = -cloud.size - 40;
                cloud.y = rand(60, CONFIG.canvasHeight * 0.45);
            }
        }
        for (const piece of this.confetti) {
            piece.y += piece.speed;
            piece.x += Math.sin(this.pulseTime * 3 + piece.offset) * 0.35 + piece.drift;
            if (piece.y > CONFIG.canvasHeight + 12) {
                piece.y = -12;
                piece.x = rand(0, CONFIG.canvasWidth);
            }
        }
    }

    drawPlanet(ctx, planet) {
        const x = CONFIG.canvasWidth * planet.x;
        const y = CONFIG.canvasHeight * planet.y;
        const r = planet.r;
        ctx.save();
        ctx.globalAlpha = planet.alpha || 1;
        ctx.translate(x, y);
        ctx.rotate(planet.rotation || 0);

        const base = ctx.createRadialGradient(-r * 0.32, -r * 0.36, r * 0.1, 0, 0, r);
        if (planet.type === 'lava') {
            base.addColorStop(0, '#ffe5bf');
            base.addColorStop(0.22, '#ff974d');
            base.addColorStop(0.58, '#ad2e24');
            base.addColorStop(1, '#2d0908');
        } else if (planet.type === 'gas') {
            base.addColorStop(0, '#f6f1ff');
            base.addColorStop(0.28, '#b47cff');
            base.addColorStop(0.62, '#5f49b7');
            base.addColorStop(1, '#21153f');
        } else if (planet.type === 'destroyed') {
            base.addColorStop(0, '#d5d7de');
            base.addColorStop(0.3, '#8f97aa');
            base.addColorStop(0.7, '#46505f');
            base.addColorStop(1, '#171c23');
        } else {
            base.addColorStop(0, '#f2fbff');
            base.addColorStop(0.28, '#8bddff');
            base.addColorStop(0.6, '#2462aa');
            base.addColorStop(1, '#091930');
        }

        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha *= 0.35;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = planet.type === 'lava' ? 'rgba(255,220,140,0.45)' : planet.type === 'gas' ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.18)';
            ctx.beginPath();
            ctx.ellipse(0, (-0.45 + i * 0.22) * r, r * (0.82 - i * 0.07), r * 0.12, Math.sin((planet.rotation || 0) * 2 + i) * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = (planet.alpha || 1) * 0.42;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.arc(r * 0.22, r * 0.1, r * 0.96, -1.3, 1.4);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        if (planet.type === 'destroyed') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(r * 0.54, -r * 0.12, r * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'rgba(255, 170, 120, 0.65)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(r * 0.35, -r * 0.1, r * 0.48, -1.5, 1.8);
            ctx.stroke();
        }

        if (planet.ring) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = 'rgba(240,245,255,0.65)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.48, r * 0.34, 0.28, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.18;
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.6, r * 0.4, 0.28, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    draw(ctx) {
        const space = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight);
        space.addColorStop(0, '#02030a');
        space.addColorStop(0.35, '#07112a');
        space.addColorStop(0.7, '#040816');
        space.addColorStop(1, '#010208');
        ctx.fillStyle = space;
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        const nebulaA = ctx.createRadialGradient(CONFIG.canvasWidth * 0.2, CONFIG.canvasHeight * 0.2, 20, CONFIG.canvasWidth * 0.2, CONFIG.canvasHeight * 0.2, 540);
        nebulaA.addColorStop(0, 'rgba(138, 92, 246, 0.34)');
        nebulaA.addColorStop(0.4, 'rgba(138, 92, 246, 0.12)');
        nebulaA.addColorStop(1, 'rgba(138, 92, 246, 0)');
        ctx.fillStyle = nebulaA;
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        const nebulaB = ctx.createRadialGradient(CONFIG.canvasWidth * 0.76, CONFIG.canvasHeight * 0.3, 30, CONFIG.canvasWidth * 0.76, CONFIG.canvasHeight * 0.3, 640);
        nebulaB.addColorStop(0, 'rgba(0, 194, 255, 0.3)');
        nebulaB.addColorStop(0.48, 'rgba(0, 194, 255, 0.1)');
        nebulaB.addColorStop(1, 'rgba(0, 194, 255, 0)');
        ctx.fillStyle = nebulaB;
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        const nebulaC = ctx.createRadialGradient(CONFIG.canvasWidth * 0.54, CONFIG.canvasHeight * 0.72, 30, CONFIG.canvasWidth * 0.54, CONFIG.canvasHeight * 0.72, 760);
        nebulaC.addColorStop(0, 'rgba(255, 87, 187, 0.18)');
        nebulaC.addColorStop(0.45, 'rgba(255, 87, 187, 0.08)');
        nebulaC.addColorStop(1, 'rgba(255, 87, 187, 0)');
        ctx.fillStyle = nebulaC;
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        for (const dust of this.spaceDust) {
            ctx.globalAlpha = dust.alpha;
            ctx.fillStyle = '#a7c7ff';
            ctx.beginPath();
            ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const star of this.deepStars) {
            const twinkle = Math.sin(this.pulseTime * (2 + star.depth * 3) + star.phase) * 0.5 + 0.5;
            ctx.globalAlpha = 0.15 + twinkle * 0.78;
            ctx.fillStyle = star.tint;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * (0.8 + twinkle * 0.35), 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 320; i++) {
            const x = (i * 173) % CONFIG.canvasWidth;
            const y = (i * 127) % CONFIG.canvasHeight;
            const twinkle = Math.sin(this.pulseTime * 4 + i) * 0.5 + 0.5;
            ctx.globalAlpha = 0.18 + twinkle * 0.75;
            ctx.fillStyle = i % 11 === 0 ? '#a8e6ff' : i % 7 === 0 ? '#ffd6ff' : '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, i % 5 === 0 ? 2.2 : 1.1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        for (const planet of this.planets) this.drawPlanet(ctx, planet);

        for (let i = 0; i < 24; i++) {
            const mx = (i * 331 + this.pulseTime * (160 + i * 4)) % (CONFIG.canvasWidth + 500) - 250;
            const my = 60 + ((i * 173) % Math.floor(CONFIG.canvasHeight * 0.75));
            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(0.65);
            ctx.globalAlpha = 0.18;
            ctx.strokeStyle = i % 2 === 0 ? '#ff9f43' : '#ffe29a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-46, -14);
            ctx.lineTo(30, 10);
            ctx.stroke();
            ctx.restore();
        }

        for (let i = 0; i < 7; i++) {
            const sx = ((this.pulseTime * (140 + i * 22)) + i * 470) % (CONFIG.canvasWidth + 420) - 210;
            const sy = CONFIG.canvasHeight * (0.18 + (i % 4) * 0.14);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = i % 2 === 0 ? '#6ae2ff' : '#c56bff';
            ctx.beginPath();
            ctx.moveTo(40, 0);
            ctx.lineTo(-18, -12);
            ctx.lineTo(-32, 0);
            ctx.lineTo(-18, 12);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = '#66d9ff';
        ctx.lineWidth = 1;
        const gridSizeSpace = 120;
        for (let x = this.gridOffset * 2; x < CONFIG.canvasWidth; x += gridSizeSpace) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.canvasHeight);
            ctx.stroke();
        }
        for (let y = this.gridOffset * 2; y < CONFIG.canvasHeight; y += gridSizeSpace) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.canvasWidth, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        return;
        ctx.fillStyle = '#dff7ff';
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        const sky = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight);
        sky.addColorStop(0, '#b8f0ff');
        sky.addColorStop(0.45, '#dff7ff');
        sky.addColorStop(1, '#fff4d6');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        const sun = ctx.createRadialGradient(260, 160, 10, 260, 160, 110);
        sun.addColorStop(0, 'rgba(255,255,210,0.95)');
        sun.addColorStop(0.55, 'rgba(255,230,140,0.85)');
        sun.addColorStop(1, 'rgba(255,230,140,0)');
        ctx.fillStyle = sun;
        ctx.beginPath();
        ctx.arc(260, 160, 110, 0, Math.PI * 2);
        ctx.fill();

        for (const cloud of this.clouds) {
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            for (let i = 0; i < cloud.puff; i++) {
                const offset = (i - (cloud.puff - 1) / 2) * cloud.size * 0.35;
                ctx.beginPath();
                ctx.arc(cloud.x + offset, cloud.y + Math.sin(this.pulseTime * 2 + i) * 4, cloud.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Grid futurista
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = this.gridOffset; x < CONFIG.canvasWidth; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.canvasHeight);
            ctx.stroke();
        }
        for (let y = this.gridOffset; y < CONFIG.canvasHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.canvasWidth, y);
            ctx.stroke();
        }

        // Líneas horizontales de profundidad
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
        for (let y = CONFIG.canvasHeight * 0.6; y < CONFIG.canvasHeight; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.canvasWidth, y);
            ctx.stroke();
        }
        const hillColors = ['#a5e887', '#84d86e', '#6fc85a'];
        hillColors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, CONFIG.canvasHeight);
            for (let x = 0; x <= CONFIG.canvasWidth; x += 80) {
                const y = CONFIG.canvasHeight - 170 + index * 45 + Math.sin(x * 0.004 + this.pulseTime * (1 + index * 0.2)) * (24 + index * 8);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(CONFIG.canvasWidth, CONFIG.canvasHeight);
            ctx.closePath();
            ctx.fill();
        });

        ctx.fillStyle = '#ffd4ea';
        ctx.beginPath();
        ctx.moveTo(0, CONFIG.canvasHeight);
        ctx.quadraticCurveTo(CONFIG.canvasWidth * 0.25, CONFIG.canvasHeight - 140, CONFIG.canvasWidth * 0.45, CONFIG.canvasHeight);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(CONFIG.canvasWidth, CONFIG.canvasHeight);
        ctx.quadraticCurveTo(CONFIG.canvasWidth * 0.75, CONFIG.canvasHeight - 160, CONFIG.canvasWidth * 0.55, CONFIG.canvasHeight);
        ctx.closePath();
        ctx.fill();

        for (const piece of this.confetti) {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(this.pulseTime + piece.offset);
            ctx.fillStyle = piece.color;
            ctx.globalAlpha = 0.5;
            if (piece.shape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(0, -piece.size);
                ctx.lineTo(piece.size * 0.7, 0);
                ctx.lineTo(0, piece.size);
                ctx.lineTo(-piece.size * 0.7, 0);
                ctx.closePath();
                ctx.fill();
            } else if (piece.shape === 'heart') {
                ctx.beginPath();
                ctx.moveTo(0, piece.size * 0.45);
                ctx.bezierCurveTo(piece.size, -piece.size * 0.1, piece.size * 0.8, -piece.size, 0, -piece.size * 0.35);
                ctx.bezierCurveTo(-piece.size * 0.8, -piece.size, -piece.size, -piece.size * 0.1, 0, piece.size * 0.45);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, piece.size * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        const ground = ctx.createLinearGradient(0, CONFIG.canvasHeight * 0.82, 0, CONFIG.canvasHeight);
        ground.addColorStop(0, 'rgba(255,255,255,0)');
        ground.addColorStop(1, 'rgba(255,201,219,0.35)');
        ctx.fillStyle = ground;
        ctx.fillRect(0, CONFIG.canvasHeight * 0.78, CONFIG.canvasWidth, CONFIG.canvasHeight * 0.22);

        for (let i = 0; i < 20; i++) {
            const px = (i * 97) % CONFIG.canvasWidth;
            const py = 100 + (i * 71) % Math.floor(CONFIG.canvasHeight * 0.65);
            const twinkle = Math.sin(this.pulseTime * 4 + i) * 0.5 + 0.5;
            ctx.globalAlpha = 0.25 + twinkle * 0.35;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 2 + twinkle * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

// ============================================
// EVENTOS DEL MUNDO
// ============================================
class MeteorHazard {
    constructor(x, y, angle, speed = 10, size = 26, damage = 22) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = size;
        this.damage = damage;
        this.life = 260;
        this.rotation = rand(0, Math.PI * 2);
        this.rotationSpeed = rand(-0.15, 0.15);
        this.dead = false;
    }

    update(player) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.life--;

        if (!this.dead && player && circleCollision(this, player)) {
            player.takeDamage(this.damage);
            game.screenShake.shake(8);
            game.particles.emitExplosion(this.x, this.y, 1.5);
            this.dead = true;
        }

        if (this.life <= 0 || this.x < -300 || this.x > CONFIG.canvasWidth + 300 || this.y < -300 || this.y > CONFIG.canvasHeight + 300) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.shadowColor = '#ff7a2f';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#6f4a32';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const r = this.radius * (0.72 + Math.sin(this.rotation * 2 + i) * 0.18);
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff9f43';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.15, -this.radius * 0.1, this.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class TrafficShip {
    constructor(fromLeft = true, y = rand(180, CONFIG.canvasHeight - 180), mecha = false) {
        this.x = fromLeft ? -240 : CONFIG.canvasWidth + 240;
        this.y = y;
        this.vx = fromLeft ? rand(16, 24) : -rand(16, 24);
        this.width = mecha ? 220 : 180;
        this.height = mecha ? 74 : 58;
        this.damage = mecha ? 28 : 16;
        this.dead = false;
        this.mecha = mecha;
        this.life = 260;
    }

    update(player) {
        this.x += this.vx;
        this.life--;
        const hitbox = { x: this.x - this.width / 2, y: this.y - this.height / 2, w: this.width, h: this.height };
        if (!this.dead && player && rectCollision(hitbox, { x: player.x - player.radius, y: player.y - player.radius, w: player.radius * 2, h: player.radius * 2 })) {
            player.takeDamage(this.damage);
            game.screenShake.shake(7);
            this.dead = true;
        }
        if (this.life <= 0 || this.x < -400 || this.x > CONFIG.canvasWidth + 400) this.dead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(Math.sign(this.vx), 1);
        ctx.shadowColor = this.mecha ? '#ff4444' : '#66d9ff';
        ctx.shadowBlur = 18;
        ctx.fillStyle = this.mecha ? '#737a8d' : '#2846c0';
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.48, 0);
        ctx.lineTo(-this.width * 0.12, -this.height * 0.45);
        ctx.lineTo(this.width * 0.42, -this.height * 0.24);
        ctx.lineTo(this.width * 0.5, 0);
        ctx.lineTo(this.width * 0.42, this.height * 0.24);
        ctx.lineTo(-this.width * 0.12, this.height * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = this.mecha ? '#ff8a80' : '#9be8ff';
        ctx.beginPath();
        ctx.ellipse(12, 0, this.width * 0.16, this.height * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class PlanetCollisionEffect {
    constructor() {
        this.timer = 120;
    }

    update() {
        this.timer--;
        if (this.timer === 96) {
            game.screenShake.shake(20);
            game.particles.emitExplosion(CONFIG.canvasWidth * 0.5, CONFIG.canvasHeight * 0.35, 5);
        }
    }

    get done() {
        return this.timer <= 0;
    }

    draw(ctx) {
        const t = 1 - this.timer / 120;
        const x1 = lerp(CONFIG.canvasWidth * 0.18, CONFIG.canvasWidth * 0.42, t);
        const y1 = lerp(-220, CONFIG.canvasHeight * 0.28, t);
        const x2 = lerp(CONFIG.canvasWidth * 0.82, CONFIG.canvasWidth * 0.58, t);
        const y2 = lerp(-220, CONFIG.canvasHeight * 0.32, t);

        ctx.save();
        ctx.globalAlpha = 0.5 + t * 0.4;
        ctx.fillStyle = '#587bff';
        ctx.beginPath();
        ctx.arc(x1, y1, 120 + t * 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7f50';
        ctx.beginPath();
        ctx.arc(x2, y2, 135 + t * 45, 0, Math.PI * 2);
        ctx.fill();
        if (this.timer < 70) {
            ctx.globalAlpha = (70 - this.timer) / 70;
            ctx.strokeStyle = '#fff2a8';
            ctx.lineWidth = 18;
            ctx.beginPath();
            ctx.arc(CONFIG.canvasWidth * 0.5, CONFIG.canvasHeight * 0.3, 120 + (70 - this.timer) * 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

class AllyCruiser {
    constructor() {
        this.x = -420;
        this.y = rand(CONFIG.canvasHeight * 0.22, CONFIG.canvasHeight * 0.48);
        this.vx = 20;
        this.width = 360;
        this.height = 120;
        this.life = 180;
        this.fireTimer = 0;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.life--;
        this.fireTimer--;

        if (this.fireTimer <= 0) {
            this.fireTimer = 10;
            const beams = [-0.55, -0.2, 0, 0.2, 0.55];
            for (const offset of beams) {
                const beamAngle = offset;
                const startX = this.x + this.width * 0.2;
                const startY = this.y + offset * 120;
                game.particles.emit(startX, startY, 8, {
                    colors: ['#66e0ff', '#ffffff', '#9d7bff'],
                    speed: 7,
                    life: 10,
                    size: 3,
                    glow: true,
                    angle: beamAngle,
                    angleSpread: 0.1,
                });

                const endX = startX + Math.cos(beamAngle) * 1700;
                const endY = startY + Math.sin(beamAngle) * 1700;
                for (const enemy of game.enemyManager.enemies) {
                    const d = pointToSegmentDistance(enemy.x, enemy.y, startX, startY, endX, endY);
                    if (d < enemy.radius + 18) enemy.takeDamage(14);
                }
                if (game.boss && !game.boss.dead) {
                    const d = pointToSegmentDistance(game.boss.x, game.boss.y, startX, startY, endX, endY);
                    if (d < game.boss.radius + 20) game.boss.takeDamage(10);
                }
                if (game.miniBoss && !game.miniBoss.dead) {
                    const d = pointToSegmentDistance(game.miniBoss.x, game.miniBoss.y, startX, startY, endX, endY);
                    if (d < game.miniBoss.radius + 20) game.miniBoss.takeDamage(12);
                }
            }
        }

        if (this.x > CONFIG.canvasWidth + 480 || this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowColor = '#72e4ff';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#8f9ac2';
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.48, 0);
        ctx.lineTo(-this.width * 0.18, -this.height * 0.42);
        ctx.lineTo(this.width * 0.28, -this.height * 0.26);
        ctx.lineTo(this.width * 0.48, 0);
        ctx.lineTo(this.width * 0.28, this.height * 0.26);
        ctx.lineTo(-this.width * 0.18, this.height * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c9d8ff';
        ctx.fillRect(-this.width * 0.15, -this.height * 0.18, this.width * 0.34, this.height * 0.36);
        ctx.fillStyle = '#66e0ff';
        ctx.beginPath();
        ctx.ellipse(this.width * 0.18, 0, this.width * 0.12, this.height * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = '#7df9ff';
        ctx.lineWidth = 6;
        for (const offset of [-0.55, -0.2, 0, 0.2, 0.55]) {
            ctx.beginPath();
            ctx.moveTo(this.width * 0.18, offset * 120);
            ctx.lineTo(this.width * 4.2, offset * 120 + offset * 220);
            ctx.stroke();
        }
        ctx.restore();
    }
}

class GroundTrap {
    constructor(x, y, type = 'mine') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = type === 'beartrap' ? 24 : 18;
        this.damage = type === 'beartrap' ? 18 : 24;
        this.life = 420;
        this.dead = false;
    }

    update(player) {
        this.life--;
        if (!this.dead && player && dist(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
            player.takeDamage(this.damage);
            if (this.type === 'beartrap') {
                player.vx *= 0.3;
                player.vy *= 0.3;
            } else {
                game.particles.emitExplosion(this.x, this.y, 1.8);
                game.screenShake.shake(10);
            }
            this.dead = true;
        }
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowColor = this.type === 'beartrap' ? '#c0c0c0' : '#ff6b6b';
        ctx.shadowBlur = 12;
        if (this.type === 'beartrap') {
            ctx.strokeStyle = '#c0c0c0';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.65, Math.PI * 0.15, Math.PI * 0.85);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.65, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#7a1f1f';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffea00';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.22, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// ============================================
// CLASE JUGADOR
// ============================================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        this.speed = CONFIG.playerSpeed;
        this.maxHealth = CONFIG.playerMaxHealth;
        this.health = this.maxHealth;
        this.maxShield = CONFIG.playerMaxShield;
        this.shield = 0;
        this.angle = 0;

        // Movimiento
        this.vx = 0;
        this.vy = 0;
        this.accel = 0.8;
        this.friction = 0.88;

        // Dash
        this.dashing = false;
        this.dashTimer = 0;
        this.dashCooldownTimer = 0;
        this.dashInvulnTimer = 0;
        this.dashTrail = [];

        // Arma
        this.weaponType = 'normal';
        this.ammo = CONFIG.maxAmmo;
        this.maxAmmo = CONFIG.maxAmmo;
        this.fireTimer = 0;
        this.reloading = false;
        this.reloadTimer = 0;

        // Habilidad
        this.skillTimer = 0;
        this.skillReady = true;
        this.blastSkillTimer = 0;
        this.blastSkillReady = true;
        this.teleportTimer = 0;
        this.laserRainTimer = 0;

        // Power-ups activos
        this.powerups = {};

        // Invulnerabilidad
        this.invulnTimer = 0;
        this.hitFlash = 0;

        // Drones aliados
        this.drones = [];

        // Combo
        this.combo = 0;
        this.score = 0;
        this.comboTimer = 0;

        // Sistema de niveles
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;

        // Animación
        this.animFrame = 0;
        this.walkCycle = 0;
    }

    update(keys, mouse) {
        this.animFrame++;

        // Movimiento con aceleración
        let dx = 0, dy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.hypot(dx, dy);
            dx /= len; dy /= len;
            this.vx += dx * this.accel;
            this.vy += dy * this.accel;
            this.walkCycle += 0.15;
        }

        // Dash
        if (keys['ShiftLeft'] || keys['ShiftRight']) {
            this.tryDash(dx, dy);
        }

        if (this.dashing) {
            this.dashTimer--;
            this.dashInvulnTimer--;
            this.dashTrail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.dashTrail.length > 8) this.dashTrail.shift();
            if (this.dashTimer <= 0) {
                this.dashing = false;
                this.vx *= 0.3;
                this.vy *= 0.3;
            }
        } else {
            this.vx *= this.friction;
            this.vy *= this.friction;
            if (this.dashCooldownTimer > 0) this.dashCooldownTimer--;
            if (this.dashInvulnTimer > 0) this.dashInvulnTimer--;
        }

        // Actualizar trail del dash
        for (const t of this.dashTrail) t.alpha *= 0.85;
        this.dashTrail = this.dashTrail.filter(t => t.alpha > 0.05);

        // Aplicar velocidad
        const currentSpeed = this.dashing ? CONFIG.dashSpeed : this.speed;
        const speedMult = this.powerups.speed ? 1.5 : 1;
        this.x += this.vx * currentSpeed * speedMult;
        this.y += this.vy * currentSpeed * speedMult;

        // Limitar al canvas
        this.x = clamp(this.x, this.radius, CONFIG.canvasWidth - this.radius);
        this.y = clamp(this.y, this.radius, CONFIG.canvasHeight - this.radius);

        // Apuntar al mouse
        this.angle = angle(this.x, this.y, mouse.x, mouse.y);

        // Disparo
        if (mouse.down && this.fireTimer <= 0 && !this.reloading) {
            this.shoot(game.bulletManager);
        }
        if (this.fireTimer > 0) this.fireTimer--;

        // Recarga
        if (this.reloading) {
            this.reloadTimer--;
            if (this.reloadTimer <= 0) {
                this.ammo = this.maxAmmo;
                this.reloading = false;
            }
        }

        // Recarga manual
        if (keys['KeyR'] && !this.reloading && this.ammo < this.maxAmmo) {
            this.reloading = true;
            this.reloadTimer = CONFIG.reloadTime;
        }

        // Habilidad especial nave aliada
        if (keys['KeyE'] && this.skillReady) {
            this.useSupportSkill();
        }
        if (this.skillTimer > 0) {
            this.skillTimer--;
            if (this.skillTimer <= 0) this.skillReady = true;
        }

        // Habilidad explosiva anterior
        if (keys['KeyC'] && this.blastSkillReady) {
            this.useBlastSkill();
        }
        if (this.blastSkillTimer > 0) {
            this.blastSkillTimer--;
            if (this.blastSkillTimer <= 0) this.blastSkillReady = true;
        }

        if (keys['KeyQ'] && this.teleportTimer <= 0) {
            this.useTeleport();
        }
        if (this.teleportTimer > 0) this.teleportTimer--;

        if (keys['KeyX'] && this.laserRainTimer <= 0) {
            this.useLaserRain();
        }
        if (this.laserRainTimer > 0) this.laserRainTimer--;

        // Cambio de arma
        if (keys['Digit1']) this.weaponType = 'normal';
        if (keys['Digit2']) this.weaponType = 'triple';
        if (keys['Digit3']) this.weaponType = 'quintuple';
        if (keys['Digit4']) this.weaponType = 'grenade';
        if (keys['Digit5']) this.weaponType = 'laser';
        if (keys['Digit6']) this.weaponType = 'shockwave';
        if (keys['Digit7']) this.weaponType = 'homing';
        if (keys['Digit8']) this.weaponType = 'shotgun';
        if (keys['Digit9']) this.weaponType = 'railgun';
        if (keys['Digit0']) this.weaponType = 'plasma';
        if (keys['Minus']) this.weaponType = 'flame';
        if (keys['Equal']) this.weaponType = 'tesla';
        if (keys['BracketLeft']) this.weaponType = 'iceburst';
        if (keys['BracketRight']) this.weaponType = 'gravity';
        if (keys['Backslash']) this.weaponType = 'nuclear';

        // Power-ups temporales
        for (const key in this.powerups) {
            this.powerups[key]--;
            if (this.powerups[key] <= 0) delete this.powerups[key];
        }

        // Aplicar slow motion a enemigos
        if (this.powerups.slowmotion) {
            for (const enemy of game.enemyManager.enemies) {
                enemy.slowTimer = 10;
            }
        }

        // Invulnerabilidad
        if (this.invulnTimer > 0) this.invulnTimer--;
        if (this.hitFlash > 0) this.hitFlash--;

        // Combo
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Regeneración
        if (this.powerups.regen && this.health < this.maxHealth) {
            if (this.animFrame % 30 === 0) this.health = Math.min(this.maxHealth, this.health + 1);
        }

        // Regeneración de escudo
        if (this.powerups.shieldRegen && this.shield < this.maxShield) {
            if (this.animFrame % 60 === 0) this.shield = Math.min(this.maxShield, this.shield + 1);
        }

        // Aura de daño
        if (this.powerups.damageAura && this.animFrame % 10 === 0) {
            for (const enemy of game.enemyManager.enemies) {
                if (dist(this.x, this.y, enemy.x, enemy.y) < 80) {
                    enemy.takeDamage(2);
                }
            }
        }

        // Drones aliados
        for (const d of this.drones) {
            d.update(this.x, this.y, game.enemyManager.enemies);
        }
    }

    tryDash(dx, dy) {
        if (this.dashCooldownTimer <= 0 && !this.dashing && (dx !== 0 || dy !== 0)) {
            this.dashing = true;
            this.dashTimer = CONFIG.dashDuration;
            this.dashCooldownTimer = CONFIG.dashCooldown;
            this.dashInvulnTimer = CONFIG.dashInvulnerability;
            this.vx = dx * 2;
            this.vy = dy * 2;
            sound.play('dash');
            game.particles.emit(this.x, this.y, 15, {
                colors: ['#00f0ff', '#00aaff', '#ffffff'],
                speed: 5,
                life: 20,
                size: 3,
                glow: true,
                angle: this.angle + Math.PI,
                angleSpread: Math.PI * 0.5,
            });
        }
    }

    shoot(bm) {
        if (this.ammo <= 0 && !this.powerups.infinite) {
            this.reloading = true;
            this.reloadTimer = CONFIG.reloadTime;
            return;
        }

        const mult = this.powerups.damage ? 2 : 1;
        const massiveMult = this.powerups.massive ? 3 : 1;
        const totalMult = mult * massiveMult;
        const pierce = this.powerups.pierce;
        const explosive = this.powerups.explosive;
        const freeze = this.powerups.freeze;
        const auto = this.powerups.autofire;

        let fireRate = CONFIG.fireRate;
        if (this.powerups.rapid) fireRate = Math.max(2, fireRate - 4);
        if (auto) fireRate = Math.max(1, fireRate - 2);
        this.fireTimer = fireRate;

        if (!this.powerups.infinite) this.ammo--;

        const spread = this.powerups.spread ? 0.3 : 0.05;

        switch(this.weaponType) {
            case 'normal':
                bm.addBullet(this.x, this.y, this.angle + rand(-spread, spread), 12, 10 * totalMult, '#00f0ff', pierce, explosive, freeze);
                sound.play('shoot');
                break;
            case 'triple':
                for (let i = -1; i <= 1; i++) {
                    bm.addBullet(this.x, this.y, this.angle + i * 0.15 + rand(-spread, spread), 11, 8 * totalMult, '#00aaff', pierce, explosive, freeze);
                }
                sound.play('shoot');
                break;
            case 'quintuple':
                for (let i = -2; i <= 2; i++) {
                    bm.addBullet(this.x, this.y, this.angle + i * 0.12 + rand(-spread, spread), 10, 7 * totalMult, '#ff00e4', pierce, explosive, freeze);
                }
                sound.play('shoot_heavy');
                break;
            case 'grenade':
                bm.addGrenade(this.x, this.y, this.angle, 7, 25 * totalMult, 60);
                sound.play('shoot_heavy');
                break;
            case 'laser':
                bm.addLaser(this.x, this.y, this.angle, 20 * totalMult, 20);
                sound.play('shoot_heavy');
                break;
            case 'shockwave':
                bm.addShockwave(this.x, this.y, 8 * totalMult);
                sound.play('shoot_heavy');
                break;
            case 'homing':
                bm.addHoming(this.x, this.y, this.angle, 9, 15 * totalMult);
                sound.play('shoot');
                break;
            case 'shotgun':
                for (let i = 0; i < 8; i++) {
                    bm.addBullet(this.x, this.y, this.angle + rand(-0.5, 0.5), rand(8, 14), 6 * totalMult, '#ffaa00', pierce, explosive, freeze);
                }
                sound.play('shoot_heavy');
                break;
            case 'railgun':
                bm.addRailgun(this.x, this.y, this.angle, 40 * totalMult);
                this.fireTimer = 40;
                sound.play('shoot_heavy');
                break;
            case 'plasma':
                bm.addPlasma(this.x, this.y, this.angle, 6, 18 * totalMult);
                sound.play('shoot_heavy');
                break;
            case 'flame':
                bm.addFlameCone(this.x, this.y, this.angle, 5.5 * totalMult);
                this.fireTimer = Math.max(2, fireRate - 3);
                sound.play('shoot');
                break;
            case 'tesla':
                bm.addTeslaArc(this.x, this.y, this.angle, 12 * totalMult);
                this.fireTimer = Math.max(10, fireRate + 8);
                sound.play('boss_alert');
                break;
            case 'iceburst':
                bm.addIceBurst(this.x, this.y, this.angle, 8 * totalMult);
                sound.play('shoot');
                break;
            case 'gravity':
                bm.addGravityOrb(this.x, this.y, this.angle, 15 * totalMult);
                this.fireTimer = Math.max(12, fireRate + 6);
                sound.play('shoot_heavy');
                break;
            case 'nuclear':
                bm.addNukeRocket(this.x, this.y, this.angle, 42 * totalMult);
                this.fireTimer = 55;
                sound.play('shoot_heavy');
                break;
        }

        // Retroceso visual
        this.vx -= Math.cos(this.angle) * 0.5;
        this.vy -= Math.sin(this.angle) * 0.5;

        // Partículas de disparo
        const muzzleX = this.x + Math.cos(this.angle) * 20;
        const muzzleY = this.y + Math.sin(this.angle) * 20;
        game.particles.emit(muzzleX, muzzleY, 3, {
            colors: ['#00f0ff', '#ffffff'],
            speed: 3,
            life: 8,
            size: 2,
            glow: true,
            angle: this.angle,
            angleSpread: 0.5,
        });
    }

    useSupportSkill() {
        this.skillReady = false;
        this.skillTimer = CONFIG.skillCooldown;
        game.summonAllyCruiser();
        window.onSkillUsed?.();
        game.particles.emitShockwave(this.x, this.y, '#7df9ff');
        for (const enemy of game.enemyManager.enemies) {
            if (dist(this.x, this.y, enemy.x, enemy.y) < 220) enemy.takeDamage(14);
        }
        sound.play('boss_alert');
    }

    useBlastSkill() {
        this.blastSkillReady = false;
        this.blastSkillTimer = Math.max(240, CONFIG.skillCooldown - 180);
        window.onSkillUsed?.();

        // Recupera la explosion/onda original y la combina con la nave aliada.
        game.particles.emitShockwave(this.x, this.y, '#ffea00');
        game.particles.emitExplosion(this.x, this.y, 2.2);
        game.screenShake.shake(14);

        for (const enemy of game.enemyManager.enemies) {
            const d = dist(this.x, this.y, enemy.x, enemy.y);
            if (d < 280) {
                const pushAngle = angle(this.x, this.y, enemy.x, enemy.y);
                enemy.vx += Math.cos(pushAngle) * 7;
                enemy.vy += Math.sin(pushAngle) * 7;
                enemy.takeDamage(30);
            }
        }
        if (game.miniBoss && !game.miniBoss.dead && dist(this.x, this.y, game.miniBoss.x, game.miniBoss.y) < 320) {
            const pushAngle = angle(this.x, this.y, game.miniBoss.x, game.miniBoss.y);
            game.miniBoss.vx += Math.cos(pushAngle) * 6;
            game.miniBoss.vy += Math.sin(pushAngle) * 6;
            game.miniBoss.takeDamage(32);
        }
        if (game.boss && !game.boss.dead && dist(this.x, this.y, game.boss.x, game.boss.y) < 340) {
            const pushAngle = angle(this.x, this.y, game.boss.x, game.boss.y);
            game.boss.vx += Math.cos(pushAngle) * 4;
            game.boss.vy += Math.sin(pushAngle) * 4;
            game.boss.takeDamage(24);
        }
        sound.play('explosion');
    }

    useTeleport() {
        const jump = 180;
        const tx = clamp(this.x + Math.cos(this.angle) * jump, this.radius, CONFIG.canvasWidth - this.radius);
        const ty = clamp(this.y + Math.sin(this.angle) * jump, this.radius, CONFIG.canvasHeight - this.radius);
        game.particles.emit(this.x, this.y, 16, {
            colors: ['#7df9ff', '#b388ff', '#ffffff'],
            speed: 5,
            life: 16,
            size: 3,
            glow: true,
        });
        this.x = tx;
        this.y = ty;
        this.invulnTimer = Math.max(this.invulnTimer, 15);
        this.teleportTimer = 180;
        sound.play('dash');
        game.particles.emit(this.x, this.y, 18, {
            colors: ['#7df9ff', '#b388ff', '#ffffff'],
            speed: 6,
            life: 18,
            size: 3,
            glow: true,
        });
    }

    useLaserRain() {
        this.laserRainTimer = 540;
        game.showNotification('LLUVIA DE LASERES', 'powerup');
        sound.play('boss_alert');
        for (let i = 0; i < 7; i++) {
            const lx = clamp(this.x + rand(-280, 280), 60, CONFIG.canvasWidth - 60);
            const ly = clamp(this.y - rand(120, 260), 40, CONFIG.canvasHeight - 40);
            setTimeout(() => {
                if (!game || game.state !== 'playing') return;
                game.particles.emitShockwave(lx, ly, '#7df9ff');
                game.bulletManager.addLaser(lx, ly, Math.PI / 2, 16, 10);
            }, i * 80);
        }
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0 || this.dashInvulnTimer > 0 || this.powerups.god) return;

        // Escudo absorbe daño primero
        if (this.shield > 0) {
            const shieldAbsorb = Math.min(this.shield, amount);
            this.shield -= shieldAbsorb;
            amount -= shieldAbsorb;
            if (this.powerups.reflect) {
                for (const enemy of game.enemyManager.enemies) {
                    if (dist(this.x, this.y, enemy.x, enemy.y) < 100) {
                        enemy.takeDamage(shieldAbsorb * 0.5);
                    }
                }
            }
        }

        if (amount > 0) {
            this.health -= amount;
            this.hitFlash = 10;
            this.invulnTimer = 30;
            game.screenShake.shake(5);
            sound.play('hit');

            // Partículas de daño
            game.particles.emit(this.x, this.y, 8, {
                colors: ['#ff0000', '#ff4444'],
                speed: 4,
                life: 15,
                size: 3,
                glow: true,
            });
        }

        if (this.health <= 0) {
            this.health = 0;
            game.gameOver();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addShield(amount) {
        this.shield = Math.min(this.maxShield, this.shield + amount);
    }

    addCombo() {
        this.combo = Math.min(CONFIG.maxCombo, this.combo + 1);
        this.comboTimer = CONFIG.comboDecay;
        window.onComboUpdate?.(this.combo);
    }

    getComboMult() {
        return 1 + Math.floor(this.combo / 5) * 0.5;
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.3);
            this.maxHealth += 10;
            this.health = Math.min(this.maxHealth, this.health + 10);
            game.showNotification(`¡NIVEL ${this.level}! +10 HP`, 'wave');
        }
    }

    draw(ctx) {
        ctx.save();

        // Trail del dash
        for (const t of this.dashTrail) {
            ctx.globalAlpha = t.alpha * 0.4;
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Flash de daño
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(this.hitFlash * 2) * 0.3;
        }

        // Invulnerabilidad parpadeo
        if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 3) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // Escudo
        if (this.shield > 0 || this.powerups.god) {
            ctx.strokeStyle = this.powerups.god ? '#ffea00' : '#00aaff';
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6 + Math.sin(this.animFrame * 0.1) * 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Cuerpo del jugador
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Aura de power-ups
        if (this.powerups.god) {
            ctx.fillStyle = 'rgba(255, 234, 0, 0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Base del jugador
        ctx.fillStyle = this.powerups.god ? '#ffea00' : '#00f0ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Detalle interno
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Arma / Cañón
        ctx.fillStyle = '#aaddff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(8, -4, 16, 8);

        // Brillo del arma
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, -2, 4, 4);

        ctx.shadowBlur = 0;
        ctx.restore();

        // Drones aliados
        for (const d of this.drones) d.draw(ctx);
    }
}

// ============================================
// CLASE DRON ALIADO
// ============================================
class Drone {
    constructor(owner) {
        this.owner = owner;
        this.angle = 0;
        this.orbitRadius = 50;
        this.orbitSpeed = 0.03;
        this.fireTimer = 0;
        this.x = owner.x;
        this.y = owner.y;
    }

    update(px, py, enemies) {
        this.angle += this.orbitSpeed;
        this.x = px + Math.cos(this.angle) * this.orbitRadius;
        this.y = py + Math.sin(this.angle) * this.orbitRadius;

        // Disparar al enemigo más cercano
        if (this.fireTimer <= 0) {
            let closest = null;
            let closestDist = 300;
            for (const e of enemies) {
                const d = dist(this.x, this.y, e.x, e.y);
                if (d < closestDist) {
                    closestDist = d;
                    closest = e;
                }
            }
            if (closest) {
                const a = angle(this.x, this.y, closest.x, closest.y);
                game.bulletManager.addBullet(this.x, this.y, a, 10, 5, '#00ff88', false, false, false);
                this.fireTimer = 20;
            }
        }
        if (this.fireTimer > 0) this.fireTimer--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

// ============================================
// CLASE BALA / PROYECTIL
// ============================================
class Bullet {
    constructor(x, y, angle, speed, damage, color, pierce = false, explosive = false, freeze = false) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.color = color;
        this.radius = 3;
        this.life = 120;
        this.pierce = pierce;
        this.explosive = explosive;
        this.freeze = freeze;
        this.hitEnemies = new Set();
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 6) this.trail.shift();
        for (const t of this.trail) t.alpha *= 0.8;

        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    isOffScreen() {
        return this.x < -50 || this.x > CONFIG.canvasWidth + 50 ||
               this.y < -50 || this.y > CONFIG.canvasHeight + 50 || this.life <= 0;
    }

    draw(ctx) {
        // Trail
        for (const t of this.trail) {
            ctx.globalAlpha = t.alpha * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Bala
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brillante
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// CLASE GRANADA
// ============================================
class Grenade {
    constructor(x, y, angle, speed, damage, fuse) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.fuse = fuse;
        this.maxFuse = fuse;
        this.radius = 5;
        this.gravity = 0.08;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.fuse--;

        // Parpadeo antes de explotar
        if (this.fuse < 20 && this.fuse % 4 === 0) {
            game.particles.emitSpark(this.x, this.y, '#ff4400');
        }
    }

    explode() {
        const radius = 80;
        game.particles.emitExplosion(this.x, this.y, 1.5);
        game.screenShake.shake(10);
        sound.play('explosion');

        // Daño a enemigos normales
        for (const enemy of game.enemyManager.enemies) {
            const d = dist(this.x, this.y, enemy.x, enemy.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                enemy.takeDamage(this.damage * falloff);
            }
        }
        // Daño a vehículos
        for (const v of game.enemyManager.vehicles) {
            if (v.health <= 0) continue;
            const d = dist(this.x, this.y, v.x, v.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                v.health -= this.damage * falloff;
                if (v.health <= 0) {
                    game.score += 50;
                    game.kills++;
                    game.particles.emitExplosion(v.x, v.y, 1);
                }
            }
        }
        // Daño al jefe
        if (game.boss && !game.boss.dead) {
            const d = dist(this.x, this.y, game.boss.x, game.boss.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                game.boss.takeDamage(this.damage * falloff);
            }
        }
        // Daño al mini jefe
        if (game.miniBoss && !game.miniBoss.dead) {
            const d = dist(this.x, this.y, game.miniBoss.x, game.miniBoss.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                game.miniBoss.takeDamage(this.damage * falloff);
            }
        }
        // Limpiar vehículos muertos
        game.enemyManager.vehicles = game.enemyManager.vehicles.filter(v => v.health > 0);
    }

    draw(ctx) {
        ctx.fillStyle = '#ff6600';
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// GRANADA DE HABILIDAD (explota al impactar)
// ============================================
class SkillGrenade {
    constructor(x, y, angle, speed, damage) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.radius = 6;
        this.exploded = false;
        this.life = 180;
    }

    update() {
        if (this.exploded) return;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Colisión con enemigos normales
        for (const enemy of game.enemyManager.enemies) {
            if (enemy.dead || enemy.spawnTimer > 0) continue;
            if (circleCollision(this, enemy)) {
                this.explode(enemy.x, enemy.y);
                return;
            }
        }

        // Colisión con vehículos
        for (let i = 0; i < game.enemyManager.vehicles.length; i++) {
            const v = game.enemyManager.vehicles[i];
            if (v.health <= 0) continue;
            const vehicleRadius = Math.max(v.width, v.height) / 2;
            if (Math.hypot(this.x - v.x, this.y - v.y) < this.radius + vehicleRadius) {
                this.explode(v.x, v.y);
                return;
            }
        }

        // Colisión con el jefe
        if (game.boss && !game.boss.dead && circleCollision(this, game.boss)) {
            this.explode(game.boss.x, game.boss.y);
            return;
        }

        // Colisión con mini jefe
        if (game.miniBoss && !game.miniBoss.dead && circleCollision(this, game.miniBoss)) {
            this.explode(game.miniBoss.x, game.miniBoss.y);
            return;
        }

        // Eliminar si sale de pantalla o pasa el tiempo
        if (this.life <= 0 || this.x < -100 || this.x > CONFIG.canvasWidth + 100 ||
            this.y < -100 || this.y > CONFIG.canvasHeight + 100) {
            this.exploded = true;
        }
    }

    explode(atX, atY) {
        if (this.exploded) return;
        this.exploded = true;

        const radius = 70;
        game.particles.emitExplosion(atX, atY, 1.2);
        game.screenShake.shake(6);
        sound.play('explosion');

        // Daño a enemigos cercanos
        for (const enemy of game.enemyManager.enemies) {
            const d = dist(atX, atY, enemy.x, enemy.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                enemy.takeDamage(this.damage * falloff);
            }
        }
        // Daño a vehículos
        for (const v of game.enemyManager.vehicles) {
            if (v.health <= 0) continue;
            const d = dist(atX, atY, v.x, v.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                v.health -= this.damage * falloff;
                if (v.health <= 0) {
                    game.score += 50;
                    game.kills++;
                    game.particles.emitExplosion(v.x, v.y, 1);
                }
            }
        }
        // Daño al jefe
        if (game.boss && !game.boss.dead) {
            const d = dist(atX, atY, game.boss.x, game.boss.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                game.boss.takeDamage(this.damage * falloff);
            }
        }
        // Daño al mini jefe
        if (game.miniBoss && !game.miniBoss.dead) {
            const d = dist(atX, atY, game.miniBoss.x, game.miniBoss.y);
            if (d < radius) {
                const falloff = 1 - (d / radius);
                game.miniBoss.takeDamage(this.damage * falloff);
            }
        }
    }

    draw(ctx) {
        if (this.exploded) return;
        ctx.fillStyle = '#ff6600';
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// CLASE LÁSER
// ============================================
class Laser {
    constructor(x, y, angle, damage, duration) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.duration = duration;
        this.maxDuration = duration;
        this.width = 6;
        this.length = 2000;
        this.hitEnemies = new Set();
        this.hitVehicles = new Set();
        this.hitBoss = false;
        this.hitMiniBoss = false;
        this.lastDamageFrame = 0;
    }

    update() {
        this.duration--;
        const endX = this.x + Math.cos(this.angle) * this.length;
        const endY = this.y + Math.sin(this.angle) * this.length;

        if (game.frame % 3 === 0) {
            // Enemigos normales
            for (const enemy of game.enemyManager.enemies) {
                const distToLine = this.pointToLineDistance(enemy.x, enemy.y, this.x, this.y, endX, endY);
                if (distToLine < enemy.radius + this.width && enemy.invulnTimer <= 0) {
                    if (!this.hitEnemies.has(enemy.id)) {
                        enemy.takeDamage(this.damage);
                        this.hitEnemies.add(enemy.id);
                        game.particles.emitSpark(enemy.x, enemy.y, '#ff00e4');
                    }
                } else {
                    this.hitEnemies.delete(enemy.id);
                }
            }

            // Vehículos
            for (let i = 0; i < game.enemyManager.vehicles.length; i++) {
                const v = game.enemyManager.vehicles[i];
                if (v.health <= 0) continue;
                const vehicleRadius = Math.max(v.width, v.height) / 2;
                const distToLine = this.pointToLineDistance(v.x, v.y, this.x, this.y, endX, endY);
                if (distToLine < vehicleRadius + this.width) {
                    if (!this.hitVehicles.has(i)) {
                        v.health -= this.damage;
                        this.hitVehicles.add(i);
                        game.particles.emitSpark(v.x, v.y, '#ff00e4');
                        if (v.health <= 0) {
                            game.score += 50;
                            game.kills++;
                            game.particles.emitExplosion(v.x, v.y, 1);
                        }
                    }
                } else {
                    this.hitVehicles.delete(i);
                }
            }

            // Jefe
            if (game.boss && !game.boss.dead) {
                const distToLine = this.pointToLineDistance(game.boss.x, game.boss.y, this.x, this.y, endX, endY);
                if (distToLine < game.boss.radius + this.width && game.boss.invulnTimer <= 0) {
                    if (!this.hitBoss) {
                        game.boss.takeDamage(this.damage);
                        this.hitBoss = true;
                        game.particles.emitSpark(game.boss.x, game.boss.y, '#ff00e4');
                    }
                } else {
                    this.hitBoss = false;
                }
            }

            // Mini jefe
            if (game.miniBoss && !game.miniBoss.dead) {
                const distToLine = this.pointToLineDistance(game.miniBoss.x, game.miniBoss.y, this.x, this.y, endX, endY);
                if (distToLine < game.miniBoss.radius + this.width && game.miniBoss.invulnTimer <= 0) {
                    if (!this.hitMiniBoss) {
                        game.miniBoss.takeDamage(this.damage);
                        this.hitMiniBoss = true;
                        game.particles.emitSpark(game.miniBoss.x, game.miniBoss.y, '#ff00e4');
                    }
                } else {
                    this.hitMiniBoss = false;
                }
            }
        }
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        return Math.hypot(px - xx, py - yy);
    }

    draw(ctx) {
        const alpha = this.duration / this.maxDuration;
        const endX = this.x + Math.cos(this.angle) * this.length;
        const endY = this.y + Math.sin(this.angle) * this.length;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.strokeStyle = 'rgba(255, 0, 228, 0.3)';
        ctx.lineWidth = this.width * 4;
        ctx.shadowColor = '#ff00e4';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#ff00e4';
        ctx.lineWidth = this.width;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.width * 0.4;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.restore();
    }
}

// ============================================
// CLASE ONDA DE CHOQUE
// ============================================
class Shockwave {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.radius = 5;
        this.maxRadius = 200;
        this.speed = 12;
        this.alpha = 1;
        this.hitEnemies = new Set();
        this.hitVehicles = new Set();
        this.hitBoss = false;
        this.hitMiniBoss = false;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);

        // Enemigos normales
        for (const enemy of game.enemyManager.enemies) {
            const d = dist(this.x, this.y, enemy.x, enemy.y);
            if (d < this.radius + enemy.radius && d > this.radius - this.speed - enemy.radius) {
                if (!this.hitEnemies.has(enemy.id)) {
                    enemy.takeDamage(this.damage);
                    this.hitEnemies.add(enemy.id);
                    const pushAngle = angle(this.x, this.y, enemy.x, enemy.y);
                    enemy.vx += Math.cos(pushAngle) * 5;
                    enemy.vy += Math.sin(pushAngle) * 5;
                }
            }
        }

        // Vehículos
        for (let i = 0; i < game.enemyManager.vehicles.length; i++) {
            const v = game.enemyManager.vehicles[i];
            if (v.health <= 0) continue;
            const vehicleRadius = Math.max(v.width, v.height) / 2;
            const d = dist(this.x, this.y, v.x, v.y);
            if (d < this.radius + vehicleRadius && d > this.radius - this.speed - vehicleRadius) {
                if (!this.hitVehicles.has(i)) {
                    v.health -= this.damage;
                    this.hitVehicles.add(i);
                    if (v.health <= 0) {
                        game.score += 50;
                        game.kills++;
                        game.particles.emitExplosion(v.x, v.y, 1);
                    }
                }
            }
        }

        // Jefe
        if (game.boss && !game.boss.dead) {
            const d = dist(this.x, this.y, game.boss.x, game.boss.y);
            if (d < this.radius + game.boss.radius && d > this.radius - this.speed - game.boss.radius) {
                if (!this.hitBoss) {
                    game.boss.takeDamage(this.damage);
                    this.hitBoss = true;
                }
            }
        }

        // Mini jefe
        if (game.miniBoss && !game.miniBoss.dead) {
            const d = dist(this.x, this.y, game.miniBoss.x, game.miniBoss.y);
            if (d < this.radius + game.miniBoss.radius && d > this.radius - this.speed - game.miniBoss.radius) {
                if (!this.hitMiniBoss) {
                    game.miniBoss.takeDamage(this.damage);
                    this.hitMiniBoss = true;
                }
            }
        }
    }

    isDone() {
        return this.radius >= this.maxRadius;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.6;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = this.alpha * 0.3;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// ============================================
// CLASE MISIL RASTREADOR
// ============================================
class HomingMissile {
    constructor(x, y, angle, speed, damage) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.speed = speed;
        this.damage = damage;
        this.radius = 4;
        this.life = 180;
        this.target = null;
        this.turnRate = 0.08;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) this.trail.shift();
        for (const t of this.trail) t.alpha *= 0.85;

        // Buscar objetivo
        if (!this.target || this.target.dead) {
            let closest = null;
            let closestDist = 400;
            for (const e of game.enemyManager.enemies) {
                const d = dist(this.x, this.y, e.x, e.y);
                if (d < closestDist) {
                    closestDist = d;
                    closest = e;
                }
            }
            this.target = closest;
        }

        // Perseguir objetivo
        if (this.target) {
            const targetAngle = angle(this.x, this.y, this.target.x, this.target.y);
            let currentAngle = Math.atan2(this.vy, this.vx);
            let diff = normalizeAngle(targetAngle - currentAngle);
            diff = clamp(diff, -this.turnRate, this.turnRate);
            currentAngle += diff;
            this.vx = Math.cos(currentAngle) * this.speed;
            this.vy = Math.sin(currentAngle) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    isOffScreen() {
        return this.x < -100 || this.x > CONFIG.canvasWidth + 100 ||
               this.y < -100 || this.y > CONFIG.canvasHeight + 100 || this.life <= 0;
    }

    draw(ctx) {
        for (const t of this.trail) {
            ctx.globalAlpha = t.alpha * 0.4;
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        const a = Math.atan2(this.vy, this.vx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(a);
        ctx.fillStyle = '#ff6600';
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(-2, -2);
        ctx.lineTo(-2, 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

// ============================================
// CLASE BALA DE RAILGUN
// ============================================
class RailgunBullet {
    constructor(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.life = 5;
        this.maxLife = 5;
        this.length = CONFIG.canvasWidth * 1.5;
    }

    update() {
        this.life--;
    }

    isOffScreen() {
        return this.life <= 0;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const endX = this.x + Math.cos(this.angle) * this.length;
        const endY = this.y + Math.sin(this.angle) * this.length;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.strokeStyle = 'rgba(255,255,100,0.3)';
        ctx.lineWidth = 20;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.restore();
    }
}

// ============================================
// CLASE BALA DE PLASMA
// ============================================
class PlasmaBall {
    constructor(x, y, angle, speed, damage) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.radius = 10;
        this.life = 180;
        this.maxLife = 180;
        this.hitEnemies = new Set();
        this.animFrame = 0;
        this.growTimer = 0;
    }

    update() {
        this.animFrame++;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        this.growTimer++;
        if (this.growTimer > 60) this.radius = Math.min(25, this.radius + 0.05);

        // Daño a todos los enemigos cercanos
        if (this.animFrame % 5 === 0) {
            for (const e of game.enemyManager.enemies) {
                if (!e.dead && dist(this.x, this.y, e.x, e.y) < this.radius + e.radius) {
                    if (!this.hitEnemies.has(e.id)) {
                        e.takeDamage(this.damage);
                        this.hitEnemies.add(e.id);
                    }
                }
            }
            if (game.boss && !game.boss.dead && dist(this.x, this.y, game.boss.x, game.boss.y) < this.radius + game.boss.radius) {
                game.boss.takeDamage(this.damage);
            }
            if (game.miniBoss && !game.miniBoss.dead && dist(this.x, this.y, game.miniBoss.x, game.miniBoss.y) < this.radius + game.miniBoss.radius) {
                game.miniBoss.takeDamage(this.damage);
            }
        }

        game.particles.emit(this.x, this.y, 1, { color: '#aa00ff', speed: 1, life: 10, size: 3, glow: true });
    }

    isOffScreen() {
        return this.x < -100 || this.x > CONFIG.canvasWidth + 100 ||
               this.y < -100 || this.y > CONFIG.canvasHeight + 100 || this.life <= 0;
    }

    draw(ctx) {
        const alpha = Math.min(1, this.life / 30);
        ctx.globalAlpha = alpha;

        ctx.fillStyle = 'rgba(170,0,255,0.3)';
        ctx.shadowColor = '#aa00ff';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cc44ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}


// ============================================
// CLASE ENEMIGO
// ============================================
// CLASE ENEMIGO
// ============================================
let enemyIdCounter = 0;

class Enemy {
    constructor(x, y, type, wave) {
        this.id = ++enemyIdCounter;
        this.x = x;
        this.y = y;
        this.type = type;
        this.dead = false;
        this.animFrame = 0;
        this.vx = 0;
        this.vy = 0;
        this.invulnTimer = 0;
        this.flashTimer = 0;
        this.slowTimer = 0;
        this.spawnTimer = 20;

        const diff = DIFFICULTY_MULT[CONFIG.difficulty];
        const waveMult = 1 + wave * 0.08;

        switch(type) {
            case 'small':
                this.radius = 10;
                this.maxHealth = 15 * diff.enemyHealth * waveMult;
                this.speed = 3.5 * diff.enemySpeed;
                this.damage = 8 * diff.enemyDamage;
                this.color = '#ff4444';
                this.glowColor = '#ff0000';
                this.score = 10;
                break;
            case 'fast':
                this.radius = 9;
                this.maxHealth = 12 * diff.enemyHealth * waveMult;
                this.speed = 5.5 * diff.enemySpeed;
                this.damage = 6 * diff.enemyDamage;
                this.color = '#ff8800';
                this.glowColor = '#ff6600';
                this.score = 15;
                break;
            case 'big':
                this.radius = 18;
                this.maxHealth = 50 * diff.enemyHealth * waveMult;
                this.speed = 1.8 * diff.enemySpeed;
                this.damage = 15 * diff.enemyDamage;
                this.color = '#aa4444';
                this.glowColor = '#ff2222';
                this.score = 25;
                break;
            case 'bomber':
                this.radius = 14;
                this.maxHealth = 30 * diff.enemyHealth * waveMult;
                this.speed = 2 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#ffaa00';
                this.glowColor = '#ff8800';
                this.score = 30;
                this.bombTimer = 60;
                break;
            case 'flyer':
                this.radius = 12;
                this.maxHealth = 25 * diff.enemyHealth * waveMult;
                this.speed = 3 * diff.enemySpeed;
                this.damage = 10 * diff.enemyDamage;
                this.color = '#aa66ff';
                this.glowColor = '#8844ff';
                this.score = 20;
                this.flyOffset = rand(0, Math.PI * 2);
                break;
            case 'tank':
                this.radius = 22;
                this.maxHealth = 100 * diff.enemyHealth * waveMult;
                this.speed = 1.2 * diff.enemySpeed;
                this.damage = 25 * diff.enemyDamage;
                this.color = '#666666';
                this.glowColor = '#888888';
                this.score = 50;
                this.armor = 0.3;
                break;
            case 'kamikaze':
                this.radius = 11;
                this.maxHealth = 20 * diff.enemyHealth * waveMult;
                this.speed = 6 * diff.enemySpeed;
                this.damage = 30 * diff.enemyDamage;
                this.color = '#ff00ff';
                this.glowColor = '#ff00cc';
                this.score = 35;
                this.explodeOnDeath = true;
                break;
            case 'sniper':
                this.radius = 11;
                this.maxHealth = 20 * diff.enemyHealth * waveMult;
                this.speed = 2 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#44ff44';
                this.glowColor = '#00ff00';
                this.score = 30;
                this.shootTimer = 90;
                break;
            case 'healer':
                this.radius = 13;
                this.maxHealth = 35 * diff.enemyHealth * waveMult;
                this.speed = 2.2 * diff.enemySpeed;
                this.damage = 8 * diff.enemyDamage;
                this.color = '#00ffaa';
                this.glowColor = '#00dd88';
                this.score = 40;
                this.healTimer = 120;
                break;
            case 'police':
                this.radius = 15;
                this.maxHealth = 40 * diff.enemyHealth * waveMult;
                this.speed = 2.5 * diff.enemySpeed;
                this.damage = 12 * diff.enemyDamage;
                this.color = '#0044ff';
                this.glowColor = '#0066ff';
                this.score = 35;
                this.shootTimer = 80;
                break;
            case 'invisible':
                this.radius = 10;
                this.maxHealth = 18 * diff.enemyHealth * waveMult;
                this.speed = 3.8 * diff.enemySpeed;
                this.damage = 10 * diff.enemyDamage;
                this.color = '#88aabb';
                this.glowColor = '#6688aa';
                this.score = 25;
                this.invisibleTimer = 0;
                this.visibleTimer = 60;
                break;
            case 'summoner':
                this.name = 'INVOCADOR';
                this.radius = 16;
                this.maxHealth = 45 * diff.enemyHealth * waveMult;
                this.speed = 1.5 * diff.enemySpeed;
                this.damage = 10 * diff.enemyDamage;
                this.color = '#ff44aa';
                this.glowColor = '#ff2288';
                this.score = 45;
                this.summonTimer = 180;
                break;
            case 'ghost':
                this.name = 'FANTASMA';
                this.radius = 11;
                this.maxHealth = 28 * diff.enemyHealth * waveMult;
                this.speed = 2.5 * diff.enemySpeed;
                this.damage = 12 * diff.enemyDamage;
                this.color = '#aaaaff';
                this.glowColor = '#8888ff';
                this.score = 30;
                this.phaseTimer = 0;
                this.phaseDir = 1;
                this.alpha = 0.5;
                break;
            case 'charger':
                this.name = 'CARGADOR';
                this.radius = 15;
                this.maxHealth = 60 * diff.enemyHealth * waveMult;
                this.speed = 2 * diff.enemySpeed;
                this.damage = 22 * diff.enemyDamage;
                this.color = '#ff2244';
                this.glowColor = '#ff0044';
                this.score = 40;
                this.chargeTimer = 120;
                this.charging = false;
                this.chargeAngle = 0;
                break;
            case 'splitter':
                this.name = 'DIVISOR';
                this.radius = 17;
                this.maxHealth = 55 * diff.enemyHealth * waveMult;
                this.speed = 2.2 * diff.enemySpeed;
                this.damage = 14 * diff.enemyDamage;
                this.color = '#ffcc00';
                this.glowColor = '#ffaa00';
                this.score = 45;
                this.splitCount = 2;
                break;
            case 'shield_bot':
                this.name = 'BOT ESCUDO';
                this.radius = 15;
                this.maxHealth = 50 * diff.enemyHealth * waveMult;
                this.speed = 2.0 * diff.enemySpeed;
                this.damage = 15 * diff.enemyDamage;
                this.color = '#2244ff';
                this.glowColor = '#4466ff';
                this.score = 45;
                this.shield = 40;
                this.maxShield = 40;
                this.shieldRegen = 0;
                break;
            case 'teleporter':
                this.name = 'TELETRANSPORTADOR';
                this.radius = 12;
                this.maxHealth = 30 * diff.enemyHealth * waveMult;
                this.speed = 2.0 * diff.enemySpeed;
                this.damage = 15 * diff.enemyDamage;
                this.color = '#ff44ff';
                this.glowColor = '#ff00ff';
                this.score = 35;
                this.teleportTimer = 120;
                break;
            case 'leech':
                this.name = 'SANGUJUELA';
                this.radius = 12;
                this.maxHealth = 35 * diff.enemyHealth * waveMult;
                this.speed = 3.0 * diff.enemySpeed;
                this.damage = 10 * diff.enemyDamage;
                this.color = '#884400';
                this.glowColor = '#aa6600';
                this.score = 35;
                this.leechTimer = 0;
                break;
            case 'electro':
                this.name = 'ELECTRICO';
                this.radius = 13;
                this.maxHealth = 40 * diff.enemyHealth * waveMult;
                this.speed = 2.5 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#ffff00';
                this.glowColor = '#ffff44';
                this.score = 45;
                this.zapTimer = 60;
                this.zapRadius = 100;
                break;
            case 'exploder':
                this.name = 'EXPLOSIVO';
                this.radius = 16;
                this.maxHealth = 45 * diff.enemyHealth * waveMult;
                this.speed = 1.8 * diff.enemySpeed;
                this.damage = 40 * diff.enemyDamage;
                this.color = '#ff4400';
                this.glowColor = '#ff6600';
                this.score = 50;
                this.fuseTimer = 300;
                break;
            case 'canine':
                this.radius = 13;
                this.maxHealth = 22 * diff.enemyHealth * waveMult;
                this.speed = 5.2 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#ff6600';
                this.glowColor = '#ff4400';
                this.score = 30;
                this.explodeOnDeath = false;
                break;
            case 'heavy_drone':
                this.radius = 20;
                this.maxHealth = 80 * diff.enemyHealth * waveMult;
                this.speed = 1.6 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#666666';
                this.glowColor = '#aaaaaa';
                this.score = 60;
                this.shootTimer = 0;
                break;
            case 'balloon':
                this.name = 'GLOBO TRAVIESO';
                this.radius = 12;
                this.maxHealth = 24 * diff.enemyHealth * waveMult;
                this.speed = 2.8 * diff.enemySpeed;
                this.damage = 12 * diff.enemyDamage;
                this.color = '#ff8dc7';
                this.glowColor = '#ff66b5';
                this.score = 32;
                this.floatOffset = rand(0, Math.PI * 2);
                break;
            case 'jester':
                this.name = 'BUFON';
                this.radius = 14;
                this.maxHealth = 34 * diff.enemyHealth * waveMult;
                this.speed = 2.6 * diff.enemySpeed;
                this.damage = 14 * diff.enemyDamage;
                this.color = '#ffd166';
                this.glowColor = '#ffb703';
                this.score = 40;
                this.shootTimer = 75;
                break;
            case 'slime':
                this.name = 'SLIME DULCE';
                this.radius = 16;
                this.maxHealth = 52 * diff.enemyHealth * waveMult;
                this.speed = 2.1 * diff.enemySpeed;
                this.damage = 16 * diff.enemyDamage;
                this.color = '#7ae582';
                this.glowColor = '#52c96b';
                this.score = 38;
                this.bounceTimer = randInt(30, 80);
                break;
            case 'pinwheel':
                this.name = 'MOLINILLO';
                this.radius = 15;
                this.maxHealth = 40 * diff.enemyHealth * waveMult;
                this.speed = 2.7 * diff.enemySpeed;
                this.damage = 15 * diff.enemyDamage;
                this.color = '#7bdff2';
                this.glowColor = '#57c8eb';
                this.score = 42;
                this.spinTimer = 60;
                break;
            case 'laser_turret':
                this.name = 'TORRE LASER';
                this.radius = 17;
                this.maxHealth = 65 * diff.enemyHealth * waveMult;
                this.speed = 1.5 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#ff4d6d';
                this.glowColor = '#ff7b89';
                this.score = 48;
                this.shootTimer = 70;
                break;
            case 'space_dragon':
                this.name = 'DRAGON ESPACIAL';
                this.radius = 20;
                this.maxHealth = 70 * diff.enemyHealth * waveMult;
                this.speed = 2.8 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#8a7dff';
                this.glowColor = '#c3bcff';
                this.score = 60;
                this.waveOffset = rand(0, Math.PI * 2);
                break;
            case 'mecha':
                this.name = 'MECHA';
                this.radius = 22;
                this.maxHealth = 120 * diff.enemyHealth * waveMult;
                this.speed = 1.7 * diff.enemySpeed;
                this.damage = 24 * diff.enemyDamage;
                this.color = '#717a8c';
                this.glowColor = '#ff6767';
                this.score = 68;
                this.shootTimer = 90;
                this.armor = 0.2;
                break;
            case 'scout_ship':
                this.name = 'NAVE RAPIDA';
                this.radius = 14;
                this.maxHealth = 26 * diff.enemyHealth * waveMult;
                this.speed = 4.8 * diff.enemySpeed;
                this.damage = 12 * diff.enemyDamage;
                this.color = '#4cc9f0';
                this.glowColor = '#90e0ef';
                this.score = 36;
                break;
            case 'tank_ship':
                this.name = 'NAVE TANQUE';
                this.radius = 24;
                this.maxHealth = 150 * diff.enemyHealth * waveMult;
                this.speed = 1.4 * diff.enemySpeed;
                this.damage = 28 * diff.enemyDamage;
                this.color = '#4f6272';
                this.glowColor = '#90a4b8';
                this.score = 72;
                this.armor = 0.35;
                this.shootTimer = 110;
                break;
            case 'dynamiter':
                this.name = 'DINAMITERO';
                this.radius = 16;
                this.maxHealth = 52 * diff.enemyHealth * waveMult;
                this.speed = 2.1 * diff.enemySpeed;
                this.damage = 22 * diff.enemyDamage;
                this.color = '#ff9f1c';
                this.glowColor = '#ffbf69';
                this.score = 52;
                this.throwTimer = 95;
                break;
            case 'nuke_carrier':
                this.name = 'PORTANUCLEAR';
                this.radius = 20;
                this.maxHealth = 92 * diff.enemyHealth * waveMult;
                this.speed = 1.9 * diff.enemySpeed;
                this.damage = 48 * diff.enemyDamage;
                this.color = '#e63946';
                this.glowColor = '#ff7b7b';
                this.score = 85;
                this.nukeTimer = 200;
                break;
            case 'police_sniper':
                this.name = 'POLICIA SNIPER';
                this.radius = 16;
                this.maxHealth = 48 * diff.enemyHealth * waveMult;
                this.speed = 2.3 * diff.enemySpeed;
                this.damage = 24 * diff.enemyDamage;
                this.color = '#1d4ed8';
                this.glowColor = '#7db0ff';
                this.score = 56;
                this.shootTimer = 105;
                break;
            case 'trapper':
                this.name = 'TRAMPERO';
                this.radius = 16;
                this.maxHealth = 54 * diff.enemyHealth * waveMult;
                this.speed = 2.2 * diff.enemySpeed;
                this.damage = 16 * diff.enemyDamage;
                this.color = '#8d6e63';
                this.glowColor = '#d7b899';
                this.score = 52;
                this.trapTimer = 120;
                break;
            case 'grenadier':
                this.name = 'GRANADERO';
                this.radius = 17;
                this.maxHealth = 58 * diff.enemyHealth * waveMult;
                this.speed = 2.0 * diff.enemySpeed;
                this.damage = 24 * diff.enemyDamage;
                this.color = '#ff9f1c';
                this.glowColor = '#ffd166';
                this.score = 58;
                this.throwTimer = 90;
                break;
            case 'expander':
                this.name = 'EXPANSIVO';
                this.radius = 18;
                this.maxHealth = 64 * diff.enemyHealth * waveMult;
                this.speed = 1.9 * diff.enemySpeed;
                this.damage = 26 * diff.enemyDamage;
                this.color = '#ff4d6d';
                this.glowColor = '#ff8fab';
                this.score = 60;
                this.expandTimer = 110;
                break;
            case 'cloner':
                this.name = 'CLONADOR';
                this.radius = 17;
                this.maxHealth = 68 * diff.enemyHealth * waveMult;
                this.speed = 2.1 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#c77dff';
                this.glowColor = '#e0aaff';
                this.score = 64;
                this.cloneTimer = 180;
                break;
            case 'freezer':
                this.name = 'CRIOMANTE';
                this.radius = 17;
                this.maxHealth = 62 * diff.enemyHealth * waveMult;
                this.speed = 2.0 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#90e0ef';
                this.glowColor = '#caf0f8';
                this.score = 62;
                this.freezeTimer = 110;
                break;
            case 'toxic':
                this.name = 'TOXICO';
                this.radius = 18;
                this.maxHealth = 74 * diff.enemyHealth * waveMult;
                this.speed = 1.95 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#80ed99';
                this.glowColor = '#c7f9cc';
                this.score = 66;
                this.toxicTimer = 70;
                break;
            case 'erratic':
                this.name = 'ERRATICO';
                this.radius = 14;
                this.maxHealth = 42 * diff.enemyHealth * waveMult;
                this.speed = 4.4 * diff.enemySpeed;
                this.damage = 16 * diff.enemyDamage;
                this.color = '#72efdd';
                this.glowColor = '#80ffdb';
                this.score = 54;
                this.erraticAngle = rand(0, Math.PI * 2);
                break;
            case 'giant_mothership':
                this.name = 'NAVE NODRIZA GIGANTE';
                this.radius = 52;
                this.maxHealth = 980 * diff.enemyHealth * waveMult;
                this.speed = 1.8 * diff.enemySpeed;
                this.damage = 28 * diff.enemyDamage;
                this.color = '#7d5fff';
                this.glowColor = '#c8b6ff';
                this.score = 700;
                break;
            case 'cosmic_dragon':
                this.name = 'DRAGON COSMICO';
                this.radius = 56;
                this.maxHealth = 920 * diff.enemyHealth * waveMult;
                this.speed = 2.4 * diff.enemySpeed;
                this.damage = 30 * diff.enemyDamage;
                this.color = '#9d4edd';
                this.glowColor = '#e0aaff';
                this.score = 720;
                this.waveOffset = rand(0, Math.PI * 2);
                break;
            case 'colossal_mecha':
                this.name = 'ROBOT MECHA COLOSAL';
                this.radius = 58;
                this.maxHealth = 1200 * diff.enemyHealth * waveMult;
                this.speed = 1.6 * diff.enemySpeed;
                this.damage = 34 * diff.enemyDamage;
                this.color = '#6c757d';
                this.glowColor = '#ff6b6b';
                this.score = 760;
                this.armor = 0.25;
                break;
            case 'galactic_entity':
                this.name = 'ENTIDAD GALACTICA';
                this.radius = 50;
                this.maxHealth = 860 * diff.enemyHealth * waveMult;
                this.speed = 2.8 * diff.enemySpeed;
                this.damage = 32 * diff.enemyDamage;
                this.color = '#00d4ff';
                this.glowColor = '#9bf6ff';
                this.score = 740;
                break;
        }

        this.health = this.maxHealth;
        this.armor = this.armor || 0;
    }

    update(player) {
        this.animFrame++;
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            return;
        }

        if (this.invulnTimer > 0) this.invulnTimer--;
        if (this.flashTimer > 0) this.flashTimer--;
        if (this.slowTimer > 0) this.slowTimer--;

        const speedMult = this.slowTimer > 0 ? 0.5 : 1;
        const px = player.x, py = player.y;

        // FIX: un único switch limpio sin duplicados
        const d = dist(this.x, this.y, px, py);
        switch(this.type) {
            case 'small':
            case 'big':
            case 'tank':
            case 'kamikaze': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.15;
                this.vy += Math.sin(a) * 0.15;
                break;
            }
            case 'fast': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.25;
                this.vy += Math.sin(a) * 0.25;
                this.vx += Math.sin(this.animFrame * 0.1) * 0.1;
                this.vy += Math.cos(this.animFrame * 0.1) * 0.1;
                break;
            }
            case 'bomber': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.1;
                this.vy += Math.sin(a) * 0.1;
                this.bombTimer--;
                if (this.bombTimer <= 0) {
                    this.bombTimer = 90;
                    game.bulletManager.addEnemyBullet(this.x, this.y, Math.PI / 2, 3, this.damage * 0.8, '#ffaa00');
                }
                break;
            }
            case 'flyer': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.12;
                this.vy += Math.sin(a) * 0.12;
                this.vx += Math.cos(this.animFrame * 0.05 + this.flyOffset) * 0.15;
                this.vy += Math.sin(this.animFrame * 0.05 + this.flyOffset) * 0.15;
                break;
            }
            case 'sniper': {
                const a = angle(this.x, this.y, px, py);
                const d = dist(this.x, this.y, px, py);
                if (d < 250) {
                    this.vx -= Math.cos(a) * 0.1;
                    this.vy -= Math.sin(a) * 0.1;
                } else if (d > 400) {
                    this.vx += Math.cos(a) * 0.08;
                    this.vy += Math.sin(a) * 0.08;
                }
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 100;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 8, this.damage, '#44ff44');
                }
                break;
            }
            case 'healer': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.1;
                this.vy += Math.sin(a) * 0.1;
                this.healTimer--;
                if (this.healTimer <= 0) {
                    this.healTimer = 150;
                    for (const e of game.enemyManager.enemies) {
                        if (e !== this && dist(this.x, this.y, e.x, e.y) < 100) {
                            e.health = Math.min(e.maxHealth, e.health + 10);
                            game.particles.emit(e.x, e.y, 3, {
                                color: '#00ffaa', speed: 2, life: 15, size: 2, glow: true,
                            });
                        }
                    }
                }
                break;
            }
            case 'police': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.12;
                this.vy += Math.sin(a) * 0.12;
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 70;
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.2, 7, this.damage * 0.7, '#0044ff');
                    }
                }
                break;
            }
            case 'invisible': {
                if (this.visibleTimer > 0) {
                    this.visibleTimer--;
                } else {
                    this.invisibleTimer--;
                    if (this.invisibleTimer <= 0) {
                        this.visibleTimer = 60;
                        this.invisibleTimer = 120;
                    }
                }
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.18;
                this.vy += Math.sin(a) * 0.18;
                break;
            }
            case 'summoner': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.08;
                this.vy += Math.sin(a) * 0.08;
                this.summonTimer--;
                if (this.summonTimer <= 0) {
                    this.summonTimer = 200;
                    for (let i = 0; i < 2; i++) {
                        const sx = this.x + rand(-30, 30);
                        const sy = this.y + rand(-30, 30);
                        game.enemyManager.enemies.push(new Enemy(sx, sy, 'small', game.waveManager.wave));
                    }
                    game.particles.emit(this.x, this.y, 10, {
                        color: '#ff44aa', speed: 4, life: 20, size: 3, glow: true,
                    });
                }
                break;
            }
            case 'ghost': {
                this.phaseTimer += this.phaseDir * 0.02;
                if (this.phaseTimer > 1 || this.phaseTimer < 0.2) this.phaseDir *= -1;
                this.alpha = this.phaseTimer * 0.7 + 0.1;
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.2;
                this.vy += Math.sin(a) * 0.2;
                break;
            }
            case 'charger': {
                if (!this.charging) {
                    const a = angle(this.x, this.y, px, py);
                    this.vx += Math.cos(a) * 0.1;
                    this.vy += Math.sin(a) * 0.1;
                    this.chargeTimer--;
                    if (this.chargeTimer <= 0) {
                        this.chargeTimer = 150;
                        this.charging = true;
                        this.chargeAngle = a;
                        game.particles.emit(this.x, this.y, 10, {
                            color: '#ff2244', speed: 3, life: 15, size: 3, glow: true,
                        });
                    }
                } else {
                    this.vx = Math.cos(this.chargeAngle) * 8;
                    this.vy = Math.sin(this.chargeAngle) * 8;
                    if (d < this.radius * 2 || dist(this.x, this.y, px, py) > 500) this.charging = false;
                }
                break;
            }
            case 'splitter': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.12;
                this.vy += Math.sin(a) * 0.12;
                break;
            }
            case 'shield_bot': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.1;
                this.vy += Math.sin(a) * 0.1;
                this.shieldRegen++;
                if (this.shieldRegen > 120) {
                    this.shieldRegen = 0;
                    this.shield = Math.min(this.maxShield, this.shield + 5);
                }
                break;
            }
            case 'teleporter': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.1;
                this.vy += Math.sin(a) * 0.1;
                this.teleportTimer--;
                if (this.teleportTimer <= 0) {
                    this.teleportTimer = 180;
                    const na = angle(px, py, this.x, this.y);
                    this.x = px + Math.cos(na) * 80;
                    this.y = py + Math.sin(na) * 80;
                    this.x = clamp(this.x, 20, CONFIG.canvasWidth - 20);
                    this.y = clamp(this.y, 20, CONFIG.canvasHeight - 20);
                    game.particles.emit(this.x, this.y, 12, {
                        color: '#ff44ff', speed: 5, life: 20, size: 3, glow: true,
                    });
                }
                break;
            }
            case 'leech': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.2;
                this.vy += Math.sin(a) * 0.2;
                if (d < this.radius + player.radius + 5) {
                    this.leechTimer++;
                    if (this.leechTimer > 10) {
                        this.leechTimer = 0;
                        this.health = Math.min(this.maxHealth, this.health + 2);
                        player.takeDamage(2);
                    }
                } else this.leechTimer = 0;
                break;
            }
            case 'electro': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.15;
                this.vy += Math.sin(a) * 0.15;
                this.zapTimer--;
                if (this.zapTimer <= 0) {
                    this.zapTimer = 80;
                    if (d < this.zapRadius) {
                        player.takeDamage(this.damage * 0.5);
                        game.particles.emit(this.x, this.y, 20, {
                            color: '#ffff00', speed: 6, life: 15, size: 2, glow: true,
                        });
                        game.screenShake.shake(4);
                    }
                    for (const e of game.enemyManager.enemies) {
                        if (e !== this && dist(this.x, this.y, e.x, e.y) < this.zapRadius * 0.5) {
                            e.slowTimer = 60;
                            game.particles.emit(e.x, e.y, 3, {
                                color: '#ffff00', speed: 2, life: 10, size: 2, glow: true,
                            });
                        }
                    }
                }
                break;
            }
            case 'exploder': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.12;
                this.vy += Math.sin(a) * 0.12;
                this.fuseTimer--;
                if (this.fuseTimer < 60) game.particles.emit(this.x, this.y, 1, {
                    color: '#ff4400', speed: 2, life: 10, size: 2, glow: true,
                });
                if (this.fuseTimer <= 0 || d < this.radius + player.radius + 20) {
                    this.die(true);
                    const radius = 120;
                    game.particles.emitExplosion(this.x, this.y, 2);
                    game.screenShake.shake(12);
                    sound.play('explosion');
                    player.takeDamage(this.damage);
                    for (const e of game.enemyManager.enemies) {
                        if (e !== this && dist(this.x, this.y, e.x, e.y) < radius) e.takeDamage(this.damage * 0.5);
                    }
                    if (game.boss && !game.boss.dead && dist(this.x, this.y, game.boss.x, game.boss.y) < radius) game.boss.takeDamage(this.damage * 0.3);
                    return;
                }
                break;
            }
            case 'canine': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.35;
                this.vy += Math.sin(a) * 0.35;
                this.vx += Math.sin(this.animFrame * 0.2) * 0.15;
                this.vy += Math.cos(this.animFrame * 0.2) * 0.15;
                if (Math.random() < 0.02) {
                    this.vy -= 2;
                }
                break;
            }
            case 'heavy_drone': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.06;
                this.vy += Math.sin(a) * 0.06;
                this.vx *= 0.95;
                this.vy *= 0.95;
                this.shootTimer = this.shootTimer || 0;
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 80;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 6, this.damage, '#ffaa00');
                }
                break;
            }
            case 'balloon': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.08;
                this.vy += Math.sin(a) * 0.08;
                this.vx += Math.sin(this.animFrame * 0.08 + this.floatOffset) * 0.08;
                this.vy += Math.cos(this.animFrame * 0.12 + this.floatOffset) * 0.04 - 0.03;
                break;
            }
            case 'jester': {
                const a = angle(this.x, this.y, px, py);
                const side = Math.sin(this.animFrame * 0.12) > 0 ? 1 : -1;
                this.vx += Math.cos(a + side * Math.PI * 0.5) * 0.1;
                this.vy += Math.sin(a + side * Math.PI * 0.5) * 0.1;
                this.vx += Math.cos(a) * 0.06;
                this.vy += Math.sin(a) * 0.06;
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 85;
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.35, 6, this.damage * 0.8, randChoice(['#ff8dc7', '#ffd166', '#7bdff2']));
                    }
                }
                break;
            }
            case 'slime': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.09;
                this.vy += Math.sin(a) * 0.09;
                this.bounceTimer--;
                if (this.bounceTimer <= 0) {
                    this.bounceTimer = randInt(40, 80);
                    this.vx += Math.cos(a) * 2.6;
                    this.vy += Math.sin(a) * 2.6;
                    game.particles.emit(this.x, this.y, 8, {
                        colors: ['#7ae582', '#b6f5c5'],
                        speed: 2.5,
                        life: 14,
                        size: 3,
                        glow: true,
                    });
                }
                break;
            }
            case 'pinwheel': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.12;
                this.vy += Math.sin(a) * 0.12;
                this.spinTimer--;
                if (this.spinTimer <= 0) {
                    this.spinTimer = 90;
                    for (let i = 0; i < 4; i++) {
                        const ba = this.animFrame * 0.08 + (i / 4) * Math.PI * 2;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5.5, this.damage * 0.7, '#7bdff2');
                    }
                }
                break;
            }
            case 'laser_turret': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.05;
                this.vy += Math.sin(a) * 0.05;
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 95;
                    for (let i = 0; i < 3; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + (i - 1) * 0.12, 11, this.damage * 0.85, '#ff4d6d');
                    }
                    game.particles.emit(this.x, this.y, 10, {
                        colors: ['#ff4d6d', '#ffffff'],
                        speed: 4,
                        life: 12,
                        size: 2.5,
                        glow: true,
                        angle: a,
                        angleSpread: 0.18,
                    });
                }
                break;
            }
            case 'space_dragon': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.08 + Math.sin(this.animFrame * 0.12 + this.waveOffset) * 0.18;
                this.vy += Math.sin(a) * 0.08 + Math.cos(this.animFrame * 0.16 + this.waveOffset) * 0.18;
                if (Math.random() < 0.02) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 8, this.damage * 0.65, '#b388ff');
                }
                break;
            }
            case 'mecha': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.07;
                this.vy += Math.sin(a) * 0.07;
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 110;
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.22, 7, this.damage * 0.8, '#ff6767');
                    }
                }
                break;
            }
            case 'scout_ship': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.22;
                this.vy += Math.sin(a) * 0.22;
                this.vx += Math.sin(this.animFrame * 0.2) * 0.12;
                this.vy += Math.cos(this.animFrame * 0.2) * 0.12;
                break;
            }
            case 'tank_ship': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.05;
                this.vy += Math.sin(a) * 0.05;
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 120;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 6, this.damage, '#8d99ae');
                }
                break;
            }
            case 'dynamiter': {
                const a = angle(this.x, this.y, px, py);
                if (d < 240) {
                    this.vx -= Math.cos(a) * 0.08;
                    this.vy -= Math.sin(a) * 0.08;
                } else {
                    this.vx += Math.cos(a) * 0.08;
                    this.vy += Math.sin(a) * 0.08;
                }
                this.throwTimer--;
                if (this.throwTimer <= 0) {
                    this.throwTimer = 110;
                    game.bulletManager.addGrenade(this.x, this.y, a, 5, this.damage, 40);
                }
                break;
            }
            case 'nuke_carrier': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.07;
                this.vy += Math.sin(a) * 0.07;
                this.nukeTimer--;
                if (this.nukeTimer <= 0) {
                    this.nukeTimer = 220;
                    game.showNotification('ADVERTENCIA NUCLEAR', 'boss');
                    const blastX = this.x + Math.cos(a) * 100;
                    const blastY = this.y + Math.sin(a) * 100;
                    this.pendingNuke = { x: blastX, y: blastY, timer: 60 };
                }
                if (this.pendingNuke) {
                    this.pendingNuke.timer--;
                    if (this.pendingNuke.timer <= 0) {
                        game.particles.emitExplosion(this.pendingNuke.x, this.pendingNuke.y, 4);
                        game.screenShake.shake(18);
                        if (dist(this.pendingNuke.x, this.pendingNuke.y, player.x, player.y) < 180) player.takeDamage(this.damage);
                        for (const enemy of game.enemyManager.enemies) {
                            if (enemy !== this && dist(this.pendingNuke.x, this.pendingNuke.y, enemy.x, enemy.y) < 160) enemy.takeDamage(this.damage * 0.5);
                        }
                        if (game.boss && !game.boss.dead && dist(this.pendingNuke.x, this.pendingNuke.y, game.boss.x, game.boss.y) < 180) game.boss.takeDamage(this.damage * 0.35);
                        this.pendingNuke = null;
                    }
                }
                break;
            }
            case 'police_sniper': {
                const a = angle(this.x, this.y, px, py);
                if (d < 320) {
                    this.vx -= Math.cos(a) * 0.08;
                    this.vy -= Math.sin(a) * 0.08;
                } else {
                    this.vx += Math.cos(a) * 0.05;
                    this.vy += Math.sin(a) * 0.05;
                }
                this.shootTimer--;
                if (this.shootTimer <= 0) {
                    this.shootTimer = 120;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 11, this.damage, '#7db0ff');
                }
                break;
            }
            case 'trapper': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.08;
                this.vy += Math.sin(a) * 0.08;
                this.trapTimer--;
                if (this.trapTimer <= 0) {
                    this.trapTimer = 150;
                    game.placeTrap(this.x, this.y, Math.random() < 0.5 ? 'beartrap' : 'mine');
                }
                break;
            }
            case 'grenadier': {
                const a = angle(this.x, this.y, px, py);
                if (d < 260) {
                    this.vx -= Math.cos(a) * 0.06;
                    this.vy -= Math.sin(a) * 0.06;
                } else {
                    this.vx += Math.cos(a) * 0.06;
                    this.vy += Math.sin(a) * 0.06;
                }
                this.throwTimer--;
                if (this.throwTimer <= 0) {
                    this.throwTimer = 100;
                    game.bulletManager.addGrenade(this.x, this.y, a, 5, this.damage, 35);
                }
                break;
            }
            case 'expander': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.08;
                this.vy += Math.sin(a) * 0.08;
                this.expandTimer--;
                if (this.expandTimer <= 0) {
                    this.expandTimer = 130;
                    game.particles.emitShockwave(this.x, this.y, '#ff8fab');
                    if (dist(this.x, this.y, px, py) < 160) player.takeDamage(this.damage * 0.75);
                }
                break;
            }
            case 'cloner': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.08;
                this.vy += Math.sin(a) * 0.08;
                this.cloneTimer--;
                if (this.cloneTimer <= 0) {
                    this.cloneTimer = 210;
                    for (let i = 0; i < 2; i++) {
                        game.enemyManager.spawnEnemy(randChoice(['small', 'fast', 'erratic']), this.x + rand(-24, 24), this.y + rand(-24, 24), Math.max(1, game.waveManager.wave - 3));
                    }
                    game.particles.emit(this.x, this.y, 14, {
                        colors: ['#c77dff', '#ffffff'],
                        speed: 4,
                        life: 16,
                        size: 2.5,
                        glow: true,
                    });
                }
                break;
            }
            case 'freezer': {
                const a = angle(this.x, this.y, px, py);
                if (d < 240) {
                    this.vx -= Math.cos(a) * 0.05;
                    this.vy -= Math.sin(a) * 0.05;
                } else {
                    this.vx += Math.cos(a) * 0.06;
                    this.vy += Math.sin(a) * 0.06;
                }
                this.freezeTimer--;
                if (this.freezeTimer <= 0) {
                    this.freezeTimer = 125;
                    for (let i = -2; i <= 2; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.14, 6.5, this.damage * 0.7, '#caf0f8');
                    }
                    if (d < 180) player.takeDamage(this.damage * 0.2);
                }
                break;
            }
            case 'toxic': {
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.07;
                this.vy += Math.sin(a) * 0.07;
                this.toxicTimer--;
                if (this.toxicTimer <= 0) {
                    this.toxicTimer = 80;
                    game.particles.emit(this.x, this.y, 18, {
                        colors: ['#80ed99', '#38b000'],
                        speed: 3,
                        life: 20,
                        size: 3,
                        glow: true,
                    });
                    if (d < 150) {
                        player.takeDamage(this.damage * 0.45);
                        player.vx += Math.cos(a) * 1.5;
                        player.vy += Math.sin(a) * 1.5;
                    }
                }
                break;
            }
            case 'erratic': {
                this.erraticAngle += rand(-0.3, 0.3);
                const a = angle(this.x, this.y, px, py);
                this.vx += Math.cos(a) * 0.12 + Math.cos(this.erraticAngle) * 0.22;
                this.vy += Math.sin(a) * 0.12 + Math.sin(this.erraticAngle) * 0.22;
                if (Math.random() < 0.018) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + rand(-0.4, 0.4), 7, this.damage * 0.65, '#72efdd');
                }
                break;
            }
        }

        // Aplicar fricción y velocidad
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.vx * this.speed * speedMult;
        this.y += this.vy * this.speed * speedMult;

        // Colisión con jugador
        if (circleCollision(this, player) && player.invulnTimer <= 0 && player.dashInvulnTimer <= 0) {
            player.takeDamage(this.damage);
            if (this.type === 'kamikaze') {
                this.die(true);
                game.particles.emitExplosion(this.x, this.y, 1);
                game.screenShake.shake(8);
                sound.play('explosion');
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return;

        const actualDamage = amount * (1 - this.armor);
        this.health -= actualDamage;
        this.flashTimer = 5;

        game.floatingTexts.add(this.x, this.y - this.radius, Math.floor(actualDamage).toString(), '#ffffff', 14, 30);

        game.particles.emit(this.x, this.y, 4, {
            colors: [this.color, '#ffffff'],
            speed: 3,
            life: 10,
            size: 2,
            glow: true,
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die(silent = false) {
        this.dead = true;
        if (!silent) {
            const sc = Math.floor(this.score * game.player.getComboMult() * DIFFICULTY_MULT[CONFIG.difficulty].scoreMult);
            game.score += sc;
            game.kills++;
            game.player.addCombo();
            game.player.addXP(this.score);
            window.onEnemyKill?.(['small','fast','balloon'].includes(this.type) ? 'basic' : 'rare');

            game.particles.emitExplosion(this.x, this.y, 0.8);
            game.dropManager.tryDrop(this.x, this.y, this.type);
            sound.play('explosion');
        }
    }

    draw(ctx) {
        if (this.spawnTimer > 0) {
            const alpha = 1 - this.spawnTimer / 20;
            ctx.globalAlpha = alpha;
        }

        // Invisibilidad
        if (this.type === 'invisible' && this.visibleTimer <= 0) {
            ctx.globalAlpha = 0.2;
        }

        // Flash de daño
        if (this.flashTimer > 0) {
            ctx.globalAlpha = 0.6 + Math.sin(this.flashTimer * 3) * 0.4;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;

        if (this.type === 'small' || this.type === 'fast') {
            const a = Math.atan2(this.vy, this.vx);
            ctx.rotate(a);
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius * 0.7, -this.radius * 0.7);
            ctx.lineTo(-this.radius * 0.7, this.radius * 0.7);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'big') {
            ctx.beginPath();
            ctx.roundRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2, 4);
            ctx.fill();
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'bomber') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            if (this.bombTimer < 20) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (this.type === 'flyer') {
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(this.radius * 0.8, 0);
            ctx.lineTo(0, this.radius);
            ctx.lineTo(-this.radius * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#cc88ff';
            const wingOffset = Math.sin(this.animFrame * 0.1) * 4;
            ctx.beginPath();
            ctx.ellipse(0, -this.radius - 3, 6, 3 + wingOffset * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0, this.radius + 3, 6, 3 + wingOffset * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'tank') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const px = Math.cos(a) * this.radius;
                const py = Math.sin(a) * this.radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#aaaaaa';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'kamikaze') {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const px = Math.cos(a) * this.radius;
                const py = Math.sin(a) * this.radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
                const a2 = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
                const px2 = Math.cos(a2) * this.radius * 0.5;
                const py2 = Math.sin(a2) * this.radius * 0.5;
                ctx.lineTo(px2, py2);
            }
            ctx.closePath();
            ctx.fill();
            const pulse = Math.sin(this.animFrame * 0.2) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(255, 0, 255, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'sniper') {
            const a = Math.atan2(this.vy, this.vx);
            ctx.rotate(a);
            ctx.fillRect(-this.radius * 0.5, -this.radius * 0.6, this.radius * 1.8, this.radius * 1.2);
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(this.radius * 0.5, 0, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'healer') {
            const s = this.radius * 0.8;
            ctx.fillRect(-s * 0.3, -s, s * 0.6, s * 2);
            ctx.fillRect(-s, -s * 0.3, s * 2, s * 0.6);
            const aura = Math.sin(this.animFrame * 0.05) * 3;
            ctx.strokeStyle = 'rgba(0, 255, 170, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5 + aura, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'police') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0022aa';
            ctx.fillRect(-this.radius * 0.8, -this.radius - 4, this.radius * 1.6, 4);
            ctx.fillRect(-this.radius * 0.5, -this.radius - 8, this.radius, 4);
            if (Math.floor(this.animFrame / 10) % 2 === 0) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(-this.radius * 0.3, -this.radius - 6, 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#0000ff';
                ctx.beginPath();
                ctx.arc(this.radius * 0.3, -this.radius - 6, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'invisible') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(136, 170, 187, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (this.type === 'summoner') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff88cc';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
            if (this.summonTimer < 30) {
                ctx.strokeStyle = 'rgba(255, 68, 170, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 5 + Math.sin(this.animFrame * 0.3) * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (this.type === 'canine') {
            const a = Math.atan2(this.vy, this.vx);
            ctx.save();
            ctx.rotate(a);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 0.8, this.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.radius * 0.5, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(this.radius * 0.65, -this.radius * 0.35, 3, 0, Math.PI * 2);
            ctx.fill();
            const legOff = Math.sin(this.animFrame * 0.3) * 5;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.radius * 0.4, this.radius * 0.3 + legOff, 4, 10);
            ctx.fillRect(0, this.radius * 0.4 - legOff, 4, 10);
            ctx.restore();
        } else if (this.type === 'heavy_drone') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#444444';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff4444';
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2 + this.animFrame * 0.02;
                ctx.save();
                ctx.rotate(ang);
                ctx.fillRect(this.radius * 0.3, -2, this.radius * 0.4, 4);
                ctx.restore();
            }
            if (Math.floor(this.animFrame / 10) % 2 === 0) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(0, -this.radius * 0.5, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(0, this.radius * 0.5, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'balloon') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 0.9, this.radius * 1.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#a86a88';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, this.radius);
            ctx.quadraticCurveTo(5, this.radius + 12, -4, this.radius + 24);
            ctx.stroke();
        } else if (this.type === 'jester') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff8dc7';
            ctx.beginPath();
            ctx.moveTo(-this.radius, -this.radius * 0.3);
            ctx.lineTo(-this.radius * 0.2, -this.radius * 1.15);
            ctx.lineTo(0, -this.radius * 0.25);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#7bdff2';
            ctx.beginPath();
            ctx.moveTo(this.radius, -this.radius * 0.3);
            ctx.lineTo(this.radius * 0.2, -this.radius * 1.15);
            ctx.lineTo(0, -this.radius * 0.25);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -2, 2, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.3, -2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7a4b31';
            ctx.beginPath();
            ctx.arc(0, this.radius * 0.15, this.radius * 0.35, 0.15, Math.PI - 0.15);
            ctx.stroke();
        } else if (this.type === 'slime') {
            const squash = Math.sin(this.animFrame * 0.18) * 0.15;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * (1.05 + squash), this.radius * (0.8 - squash), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#b9f6c4';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.25, -this.radius * 0.15, 3, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.2, -this.radius * 0.1, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#45a85b';
            ctx.beginPath();
            ctx.arc(0, this.radius * 0.15, this.radius * 0.3, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else if (this.type === 'pinwheel') {
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate(this.animFrame * 0.08 + i * Math.PI * 0.5);
                ctx.fillStyle = ['#ff8dc7', '#ffd166', '#7ae582', '#7bdff2'][i];
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(this.radius * 0.9, -this.radius * 0.2, this.radius * 0.8, this.radius * 0.55);
                ctx.quadraticCurveTo(this.radius * 0.2, this.radius * 0.25, 0, 0);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = '#fff8ff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.22, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'laser_turret') {
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.fillStyle = '#ffd6de';
            ctx.fillRect(-this.radius * 0.25, -this.radius * 1.1, this.radius * 0.5, this.radius * 0.9);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -this.radius * 0.2, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'space_dragon') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.quadraticCurveTo(0, -this.radius * 0.9, -this.radius * 1.1, -this.radius * 0.2);
            ctx.quadraticCurveTo(-this.radius * 1.5, 0, -this.radius * 1.1, this.radius * 0.2);
            ctx.quadraticCurveTo(0, this.radius * 0.9, this.radius, 0);
            ctx.fill();
            ctx.fillStyle = '#d6d1ff';
            ctx.beginPath();
            ctx.arc(this.radius * 0.3, -this.radius * 0.12, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'mecha') {
            ctx.fillRect(-this.radius, -this.radius * 0.8, this.radius * 2, this.radius * 1.6);
            ctx.fillStyle = '#c8ced9';
            ctx.fillRect(-this.radius * 0.35, -this.radius * 0.45, this.radius * 0.7, this.radius * 0.55);
            ctx.fillStyle = '#ff7b7b';
            ctx.fillRect(-this.radius * 0.75, this.radius * 0.1, this.radius * 0.22, this.radius * 0.75);
            ctx.fillRect(this.radius * 0.53, this.radius * 0.1, this.radius * 0.22, this.radius * 0.75);
        } else if (this.type === 'scout_ship') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius * 0.2, -this.radius * 0.7);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(-this.radius * 0.2, this.radius * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'tank_ship') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius * 1.1, 0);
            ctx.lineTo(this.radius * 0.25, -this.radius * 0.8);
            ctx.lineTo(-this.radius, -this.radius * 0.65);
            ctx.lineTo(-this.radius * 1.15, 0);
            ctx.lineTo(-this.radius, this.radius * 0.65);
            ctx.lineTo(this.radius * 0.25, this.radius * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#c3ccd7';
            ctx.fillRect(-this.radius * 0.2, -this.radius * 0.18, this.radius * 0.7, this.radius * 0.36);
            ctx.restore();
        } else if (this.type === 'dynamiter') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff1b8';
            ctx.fillRect(-3, -this.radius * 0.9, 6, this.radius * 0.7);
            ctx.beginPath();
            ctx.arc(0, -this.radius * 0.25, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'nuke_carrier') {
            ctx.fillRect(-this.radius, -this.radius * 0.9, this.radius * 2, this.radius * 1.8);
            ctx.fillStyle = '#ffd6d6';
            ctx.fillRect(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.7, this.radius * 0.7);
            ctx.fillStyle = '#ffea00';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.18, 0, Math.PI * 2);
            ctx.fill();
            if (this.pendingNuke) {
                ctx.strokeStyle = 'rgba(255,235,59,0.85)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.pendingNuke.x - this.x, this.pendingNuke.y - this.y, 20 + (60 - this.pendingNuke.timer) * 2.5, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (this.type === 'police_sniper') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#9ec5ff';
            ctx.fillRect(0, -3, this.radius * 1.2, 6);
            ctx.restore();
        } else if (this.type === 'trapper') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d7b899';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'grenadier') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff2b3';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-2, -this.radius * 0.9, 4, this.radius * 0.5);
        } else if (this.type === 'expander') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd1dc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * (0.55 + Math.sin(this.animFrame * 0.15) * 0.12), 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'cloner') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 3; i++) {
                const ang = this.animFrame * 0.06 + i * (Math.PI * 2 / 3);
                ctx.fillStyle = i === 0 ? '#ffffff' : '#e0aaff';
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * this.radius * 0.52, Math.sin(ang) * this.radius * 0.52, this.radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'freezer') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.rotate(this.animFrame * 0.02 + i * Math.PI / 3);
                ctx.beginPath();
                ctx.moveTo(0, -this.radius * 0.8);
                ctx.lineTo(0, this.radius * 0.8);
                ctx.moveTo(-this.radius * 0.18, -this.radius * 0.35);
                ctx.lineTo(this.radius * 0.18, -this.radius * 0.52);
                ctx.moveTo(-this.radius * 0.18, this.radius * 0.35);
                ctx.lineTo(this.radius * 0.18, this.radius * 0.52);
                ctx.stroke();
                ctx.restore();
            }
        } else if (this.type === 'toxic') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d8f3dc';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(Math.sin(this.animFrame * 0.05 + i) * this.radius * 0.4, Math.cos(this.animFrame * 0.06 + i) * this.radius * 0.4, this.radius * 0.14, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'erratic') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(0, -this.radius * 0.7);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(0, this.radius * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.globalAlpha = 1;

        // Barra de vida para enemigos grandes
        if (this.maxHealth > 30 && this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 3;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.radius - 8;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = this.color;
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }
}

// ============================================
// CLASE MINI JEFE
// ============================================
class MiniBoss {
    constructor(type, wave) {
        this.type = type;
        this.dead = false;
        this.animFrame = 0;
        this.phase = 1;
        this.invulnTimer = 0;
        this.flashTimer = 0;
        this.spawnTimer = 90;
        this.attackTimer = 0;
        this.moveTimer = 0;
        this.targetX = CONFIG.canvasWidth / 2;
        this.targetY = CONFIG.canvasHeight / 2;

        const diff = DIFFICULTY_MULT[CONFIG.difficulty];
        const waveMult = 1 + wave * 0.12;

        switch(type) {
            case 'mini_tank':
                this.name = 'TANQUE MINI';
                this.radius = 28;
                this.maxHealth = 300 * diff.enemyHealth * waveMult;
                this.speed = 1.8 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#554433';
                this.glowColor = '#ff8800';
                this.score = 200;
                this.armor = 0.2;
                break;
            case 'mini_ship':
                this.name = 'NAVE MINI';
                this.radius = 26;
                this.maxHealth = 250 * diff.enemyHealth * waveMult;
                this.speed = 2.8 * diff.enemySpeed;
                this.damage = 15 * diff.enemyDamage;
                this.color = '#6644aa';
                this.glowColor = '#aa66ff';
                this.score = 180;
                break;
            case 'armored_dog':
                this.name = 'PERRO BLINDADO';
                this.radius = 24;
                this.maxHealth = 200 * diff.enemyHealth * waveMult;
                this.speed = 4.5 * diff.enemySpeed;
                this.damage = 22 * diff.enemyDamage;
                this.color = '#aa4422';
                this.glowColor = '#ff6600';
                this.score = 170;
                this.chargeCooldown = 0;
                break;
            case 'heavy_drone_boss':
                this.name = 'DRONE PESADO';
                this.radius = 30;
                this.maxHealth = 350 * diff.enemyHealth * waveMult;
                this.speed = 1.4 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#555555';
                this.glowColor = '#aaaaaa';
                this.score = 220;
                this.missileTimer = 0;
                break;
            case 'ghost_lord':
                this.name = 'REY FANTASMITA';
                this.radius = 27;
                this.maxHealth = 280 * diff.enemyHealth * waveMult;
                this.speed = 2.7 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#d7d5ff';
                this.glowColor = '#9c94ff';
                this.score = 210;
                this.alpha = 0.7;
                break;
            case 'splitter_boss':
                this.name = 'MAESTRO GELATINA';
                this.radius = 29;
                this.maxHealth = 320 * diff.enemyHealth * waveMult;
                this.speed = 2.2 * diff.enemySpeed;
                this.damage = 19 * diff.enemyDamage;
                this.color = '#ffd166';
                this.glowColor = '#ffb703';
                this.score = 215;
                break;
            case 'mini_bomber':
                this.name = 'MINI JEFE BOMBARDERO';
                this.radius = 30;
                this.maxHealth = 340 * diff.enemyHealth * waveMult;
                this.speed = 2 * diff.enemySpeed;
                this.damage = 22 * diff.enemyDamage;
                this.color = '#ff7f50';
                this.glowColor = '#ffae7f';
                this.score = 230;
                break;
            case 'mini_mecha':
                this.name = 'MINI JEFE MECHA';
                this.radius = 32;
                this.maxHealth = 400 * diff.enemyHealth * waveMult;
                this.speed = 1.8 * diff.enemySpeed;
                this.damage = 24 * diff.enemyDamage;
                this.color = '#717a8c';
                this.glowColor = '#ff6767';
                this.score = 260;
                this.armor = 0.25;
                break;
            case 'mini_space_dragon':
                this.name = 'MINI DRAGON COSMICO';
                this.radius = 31;
                this.maxHealth = 300 * diff.enemyHealth * waveMult;
                this.speed = 2.9 * diff.enemySpeed;
                this.damage = 22 * diff.enemyDamage;
                this.color = '#a48bff';
                this.glowColor = '#d1c4ff';
                this.score = 250;
                this.waveOffset = rand(0, Math.PI * 2);
                break;
            case 'mini_heavy_ship':
                this.name = 'MINI NAVE PESADA';
                this.radius = 34;
                this.maxHealth = 360 * diff.enemyHealth * waveMult;
                this.speed = 1.7 * diff.enemySpeed;
                this.damage = 23 * diff.enemyDamage;
                this.color = '#536878';
                this.glowColor = '#9fb3c8';
                this.score = 245;
                break;
            case 'mini_nuclear':
                this.name = 'MINI JEFE NUCLEAR';
                this.radius = 33;
                this.maxHealth = 380 * diff.enemyHealth * waveMult;
                this.speed = 1.6 * diff.enemySpeed;
                this.damage = 26 * diff.enemyDamage;
                this.color = '#e63946';
                this.glowColor = '#ffd166';
                this.score = 265;
                break;
            case 'mini_summoner':
                this.name = 'MINI INVOCADOR';
                this.radius = 30;
                this.maxHealth = 320 * diff.enemyHealth * waveMult;
                this.speed = 2.0 * diff.enemySpeed;
                this.damage = 18 * diff.enemyDamage;
                this.color = '#b5179e';
                this.glowColor = '#ff99e6';
                this.score = 240;
                break;
            case 'mini_ninja':
                this.name = 'MINI NINJA VELOZ';
                this.radius = 26;
                this.maxHealth = 250 * diff.enemyHealth * waveMult;
                this.speed = 4.8 * diff.enemySpeed;
                this.damage = 24 * diff.enemyDamage;
                this.color = '#14213d';
                this.glowColor = '#80ffdb';
                this.score = 250;
                break;
        }

        this.health = this.maxHealth;
        this.armor = this.armor || 0;
        this.x = CONFIG.canvasWidth / 2;
        this.y = -120;
        this.vx = 0;
        this.vy = 0;
    }

    update(player) {
        this.animFrame++;
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            this.y += 1.5;
            return;
        }

        if (this.invulnTimer > 0) this.invulnTimer--;
        if (this.flashTimer > 0) this.flashTimer--;

        const healthPct = this.health / this.maxHealth;
        if (healthPct < 0.5 && this.phase === 1) {
            this.phase = 2;
            this.onPhaseChange(2);
        }

        this.moveTimer--;
        if (this.moveTimer <= 0) {
            this.moveTimer = randInt(80, 140);
            this.targetX = rand(this.radius + 50, CONFIG.canvasWidth - this.radius - 50);
            this.targetY = rand(this.radius + 50, CONFIG.canvasHeight - this.radius - 50);
        }

        const a = angle(this.x, this.y, this.targetX, this.targetY);
        this.vx += Math.cos(a) * 0.06;
        this.vy += Math.sin(a) * 0.06;
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

        this.x = clamp(this.x, this.radius, CONFIG.canvasWidth - this.radius);
        this.y = clamp(this.y, this.radius, CONFIG.canvasHeight - this.radius);

        if (this.type === 'black_hole') {
            const pull = angle(player.x, player.y, this.x, this.y);
            player.vx += Math.cos(pull) * 0.035;
            player.vy += Math.sin(pull) * 0.035;
            for (const enemy of game.enemyManager.enemies) {
                const ep = angle(enemy.x, enemy.y, this.x, this.y);
                enemy.vx += Math.cos(ep) * 0.02;
                enemy.vy += Math.sin(ep) * 0.02;
            }
        }

        this.attackTimer--;
        if (this.attackTimer <= 0) {
            this.attack(player);
        }

        if (circleCollision(this, player) && player.invulnTimer <= 0 && player.dashInvulnTimer <= 0) {
            player.takeDamage(this.damage);
        }
    }

    onPhaseChange(newPhase) {
        game.screenShake.shake(10);
        game.particles.emitExplosion(this.x, this.y, 1.5);
        sound.play('boss_alert');
        game.showNotification(`¡MINI JEFE FASE ${newPhase}!`, 'boss');
        this.invulnTimer = 40;
    }

    attack(player) {
        const px = player.x, py = player.y;
        const a = angle(this.x, this.y, px, py);

        switch(this.type) {
            case 'mini_tank':
                this.attackTimer = 50;
                game.bulletManager.addEnemyBullet(this.x, this.y, a, 5, this.damage, '#ff8800');
                if (this.phase >= 2) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + 0.4, 5, this.damage * 0.8, '#ff6600');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a - 0.4, 5, this.damage * 0.8, '#ff6600');
                }
                break;
            case 'mini_ship':
                this.attackTimer = 40;
                game.bulletManager.addEnemyBullet(this.x, this.y, a, 7, this.damage, '#aa66ff');
                if (this.phase >= 2) {
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.3, 4, this.damage * 0.5, '#8844ff');
                    }
                }
                break;
            case 'armored_dog':
                this.attackTimer = 35;
                const chargeAngle = a + rand(-0.15, 0.15);
                this.vx += Math.cos(chargeAngle) * 4;
                this.vy += Math.sin(chargeAngle) * 4;
                this.chargeCooldown = 15;
                if (this.phase >= 2) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 6, this.damage * 0.6, '#ff4400');
                }
                break;
            case 'heavy_drone_boss':
                this.attackTimer = 45;
                game.bulletManager.addEnemyBullet(this.x, this.y, a, 4, this.damage * 1.3, '#aaaaaa');
                if (this.phase >= 2) {
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.3, 3, this.damage, '#ffaa00');
                    }
                }
                break;
            case 'ghost_lord':
                this.attackTimer = this.phase >= 2 ? 28 : 42;
                for (let i = -1; i <= 1; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.28, 6, this.damage * 0.75, '#b388ff');
                }
                if (this.phase >= 2) {
                    for (let i = 0; i < 6; i++) {
                        const ba = (i / 6) * Math.PI * 2 + this.animFrame * 0.06;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 4.5, this.damage * 0.4, '#ffffff');
                    }
                }
                break;
            case 'splitter_boss':
                this.attackTimer = this.phase >= 2 ? 32 : 46;
                for (let i = -2; i <= 2; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.18, 5.5, this.damage * 0.7, '#ffd166');
                }
                if (this.phase >= 2) {
                    const spawnType = randChoice(['slime', 'balloon', 'small']);
                    game.enemyManager.spawnEnemy(spawnType, this.x + rand(-35, 35), this.y + rand(-35, 35), game.waveManager.wave);
                }
                break;
            case 'mini_bomber':
                this.attackTimer = this.phase >= 2 ? 25 : 40;
                for (let i = -2; i <= 2; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, Math.PI / 2 + i * 0.16, 5, this.damage * 0.7, '#ff7f50');
                }
                if (this.phase >= 2) game.bulletManager.addGrenade(this.x, this.y, a, 5, this.damage, 35);
                break;
            case 'mini_mecha':
                this.attackTimer = this.phase >= 2 ? 28 : 46;
                for (let i = -1; i <= 1; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.22, 7, this.damage * 0.8, '#ff6767');
                }
                break;
            case 'mini_space_dragon':
                this.attackTimer = this.phase >= 2 ? 24 : 36;
                this.vx += Math.sin(this.animFrame * 0.14 + this.waveOffset) * 1.2;
                this.vy += Math.cos(this.animFrame * 0.12 + this.waveOffset) * 1.2;
                for (let i = -1; i <= 1; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.3, 8, this.damage * 0.7, '#b388ff');
                }
                break;
            case 'mini_heavy_ship':
                this.attackTimer = this.phase >= 2 ? 30 : 48;
                game.bulletManager.addEnemyBullet(this.x, this.y, a, 7, this.damage, '#9fb3c8');
                if (this.phase >= 2) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + 0.35, 6, this.damage * 0.75, '#9fb3c8');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a - 0.35, 6, this.damage * 0.75, '#9fb3c8');
                }
                break;
            case 'mini_nuclear':
                this.attackTimer = this.phase >= 2 ? 24 : 38;
                game.bulletManager.addGrenade(this.x, this.y, a, 5, this.damage, this.phase >= 2 ? 22 : 32);
                if (this.phase >= 2) {
                    game.particles.emitShockwave(this.x, this.y, '#ffd166');
                    if (dist(this.x, this.y, px, py) < 150) player.takeDamage(this.damage * 0.35);
                }
                break;
            case 'mini_summoner':
                this.attackTimer = this.phase >= 2 ? 26 : 42;
                for (let i = -1; i <= 1; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.25, 6, this.damage * 0.7, '#ff99e6');
                }
                const summonType = this.phase >= 2 ? randChoice(['cloner', 'erratic', 'small']) : randChoice(['small', 'fast', 'balloon']);
                game.enemyManager.spawnEnemy(summonType, this.x + rand(-30, 30), this.y + rand(-30, 30), Math.max(1, game.waveManager.wave - 2));
                break;
            case 'mini_ninja':
                this.attackTimer = this.phase >= 2 ? 18 : 28;
                this.vx += Math.cos(a) * 3.2;
                this.vy += Math.sin(a) * 3.2;
                for (let i = -2; i <= 2; i++) {
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.12, 9, this.damage * 0.45, '#80ffdb');
                }
                break;
        }
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return;
        this.health -= amount;
        this.flashTimer = 5;

        game.floatingTexts.add(this.x, this.y - this.radius - 10, Math.floor(amount).toString(), '#ff4444', 20, 35);
        game.particles.emit(this.x, this.y, 6, {
            colors: [this.color, '#ffffff'], speed: 4, life: 12, size: 3, glow: true,
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        game.score += Math.floor(this.score * DIFFICULTY_MULT[CONFIG.difficulty].scoreMult);
        game.kills++;
        window.onEnemyKill?.('miniboss');

        game.particles.emitExplosion(this.x, this.y, 2);
        game.screenShake.shake(15);
        sound.play('explosion');

        for (let i = 0; i < 4; i++) {
            const types = ['health', 'shield', 'speed', 'damage', 'triple', 'grenade', 'laser', 'rapid', 'slowmotion'];
            game.dropManager.drops.push(new Drop(this.x + rand(-40, 40), this.y + rand(-40, 40), randChoice(types)));
        }

        game.hideBossBar();
        game.showNotification(`¡${this.name} DERROTADO!`, 'boss');
    }

    draw(ctx) {
        if (this.spawnTimer > 0) {
            ctx.globalAlpha = 1 - this.spawnTimer / 90;
        }

        if (this.flashTimer > 0) {
            ctx.globalAlpha = 0.6 + Math.sin(this.flashTimer * 3) * 0.4;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 20 + Math.sin(this.animFrame * 0.05) * 8;

        ctx.strokeStyle = this.phase === 2 ? '#ff0000' : this.glowColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = this.color;

        if (this.type === 'mini_tank') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const r = this.radius * (1 + Math.sin(this.animFrame * 0.03 + i) * 0.05);
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffaa00';
            for (let i = 0; i < 2; i++) {
                const a = (i / 2) * Math.PI * 2;
                ctx.save();
                ctx.rotate(a);
                ctx.fillRect(this.radius * 0.4, -3, this.radius * 0.4, 6);
                ctx.restore();
            }
        } else if (this.type === 'mini_ship') {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#aa66ff';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 0.5, this.radius * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2 + this.animFrame * 0.03;
                ctx.fillStyle = Math.sin(ang * 3 + this.animFrame * 0.1) > 0 ? '#ff00ff' : '#8800ff';
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * this.radius * 0.7, Math.sin(ang) * this.radius * 0.35, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'armored_dog') {
            ctx.save();
            const a = Math.atan2(this.vy, this.vx);
            ctx.rotate(a);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 0.8, this.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.radius * 0.5, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(this.radius * 0.65, -this.radius * 0.35, 3, 0, Math.PI * 2);
            ctx.fill();
            const legOff = Math.sin(this.animFrame * 0.3) * 5;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.radius * 0.4, this.radius * 0.3 + legOff, 4, 10);
            ctx.fillRect(0, this.radius * 0.4 - legOff, 4, 10);
            ctx.restore();
        } else if (this.type === 'heavy_drone_boss') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#444444';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff4444';
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2 + this.animFrame * 0.02;
                ctx.save();
                ctx.rotate(ang);
                ctx.fillRect(this.radius * 0.4, -3, this.radius * 0.5, 6);
                ctx.restore();
            }
            if (Math.floor(this.animFrame / 10) % 2 === 0) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(0, -this.radius * 0.6, 4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(0, this.radius * 0.6, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'ghost_lord') {
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(0, -this.radius * 0.1, this.radius * 0.8, Math.PI, 0);
            ctx.lineTo(this.radius * 0.8, this.radius * 0.65);
            for (let i = 0; i < 3; i++) {
                ctx.quadraticCurveTo(this.radius * (0.45 - i * 0.45), this.radius * (0.95 + (i % 2) * 0.18), this.radius * (0.15 - i * 0.55), this.radius * 0.65);
            }
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.2, -this.radius * 0.15, 4, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.2, -this.radius * 0.15, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6c63ff';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.2, -this.radius * 0.12, 2, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.2, -this.radius * 0.12, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'splitter_boss') {
            const wobble = Math.sin(this.animFrame * 0.12) * 0.12;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * (1 + wobble), this.radius * (0.78 - wobble * 0.5), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff1a8';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.22, -this.radius * 0.08, 4, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.2, -this.radius * 0.08, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#9d6b00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, this.radius * 0.08, this.radius * 0.32, 0.15, Math.PI - 0.15);
            ctx.stroke();
        } else if (this.type === 'mini_bomber') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffd3a8';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff3d00';
            ctx.beginPath();
            ctx.arc(0, this.radius * 0.9, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'mini_mecha') {
            ctx.fillRect(-this.radius, -this.radius * 0.8, this.radius * 2, this.radius * 1.6);
            ctx.fillStyle = '#d9dce4';
            ctx.fillRect(-this.radius * 0.35, -this.radius * 0.45, this.radius * 0.7, this.radius * 0.55);
            ctx.fillStyle = '#ff6767';
            ctx.fillRect(-this.radius * 0.75, this.radius * 0.1, this.radius * 0.22, this.radius * 0.75);
            ctx.fillRect(this.radius * 0.53, this.radius * 0.1, this.radius * 0.22, this.radius * 0.75);
        } else if (this.type === 'mini_space_dragon') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.quadraticCurveTo(0, -this.radius * 0.9, -this.radius * 1.2, -this.radius * 0.25);
            ctx.quadraticCurveTo(-this.radius * 1.4, 0, -this.radius * 1.2, this.radius * 0.25);
            ctx.quadraticCurveTo(0, this.radius * 0.9, this.radius, 0);
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'mini_heavy_ship') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius * 1.1, 0);
            ctx.lineTo(this.radius * 0.22, -this.radius * 0.85);
            ctx.lineTo(-this.radius, -this.radius * 0.6);
            ctx.lineTo(-this.radius * 1.1, 0);
            ctx.lineTo(-this.radius, this.radius * 0.6);
            ctx.lineTo(this.radius * 0.22, this.radius * 0.85);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#c7d6e2';
            ctx.fillRect(-this.radius * 0.15, -this.radius * 0.18, this.radius * 0.7, this.radius * 0.36);
            ctx.restore();
        } else if (this.type === 'mini_nuclear') {
            ctx.fillRect(-this.radius, -this.radius * 0.9, this.radius * 2, this.radius * 1.8);
            ctx.fillStyle = '#fff3bf';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.34, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffea00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.62, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'mini_summoner') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 4; i++) {
                const ang = this.animFrame * 0.05 + i * Math.PI * 0.5;
                ctx.fillStyle = i % 2 === 0 ? '#ff99e6' : '#ffffff';
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * this.radius * 0.55, Math.sin(ang) * this.radius * 0.55, this.radius * 0.14, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'mini_ninja') {
            ctx.save();
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(0, -this.radius * 0.8);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(0, this.radius * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#80ffdb';
            ctx.fillRect(-this.radius * 0.15, -2, this.radius * 0.6, 4);
            ctx.restore();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// ============================================
// CLASE BALA ENEMIGA
// ============================================
class EnemyBullet {
    constructor(x, y, angle, speed, damage, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.color = color;
        this.radius = 4;
        this.life = 150;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    isOffScreen() {
        return this.x < -50 || this.x > CONFIG.canvasWidth + 50 ||
               this.y < -50 || this.y > CONFIG.canvasHeight + 50 || this.life <= 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// MANAGER DE BALAS
// ============================================
class BulletManager {
    constructor() {
        this.bullets = [];
        this.grenades = [];
        this.lasers = [];
        this.shockwaves = [];
        this.homing = [];
        this.skillGrenades = []; // FIX: registrar SkillGrenades
        this.railguns = [];
        this.plasmas = [];
        this.enemyBullets = [];
    }

    _ptLineDist(px, py, x1, y1, x2, y2) {
        return pointToSegmentDistance(px, py, x1, y1, x2, y2);
    }

    addBullet(x, y, angle, speed, damage, color, pierce, explosive, freeze) {
        this.bullets.push(new Bullet(x, y, angle, speed, damage, color, pierce, explosive, freeze));
    }

    addGrenade(x, y, angle, speed, damage, fuse) {
        this.grenades.push(new Grenade(x, y, angle, speed, damage, fuse));
    }

    addLaser(x, y, angle, damage, duration) {
        this.lasers.push(new Laser(x, y, angle, damage, duration));
    }

    addShockwave(x, y, damage) {
        this.shockwaves.push(new Shockwave(x, y, damage));
    }

    addHoming(x, y, angle, speed, damage) {
        this.homing.push(new HomingMissile(x, y, angle, speed, damage));
    }

    // FIX: método para añadir SkillGrenade
    addSkillGrenade(x, y, angle, speed, damage) {
        this.skillGrenades.push(new SkillGrenade(x, y, angle, speed, damage));
    }

    addRailgun(x, y, angle, damage) {
        this.railguns.push(new RailgunBullet(x, y, angle, damage));
        // Daño instantáneo al disparar
        const endX = x + Math.cos(angle) * 3000, endY = y + Math.sin(angle) * 3000;
        for (const e of game.enemyManager.enemies) {
            const d = this._ptLineDist(e.x, e.y, x, y, endX, endY);
            if (d < e.radius + 10) {
                e.takeDamage(damage);
                game.particles.emitSpark(e.x, e.y, '#ffff00');
            }
        }
        if (game.boss && !game.boss.dead) {
            const d = this._ptLineDist(game.boss.x, game.boss.y, x, y, endX, endY);
            if (d < game.boss.radius + 10) game.boss.takeDamage(damage);
        }
        if (game.miniBoss && !game.miniBoss.dead) {
            const d = this._ptLineDist(game.miniBoss.x, game.miniBoss.y, x, y, endX, endY);
            if (d < game.miniBoss.radius + 10) game.miniBoss.takeDamage(damage);
        }
        game.screenShake.shake(8);
        game.particles.emit(x, y, 20, { colors: ['#ffff00', '#ffffff'], speed: 8, life: 15, size: 3, glow: true, angle: angle, angleSpread: 0.3 });
    }

    addPlasma(x, y, angle, speed, damage) {
        this.plasmas.push(new PlasmaBall(x, y, angle, speed, damage));
    }

    addFlameCone(x, y, angle, damage) {
        for (let i = 0; i < 10; i++) {
            const b = new Bullet(x, y, angle + rand(-0.35, 0.35), rand(5.5, 8.5), damage, randChoice(['#ff9f1c', '#ff6b35', '#ffd166']), false, true, false);
            b.life = randInt(18, 26);
            b.radius = rand(3, 5);
            this.bullets.push(b);
        }
    }

    addIceBurst(x, y, angle, damage) {
        for (let i = -3; i <= 3; i++) {
            const b = new Bullet(x, y, angle + i * 0.1 + rand(-0.03, 0.03), 10, damage, '#9be7ff', false, false, true);
            b.radius = 4;
            this.bullets.push(b);
        }
    }

    addTeslaArc(x, y, angle, damage) {
        const hitTargets = [];
        const pool = [...game.enemyManager.enemies.filter(e => !e.dead && e.spawnTimer <= 0)];
        if (game.miniBoss && !game.miniBoss.dead) pool.push(game.miniBoss);
        if (game.boss && !game.boss.dead) pool.push(game.boss);

        let fromX = x;
        let fromY = y;
        for (let step = 0; step < 4; step++) {
            let closest = null;
            let closestDist = 340;
            for (const target of pool) {
                if (hitTargets.includes(target)) continue;
                const d = dist(fromX, fromY, target.x, target.y);
                if (d < closestDist) {
                    closest = target;
                    closestDist = d;
                }
            }
            if (!closest) break;
            hitTargets.push(closest);
            closest.takeDamage(damage * Math.max(0.45, 1 - step * 0.18));
            game.particles.emit(closest.x, closest.y, 14, {
                colors: ['#fff799', '#7df9ff', '#ffffff'],
                speed: 4,
                life: 14,
                size: 2.5,
                glow: true,
            });
            this.lasers.push(new Laser(fromX, fromY, angle(fromX, fromY, closest.x, closest.y), damage * 0.15, 4));
            fromX = closest.x;
            fromY = closest.y;
        }
    }

    addGravityOrb(x, y, angleValue, damage) {
        const orb = new PlasmaBall(x, y, angleValue, 4.2, damage * 0.7);
        orb.radius = 16;
        orb.gravityField = true;
        orb.damage = damage * 0.55;
        this.plasmas.push(orb);
    }

    addNukeRocket(x, y, angleValue, damage) {
        const nuke = new SkillGrenade(x, y, angleValue, 5.5, damage);
        nuke.radius = 8;
        const originalExplode = nuke.explode.bind(nuke);
        nuke.explode = (atX, atY) => {
            originalExplode(atX, atY);
            game.particles.emitExplosion(atX, atY, 4.5);
            game.particles.emitShockwave(atX, atY, '#ffb703');
            game.screenShake.shake(22);
            for (const enemy of game.enemyManager.enemies) {
                if (!enemy.dead && dist(atX, atY, enemy.x, enemy.y) < 180) enemy.takeDamage(damage * 0.7);
            }
            if (game.boss && !game.boss.dead && dist(atX, atY, game.boss.x, game.boss.y) < 220) game.boss.takeDamage(damage * 0.6);
            if (game.miniBoss && !game.miniBoss.dead && dist(atX, atY, game.miniBoss.x, game.miniBoss.y) < 200) game.miniBoss.takeDamage(damage * 0.7);
        };
        this.skillGrenades.push(nuke);
    }

    addEnemyBullet(x, y, angle, speed, damage, color) {
        this.enemyBullets.push(new EnemyBullet(x, y, angle, speed, damage, color));
    }

    update() {
        // Balas del jugador
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update();
            if (b.isOffScreen()) {
                this.bullets.splice(i, 1);
                continue;
            }
            let hit = false;

            // Colisiones con enemigos normales
            for (const enemy of game.enemyManager.enemies) {
                if (enemy.dead || enemy.spawnTimer > 0) continue;
                if (circleCollision(b, enemy)) {
                    if (!b.pierce) {
                        if (!b.hitEnemies.has(enemy.id)) {
                            enemy.takeDamage(b.damage);
                            b.hitEnemies.add(enemy.id);
                            if (b.explosive) {
                                game.particles.emitExplosion(b.x, b.y, 0.6);
                                game.screenShake.shake(4);
                            }
                            if (b.freeze) {
                                enemy.slowTimer = 120;
                                game.particles.emit(b.x, b.y, 5, {
                                    color: '#88ccff', speed: 2, life: 15, size: 2, glow: true,
                                });
                            }
                            hit = true;
                            this.bullets.splice(i, 1);
                        }
                    } else {
                        if (!b.hitEnemies.has(enemy.id)) {
                            enemy.takeDamage(b.damage);
                            b.hitEnemies.add(enemy.id);
                            game.particles.emitSpark(b.x, b.y);
                        }
                    }
                    break;
                }
            }
            if (hit) continue;

            // Colisiones con vehículos
            for (let vi = 0; vi < game.enemyManager.vehicles.length; vi++) {
                const v = game.enemyManager.vehicles[vi];
                if (v.health <= 0) continue;
                const vehicleRadius = Math.max(v.width, v.height) / 2;
                if (Math.hypot(b.x - v.x, b.y - v.y) < b.radius + vehicleRadius) {
                    v.health -= b.damage;
                    if (v.health <= 0) {
                        game.score += 50;
                        game.kills++;
                        game.particles.emitExplosion(v.x, v.y, 1);
                        game.enemyManager.vehicles.splice(vi, 1);
                    }
                    this.bullets.splice(i, 1);
                    hit = true;
                    break;
                }
            }
            if (hit) continue;

            // Colisiones con el jefe
            if (game.boss && !game.boss.dead && circleCollision(b, game.boss)) {
                game.boss.takeDamage(b.damage);
                this.bullets.splice(i, 1);
            }

            // Colisiones con mini jefe
            if (game.miniBoss && !game.miniBoss.dead && game.miniBoss.invulnTimer <= 0 && circleCollision(b, game.miniBoss)) {
                game.miniBoss.takeDamage(b.damage);
                if (!b.pierce) {
                    this.bullets.splice(i, 1);
                }
            }
        }

        // Granadas
        for (let i = this.grenades.length - 1; i >= 0; i--) {
            const g = this.grenades[i];
            g.update();
            if (g.fuse <= 0) {
                g.explode();
                this.grenades.splice(i, 1);
            }
        }

        // FIX: actualizar SkillGrenades
        for (let i = this.skillGrenades.length - 1; i >= 0; i--) {
            this.skillGrenades[i].update();
            if (this.skillGrenades[i].exploded) {
                this.skillGrenades.splice(i, 1);
            }
        }

        // Láseres
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            this.lasers[i].update();
            if (this.lasers[i].duration <= 0) this.lasers.splice(i, 1);
        }

        // Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            this.shockwaves[i].update();
            if (this.shockwaves[i].isDone()) this.shockwaves.splice(i, 1);
        }

        // Railguns
        for (let i = this.railguns.length - 1; i >= 0; i--) {
            this.railguns[i].update();
            if (this.railguns[i].isOffScreen()) this.railguns.splice(i, 1);
        }

        // Plasmas
        for (let i = this.plasmas.length - 1; i >= 0; i--) {
            this.plasmas[i].update();
            const plasma = this.plasmas[i];
            if (plasma.gravityField) {
                for (const enemy of game.enemyManager.enemies) {
                    if (enemy.dead) continue;
                    const d = dist(plasma.x, plasma.y, enemy.x, enemy.y);
                    if (d < 200) {
                        const pull = angle(enemy.x, enemy.y, plasma.x, plasma.y);
                        enemy.vx += Math.cos(pull) * 0.08;
                        enemy.vy += Math.sin(pull) * 0.08;
                        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 6);
                    }
                }
                if (game.frame % 4 === 0) {
                    game.particles.emit(plasma.x, plasma.y, 2, {
                        colors: ['#b388ff', '#7df9ff'],
                        speed: 2,
                        life: 10,
                        size: 2,
                        glow: true,
                    });
                }
            }
            if (plasma.isOffScreen()) this.plasmas.splice(i, 1);
        }

        // Misiles homing
        for (let i = this.homing.length - 1; i >= 0; i--) {
            const h = this.homing[i];
            h.update();
            if (h.isOffScreen()) {
                this.homing.splice(i, 1);
                continue;
            }
            let hit = false;
            for (const enemy of game.enemyManager.enemies) {
                if (enemy.dead || enemy.spawnTimer > 0) continue;
                if (circleCollision(h, enemy)) {
                    enemy.takeDamage(h.damage);
                    game.particles.emitExplosion(h.x, h.y, 0.8);
                    this.homing.splice(i, 1);
                    hit = true;
                    break;
                }
            }
            if (hit) continue;
            for (let vi = 0; vi < game.enemyManager.vehicles.length; vi++) {
                const v = game.enemyManager.vehicles[vi];
                if (v.health <= 0) continue;
                const vehicleRadius = Math.max(v.width, v.height) / 2;
                if (Math.hypot(h.x - v.x, h.y - v.y) < h.radius + vehicleRadius) {
                    v.health -= h.damage;
                    if (v.health <= 0) {
                        game.score += 50;
                        game.kills++;
                        game.particles.emitExplosion(v.x, v.y, 1);
                        game.enemyManager.vehicles.splice(vi, 1);
                    }
                    this.homing.splice(i, 1);
                    hit = true;
                    break;
                }
            }
            if (hit) continue;
            if (game.boss && !game.boss.dead && circleCollision(h, game.boss)) {
                game.boss.takeDamage(h.damage);
                this.homing.splice(i, 1);
            }
            if (hit) continue;
            if (game.miniBoss && !game.miniBoss.dead && circleCollision(h, game.miniBoss)) {
                game.miniBoss.takeDamage(h.damage);
                this.homing.splice(i, 1);
            }
        }

        // Balas enemigas
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const b = this.enemyBullets[i];
            b.update();
            if (b.isOffScreen()) {
                this.enemyBullets.splice(i, 1);
                continue;
            }
            if (circleCollision(b, game.player)) {
                game.player.takeDamage(b.damage);
                game.particles.emit(b.x, b.y, 5, {
                    colors: [b.color, '#ffffff'],
                    speed: 3, life: 10, size: 2, glow: true,
                });
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const b of this.bullets) b.draw(ctx);
        for (const g of this.grenades) g.draw(ctx);
        for (const sg of this.skillGrenades) sg.draw(ctx); // FIX: dibujar SkillGrenades
        for (const l of this.lasers) l.draw(ctx);
        for (const s of this.shockwaves) s.draw(ctx);
        for (const r of this.railguns) r.draw(ctx);
        for (const p of this.plasmas) p.draw(ctx);
        for (const h of this.homing) h.draw(ctx);
        for (const b of this.enemyBullets) b.draw(ctx);
    }
}

// ============================================
// MANAGER DE ENEMIGOS
// ============================================
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.vehicles = [];
    }

    spawnEnemy(type, x, y, wave) {
        this.enemies.push(new Enemy(x, y, type, wave));
    }

    spawnVehicle(wave) {
        const side = randInt(0, 3);
        let x, y, vx, vy;
        switch(side) {
            case 0: x = -60; y = rand(100, CONFIG.canvasHeight - 100); vx = 3; vy = rand(-0.5, 0.5); break;
            case 1: x = CONFIG.canvasWidth + 60; y = rand(100, CONFIG.canvasHeight - 100); vx = -3; vy = rand(-0.5, 0.5); break;
            case 2: x = rand(100, CONFIG.canvasWidth - 100); y = -60; vx = rand(-0.5, 0.5); vy = 3; break;
            case 3: x = rand(100, CONFIG.canvasWidth - 100); y = CONFIG.canvasHeight + 60; vx = rand(-0.5, 0.5); vy = -3; break;
        }
        this.vehicles.push({
            x, y, vx, vy,
            width: 50, height: 30,
            health: 80,
            maxHealth: 80,
            spawnTimer: 0,
            spawned: false,
            color: '#0044cc',
        });
    }

    update(player) {
        for (const enemy of this.enemies) {
            if (!enemy.dead) enemy.update(player);
        }
        this.enemies = this.enemies.filter(e => !e.dead);

        // Vehículos
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const v = this.vehicles[i];
            v.x += v.vx;
            v.y += v.vy;
            v.spawnTimer++;

            if (!v.spawned && v.spawnTimer > 40) {
                v.spawned = true;
                for (let j = 0; j < 3; j++) {
                    this.spawnEnemy('police', v.x + rand(-20, 20), v.y + rand(-20, 20), game.waveManager.wave);
                }
            }

            if (v.x < -200 || v.x > CONFIG.canvasWidth + 200 ||
                v.y < -200 || v.y > CONFIG.canvasHeight + 200) {
                this.vehicles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const v of this.vehicles) {
            ctx.save();
            ctx.translate(v.x, v.y);
            const a = Math.atan2(v.vy, v.vx);
            ctx.rotate(a);

            ctx.fillStyle = v.color;
            ctx.shadowColor = '#0066ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(-v.width/2, -v.height/2, v.width, v.height);

            ctx.fillStyle = '#ff0000';
            ctx.fillRect(v.width/2 - 5, -v.height/2 + 2, 4, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(v.width/2 - 5, v.height/2 - 6, 4, 4);

            if (Math.floor(v.spawnTimer / 8) % 2 === 0) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(0, -v.height/2 - 3, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#0000ff';
                ctx.beginPath();
                ctx.arc(0, -v.height/2 - 3, 3, 0, Math.PI * 2);
                ctx.fill();
        }

        if (this.type === 'ghost') {
            ctx.save();
            ctx.shadowBlur = 25;
            const pulse = Math.sin(this.animFrame * 0.1) * 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (this.type === 'charger') {
            ctx.save();
            if (this.charging) {
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ff0044';
            }
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.charging ? '#ffffff' : '#ff6688';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (this.type === 'splitter') {
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                ctx.lineTo(Math.cos(a) * this.radius * (i % 2 ? 0.7 : 1), Math.sin(a) * this.radius * (i % 2 ? 0.7 : 1));
            }
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffee88';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.type === 'shield_bot') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            if (this.shield > 0) {
                ctx.strokeStyle = 'rgba(100,180,255,0.8)';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#88aaff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        if (this.type === 'teleporter') {
            const pulse = Math.sin(this.animFrame * 0.15) * 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.type === 'leech') {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 0.6, Math.atan2(this.vy, this.vx), 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.type === 'electro') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const ang = (i / 6) * Math.PI * 2 + this.animFrame * 0.1;
                const r = this.radius + Math.sin(this.animFrame * 0.3 + i) * 5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(ang) * this.radius * 0.5, Math.sin(ang) * this.radius * 0.5);
                ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                ctx.stroke();
            }
        }
        if (this.type === 'exploder') {
            const frac = this.fuseTimer / 300;
            const pulse = this.fuseTimer < 60 ? Math.sin(this.animFrame * 0.5) * 3 : 0;
            ctx.fillStyle = frac < 0.3 ? '#ff0000' : frac < 0.6 ? '#ff6600' : this.color;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 20 + pulse;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
            ctx.restore();
        }

        for (const enemy of this.enemies) enemy.draw(ctx);
    }

    getAliveCount() {
        return this.enemies.filter(e => e.spawnTimer <= 0).length;
    }
}

// ============================================
// CLASE DROP / POWER-UP
// ============================================
class Drop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 12;
        this.life = 600;
        this.bobOffset = rand(0, Math.PI * 2);
        this.magnetized = false;

        const defs = {
            health: { color: '#ff4444', icon: '❤', name: 'Vida' },
            shield: { color: '#00aaff', icon: '🛡', name: 'Escudo' },
            speed: { color: '#ffaa00', icon: '⚡', name: 'Velocidad' },
            damage: { color: '#ff0000', icon: '⚔', name: 'Daño x2' },
            triple: { color: '#00f0ff', icon: '🔱', name: 'Triple' },
            quintuple: { color: '#ff00e4', icon: '✦', name: 'Quíntuple' },
            grenade: { color: '#ff6600', icon: '💣', name: 'Granada' },
            laser: { color: '#ff00e4', icon: '☄', name: 'Láser' },
            shockwave: { color: '#00f0ff', icon: '◎', name: 'Onda' },
            homing: { color: '#ff6600', icon: '🎯', name: 'Rastreador' },
            rapid: { color: '#ffea00', icon: '🔥', name: 'Rápido' },
            pierce: { color: '#ffffff', icon: '➤', name: 'Perforante' },
            explosive: { color: '#ff4400', icon: '💥', name: 'Explosivo' },
            freeze: { color: '#88ccff', icon: '❄', name: 'Congelante' },
            god: { color: '#ffea00', icon: '⭐', name: 'Modo Dios' },
            infinite: { color: '#aaddff', icon: '∞', name: 'Munición ∞' },
            regen: { color: '#00ff88', icon: '💚', name: 'Regeneración' },
            reflect: { color: '#ff88ff', icon: '↩', name: 'Reflectar' },
            magnet: { color: '#ffaa00', icon: '🧲', name: 'Imán' },
            spread: { color: '#ff66ff', icon: '✴', name: 'Dispersión' },
            slowmotion: { color: '#4488ff', icon: '🐌', name: 'Cámara Lenta' },
            massive: { color: '#ff4444', icon: '💀', name: 'Masivo' },
            chaos: { color: '#ff0000', icon: '☠️', name: 'MODO CAOS' },
            shotgun: { color: '#ffaa44', icon: '🔫', name: 'Escopeta' },
            railgun: { color: '#ffff00', icon: '⚡', name: 'Railgun' },
            plasma: { color: '#aa00ff', icon: '🔮', name: 'Plasma' },
            flame: { color: '#ff7b00', icon: 'F', name: 'Lanzallamas' },
            tesla: { color: '#9bf6ff', icon: 'T', name: 'Tesla' },
            iceburst: { color: '#caf0f8', icon: 'I', name: 'Hielo' },
            gravity: { color: '#b388ff', icon: 'G', name: 'Gravedad' },
            nuclearWeapon: { color: '#ffd166', icon: 'N', name: 'Arma Nuclear' },
            shieldRegen: { color: '#44aaff', icon: '🔵', name: 'Regen Escudo' },
            damageAura: { color: '#ff0088', icon: '🌟', name: 'Aura Daño' },
            multidrone: { color: '#00ffaa', icon: '🤖🤖', name: 'Multi-Drones' },
            heal_full: { color: '#ff4444', icon: '➕', name: 'Curación Total' },
            invulnerable: { color: '#ffff00', icon: '🌙', name: 'Invulnerable' },
            nuke: { color: '#ff8800', icon: '💀', name: 'NUKE' },
            timeStop: { color: '#00ffff', icon: '⏰', name: 'Stop Tiempo' },
            vampire: { color: '#880000', icon: '🧛', name: 'Vampirismo' },
            overload: { color: '#ff00aa', icon: '⚡⚡', name: 'Sobrecarga' },
            chainLightning: { color: '#ffff00', icon: '⚡🔗', name: 'Rayo Cadena' },
        };

        const def = defs[type] || { color: '#ffffff', icon: '?', name: '???' };
        this.color = def.color;
        this.icon = def.icon;
        this.name = def.name;
    }

    update(player) {
        this.life--;

        // Imán
        if (player.powerups.magnet || this.magnetized) {
            const d = dist(this.x, this.y, player.x, player.y);
            if (d < 200) {
                this.magnetized = true;
                const a = angle(this.x, this.y, player.x, player.y);
                this.x += Math.cos(a) * 6;
                this.y += Math.sin(a) * 6;
            }
        }

        // Colisión con jugador
        if (circleCollision(this, player)) {
            this.apply(player);
            return true; // consumed
        }
        return false;
    }

    apply(player) {
        sound.play('powerup');
        game.floatingTexts.add(this.x, this.y - 20, this.name, this.color, 16, 40);
        game.particles.emit(this.x, this.y, 12, {
            colors: [this.color, '#ffffff'],
            speed: 4,
            life: 20,
            size: 3,
            glow: true,
        });

        switch(this.type) {
            case 'health': player.heal(25); break;
            case 'shield': player.addShield(25); break;
            case 'speed': player.powerups.speed = 600; break;
            case 'damage': player.powerups.damage = 600; break;
            case 'triple': player.weaponType = 'triple'; break;
            case 'quintuple': player.weaponType = 'quintuple'; break;
            case 'grenade': player.weaponType = 'grenade'; break;
            case 'laser': player.weaponType = 'laser'; break;
            case 'shockwave': player.weaponType = 'shockwave'; break;
            case 'homing': player.weaponType = 'homing'; break;
            case 'rapid': player.powerups.rapid = 600; break;
            case 'pierce': player.powerups.pierce = 600; break;
            case 'explosive': player.powerups.explosive = 600; break;
            case 'freeze': player.powerups.freeze = 600; break;
            case 'god': player.powerups.god = 300; break;
            case 'infinite': player.powerups.infinite = 400; break;
            case 'regen': player.powerups.regen = 600; break;
            case 'reflect': player.powerups.reflect = 400; break;
            case 'magnet': player.powerups.magnet = 600; break;
            case 'drone': player.drone = new Drone(player); break;
            case 'spread': player.powerups.spread = 600; break;
            case 'slowall':
                for (const e of game.enemyManager.enemies) e.slowTimer = 300;
                break;
            case 'slowmotion':
                player.powerups.slowmotion = 600;
                break;
            case 'massive': player.powerups.massive = 600; break;
            case 'chaos':
                player.powerups.chaos = 900;
                game.activateChaosMode(); // llamada a método definido en Game
                break;
            case 'shieldRegen': player.powerups.shieldRegen = 600; break;
            case 'damageAura': player.powerups.damageAura = 600; break;
            case 'multidrone':
                for (let i = 0; i < 3; i++) {
                    const d = new Drone(player);
                    d.orbitRadius = 50 + i * 25;
                    d.angle = (i / 3) * Math.PI * 2;
                    player.drones.push(d);
                }
                break;
            case 'heal_full': player.health = player.maxHealth; break;
            case 'invulnerable': player.powerups.god = 300; player.invulnTimer = 300; break;
            case 'nuke':
                game.particles.emitExplosion(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, 5);
                game.screenShake.shake(20);
                sound.play('explosion');
                for (const e of game.enemyManager.enemies) e.takeDamage(9999);
                if (game.boss && !game.boss.dead) game.boss.takeDamage(200);
                if (game.miniBoss && !game.miniBoss.dead) game.miniBoss.takeDamage(150);
                break;
            case 'timeStop':
                for (const e of game.enemyManager.enemies) e.slowTimer = 180;
                game.bulletManager.enemyBullets = [];
                game.showNotification('¡TIEMPO DETENIDO!', 'wave');
                break;
            case 'vampire': player.powerups.vampire = 600; break;
            case 'overload': player.powerups.overload = 600; player.powerups.rapid = 600; player.powerups.damage = 600; player.powerups.pierce = 600; break;
            case 'chainLightning': player.powerups.chainLightning = 600; break;
            case 'flame': player.weaponType = 'flame'; break;
            case 'tesla': player.weaponType = 'tesla'; break;
            case 'iceburst': player.weaponType = 'iceburst'; break;
            case 'gravity': player.weaponType = 'gravity'; break;
            case 'nuclearWeapon': player.weaponType = 'nuclear'; break;
        }
    }

    draw(ctx) {
        // FIX: guard por si game aún no existe
        const frameVal = (typeof game !== 'undefined' && game) ? game.frame : 0;
        const bob = Math.sin(frameVal * 0.05 + this.bobOffset) * 3;
        const alpha = Math.min(1, this.life / 60);
        ctx.globalAlpha = alpha;

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, this.radius + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y + bob);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

// ============================================
// MANAGER DE DROPS
// ============================================
class DropManager {
    constructor() {
        this.drops = [];
    }

    tryDrop(x, y, enemyType) {
        const baseChance = 0.15;
        const typeChance = {
            small: 0.1, fast: 0.12, big: 0.2, bomber: 0.18, flyer: 0.15,
            tank: 0.25, kamikaze: 0.2, sniper: 0.18, healer: 0.22,
            police: 0.15, invisible: 0.15, summoner: 0.2,
            canine: 0.18, heavy_drone: 0.22,
        };

        if (Math.random() < (typeChance[enemyType] || baseChance)) {
            const types = [
                'health', 'shield', 'speed', 'damage', 'triple', 'quintuple',
                'grenade', 'laser', 'shockwave', 'homing', 'shotgun', 'railgun',
                'plasma', 'rapid', 'pierce', 'explosive', 'freeze', 'god',
                'infinite', 'regen', 'reflect', 'magnet', 'drone', 'spread',
                'slowall', 'slowmotion', 'massive', 'shieldRegen', 'damageAura',
                'multidrone', 'heal_full', 'invulnerable', 'nuke', 'timeStop',
                'vampire', 'overload', 'chainLightning', 'flame', 'tesla',
                'iceburst', 'gravity', 'nuclearWeapon',
            ];
            const type = randChoice(types);
            this.drops.push(new Drop(x, y, type));
        }
    }

    update(player) {
        for (let i = this.drops.length - 1; i >= 0; i--) {
            if (this.drops[i].update(player)) {
                this.drops.splice(i, 1);
            } else if (this.drops[i].life <= 0) {
                this.drops.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const d of this.drops) d.draw(ctx);
    }
}

// ============================================
// CLASE JEFE
// ============================================
class Boss {
    constructor(type, wave) {
        this.type = type;
        this.dead = false;
        this.animFrame = 0;
        this.phase = 1;
        this.invulnTimer = 0;
        this.flashTimer = 0;
        this.spawnTimer = 120;
        this.attackTimer = 0;
        this.moveTimer = 0;
        this.targetX = CONFIG.canvasWidth / 2;
        this.targetY = CONFIG.canvasHeight / 2;

        const diff = DIFFICULTY_MULT[CONFIG.difficulty];
        const waveMult = 1 + wave * 0.1;

        switch(type) {
            case 'tank_giant':
                this.name = 'COLOSO BLINDADO';
                this.radius = 45;
                this.maxHealth = 800 * diff.enemyHealth * waveMult;
                this.speed = 1.5 * diff.enemySpeed;
                this.damage = 30 * diff.enemyDamage;
                this.color = '#664422';
                this.glowColor = '#ff8800';
                this.score = 500;
                break;
            case 'mothership':
                this.name = 'NAVE NODRIZA';
                this.radius = 40;
                this.maxHealth = 600 * diff.enemyHealth * waveMult;
                this.speed = 2 * diff.enemySpeed;
                this.damage = 25 * diff.enemyDamage;
                this.color = '#8844ff';
                this.glowColor = '#aa66ff';
                this.score = 500;
                break;
            case 'police_commander':
                this.name = 'COMANDANTE POLICIAL';
                this.radius = 35;
                this.maxHealth = 700 * diff.enemyHealth * waveMult;
                this.speed = 2.2 * diff.enemySpeed;
                this.damage = 20 * diff.enemyDamage;
                this.color = '#0022aa';
                this.glowColor = '#0044ff';
                this.score = 500;
                break;
            case 'bomber_supreme':
                this.name = 'BOMBARDERO SUPREMO';
                this.radius = 38;
                this.maxHealth = 550 * diff.enemyHealth * waveMult;
                this.speed = 1.8 * diff.enemySpeed;
                this.damage = 35 * diff.enemyDamage;
                this.color = '#ff4400';
                this.glowColor = '#ff6600';
                this.score = 500;
                break;
            case 'robot_colossal':
                this.name = 'ROBOT COLOSAL';
                this.radius = 42;
                this.maxHealth = 900 * diff.enemyHealth * waveMult;
                this.speed = 1.3 * diff.enemySpeed;
                this.damage = 28 * diff.enemyDamage;
                this.color = '#666666';
                this.glowColor = '#ff4444';
                this.score = 600;
                break;
            case 'electric_boss':
                this.name = 'ENTIDAD ELÉCTRICA';
                this.radius = 36;
                this.maxHealth = 650 * diff.enemyHealth * waveMult;
                this.speed = 3 * diff.enemySpeed;
                this.damage = 22 * diff.enemyDamage;
                this.color = '#ffea00';
                this.glowColor = '#ffff00';
                this.score = 500;
                break;
            case 'mech_beast':
                this.name = 'BESTIA MECÁNICA';
                this.radius = 44;
                this.maxHealth = 750 * diff.enemyHealth * waveMult;
                this.speed = 2.5 * diff.enemySpeed;
                this.damage = 26 * diff.enemyDamage;
                this.color = '#aa2222';
                this.glowColor = '#ff0000';
                this.score = 550;
                break;
            case 'living_planet':
                this.name = 'PLANETA VIVIENTE';
                this.radius = 58;
                this.maxHealth = 980 * diff.enemyHealth * waveMult;
                this.speed = 1.2 * diff.enemySpeed;
                this.damage = 28 * diff.enemyDamage;
                this.color = '#4cc9f0';
                this.glowColor = '#ffd166';
                this.score = 650;
                break;
            case 'black_hole':
                this.name = 'AGUJERO NEGRO';
                this.radius = 52;
                this.maxHealth = 920 * diff.enemyHealth * waveMult;
                this.speed = 1.9 * diff.enemySpeed;
                this.damage = 26 * diff.enemyDamage;
                this.color = '#111111';
                this.glowColor = '#9d4edd';
                this.score = 640;
                break;
            case 'supreme_dreadnought':
                this.name = 'NAVE SUPREMA';
                this.radius = 54;
                this.maxHealth = 1040 * diff.enemyHealth * waveMult;
                this.speed = 1.7 * diff.enemySpeed;
                this.damage = 30 * diff.enemyDamage;
                this.color = '#6c757d';
                this.glowColor = '#9bf6ff';
                this.score = 670;
                break;
        }

        this.health = this.maxHealth;
        this.x = CONFIG.canvasWidth / 2;
        this.y = -100;
        this.vx = 0;
        this.vy = 0;
    }

    update(player) {
        this.animFrame++;
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            this.y += 1;
            return;
        }

        if (this.invulnTimer > 0) this.invulnTimer--;
        if (this.flashTimer > 0) this.flashTimer--;

        const healthPct = this.health / this.maxHealth;
        if (healthPct < 0.33 && this.phase === 2) {
            this.phase = 3;
            this.onPhaseChange(3);
        } else if (healthPct < 0.66 && this.phase === 1) {
            this.phase = 2;
            this.onPhaseChange(2);
        }

        if (this.pendingNuke) {
            this.pendingNuke.timer--;
            if (this.pendingNuke.timer <= 0) {
                game.particles.emitExplosion(this.pendingNuke.x, this.pendingNuke.y, 5);
                game.screenShake.shake(24);
                if (dist(this.pendingNuke.x, this.pendingNuke.y, player.x, player.y) < 230) player.takeDamage(this.damage * 1.2);
                for (const enemy of game.enemyManager.enemies) {
                    if (dist(this.pendingNuke.x, this.pendingNuke.y, enemy.x, enemy.y) < 180) enemy.takeDamage(9999);
                }
                this.pendingNuke = null;
            }
        }

        this.moveTimer--;
        if (this.moveTimer <= 0) {
            this.moveTimer = randInt(60, 120);
            if (this.phase >= 2) {
                this.targetX = clamp(player.x + rand(-260, 260), this.radius + 50, CONFIG.canvasWidth - this.radius - 50);
                this.targetY = clamp(player.y + rand(-220, 220), this.radius + 50, CONFIG.canvasHeight - this.radius - 50);
            } else {
                this.targetX = rand(this.radius + 50, CONFIG.canvasWidth - this.radius - 50);
                this.targetY = rand(this.radius + 50, CONFIG.canvasHeight - this.radius - 50);
            }
        }

        const a = angle(this.x, this.y, this.targetX, this.targetY);
        this.vx += Math.cos(a) * 0.08;
        this.vy += Math.sin(a) * 0.08;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

        this.x = clamp(this.x, this.radius, CONFIG.canvasWidth - this.radius);
        this.y = clamp(this.y, this.radius, CONFIG.canvasHeight - this.radius);

        this.attackTimer--;
        if (this.attackTimer <= 0) {
            this.attack(player);
        }

        if (circleCollision(this, player) && player.invulnTimer <= 0 && player.dashInvulnTimer <= 0) {
            player.takeDamage(this.damage);
        }
    }

    onPhaseChange(newPhase) {
        game.screenShake.shake(15);
        game.particles.emitExplosion(this.x, this.y, 2);
        sound.play('boss_alert');
        game.showNotification(`¡FASE ${newPhase}!`, 'boss');
        this.invulnTimer = 60;
    }

    attack(player) {
        const px = player.x, py = player.y;
        const a = angle(this.x, this.y, px, py);

        switch(this.type) {
            case 'tank_giant':
                if (this.phase === 1) {
                    this.attackTimer = 50;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 6, this.damage, '#ff8800');
                } else if (this.phase === 2) {
                    this.attackTimer = 40;
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.3, 6, this.damage * 0.8, '#ff8800');
                    }
                } else {
                    this.attackTimer = 30;
                    for (let i = 0; i < 8; i++) {
                        const ba = (i / 8) * Math.PI * 2 + this.animFrame * 0.1;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5, this.damage * 0.6, '#ff4400');
                    }
                    game.screenShake.shake(4);
                }
                break;

            case 'mothership':
                if (this.phase === 1) {
                    this.attackTimer = 45;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 8, this.damage, '#aa66ff');
                } else if (this.phase === 2) {
                    this.attackTimer = 35;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 8, this.damage, '#aa66ff');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + 0.5, 7, this.damage * 0.7, '#8844ff');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a - 0.5, 7, this.damage * 0.7, '#8844ff');
                } else {
                    this.attackTimer = 25;
                    for (let i = 0; i < 12; i++) {
                        const ba = (i / 12) * Math.PI * 2;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 6, this.damage * 0.5, '#ff00ff');
                    }
                    if (Math.random() < 0.35) {
                        game.enemyManager.spawnEnemy(randChoice(['balloon', 'flyer', 'pinwheel']), this.x + rand(-40, 40), this.y + rand(-40, 40), game.waveManager.wave);
                    }
                }
                break;

            case 'police_commander':
                if (this.phase === 1) {
                    this.attackTimer = 40;
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.2, 7, this.damage * 0.8, '#0044ff');
                    }
                } else if (this.phase === 2) {
                    this.attackTimer = 35;
                    for (let i = -2; i <= 2; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.15, 7, this.damage * 0.7, '#0044ff');
                    }
                    if (Math.random() < 0.3) {
                        game.enemyManager.spawnEnemy('police', this.x + rand(-40, 40), this.y + rand(-40, 40), game.waveManager.wave);
                    }
                } else {
                    this.attackTimer = 25;
                    for (let i = 0; i < 16; i++) {
                        const ba = (i / 16) * Math.PI * 2;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5, this.damage * 0.5, '#0022aa');
                    }
                }
                break;

            case 'bomber_supreme':
                if (this.phase === 1) {
                    this.attackTimer = 50;
                    game.bulletManager.addEnemyBullet(this.x, this.y, Math.PI / 2, 4, this.damage, '#ff6600');
                } else if (this.phase === 2) {
                    this.attackTimer = 35;
                    for (let i = -2; i <= 2; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, Math.PI / 2 + i * 0.2, 4, this.damage * 0.8, '#ff4400');
                    }
                } else {
                    this.attackTimer = 25;
                    for (let i = -4; i <= 4; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, Math.PI / 2 + i * 0.15, 5, this.damage * 0.6, '#ff0000');
                    }
                    for (let i = 0; i < 4; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, i * Math.PI * 0.5, 4.5, this.damage * 0.45, '#ff8a65');
                    }
                    game.showNotification('ALERTA NUCLEAR', 'boss');
                    this.pendingNuke = { x: px + rand(-120, 120), y: py + rand(-120, 120), timer: 45 };
                }
                break;

            case 'robot_colossal':
                if (this.phase === 1) {
                    this.attackTimer = 55;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 5, this.damage * 1.2, '#ff4444');
                } else if (this.phase === 2) {
                    this.attackTimer = 40;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 5, this.damage, '#ff4444');
                    for (let i = 0; i < 6; i++) {
                        const ba = a + (i - 2.5) * 0.4;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 4, this.damage * 0.6, '#ff6666');
                    }
                } else {
                    this.attackTimer = 30;
                    for (let i = 0; i < 20; i++) {
                        const ba = (i / 20) * Math.PI * 2 + this.animFrame * 0.05;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 4, this.damage * 0.4, '#ff0000');
                    }
                    if (Math.random() < 0.25) {
                        game.enemyManager.spawnEnemy('slime', this.x + rand(-45, 45), this.y + rand(-45, 45), game.waveManager.wave);
                    }
                }
                break;

            case 'electric_boss':
                if (this.phase === 1) {
                    this.attackTimer = 35;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 10, this.damage, '#ffea00');
                } else if (this.phase === 2) {
                    this.attackTimer = 25;
                    for (let i = -2; i <= 2; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.25, 9, this.damage * 0.7, '#ffff00');
                    }
                } else {
                    this.attackTimer = 18;
                    for (let i = 0; i < 10; i++) {
                        const ba = rand(0, Math.PI * 2);
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 7, this.damage * 0.5, '#ffffff');
                    }
                    for (let i = 0; i < 2; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + (i === 0 ? -0.6 : 0.6), 11, this.damage * 0.75, '#fff59d');
                    }
                }
                break;

            case 'mech_beast':
                if (this.phase === 1) {
                    this.attackTimer = 45;
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 7, this.damage, '#ff0000');
                } else if (this.phase === 2) {
                    this.attackTimer = 35;
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.3, 7, this.damage * 0.8, '#ff2222');
                    }
                } else {
                    this.attackTimer = 22;
                    for (let i = 0; i < 14; i++) {
                        const ba = (i / 14) * Math.PI * 2;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5, this.damage * 0.5, '#ff0000');
                    }
                    if (Math.random() < 0.2) {
                        game.enemyManager.spawnEnemy(randChoice(['fast', 'canine', 'jester']), this.x + rand(-50, 50), this.y + rand(-50, 50), game.waveManager.wave);
                    }
                }
                break;
            case 'living_planet':
                if (this.phase === 1) {
                    this.attackTimer = 42;
                    for (let i = 0; i < 6; i++) {
                        const ba = a + (i - 2.5) * 0.18;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5.5, this.damage * 0.7, '#ffd166');
                    }
                } else if (this.phase === 2) {
                    this.attackTimer = 34;
                    game.spawnMeteorBurst(4, false);
                    for (let i = 0; i < 8; i++) {
                        const ba = (i / 8) * Math.PI * 2;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 4.5, this.damage * 0.55, '#4cc9f0');
                    }
                } else {
                    this.attackTimer = 26;
                    game.particles.emitShockwave(this.x, this.y, '#ffd166');
                    if (dist(this.x, this.y, px, py) < 220) player.takeDamage(this.damage * 0.6);
                    for (let i = 0; i < 3; i++) {
                        game.enemyManager.spawnEnemy(randChoice(['toxic', 'freezer', 'space_dragon']), this.x + rand(-60, 60), this.y + rand(-60, 60), game.waveManager.wave);
                    }
                }
                break;
            case 'black_hole':
                if (this.phase === 1) {
                    this.attackTimer = 36;
                    for (let i = 0; i < 10; i++) {
                        const ba = (i / 10) * Math.PI * 2 + this.animFrame * 0.03;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 4.2, this.damage * 0.55, '#9d4edd');
                    }
                } else if (this.phase === 2) {
                    this.attackTimer = 28;
                    game.particles.emitShockwave(this.x, this.y, '#9d4edd');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a, 10, this.damage, '#ffffff');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a + 0.45, 8, this.damage * 0.75, '#9d4edd');
                    game.bulletManager.addEnemyBullet(this.x, this.y, a - 0.45, 8, this.damage * 0.75, '#9d4edd');
                } else {
                    this.attackTimer = 18;
                    for (let i = 0; i < 12; i++) {
                        const ba = (i / 12) * Math.PI * 2 + this.animFrame * 0.08;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5.5, this.damage * 0.45, '#ffffff');
                    }
                    if (Math.random() < 0.35) game.enemyManager.spawnEnemy('erratic', this.x + rand(-50, 50), this.y + rand(-50, 50), game.waveManager.wave);
                }
                break;
            case 'supreme_dreadnought':
                if (this.phase === 1) {
                    this.attackTimer = 38;
                    for (let i = -2; i <= 2; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.16, 7, this.damage * 0.8, '#9bf6ff');
                    }
                } else if (this.phase === 2) {
                    this.attackTimer = 30;
                    game.bulletManager.addGrenade(this.x, this.y, a, 5, this.damage, 32);
                    for (let i = -1; i <= 1; i++) {
                        game.bulletManager.addEnemyBullet(this.x, this.y, a + i * 0.25, 8, this.damage * 0.7, '#ffffff');
                    }
                } else {
                    this.attackTimer = 22;
                    for (let i = 0; i < 14; i++) {
                        const ba = (i / 14) * Math.PI * 2;
                        game.bulletManager.addEnemyBullet(this.x, this.y, ba, 5.5, this.damage * 0.45, '#9bf6ff');
                    }
                    if (Math.random() < 0.3) game.enemyManager.spawnEnemy(randChoice(['scout_ship', 'tank_ship', 'police_sniper']), this.x + rand(-70, 70), this.y + rand(-70, 70), game.waveManager.wave);
                }
                break;
        }
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return;
        this.health -= amount;
        this.flashTimer = 5;

        game.floatingTexts.add(this.x, this.y - this.radius - 10, Math.floor(amount).toString(), '#ff4444', 20, 35);
        game.particles.emit(this.x, this.y, 5, {
            colors: [this.color, '#ffffff'],
            speed: 3, life: 10, size: 2, glow: true,
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        game.score += Math.floor(this.score * DIFFICULTY_MULT[CONFIG.difficulty].scoreMult);
        game.kills++;
        window.onEnemyKill?.('boss');

        game.particles.emitExplosion(this.x, this.y, this.type === 'bomber_supreme' ? 6 : 3);
        game.screenShake.shake(this.type === 'bomber_supreme' ? 30 : 20);
        sound.play('explosion');

        if (this.type === 'bomber_supreme') {
            game.showNotification('MEGA EXPLOSION NUCLEAR', 'boss');
            for (const enemy of game.enemyManager.enemies) enemy.takeDamage(9999);
            if (game.player && dist(this.x, this.y, game.player.x, game.player.y) < 320) game.player.takeDamage(this.damage * 1.5);
            game.spawnMeteorBurst(8, true);
        }

        for (let i = 0; i < 5; i++) {
            const types = ['health', 'shield', 'speed', 'damage', 'triple', 'grenade', 'laser', 'rapid'];
            game.dropManager.drops.push(new Drop(this.x + rand(-50, 50), this.y + rand(-50, 50), randChoice(types)));
        }

        game.hideBossBar();
        game.showNotification('¡JEFE DERROTADO!', 'boss');
    }

    draw(ctx) {
        if (this.spawnTimer > 0) {
            ctx.globalAlpha = 1 - this.spawnTimer / 120;
        }

        if (this.flashTimer > 0) {
            ctx.globalAlpha = 0.6 + Math.sin(this.flashTimer * 3) * 0.4;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        const phaseColors = ['#ffffff', '#ffaa00', '#ff0000'];
        ctx.shadowColor = phaseColors[this.phase - 1] || this.glowColor;
        ctx.shadowBlur = 25 + Math.sin(this.animFrame * 0.05) * 10;

        ctx.strokeStyle = phaseColors[this.phase - 1] || this.glowColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.2 + Math.sin(this.animFrame * 0.03) * 0.1;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = this.color;

        if (this.type === 'tank_giant') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const r = this.radius * (1 + Math.sin(this.animFrame * 0.02 + i) * 0.05);
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 3; i++) {
                const a = (i / 3) * Math.PI * 2 + this.animFrame * 0.01;
                ctx.save();
                ctx.rotate(a);
                ctx.fillRect(this.radius * 0.5, -4, this.radius * 0.5, 8);
                ctx.restore();
            }
        } else if (this.type === 'mothership') {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#aa66ff';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 0.6, this.radius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + this.animFrame * 0.03;
                ctx.fillStyle = Math.sin(a * 3 + this.animFrame * 0.1) > 0 ? '#ff00ff' : '#8800ff';
                ctx.beginPath();
                ctx.arc(Math.cos(a) * this.radius * 0.8, Math.sin(a) * this.radius * 0.5, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'police_commander') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#001188';
            ctx.fillRect(-this.radius * 0.8, -this.radius - 6, this.radius * 1.6, 6);
            ctx.fillRect(-this.radius * 0.5, -this.radius - 12, this.radius, 6);
            ctx.fillStyle = '#ffea00';
            ctx.beginPath();
            ctx.moveTo(0, -this.radius * 0.3);
            ctx.lineTo(this.radius * 0.2, -this.radius * 0.1);
            ctx.lineTo(0, this.radius * 0.1);
            ctx.lineTo(-this.radius * 0.2, -this.radius * 0.1);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'bomber_supreme') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-this.radius * 1.2, -this.radius * 0.3);
            ctx.lineTo(-this.radius * 0.5, -this.radius * 0.8);
            ctx.lineTo(this.radius * 0.5, -this.radius * 0.8);
            ctx.lineTo(this.radius * 1.2, -this.radius * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-this.radius * 1.2, this.radius * 0.3);
            ctx.lineTo(-this.radius * 0.5, this.radius * 0.8);
            ctx.lineTo(this.radius * 0.5, this.radius * 0.8);
            ctx.lineTo(this.radius * 1.2, this.radius * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            const bob = Math.sin(this.animFrame * 0.1) * 3;
            ctx.beginPath();
            ctx.arc(0, this.radius + 8 + bob, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'robot_colossal') {
            const pulse = Math.sin(this.animFrame * 0.05) * 2;
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(0, -this.radius * 0.2, this.radius * 0.3 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -this.radius * 0.2, this.radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#555555';
            ctx.fillRect(-this.radius - 10, -this.radius * 0.3, 10, this.radius * 0.6);
            ctx.fillRect(this.radius, -this.radius * 0.3, 10, this.radius * 0.6);
        } else if (this.type === 'electric_boss') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 + this.animFrame * 0.05;
                const r = this.radius + Math.sin(this.animFrame * 0.2 + i) * 8;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * this.radius * 0.5, Math.sin(a) * this.radius * 0.5);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                ctx.stroke();
            }
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'mech_beast') {
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const r = this.radius * (0.8 + Math.sin(this.animFrame * 0.03 + i * 2) * 0.2);
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -this.radius * 0.2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.radius * 0.3, -this.radius * 0.2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 3;
            const jaw = Math.sin(this.animFrame * 0.1) * 5;
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.4, this.radius * 0.3);
            ctx.lineTo(0, this.radius * 0.6 + jaw);
            ctx.lineTo(this.radius * 0.4, this.radius * 0.3);
            ctx.stroke();
        } else if (this.type === 'living_planet') {
            const core = ctx.createRadialGradient(-this.radius * 0.25, -this.radius * 0.25, this.radius * 0.1, 0, 0, this.radius);
            core.addColorStop(0, '#fff4bf');
            core.addColorStop(0.35, '#4cc9f0');
            core.addColorStop(0.75, '#1768ac');
            core.addColorStop(1, '#0b132b');
            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.35;
            for (let i = 0; i < 4; i++) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(0, (-0.4 + i * 0.24) * this.radius, this.radius * (0.82 - i * 0.08), this.radius * 0.1, Math.sin(this.animFrame * 0.03 + i) * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        } else if (this.type === 'black_hole') {
            for (let i = 0; i < 5; i++) {
                ctx.globalAlpha = 0.18 - i * 0.025;
                ctx.strokeStyle = i % 2 === 0 ? '#9d4edd' : '#7df9ff';
                ctx.lineWidth = 12 - i * 2;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.65 + i * 12 + Math.sin(this.animFrame * 0.08 + i) * 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#05010b';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.68, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'supreme_dreadnought') {
            ctx.beginPath();
            ctx.moveTo(this.radius * 1.2, 0);
            ctx.lineTo(this.radius * 0.25, -this.radius * 0.9);
            ctx.lineTo(-this.radius, -this.radius * 0.7);
            ctx.lineTo(-this.radius * 1.2, 0);
            ctx.lineTo(-this.radius, this.radius * 0.7);
            ctx.lineTo(this.radius * 0.25, this.radius * 0.9);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#c7d6e2';
            ctx.fillRect(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.9, this.radius * 0.4);
            ctx.fillStyle = '#9bf6ff';
            ctx.beginPath();
            ctx.arc(this.radius * 0.35, 0, this.radius * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.22, -this.radius * 0.08, 4, 0, Math.PI * 2);
        ctx.arc(this.radius * 0.22, -this.radius * 0.08, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3f3355';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.22, -this.radius * 0.05, 2, 0, Math.PI * 2);
        ctx.arc(this.radius * 0.22, -this.radius * 0.05, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(63, 51, 85, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, this.radius * 0.12, this.radius * 0.18, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// ============================================
// MANAGER DE OLEADAS
// ============================================
class WaveManager {
    constructor() {
        this.wave = 0;
        this.state = 'idle';
        this.spawnTimer = 0;
        this.enemiesToSpawn = 0;
        this.spawnedCount = 0;
        this.waveTimer = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.totalBossesDefeated = 0;
        this.miniBoss = null;
        this.miniBossSpawned = false;
        this.miniBossDefeated = false;
        this.miniBossWave = 0;
    }

    startWave() {
        this.wave++;
        this.state = 'spawning';
        this.spawnedCount = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.miniBossSpawned = false;
        this.miniBossDefeated = false;

        const diff = DIFFICULTY_MULT[CONFIG.difficulty];
        const baseCount = 5 + this.wave * 3;
        this.enemiesToSpawn = Math.floor(baseCount / diff.spawnRate);
        this.spawnTimer = 0;

        if (this.wave > 1 && this.wave % 2 === 0 && this.wave % 5 !== 0) {
            this.state = 'miniboss';
            this.miniBossWave = this.wave;
        } else if (this.wave % 5 === 0) {
            this.state = 'boss';
        }

        game.showNotification(`OLEADA ${this.wave}`, 'wave');
    }

    update() {
        if (this.state === 'spawning') {
            this.spawnTimer--;
            if (this.spawnTimer <= 0 && this.spawnedCount < this.enemiesToSpawn) {
                this.spawnEnemy();
                this.spawnedCount++;
                this.spawnTimer = Math.max(15, 45 - this.wave * 2);
            }

            if (this.spawnedCount >= this.enemiesToSpawn) {
                this.state = 'fighting';
            }

            if (this.wave >= 3 && Math.random() < 0.002) {
                game.enemyManager.spawnVehicle(this.wave);
            }
        } else if (this.state === 'fighting') {
            if (game.enemyManager.getAliveCount() === 0 && this.spawnedCount >= this.enemiesToSpawn) {
                this.state = 'shop';
                window.onWaveComplete?.(this.wave);
                game.showShop();
            }
        } else if (this.state === 'boss') {
            if (!this.bossSpawned) {
                this.bossSpawned = true;
                this.spawnBoss();
            }
            if (this.bossDefeated) {
                this.state = 'shop';
                window.onWaveComplete?.(this.wave);
                game.showShop();
            }
        } else if (this.state === 'miniboss') {
            if (!this.miniBossSpawned) {
                this.miniBossSpawned = true;
                this.spawnMiniBoss();
            }
            if (this.miniBossDefeated) {
                this.state = 'shop';
                window.onWaveComplete?.(this.wave);
                game.showShop();
            }
        }
    }

    spawnEnemy() {
        const types = this.getEnemyTypesForWave();
        const type = randChoice(types);

        const side = randInt(0, 3);
        let x, y;
        const margin = 60;
        switch(side) {
            case 0: x = rand(margin, CONFIG.canvasWidth - margin); y = -margin; break;
            case 1: x = CONFIG.canvasWidth + margin; y = rand(margin, CONFIG.canvasHeight - margin); break;
            case 2: x = rand(margin, CONFIG.canvasWidth - margin); y = CONFIG.canvasHeight + margin; break;
            case 3: x = -margin; y = rand(margin, CONFIG.canvasHeight - margin); break;
        }

        game.enemyManager.spawnEnemy(type, x, y, this.wave);
    }

    getEnemyTypesForWave() {
        const types = ['small'];
        if (this.wave >= 2) types.push('fast');
        if (this.wave >= 3) types.push('big');
        if (this.wave >= 4) types.push('flyer');
        if (this.wave >= 5) types.push('bomber');
        if (this.wave >= 6) types.push('tank');
        if (this.wave >= 7) types.push('kamikaze');
        if (this.wave >= 8) types.push('sniper');
        if (this.wave >= 9) types.push('healer');
        if (this.wave >= 10) types.push('invisible');
        if (this.wave >= 11) types.push('summoner');
        if (this.wave >= 3) types.push('police');
        if (this.wave >= 8) types.push('canine');
        if (this.wave >= 10) types.push('heavy_drone');
        if (this.wave >= 12) types.push('ghost');
        if (this.wave >= 13) types.push('charger');
        if (this.wave >= 14) types.push('splitter');
        if (this.wave >= 15) types.push('shield_bot');
        if (this.wave >= 16) types.push('teleporter');
        if (this.wave >= 17) types.push('leech');
        if (this.wave >= 18) types.push('electro');
        if (this.wave >= 19) types.push('exploder');
        if (this.wave >= 4) types.push('balloon');
        if (this.wave >= 7) types.push('slime');
        if (this.wave >= 9) types.push('jester');
        if (this.wave >= 12) types.push('pinwheel');
        if (this.wave >= 6) types.push('scout_ship');
        if (this.wave >= 8) types.push('laser_turret');
        if (this.wave >= 10) types.push('space_dragon');
        if (this.wave >= 11) types.push('dynamiter');
        if (this.wave >= 13) types.push('tank_ship');
        if (this.wave >= 15) types.push('mecha');
        if (this.wave >= 17) types.push('nuke_carrier');
        if (this.wave >= 9) types.push('police_sniper');
        if (this.wave >= 10) types.push('trapper');
        if (this.wave >= 11) types.push('grenadier');
        if (this.wave >= 12) types.push('expander');
        if (this.wave >= 10) types.push('erratic');
        if (this.wave >= 12) types.push('freezer');
        if (this.wave >= 13) types.push('cloner');
        if (this.wave >= 14) types.push('toxic');
        return types;
    }

    spawnBoss() {
        const bosses = [
            { type: 'mothership', alias: 'NAVE NODRIZA GIGANTE' },
            { type: 'mech_beast', alias: 'DRAGON COSMICO' },
            { type: 'robot_colossal', alias: 'ROBOT MECHA COLOSAL' },
            { type: 'electric_boss', alias: 'ENTIDAD GALACTICA' },
            { type: 'tank_giant', alias: 'COLOSO DE ASEDIO' },
            { type: 'police_commander', alias: 'COMANDANTE ESTELAR' },
            { type: 'bomber_supreme', alias: 'BOMBARDERO ABISMAL' },
            { type: 'living_planet', alias: 'PLANETA VIVIENTE' },
            { type: 'black_hole', alias: 'AGUJERO NEGRO' },
            { type: 'supreme_dreadnought', alias: 'NAVE SUPREMA' },
        ];
        const bossData = bosses[(Math.floor(this.wave / 5) - 1) % bosses.length];
        game.boss = new Boss(bossData.type, this.wave);
        game.boss.name = bossData.alias;
        game.showBossBar(game.boss);
        game.showNotification(`¡JEFE: ${game.boss.name}!`, 'boss');
        sound.play('boss_alert');
        game.screenShake.shake(10);
    }

    spawnMiniBoss() {
        const miniBosses = ['mini_tank', 'mini_ship', 'armored_dog', 'heavy_drone_boss', 'ghost_lord', 'splitter_boss', 'mini_bomber', 'mini_mecha', 'mini_space_dragon', 'mini_heavy_ship', 'mini_nuclear', 'mini_summoner', 'mini_ninja'];
        const type = miniBosses[randInt(0, miniBosses.length - 1)];
        this.miniBoss = new MiniBoss(type, this.wave);
        game.miniBoss = this.miniBoss;
        game.showBossBar(this.miniBoss);
        game.showNotification(`¡MINI JEFE: ${this.miniBoss.name}!`, 'boss');
        sound.play('boss_alert');
        game.screenShake.shake(8);
    }

    onBossDefeated() {
        this.bossDefeated = true;
        this.totalBossesDefeated++;
        game.boss = null;
    }

    onMiniBossDefeated() {
        this.miniBossDefeated = true;
        game.miniBoss = null;
    }
}

// ============================================
// CLASE PRINCIPAL DEL JUEGO
// ============================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        this.frame = 0;
        this.state = 'menu';
        this.score = 0;
        this.kills = 0;
        this.highScore = parseInt(localStorage.getItem('neonSurvivorHighScore') || '0');

        // Sistemas
        this.particles = new ParticleSystem();
        this.floatingTexts = new FloatingTextSystem();
        this.screenShake = new ScreenShake();
        this.background = new BackgroundSystem();
        this.bulletManager = new BulletManager();
        this.enemyManager = new EnemyManager();
        this.dropManager = new DropManager();
        this.waveManager = new WaveManager();

        // Entidades
        this.player = null;
        this.boss = null;
        this.miniBoss = null;

        // Chaos Mode
        this.chaosMode = false;
        this.chaosTimer = 0;
        this.chaosSpawnTimer = 0;

        // Eventos y entidades del mundo
        this.activeMeteors = [];
        this.trafficShips = [];
        this.allyCruisers = [];
        this.groundTraps = [];
        this.planetCollisionEffect = null;
        this.worldEventTimer = randInt(420, 780);
        this.mechaModeTimer = 0;
        this.electricStormTimer = 0;
        this.gravityFluxTimer = 0;
        this.blackHoleTimer = 0;
        this.blackHoleX = CONFIG.canvasWidth * 0.5;
        this.blackHoleY = CONFIG.canvasHeight * 0.5;
        this.shipWarTimer = 0;
        this.starBurstTimer = 0;

        // Input
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.setupInput();

        // UI
        this.setupUI();
        this.updateHighScoreDisplay();

        // Loop
        this.lastTime = 0;
        this.bindLoop = this.loop.bind(this);
        requestAnimationFrame(this.bindLoop);

        // Resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.scaleX = this.canvas.width / CONFIG.canvasWidth;
        this.scaleY = this.canvas.height / CONFIG.canvasHeight;
        this.scale = Math.min(this.scaleX, this.scaleY);
        this.offsetX = (this.canvas.width - CONFIG.canvasWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - CONFIG.canvasHeight * this.scale) / 2;
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.state === 'playing') this.pause();
                else if (this.state === 'paused') this.resume();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left - this.offsetX) / this.scale;
            const my = (e.clientY - rect.top - this.offsetY) / this.scale;
            this.mouse.x = mx;
            this.mouse.y = my;
        });
        this.canvas.addEventListener('mousedown', () => {
            this.mouse.down = true;
            sound.init();
        });
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mouse.down = true;
            sound.init();
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouse.down = false;
        });
    }

    setupUI() {
        document.getElementById('btnStart').addEventListener('click', () => this.startGame());
        document.getElementById('btnDifficulty').addEventListener('click', () => this.cycleDifficulty());
        document.getElementById('btnControls').addEventListener('click', () => this.showControls());
        document.getElementById('btnBackControls').addEventListener('click', () => this.showMenu());
        document.getElementById('btnResume').addEventListener('click', () => this.resume());
        document.getElementById('btnRestartPause').addEventListener('click', () => this.startGame());
        document.getElementById('btnMenuPause').addEventListener('click', () => this.showMenu());
        document.getElementById('btnRestart').addEventListener('click', () => this.startGame());
        document.getElementById('btnMenu').addEventListener('click', () => this.showMenu());
        document.getElementById('btnRestartVictory').addEventListener('click', () => this.startGame());
        document.getElementById('btnMenuVictory').addEventListener('click', () => this.showMenu());
        document.getElementById('btnSkipShop').addEventListener('click', () => this.skipShop());
    }

    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.kills = 0;
        this.frame = 0;

        this.particles = new ParticleSystem();
        this.floatingTexts = new FloatingTextSystem();
        this.screenShake = new ScreenShake();
        this.bulletManager = new BulletManager();
        this.enemyManager = new EnemyManager();
        this.dropManager = new DropManager();
        this.waveManager = new WaveManager();

        this.player = new Player(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2);
        this.boss = null;
        this.miniBoss = null;
        this.chaosMode = false;
        this.chaosTimer = 0;
        this.activeMeteors = [];
        this.trafficShips = [];
        this.allyCruisers = [];
        this.groundTraps = [];
        this.planetCollisionEffect = null;
        this.worldEventTimer = randInt(420, 780);
        this.mechaModeTimer = 0;
        this.electricStormTimer = 0;
        this.gravityFluxTimer = 0;
        this.blackHoleTimer = 0;
        this.blackHoleX = CONFIG.canvasWidth * 0.5;
        this.blackHoleY = CONFIG.canvasHeight * 0.5;
        this.shipWarTimer = 0;
        this.starBurstTimer = 0;

        this.waveManager.startWave();

        this.hideAllScreens();
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('gamificationUI')?.classList.remove('hidden');

        sound.init();
    }

    showMenu() {
        this.state = 'menu';
        this.hideAllScreens();
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('gamificationUI')?.classList.add('hidden');
        openPanel?.('');
        this.updateHighScoreDisplay();
    }

    showControls() {
        this.hideAllScreens();
        document.getElementById('controlsScreen').classList.remove('hidden');
    }

    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        this.hideAllScreens();
        document.getElementById('pauseScreen').classList.remove('hidden');
    }

    resume() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        this.hideAllScreens();
    }

    gameOver() {
        this.state = 'gameover';
        sound.play('death');

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neonSurvivorHighScore', this.highScore.toString());
        }

        document.getElementById('finalWave').textContent = this.waveManager.wave;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalKills').textContent = this.kills;
        document.getElementById('finalCombo').textContent = 'x' + this.player.combo;
        document.getElementById('finalLevel').textContent = this.player.level;
        document.getElementById('finalXP').textContent = this.player.xp;

        this.hideAllScreens();
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
    }

    victory() {
        this.state = 'victory';
        sound.play('victory');

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neonSurvivorHighScore', this.highScore.toString());
        }

        document.getElementById('victoryScore').textContent = this.score;
        document.getElementById('victoryKills').textContent = this.kills;
        document.getElementById('victoryLevel').textContent = this.player.level;
        document.getElementById('victoryXP').textContent = this.player.xp;

        this.hideAllScreens();
        document.getElementById('victoryScreen').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
    }

    // FIX: método activateChaosMode faltante
    activateChaosMode() {
        this.chaosMode = true;
        this.chaosTimer = 900;
        this.showNotification('¡MODO CAOS ACTIVADO!', 'boss');
        game.screenShake.shake(15);
        game.particles.emitExplosion(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, 2);
    }

    showShop() {
        this.state = 'shop';
        const shopOptions = document.getElementById('shopOptions');
        shopOptions.innerHTML = '';

        const upgrades = [
            { icon: '❤', name: 'Vida Máx +20', desc: 'Aumenta vida máxima', action: () => { this.player.maxHealth += 20; this.player.health += 20; } },
            { icon: '🛡', name: 'Escudo +15', desc: 'Aumenta escudo máximo', action: () => { this.player.maxShield += 15; this.player.addShield(15); } },
            { icon: '⚡', name: 'Velocidad +10%', desc: 'Más velocidad de movimiento', action: () => { this.player.speed *= 1.1; } },
            { icon: '🔥', name: 'Daño +15%', desc: 'Más daño de balas', action: () => { /* se aplica via powerups en shoot */ } },
            { icon: '💨', name: 'Dash Rápido', desc: 'Reduce cooldown del dash', action: () => { CONFIG.dashCooldown = Math.max(60, CONFIG.dashCooldown - 20); } },
            { icon: '🔫', name: 'Cadencia +20%', desc: 'Dispara más rápido', action: () => { CONFIG.fireRate = Math.max(3, CONFIG.fireRate - 2); } },
        ];

        const selected = [];
        while (selected.length < 3 && selected.length < upgrades.length) {
            const u = randChoice(upgrades);
            if (!selected.includes(u)) selected.push(u);
        }

        for (const u of selected) {
            const div = document.createElement('div');
            div.className = 'shopOption';
            div.innerHTML = `
                <div class="shopIcon">${u.icon}</div>
                <div class="shopName">${u.name}</div>
                <div class="shopDesc">${u.desc}</div>
            `;
            div.addEventListener('click', () => {
                u.action();
                this.hideAllScreens();
                this.state = 'playing';
                this.waveManager.startWave();
            });
            shopOptions.appendChild(div);
        }

        this.hideAllScreens();
        document.getElementById('shopScreen').classList.remove('hidden');
    }

    skipShop() {
        this.hideAllScreens();
        this.state = 'playing';
        this.waveManager.startWave();
    }

    cycleDifficulty() {
        const diffs = ['easy', 'normal', 'hard'];
        const idx = diffs.indexOf(CONFIG.difficulty);
        CONFIG.difficulty = diffs[(idx + 1) % diffs.length];
        const labels = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' };
        document.getElementById('btnDifficulty').textContent = `Dificultad: ${labels[CONFIG.difficulty]}`;
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    }

    showNotification(text, type = 'wave') {
        const container = document.getElementById('notifications');
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        div.textContent = text;
        container.appendChild(div);
        setTimeout(() => div.remove(), 2500);
    }

    showAlert(text) {
        this.showNotification(text, 'boss');
    }

    summonAllyCruiser() {
        this.allyCruisers.push(new AllyCruiser());
        this.showAlert('NAVE ALIADA ENTRANDO');
        this.screenShake.shake(10);
    }

    spawnMeteorBurst(count = 8, giant = false) {
        for (let i = 0; i < count; i++) {
            const side = randInt(0, 3);
            let x, y, a;
            if (side === 0) {
                x = rand(0, CONFIG.canvasWidth);
                y = -120;
                a = rand(0.7, 2.2);
            } else if (side === 1) {
                x = CONFIG.canvasWidth + 120;
                y = rand(0, CONFIG.canvasHeight);
                a = rand(2.1, 3.8);
            } else if (side === 2) {
                x = rand(0, CONFIG.canvasWidth);
                y = CONFIG.canvasHeight + 120;
                a = rand(-2.3, -0.8);
            } else {
                x = -120;
                y = rand(0, CONFIG.canvasHeight);
                a = rand(-0.2, 1.1);
            }
            this.activeMeteors.push(new MeteorHazard(
                x,
                y,
                a,
                giant ? rand(12, 16) : rand(8, 12),
                giant ? rand(34, 54) : rand(20, 34),
                giant ? rand(28, 40) : rand(16, 26)
            ));
        }
    }

    spawnTrafficWave(count = 3, mecha = false) {
        for (let i = 0; i < count; i++) {
            this.trafficShips.push(new TrafficShip(Math.random() < 0.5, rand(180, CONFIG.canvasHeight - 180), mecha));
        }
    }

    placeTrap(x, y, type = 'mine') {
        this.groundTraps.push(new GroundTrap(x, y, type));
    }

    triggerPlanetCollision() {
        this.showAlert('COLISION DE PLANETAS');
        this.planetCollisionEffect = new PlanetCollisionEffect();
        setTimeout(() => {
            if (!this.player || this.state !== 'playing') return;
            this.screenShake.shake(20);
            this.particles.emitExplosion(CONFIG.canvasWidth * 0.5, CONFIG.canvasHeight * 0.35, 5);
            for (const enemy of this.enemyManager.enemies) enemy.takeDamage(40);
            if (this.boss && !this.boss.dead) this.boss.takeDamage(35);
            if (this.miniBoss && !this.miniBoss.dead) this.miniBoss.takeDamage(45);
            this.player.takeDamage(10);
        }, 900);
    }

    activateMechaWorld() {
        this.mechaModeTimer = 720;
        this.showAlert('MODO MECHA ACTIVADO');
        this.spawnMeteorBurst(6, true);
        for (let i = 0; i < 4; i++) {
            const x = rand(120, CONFIG.canvasWidth - 120);
            const y = rand(120, CONFIG.canvasHeight - 120);
            this.enemyManager.spawnEnemy(randChoice(['mecha', 'tank_ship', 'laser_turret']), x, y, this.waveManager.wave);
        }
    }

    triggerRandomWorldEvent() {
        const events = ['meteor', 'invasion', 'traffic', 'planets', 'electric', 'gravity', 'war', 'starburst', 'fragments', 'blackhole'];
        if (this.waveManager && this.waveManager.wave >= 10) {
            events.push('mecha');
        }
        const ev = randChoice(events);

        if (ev === 'meteor') {
            this.showAlert('CUIDADO: LLUVIA DE METEORITOS');
            setTimeout(() => this.spawnMeteorBurst(10, false), 1000);
        } else if (ev === 'invasion') {
            this.showAlert('INVASION ALIENIGENA');
            setTimeout(() => {
                for (let i = 0; i < 10; i++) {
                    const side = randInt(0, 3);
                    const margin = 90;
                    let x, y;
                    if (side === 0) { x = rand(margin, CONFIG.canvasWidth - margin); y = -margin; }
                    else if (side === 1) { x = CONFIG.canvasWidth + margin; y = rand(margin, CONFIG.canvasHeight - margin); }
                    else if (side === 2) { x = rand(margin, CONFIG.canvasWidth - margin); y = CONFIG.canvasHeight + margin; }
                    else { x = -margin; y = rand(margin, CONFIG.canvasHeight - margin); }
                    this.enemyManager.spawnEnemy(randChoice(['fast', 'scout_ship', 'balloon', 'space_dragon']), x, y, this.waveManager.wave);
                }
            }, 900);
        } else if (ev === 'traffic') {
            this.showAlert('TRAFICO ESPACIAL');
            setTimeout(() => this.spawnTrafficWave(4, false), 900);
        } else if (ev === 'planets') {
            this.triggerPlanetCollision();
        } else if (ev === 'electric') {
            this.showAlert('TORMENTA ELECTRICA ESPACIAL');
            this.electricStormTimer = 360;
        } else if (ev === 'gravity') {
            this.showAlert('GRAVEDAD ALTERADA');
            this.gravityFluxTimer = 420;
        } else if (ev === 'war') {
            this.showAlert('GUERRA ENTRE NAVES');
            this.shipWarTimer = 300;
            this.spawnTrafficWave(3, false);
            for (let i = 0; i < 6; i++) {
                this.enemyManager.spawnEnemy(randChoice(['scout_ship', 'laser_turret', 'police_sniper']), rand(120, CONFIG.canvasWidth - 120), rand(120, CONFIG.canvasHeight - 120), this.waveManager.wave);
            }
        } else if (ev === 'starburst') {
            this.showAlert('EXPLOSION DE ESTRELLA');
            this.starBurstTimer = 180;
            setTimeout(() => this.spawnMeteorBurst(8, true), 700);
        } else if (ev === 'fragments') {
            this.showAlert('FRAGMENTOS DE PLANETA');
            setTimeout(() => this.spawnMeteorBurst(12, true), 900);
        } else if (ev === 'blackhole') {
            this.showAlert('AGUJERO NEGRO CERCANO');
            this.blackHoleTimer = 360;
            this.blackHoleX = rand(CONFIG.canvasWidth * 0.25, CONFIG.canvasWidth * 0.75);
            this.blackHoleY = rand(CONFIG.canvasHeight * 0.25, CONFIG.canvasHeight * 0.75);
        } else {
            this.activateMechaWorld();
        }

        this.worldEventTimer = randInt(420, 820);
    }

    updateWorldEntities() {
        this.worldEventTimer--;
        if (this.worldEventTimer <= 0 && this.state === 'playing') {
            this.triggerRandomWorldEvent();
        }

        if (this.mechaModeTimer > 0) {
            this.mechaModeTimer--;
            if (this.mechaModeTimer % 120 === 0) this.spawnMeteorBurst(3, true);
            if (this.mechaModeTimer % 180 === 0) {
                this.enemyManager.spawnEnemy(randChoice(['mecha', 'tank_ship', 'nuke_carrier']), rand(160, CONFIG.canvasWidth - 160), -120, this.waveManager.wave);
            }
        }

        if (this.electricStormTimer > 0) {
            this.electricStormTimer--;
            if (this.electricStormTimer % 45 === 0) {
                const zx = rand(80, CONFIG.canvasWidth - 80);
                const zy = rand(80, CONFIG.canvasHeight - 80);
                this.particles.emit(zx, zy, 22, {
                    colors: ['#fff799', '#7df9ff', '#ffffff'],
                    speed: 6,
                    life: 14,
                    size: 2.5,
                    glow: true,
                });
                for (const enemy of this.enemyManager.enemies) {
                    if (!enemy.dead && dist(zx, zy, enemy.x, enemy.y) < 120) enemy.takeDamage(18);
                }
            }
        }

        if (this.gravityFluxTimer > 0) {
            this.gravityFluxTimer--;
            const gx = CONFIG.canvasWidth * 0.5;
            const gy = CONFIG.canvasHeight * 0.5;
            const pa = angle(this.player.x, this.player.y, gx, gy);
            this.player.vx += Math.cos(pa) * 0.025;
            this.player.vy += Math.sin(pa) * 0.025;
            for (const enemy of this.enemyManager.enemies) {
                const ga = angle(enemy.x, enemy.y, gx, gy);
                enemy.vx += Math.cos(ga) * 0.03;
                enemy.vy += Math.sin(ga) * 0.03;
            }
        }

        if (this.blackHoleTimer > 0) {
            this.blackHoleTimer--;
            const pa = angle(this.player.x, this.player.y, this.blackHoleX, this.blackHoleY);
            const pd = dist(this.player.x, this.player.y, this.blackHoleX, this.blackHoleY);
            this.player.vx += Math.cos(pa) * 0.04;
            this.player.vy += Math.sin(pa) * 0.04;
            if (pd < 110 && this.frame % 20 === 0) this.player.takeDamage(4);
            for (const enemy of this.enemyManager.enemies) {
                const ea = angle(enemy.x, enemy.y, this.blackHoleX, this.blackHoleY);
                enemy.vx += Math.cos(ea) * 0.06;
                enemy.vy += Math.sin(ea) * 0.06;
                if (dist(enemy.x, enemy.y, this.blackHoleX, this.blackHoleY) < 70) enemy.takeDamage(9999);
            }
        }

        if (this.shipWarTimer > 0) {
            this.shipWarTimer--;
            if (this.shipWarTimer % 90 === 0) this.spawnTrafficWave(2, this.mechaModeTimer > 0);
        }

        if (this.starBurstTimer > 0) {
            this.starBurstTimer--;
            if (this.starBurstTimer % 30 === 0) {
                for (let i = 0; i < 6; i++) {
                    this.bulletManager.addEnemyBullet(CONFIG.canvasWidth * 0.5, 50, rand(0.85, 2.3), rand(7, 10), 8, '#fff4b1');
                }
            }
        }

        for (const meteor of this.activeMeteors) meteor.update(this.player);
        this.activeMeteors = this.activeMeteors.filter(m => !m.dead);

        for (const ship of this.trafficShips) ship.update(this.player);
        this.trafficShips = this.trafficShips.filter(s => !s.dead);

        for (const cruiser of this.allyCruisers) cruiser.update();
        this.allyCruisers = this.allyCruisers.filter(c => !c.dead);

        for (const trap of this.groundTraps) trap.update(this.player);
        this.groundTraps = this.groundTraps.filter(t => !t.dead);

        if (this.planetCollisionEffect) {
            this.planetCollisionEffect.update();
            if (this.planetCollisionEffect.done) this.planetCollisionEffect = null;
        }
    }

    drawWorldEntities(ctx) {
        if (this.mechaModeTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.12 + Math.sin(this.frame * 0.06) * 0.04;
            ctx.fillStyle = '#ff3b30';
            ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
            ctx.restore();
        }

        if (this.electricStormTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.06 + Math.sin(this.frame * 0.18) * 0.03;
            ctx.fillStyle = '#7df9ff';
            ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
            for (let i = 0; i < 6; i++) {
                const x = (this.frame * (13 + i) + i * 420) % CONFIG.canvasWidth;
                ctx.strokeStyle = 'rgba(255,255,200,0.65)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x - 20, 80);
                ctx.lineTo(x + 10, 170);
                ctx.lineTo(x - 28, 260);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (this.gravityFluxTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.12;
            ctx.strokeStyle = '#9d7bff';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(CONFIG.canvasWidth * 0.5, CONFIG.canvasHeight * 0.5, 140 + i * 60 + Math.sin(this.frame * 0.06 + i) * 12, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (this.blackHoleTimer > 0) {
            ctx.save();
            ctx.translate(this.blackHoleX, this.blackHoleY);
            for (let i = 0; i < 5; i++) {
                ctx.globalAlpha = 0.18 - i * 0.025;
                ctx.strokeStyle = i % 2 === 0 ? '#7df9ff' : '#9d4edd';
                ctx.lineWidth = 12 - i * 2;
                ctx.beginPath();
                ctx.arc(0, 0, 54 + i * 18 + Math.sin(this.frame * 0.08 + i) * 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = '#05010b';
            ctx.beginPath();
            ctx.arc(0, 0, 44, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.starBurstTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.08 + Math.sin(this.frame * 0.2) * 0.04;
            ctx.fillStyle = '#fff4b1';
            ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
            ctx.restore();
        }

        if (this.planetCollisionEffect) this.planetCollisionEffect.draw(ctx);
        for (const trap of this.groundTraps) trap.draw(ctx);
        for (const ship of this.trafficShips) ship.draw(ctx);
        for (const meteor of this.activeMeteors) meteor.draw(ctx);
        for (const cruiser of this.allyCruisers) cruiser.draw(ctx);
    }

    showBossBar(boss) {
        const bar = document.getElementById('bossBar');
        document.getElementById('bossName').textContent = boss.name || boss.type;
        bar.classList.remove('hidden');
    }

    hideBossBar() {
        document.getElementById('bossBar').classList.add('hidden');
    }

    updateHighScoreDisplay() {
        document.querySelector('#highScore span').textContent = this.highScore;
    }

    // FIX: updateHUD con la llave de cierre correctamente dentro de la clase
    updateHUD() {
        if (!this.player) return;

        const healthPct = this.player.health / this.player.maxHealth;
        document.getElementById('healthBar').style.width = (healthPct * 100) + '%';
        document.getElementById('healthText').textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;

        const shieldPct = this.player.shield / this.player.maxShield;
        document.getElementById('shieldBar').style.width = (shieldPct * 100) + '%';
        document.getElementById('shieldText').textContent = Math.ceil(this.player.shield);

        document.getElementById('waveText').textContent = `Oleada ${this.waveManager.wave}`;
        document.getElementById('enemyCount').textContent = `Enemigos: ${this.enemyManager.getAliveCount()}`;

        document.getElementById('scoreText').textContent = `Puntuación: ${this.score}`;
        document.getElementById('comboText').textContent = `Combo: x${this.player.combo}`;
        document.getElementById('levelText').textContent = `Nivel: ${this.player.level}`;

        const weaponNames = {
            normal: 'Disparo Normal',
            triple: 'Disparo Triple',
            quintuple: 'Disparo Quíntuple',
            grenade: 'Lanzagranadas',
            laser: 'Rayo Potente',
            shockwave: 'Onda de Choque',
            homing: 'Misil Rastreador',
            shotgun: 'Escopeta',
            railgun: 'Railgun',
            plasma: 'Cañón Plasma',
            flame: 'Lanzallamas Espacial',
            tesla: 'Rayo Tesla',
            iceburst: 'Rafaga de Hielo',
            gravity: 'Arma de Gravedad',
            nuclear: 'Arma Nuclear',
        };
        document.getElementById('weaponName').textContent = weaponNames[this.player.weaponType] || 'Desconocido';

        const ammoPct = this.player.powerups.infinite ? 100 : (this.player.ammo / this.player.maxAmmo * 100);
        document.getElementById('ammoBar').style.width = ammoPct + '%';

        const dashPct = 1 - (this.player.dashCooldownTimer / CONFIG.dashCooldown);
        const dashBar = document.getElementById('dashBar');
        dashBar.style.width = (dashPct * 100) + '%';
        dashBar.className = 'cooldownBar ' + (dashPct >= 1 ? 'ready' : 'cooldown');

        const skillPct = 1 - (this.player.skillTimer / CONFIG.skillCooldown);
        const skillBar = document.getElementById('skillBar');
        skillBar.style.width = (skillPct * 100) + '%';
        skillBar.className = 'cooldownBar ' + (skillPct >= 1 ? 'ready' : 'cooldown');
        document.querySelector('#skillCooldown span').textContent = `Nave Aliada (E)`;

        const powerupsContainer = document.getElementById('activePowerups');
        powerupsContainer.innerHTML = '';
        const icons = {
            speed: '⚡', damage: '⚔', rapid: '🔥', pierce: '➤', explosive: '💥',
            freeze: '❄', god: '⭐', infinite: '∞', regen: '💚', reflect: '↩',
            magnet: '🧲', spread: '✴', slowmotion: '🐌', massive: '💀', chaos: '☠️',
        };
        const colors = {
            speed: '#ffaa00', damage: '#ff0000', rapid: '#ffea00', pierce: '#ffffff',
            explosive: '#ff4400', freeze: '#88ccff', god: '#ffea00', infinite: '#aaddff',
            regen: '#00ff88', reflect: '#ff88ff', magnet: '#ffaa00', spread: '#ff66ff',
            slowmotion: '#4488ff', massive: '#ff4444', chaos: '#ff0000',
        };
        for (const [key, value] of Object.entries(this.player.powerups)) {
            if (value > 0) {
                const div = document.createElement('div');
                div.className = 'powerupIcon';
                div.style.borderColor = colors[key] || '#ffffff';
                div.style.color = colors[key] || '#ffffff';
                div.innerHTML = `${icons[key] || '?'}<span class="powerupTimer">${Math.ceil(value / 60)}s</span>`;
                powerupsContainer.appendChild(div);
            }
        }

        // Barra de jefe
        if (this.boss && !this.boss.dead) {
            const bossPct = this.boss.health / this.boss.maxHealth;
            document.getElementById('bossHealthBar').style.width = (bossPct * 100) + '%';
        }
    }

    // ============================================
    // GAME LOOP
    // ============================================
    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.frame++;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);

        this.background.update();
        this.background.draw(this.ctx);

        if (this.state === 'playing' || this.state === 'paused') {
            this.screenShake.update();
            this.screenShake.apply(this.ctx);

            if (this.state === 'playing') {
                // Chaos Mode: spawn rápido de enemigos
                if (this.chaosMode) {
                    this.chaosTimer--;
                    if (this.chaosTimer <= 0) {
                        this.chaosMode = false;
                        if (this.player) delete this.player.powerups.chaos;
                    }
                    this.chaosSpawnTimer--;
                    if (this.chaosSpawnTimer <= 0) {
                        this.chaosSpawnTimer = 20;
                        const types = this.waveManager.getEnemyTypesForWave();
                        const side = randInt(0, 3);
                        let cx, cy;
                        const margin = 60;
                        switch(side) {
                            case 0: cx = rand(margin, CONFIG.canvasWidth - margin); cy = -margin; break;
                            case 1: cx = CONFIG.canvasWidth + margin; cy = rand(margin, CONFIG.canvasHeight - margin); break;
                            case 2: cx = rand(margin, CONFIG.canvasWidth - margin); cy = CONFIG.canvasHeight + margin; break;
                            default: cx = -margin; cy = rand(margin, CONFIG.canvasHeight - margin); break;
                        }
                        this.enemyManager.spawnEnemy(randChoice(types), cx, cy, this.waveManager.wave);
                    }
                }

                this.player.update(this.keys, this.mouse);
                this.enemyManager.update(this.player);
                this.bulletManager.update();
                this.dropManager.update(this.player);
                this.waveManager.update();
                this.updateWorldEntities();
                this.particles.update();
                this.floatingTexts.update();

                if (this.boss) {
                    this.boss.update(this.player);
                    if (this.boss.dead) {
                        this.waveManager.onBossDefeated();
                        this.boss = null;
                    }
                }

                if (this.miniBoss) {
                    this.miniBoss.update(this.player);
                    if (this.miniBoss.dead) {
                        this.waveManager.onMiniBossDefeated();
                        this.miniBoss = null;
                    }
                }

                if (this.waveManager.totalBossesDefeated >= 10) {
                    this.victory();
                }
            }

            // Draw
            this.drawWorldEntities(this.ctx);
            this.dropManager.draw(this.ctx);
            this.enemyManager.draw(this.ctx);
            if (this.boss) this.boss.draw(this.ctx);
            if (this.miniBoss) this.miniBoss.draw(this.ctx);
            this.player.draw(this.ctx);
            this.bulletManager.draw(this.ctx);
            this.particles.draw(this.ctx);
            this.floatingTexts.draw(this.ctx);

            this.updateHUD();
        }

        this.ctx.restore();

        requestAnimationFrame(this.bindLoop);
    }
}

// ============================================
// INICIAR JUEGO
// ============================================
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    window.game = game;
});

function resetGame() {
    if (game) {
        game = new Game();
    window.game = game;
        document.getElementById('gameOverScreen')?.classList.add('hidden');
        document.getElementById('pauseScreen')?.classList.add('hidden');
        document.getElementById('mainMenu')?.classList.remove('hidden');
    }
}

// =========== GAMIFICACI�N INTEGRADA ===========
class PlayerData {
    constructor(uid="player1"){this.uid=uid;this.d=this.ld();}
    ld(){const k="gs_"+this.uid;const s=localStorage.getItem(k);return s?JSON.parse(s):this.df();}
    df(){return{uid:this.uid,coins:0,creds:0,bpxp:0,totxp:0,lvl:1,xp:0,xpn:100,rnk:"Novato",k:0,bk:0,rk:0,mk:0,bkills:0,m:[],mp:{},lm:this.did(),dlr:false,bpl:1,bpc:0,bpf:[],bprem:false,inv:{sk:[],fr:[],bg:[],ef:[]},eq:{sk:0,fr:0,bg:0,ef:0},set:{s:true,m:true},ls:new Date().toISOString()};}
    did(){const d=new Date();return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();}
    sv(){localStorage.setItem("gs_"+this.uid,JSON.stringify(this.d));}
    addC(n){this.d.coins+=n;this.sv();}
    addCr(n){this.d.creds+=n;this.sv();}
    addXP(n){this.d.xp+=n;this.d.totxp+=n;while(this.d.xp>=this.d.xpn){this.d.xp-=this.d.xpn;this.d.lvl++;this.d.xpn=Math.floor(this.d.xpn*1.25);this.onLvl();}this.sv();}
    onLvl(){this.addC(this.d.lvl*50);const l=this.d.lvl;this.d.rnk=l>=50?"Leyenda":l>=35?"Elite":l>=20?"Experto":l>=10?"Activo":"Novato";this.sv();if(game&&game.floatingTexts)game.floatingTexts.add(CONFIG.canvasWidth/2,CONFIG.canvasHeight/2,"NIVEL "+l+"!","#ffea00",30,70);}
    addBPXP(n){this.d.bpxp+=n;while(this.d.bpxp>=this.d.bpl*1000){this.d.bpxp-=this.d.bpl*1000;this.d.bpl++;}this.sv();}
    addKill(t){this.d.k++;if(t==="basic")this.d.bk++;else if(t==="rare")this.d.rk++;else if(t==="miniboss")this.d.mk++;else if(t==="boss")this.d.bkills++;this.sv();}
}
const playerData = new PlayerData();

class MissionSystem {
    constructor(){this.m=[];this.pr={};const td=playerData.did();if(!playerData.d.lm||playerData.d.lm!==td||!playerData.d.m.length)this.g();else{this.m=playerData.d.m;this.pr=playerData.d.mp;}}
    g(){const pool=[{id:"m1",t:"kill",s:"basic",tg:5,d:"5 enemigos b�sicos",c:50,x:40},{id:"m2",t:"kill",s:"basic",tg:12,d:"12 b�sicos",c:110,x:80},{id:"m3",t:"kill",s:"rare",tg:2,d:"2 raros",c:150,x:120},{id:"m4",t:"kill",s:"miniboss",tg:1,d:"1 mini jefe",c:250,x:180},{id:"m5",t:"kill",s:"boss",tg:1,d:"1 jefe diario",c:400,x:300,p:true},{id:"m6",t:"survive",tg:90,d:"90 segundos",c:120,x:80},{id:"m7",t:"skill",tg:5,d:"5 habilidades",c:80,x:60},{id:"m8",t:"kill_all",tg:25,d:"25 total",c:200,x:150},{id:"m9",t:"combo",tg:15,d:"Combo x15",c:180,x:130},{id:"m10",t:"login",tg:1,d:"Iniciar sesi�n",c:30,x:20}];const sh=pool.sort(()=>0.5-Math.random());this.m=sh.slice(0,4).map(m=>({...m,done:false,claimed:false}));this.pr={};playerData.d.m=this.m;playerData.d.mp=this.pr;playerData.d.lm=playerData.did();playerData.sv();}
    onEvt(t,s=null,v=1){for(const m of this.m){if(m.done||m.claimed)continue;if((t==="kill"&&m.s===s)||m.t==="kill_all")this.inc(m.id);else if(m.t==="skill"&&t==="skill")this.inc(m.id);else if(m.t==="survive"&&t==="survive"){const c=this.pr[m.id]||0;this.pr[m.id]=Math.min(c+v,m.tg);if(this.pr[m.id]>=m.tg)m.done=true;playerData.d.mp=this.pr;playerData.sv();}else if(m.t==="combo"&&t==="combo"&&v>=m.tg)m.done=true;else if(m.t==="wave"&&t==="wave"&&v>=m.tg)m.done=true;}}
    inc(id){const m=this.m.find(x=>x.id===id);if(!m||m.done)return;const c=this.pr[id]||0;if(c<m.tg){this.pr[id]=c+1;if(this.pr[id]>=m.tg)m.done=true;playerData.d.mp=this.pr;playerData.sv();}}
    claim(id){const m=this.m.find(x=>x.id===id);if(!m||!m.done||m.claimed)return{success:false,message:"No reclamable"};m.claimed=true;playerData.addC(m.c);playerData.addXP(m.x);playerData.sv();return{success:true,message:"Reclamaste "+m.c+" monedas y "+m.x+" XP",c:m.c,x:m.x};}
    prog(id){return this.pr[id]||0;}
    getMs(){return this.m;}
    canR(){const td=playerData.did();return !playerData.d.lm||playerData.d.lm!==td;}
    r(useC=false){if(useC){if(playerData.d.coins>=50){playerData.d.coins-=50;this.g();playerData.sv();return{success:true,message:"Misiones renovadas"};}return{success:false,message:"Necesitas 50 monedas"};}this.g();return{success:true,message:"Misiones renovadas"};}
}
const missionSystem = new MissionSystem();

window.onEnemyKill = function(t){playerData.addKill(t);playerData.addC(10);playerData.addXP(5);playerData.addBPXP(2);missionSystem.onEvt("kill",t);updGamUI();showNotif("+10 monedas");};
window.onSkillUsed = function(){missionSystem.onEvt("skill");updGamUI();};
window.onWaveComplete = function(w){missionSystem.onEvt("wave",null,w);playerData.addC(w*15);playerData.addXP(w*8);updGamUI();showNotif("Oleada "+w+" completada","wave");};
window.onComboUpdate = function(c){missionSystem.onEvt("combo",null,c);};

function showNotif(t,tp="info"){const n=document.getElementById("notifications");if(n){const e=document.createElement("div");e.className="notification "+tp;e.textContent=t;n.appendChild(e);setTimeout(()=>e.remove(),3000);}}
function updGamUI(){
    const ids=["coinsAmount","creditsAmount","bpAmount","xpBarFill","xpText","levelText","rankBadge","menuLevel","menuRank","menuCoins"];
    const v=[playerData.d.coins,playerData.d.creds,playerData.d.bpl,(playerData.d.xp/playerData.d.xpn)*100,playerData.d.xp+"/"+playerData.d.xpn,"Nv."+playerData.d.lvl,playerData.d.rnk,playerData.d.lvl,playerData.d.rnk,playerData.d.coins];
    ids.forEach((id,i)=>{const el=document.getElementById(id);if(el){if(id==="xpBarFill")el.style.width=v[i]+"%";else el.textContent=v[i];}});
}
function openPanel(id){["missionsPanel","shopPanel","rankingPanel","battlePassPanel"].forEach(pid=>{const el=document.getElementById(pid);if(el)el.classList.toggle("hidden",pid!==id);});}
function initGamUI(){
    document.getElementById("btnMissions")?.addEventListener("click",()=>openPanel("missionsPanel"));
    document.getElementById("btnShop")?.addEventListener("click",()=>{openPanel("shopPanel");rendShop("skin");});
    document.getElementById("btnRanking")?.addEventListener("click",()=>{openPanel("rankingPanel");rendRank("coins");});
    document.getElementById("btnBattlePass")?.addEventListener("click",()=>{openPanel("battlePassPanel");rendBP();});
    ["closeMissions","closeShop","closeRanking","closeBattlePass"].forEach(id=>{document.getElementById(id)?.addEventListener("click",()=>openPanel(""));});
    document.getElementById("btnGamificationMenu")?.addEventListener("click",()=>{game?.hideAllScreens();document.getElementById("gamificationUI")?.classList.remove("hidden");document.getElementById("gamificationMenuScreen")?.classList.remove("hidden");});
    document.getElementById("btnBackGamification")?.addEventListener("click",()=>{document.getElementById("gamificationUI")?.classList.add("hidden");game?.showMenu();});
    document.getElementById("btnOpenMissions")?.addEventListener("click",()=>openPanel("missionsPanel"));
        document.getElementById("btnOpenShop")?.addEventListener("click",()=>{openPanel("shopPanel");rendShop("skin");});
        document.getElementById("btnOpenRanking")?.addEventListener("click",()=>{openPanel("rankingPanel");rendRank("coins");});
        document.getElementById("btnOpenBattlePass")?.addEventListener("click",()=>{openPanel("battlePassPanel");rendBP();});
    document.querySelectorAll(".shopTab").forEach(b=>{b.addEventListener("click",()=>{document.querySelectorAll(".shopTab").forEach(x=>x.classList.remove("active"));b.classList.add("active");rendShop(b.dataset.tab);});});
    document.querySelectorAll(".rankTab").forEach(b=>{b.addEventListener("click",()=>{document.querySelectorAll(".rankTab").forEach(x=>x.classList.remove("active"));b.classList.add("active");rendRank(b.dataset.rank);});});
    document.getElementById("btnRefreshMissions")?.addEventListener("click",()=>{const r=missionSystem.r(true);showNotif(r.message,r.success?"success":"error");if(r.success)rendMissions();});
    document.getElementById("missionsList")?.addEventListener("click",(e)=>{
        if(e.target.classList.contains("mission-claim")&&!e.target.disabled){
            const mid=e.target.dataset.mid;const res=missionSystem.claim(mid);
            if(res.success){rendMissions();updGamUI();}showNotif(res.message,res.success?"success":"error");
        }
    });
    rendMissions(); rendShop("skin"); rendRank("coins"); rendBP(); updGamUI();
}

const SHOP_ITEMS = [
    {id:101,t:"skin",n:"Rosa Neon",p:200,cl:"#ff69b4"},
    {id:102,t:"skin",n:"Oro Cosmico",p:500,cl:"#ffd700"},
    {id:201,t:"frame",n:"Marco Plata",p:150,ic:"??"},
    {id:202,t:"frame",n:"Marco Oro",p:400,ic:"??"}
];
function rendShop(tab){const c=document.getElementById("shopContent");if(!c)return;c.innerHTML="";SHOP_ITEMS.filter(i=>i.t===tab).forEach(it=>{const invKey={skin:"sk",frame:"fr",background:"bg",effect:"ef"}[it.t]||it.t;const owned=(playerData.d.inv[invKey]||[]).includes(it.id);const b=document.createElement("button");b.className="shop-item";b.innerHTML=`<div class="item-preview" style="background:${it.cl||"#333"}">${it.ic||""}</div><div class="item-name">${it.n}</div><div class="item-price">${owned?"Comprado":it.p+" monedas"}</div>`;b.disabled=owned||playerData.d.coins<it.p;b.onclick=()=>{if(!owned&&playerData.d.coins>=it.p){playerData.d.coins-=it.p;if(!playerData.d.inv[invKey])playerData.d.inv[invKey]=[];playerData.d.inv[invKey].push(it.id);playerData.sv();rendShop(tab);updGamUI();showNotif("Comprado: "+it.n);}};c.appendChild(b);});}
function getRnk(m){const a=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("gs_")){const d=JSON.parse(localStorage.getItem(k));a.push({nm:k.slice(3),coins:d.coins||0,kills:d.k||0,lvl:d.lvl||1});}}if(m==="coins")return a.sort((x,y)=>y.coins-x.coins).slice(0,15);if(m==="kills")return a.sort((x,y)=>y.kills-x.kills).slice(0,15);return a.sort((x,y)=>y.lvl-x.lvl).slice(0,15);}
function rendRank(m){const l=document.getElementById("rankingList");if(!l)return;l.innerHTML="";const r=getRnk(m);r.forEach((u,i)=>{const d=document.createElement("div");d.className="rank-entry";d.innerHTML=`<span>#${i+1}</span><span>${u.nm}</span><span>${m==="coins"?u.coins:m==="kills"?u.kills:u.lvl}</span>`;l.appendChild(d);});}
function rendMissions(){const l=document.getElementById("missionsList");if(!l)return;l.innerHTML="";missionSystem.getMs().forEach(m=>{const cur=missionSystem.prog(m.id);const p=Math.min(cur/m.tg*100,100);const d=document.createElement("div");d.className="mission-card";d.innerHTML=`<div>${m.d}</div><div class="mission-bar-bg"><div class="mission-bar-fill" style="width:${p}%"></div></div><div>${cur}/${m.tg} � ${m.c} monedas � ${m.x} XP</div><button class="mission-claim" data-mid="${m.id}" ${!m.done||m.claimed?"disabled":""}>${m.claimed?"?":"Reclamar"}</button>`;l.appendChild(d);});}
function rendBP(){const l=document.getElementById("bpRewardsList");if(!l)return;l.innerHTML="";for(let i=1;i<=10;i++){const d=document.createElement("div");d.className="bp-level";d.innerHTML=`<span>Nv ${i}</span><span class="bp-free">[F] ${i===1?"50 monedas":i===3?"Skin Com�n":i===5?"100 monedas":i===7?"Marco Plata":i===10?"150 monedas":"�"}</span>`;if(playerData.d.bpl>=i)d.innerHTML+=' <span class="bp-claimed">?</span>';l.appendChild(d);}const fill=document.getElementById("bpProgressFill");const txt=document.getElementById("bpXPText");const lvl=document.getElementById("bpLevelNum");if(fill)fill.style.width=(playerData.d.bpxp/(playerData.d.bpl*1000)*100)+"%";if(txt)txt.textContent=playerData.d.bpxp+"/"+(playerData.d.bpl*1000)+" XP";if(lvl)lvl.textContent=playerData.d.bpl;}
window.addEventListener("load",()=>{setTimeout(initGamUI,300);});



// =====================================================
// ADVANCED SKIN / SHOP / RIGHT-CLICK COMBAT SYSTEM
// =====================================================
(function installAdvancedSkinSystem(){
    if (window.__advancedSkinSystemInstalled) return;
    window.__advancedSkinSystemInstalled = true;

    const SKIN_STORAGE_KEY = 'gs_advanced_skins_v2';
    const DEFAULT_SKIN = 'standard';

    const ADVANCED_SKINS = [
        { id:'standard', name:'Nave Base', desc:'Disparo equilibrado y soporte aliado clasico.', price:0, color:'#00f0ff', accent:'#ffffff', shot:'standard', special:'support', cooldown:360 },
        { id:'atomic_core', name:'Nucleo Atomico', desc:'Proyectiles energeticos inestables. Especial: explosion nuclear masiva.', price:450, color:'#ff334d', accent:'#ffd166', shot:'atomic', special:'nuclear', cooldown:720 },
        { id:'sun', name:'Sol', desc:'Fuego continuo que prende enemigos. Especial: llamarada solar.', price:520, color:'#ff9f1c', accent:'#fff3b0', shot:'flame', special:'solar_flare', cooldown:540 },
        { id:'neutron_star', name:'Estrella de Neutrones', desc:'Rayo super concentrado. Especial: estrella azul que cae y limpia el mapa.', price:760, color:'#7df9ff', accent:'#ffffff', shot:'neutron', special:'blue_star', cooldown:900 },
        { id:'black_hole', name:'Agujero Negro', desc:'Mini agujeros negros que absorben y explotan. Especial: mega explosion gravitacional.', price:900, color:'#1b102f', accent:'#b388ff', shot:'blackhole', special:'gravity_burst', cooldown:840 },
        { id:'meteor_rain', name:'Lluvia de Meteoritos', desc:'Rocas ardientes con salpicadura. Especial: bombardeo orbital.', price:620, color:'#ff6b35', accent:'#ffd166', shot:'meteor', special:'meteor_storm', cooldown:680 },
        { id:'plasma', name:'Plasma', desc:'Orbes de plasma expansivos. Especial: nova de plasma.', price:560, color:'#c56bff', accent:'#6ae2ff', shot:'plasma', special:'plasma_nova', cooldown:560 },
        { id:'electric', name:'Electrica', desc:'Rayos encadenados. Especial: tormenta electrica.', price:580, color:'#f8ff6a', accent:'#7df9ff', shot:'electric', special:'electric_storm', cooldown:520 },
        { id:'triple_laser', name:'Laser Triple', desc:'Tres lineas laser perforantes. Especial: abanico laser.', price:640, color:'#ff4fd8', accent:'#ffffff', shot:'triple_laser', special:'laser_fan', cooldown:600 },
        { id:'dark_energy', name:'Energia Oscura', desc:'Misiles oscuros que ralentizan. Especial: pulso de vacio.', price:700, color:'#5d2de1', accent:'#1df2ff', shot:'dark', special:'void_pulse', cooldown:650 },
        { id:'crystal', name:'Cristal', desc:'Fragmentos cristalinos perforantes. Especial: explosion prismatica.', price:500, color:'#9be7ff', accent:'#ff9ff3', shot:'crystal', special:'crystal_bloom', cooldown:500 },
        { id:'ice', name:'Hielo', desc:'Rafagas heladas que congelan. Especial: tormenta glacial.', price:460, color:'#9be7ff', accent:'#ffffff', shot:'ice', special:'ice_storm', cooldown:520 },
        { id:'poison', name:'Veneno', desc:'Agujas toxicas con dano temporal. Especial: nube venenosa.', price:480, color:'#7ae582', accent:'#d8ff7a', shot:'poison', special:'poison_cloud', cooldown:520 }
    ];

    function loadSkinState(){
        try {
            const raw = localStorage.getItem(SKIN_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                parsed.unlocked = Array.isArray(parsed.unlocked) ? parsed.unlocked : [DEFAULT_SKIN];
                parsed.equipped = parsed.equipped || DEFAULT_SKIN;
                return parsed;
            }
        } catch (_) {}
        return { unlocked:[DEFAULT_SKIN], equipped:DEFAULT_SKIN };
    }

    function saveSkinState(state){
        localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(state));
    }

    function getTargetsInRadius(x, y, radius){
        const targets = [];
        if (!window.game) return targets;
        for (const enemy of game.enemyManager.enemies) {
            if (!enemy.dead && dist(x, y, enemy.x, enemy.y) <= radius + (enemy.radius || 0)) targets.push(enemy);
        }
        if (game.miniBoss && !game.miniBoss.dead && dist(x, y, game.miniBoss.x, game.miniBoss.y) <= radius + game.miniBoss.radius) targets.push(game.miniBoss);
        if (game.boss && !game.boss.dead && dist(x, y, game.boss.x, game.boss.y) <= radius + game.boss.radius) targets.push(game.boss);
        return targets;
    }

    function areaDamage(x, y, radius, damage, color, status){
        if (!window.game) return 0;
        let hits = 0;
        for (const target of getTargetsInRadius(x, y, radius)) {
            const falloff = 1 - Math.min(0.7, dist(x, y, target.x, target.y) / Math.max(1, radius));
            target.takeDamage(damage * falloff);
            if (status) applyStatus(target, status.type, status.frames, status.damage, status.color);
            hits++;
        }
        game.particles.emitExplosion(x, y, Math.max(1, radius / 90));
        game.particles.emitShockwave(x, y, color || '#ffffff');
        game.screenShake.shake(Math.min(30, Math.max(8, radius / 18)));
        return hits;
    }

    function applyStatus(target, type, frames, damage, color){
        if (!target) return;
        target.skinStatus = { type, frames, damage, color: color || '#ffffff' };
        if (type === 'freeze') target.slowTimer = Math.max(target.slowTimer || 0, frames);
    }

    function tickStatus(target){
        const s = target && target.skinStatus;
        if (!s || s.frames <= 0 || target.dead) return;
        s.frames--;
        if (s.frames % 20 === 0) target.takeDamage(s.damage || 1);
        if (window.game && game.frame % 6 === 0) {
            game.particles.emit(target.x, target.y, 2, { colors:[s.color, '#ffffff'], speed:2, life:12, size:2, glow:true });
        }
        if (s.type === 'freeze') target.slowTimer = Math.max(target.slowTimer || 0, 8);
        if (s.frames <= 0) target.skinStatus = null;
    }

    function patchStatusTick(ClassRef){
        if (!ClassRef || ClassRef.prototype.__skinStatusPatched) return;
        const original = ClassRef.prototype.update;
        ClassRef.prototype.update = function(...args){
            tickStatus(this);
            return original.apply(this, args);
        };
        ClassRef.prototype.__skinStatusPatched = true;
    }

    patchStatusTick(Enemy);
    patchStatusTick(MiniBoss);
    patchStatusTick(Boss);

    class AdvancedSkinSystem {
        constructor(){
            this.skins = ADVANCED_SKINS;
            this.state = loadSkinState();
            if (!this.state.unlocked.includes(DEFAULT_SKIN)) this.state.unlocked.push(DEFAULT_SKIN);
            if (!this.getSkin(this.state.equipped)) this.state.equipped = DEFAULT_SKIN;
            saveSkinState(this.state);
        }
        getSkin(id){ return this.skins.find(s => s.id === id) || this.skins[0]; }
        equipped(){ return this.getSkin(this.state.equipped); }
        isUnlocked(id){ return this.state.unlocked.includes(id); }
        buy(id){
            const skin = this.getSkin(id);
            if (!skin) return { ok:false, message:'Skin no encontrada' };
            if (this.isUnlocked(id)) return this.equip(id);
            if (!playerData || playerData.d.coins < skin.price) return { ok:false, message:'Necesitas ' + skin.price + ' monedas' };
            playerData.d.coins -= skin.price;
            this.state.unlocked.push(id);
            this.state.equipped = id;
            playerData.sv();
            saveSkinState(this.state);
            updGamUI();
            return { ok:true, message:'Comprada y equipada: ' + skin.name };
        }
        equip(id){
            const skin = this.getSkin(id);
            if (!skin) return { ok:false, message:'Skin no encontrada' };
            if (!this.isUnlocked(id)) return { ok:false, message:'Skin bloqueada' };
            this.state.equipped = id;
            saveSkinState(this.state);
            return { ok:true, message:'Equipada: ' + skin.name };
        }
        unequip(){
            this.state.equipped = DEFAULT_SKIN;
            saveSkinState(this.state);
            return { ok:true, message:'Skin base equipada' };
        }
        fire(player, bm, mult){
            const skin = this.equipped();
            const a = player.angle;
            const x = player.x;
            const y = player.y;
            const dmg = 10 * (mult || 1);
            player.fireTimer = Math.max(2, CONFIG.fireRate - (skin.shot === 'flame' ? 4 : 0));
            if (!player.powerups.infinite) player.ammo--;
            switch (skin.shot) {
                case 'atomic':
                    for (let i = -1; i <= 1; i++) bm.addBullet(x, y, a + i * 0.08 + rand(-0.04,0.04), 12, dmg * 1.2, skin.color, false, true, false);
                    game.particles.emit(x, y, 7, { colors:[skin.color, skin.accent], speed:4, life:12, size:2.5, glow:true, angle:a, angleSpread:0.4 });
                    sound.play('shoot_heavy');
                    break;
                case 'flame': bm.addFlameCone(x, y, a, dmg * 0.6); sound.play('shoot'); break;
                case 'neutron': bm.addRailgun(x, y, a, dmg * 3.2); sound.play('shoot_heavy'); break;
                case 'blackhole': this.fireBlackHole(x, y, a, dmg * 1.5); sound.play('boss_alert'); break;
                case 'meteor': bm.addGrenade(x, y, a + rand(-0.12,0.12), 9, dmg * 1.9, 38); sound.play('shoot_heavy'); break;
                case 'plasma': bm.addPlasma(x, y, a, 7, dmg * 1.6); sound.play('shoot_heavy'); break;
                case 'electric': bm.addTeslaArc(x, y, a, dmg * 1.35); sound.play('boss_alert'); break;
                case 'triple_laser': for (let i=-1;i<=1;i++) bm.addLaser(x, y, a + i * 0.13, dmg * 1.2, 7); sound.play('shoot_heavy'); break;
                case 'dark': bm.addHoming(x, y, a, 9, dmg * 1.5); game.particles.emit(x,y,6,{colors:[skin.color,skin.accent],speed:3,life:14,size:3,glow:true}); sound.play('shoot'); break;
                case 'crystal': for (let i=-2;i<=2;i++){ const b = new Bullet(x,y,a+i*0.09,13,dmg*0.85, i===0?skin.accent:skin.color, true, false, false); b.radius=4; bm.bullets.push(b); } sound.play('shoot'); break;
                case 'ice': bm.addIceBurst(x, y, a, dmg); sound.play('shoot'); break;
                case 'poison': for (let i=-1;i<=1;i++){ const b = new Bullet(x,y,a+i*0.08,11,dmg*0.75,skin.color,false,false,false); b.poison = true; bm.bullets.push(b); } sound.play('shoot'); break;
                default: bm.addBullet(x, y, a + rand(-0.05,0.05), 12, dmg, skin.color, false, false, false); sound.play('shoot'); break;
            }
        }
        fireBlackHole(x, y, a, damage){
            const orb = new PlasmaBall(x, y, a, 4.5, damage);
            orb.radius = 14;
            orb.life = 95;
            orb.maxLife = 95;
            orb.gravityField = true;
            orb.skinBlackHole = true;
            orb.color = '#1b102f';
            orb.accent = '#b388ff';
            game.bulletManager.plasmas.push(orb);
        }
        canSpecial(player){ return !player.skinSkillTimer || player.skinSkillTimer <= 0; }
        useSpecial(player){
            const skin = this.equipped();
            if (!this.canSpecial(player)) {
                showNotif('Especial en recarga: ' + Math.ceil(player.skinSkillTimer / 60) + 's', 'error');
                return false;
            }
            player.skinSkillTimer = skin.cooldown || 600;
            player.skinSkillMax = player.skinSkillTimer;
            window.onSkillUsed?.();
            const x = player.x, y = player.y, a = player.angle;
            switch (skin.special) {
                case 'nuclear': areaDamage(x, y, 520, 120, '#ff334d'); break;
                case 'solar_flare': areaDamage(x + Math.cos(a)*160, y + Math.sin(a)*160, 360, 58, '#ff9f1c', {type:'burn', frames:220, damage:3, color:'#ff9f1c'}); break;
                case 'blue_star': this.dropStar(x, y); break;
                case 'gravity_burst': this.gravityBurst(x, y); break;
                case 'meteor_storm': this.meteorStorm(x, y); break;
                case 'plasma_nova': areaDamage(x, y, 360, 72, '#c56bff'); for(let i=0;i<12;i++) game.bulletManager.addPlasma(x,y,(i/12)*Math.PI*2,5,22); break;
                case 'electric_storm': for(let i=0;i<10;i++) setTimeout(()=>{ if(window.game) game.bulletManager.addTeslaArc(x+rand(-260,260), y+rand(-260,260), rand(0,Math.PI*2), 34); }, i*45); areaDamage(x,y,320,38,'#f8ff6a'); break;
                case 'laser_fan': for(let i=-4;i<=4;i++) game.bulletManager.addLaser(x,y,a+i*0.12,42,14); game.screenShake.shake(16); break;
                case 'void_pulse': areaDamage(x,y,430,64,'#5d2de1',{type:'slow',frames:180,damage:2,color:'#5d2de1'}); break;
                case 'crystal_bloom': for(let i=0;i<24;i++){ const b=new Bullet(x,y,(i/24)*Math.PI*2,12,24, i%2?'#9be7ff':'#ff9ff3', true,false,false); b.radius=5; game.bulletManager.bullets.push(b); } areaDamage(x,y,220,45,'#9be7ff'); break;
                case 'ice_storm': areaDamage(x,y,390,45,'#9be7ff',{type:'freeze',frames:240,damage:2,color:'#9be7ff'}); break;
                case 'poison_cloud': areaDamage(x,y,380,36,'#7ae582',{type:'poison',frames:300,damage:4,color:'#7ae582'}); break;
                default: player.useSupportSkill(); break;
            }
            showNotif('Especial: ' + skin.name, 'powerup');
            return true;
        }
        dropStar(x, y){
            const sx = clamp(x + rand(-180,180), 100, CONFIG.canvasWidth - 100);
            const sy = clamp(y + rand(-180,180), 100, CONFIG.canvasHeight - 100);
            for (let i=0;i<18;i++) game.particles.emit(sx, sy - 480 + i*24, 3, { colors:['#7df9ff','#ffffff'], speed:3, life:20, size:3, glow:true });
            setTimeout(()=>{ if(window.game) areaDamage(sx, sy, 1200, 240, '#7df9ff'); }, 360);
        }
        gravityBurst(x, y){
            for (const target of getTargetsInRadius(x, y, 900)) {
                const pull = angle(target.x, target.y, x, y);
                target.vx = (target.vx || 0) + Math.cos(pull) * 14;
                target.vy = (target.vy || 0) + Math.sin(pull) * 14;
            }
            areaDamage(x, y, 700, 135, '#b388ff');
        }
        meteorStorm(x, y){
            for (let i=0;i<16;i++) {
                setTimeout(()=>{
                    if(!window.game) return;
                    const tx = clamp(x + rand(-520,520), 60, CONFIG.canvasWidth - 60);
                    const ty = clamp(y + rand(-360,360), 60, CONFIG.canvasHeight - 60);
                    game.particles.emitExplosion(tx, ty, 1.2);
                    areaDamage(tx, ty, 120, 42, '#ff6b35');
                }, i * 80);
            }
        }
    }

    window.skinSystem = new AdvancedSkinSystem();

    const originalBulletUpdate = Bullet.prototype.update;
    Bullet.prototype.update = function(){
        originalBulletUpdate.call(this);
        if (this.poison && window.game) {
            if (game.frame % 7 === 0) game.particles.emit(this.x, this.y, 1, { colors:['#7ae582','#d8ff7a'], speed:1, life:12, size:2, glow:true });
            for (const enemy of game.enemyManager.enemies) {
                if (!enemy.dead && circleCollision(this, enemy)) applyStatus(enemy, 'poison', 180, 3, '#7ae582');
            }
        }
    };

    const originalBulletManagerUpdate = BulletManager.prototype.update;
    BulletManager.prototype.update = function(){
        originalBulletManagerUpdate.call(this);
        for (const b of this.bullets) {
            if (!b.poison) continue;
            for (const enemy of game.enemyManager.enemies) {
                if (!enemy.dead && circleCollision(b, enemy)) applyStatus(enemy, 'poison', 180, 3, '#7ae582');
            }
        }
    };

    const originalPlasmaUpdate = PlasmaBall.prototype.update;
    PlasmaBall.prototype.update = function(){
        originalPlasmaUpdate.call(this);
        if (this.skinBlackHole) {
            for (const target of getTargetsInRadius(this.x, this.y, 190)) {
                const a = angle(target.x, target.y, this.x, this.y);
                target.vx = (target.vx || 0) + Math.cos(a) * 0.35;
                target.vy = (target.vy || 0) + Math.sin(a) * 0.35;
                if (game.frame % 10 === 0) target.takeDamage(this.damage * 0.18);
            }
            if (this.life <= 1) areaDamage(this.x, this.y, 210, this.damage * 2.2, '#b388ff');
        }
    };

    const originalPlasmaDraw = PlasmaBall.prototype.draw;
    PlasmaBall.prototype.draw = function(ctx){
        if (!this.color) return originalPlasmaDraw.call(this, ctx);
        const alpha = Math.min(1, this.life / 30);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.accent || this.color;
        ctx.shadowBlur = 32;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.accent || '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(4, this.radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const originalPlayerUpdate = Player.prototype.update;
    Player.prototype.update = function(keys, mouse){
        if (this.skinSkillTimer > 0) this.skinSkillTimer--;
        originalPlayerUpdate.call(this, keys, mouse);
        if (mouse.right) {
            window.skinSystem.useSpecial(this);
            mouse.right = false;
        }
    };

    const originalPlayerShoot = Player.prototype.shoot;
    Player.prototype.shoot = function(bm){
        if (window.skinSystem && window.skinSystem.equipped().id !== DEFAULT_SKIN) {
            if (this.ammo <= 0 && !this.powerups.infinite) {
                this.reloading = true;
                this.reloadTimer = CONFIG.reloadTime;
                return;
            }
            const mult = (this.powerups.damage ? 2 : 1) * (this.powerups.massive ? 3 : 1);
            window.skinSystem.fire(this, bm, mult);
            return;
        }
        originalPlayerShoot.call(this, bm);
    };

    const originalPlayerDraw = Player.prototype.draw;
    Player.prototype.draw = function(ctx){
        originalPlayerDraw.call(this, ctx);
        const skin = window.skinSystem && window.skinSystem.equipped();
        if (!skin || skin.id === DEFAULT_SKIN) return;
        ctx.save();
        ctx.globalAlpha = 0.55 + Math.sin((this.animFrame || 0) * 0.08) * 0.15;
        ctx.strokeStyle = skin.accent;
        ctx.lineWidth = 3;
        ctx.shadowColor = skin.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    const originalSetupInput = Game.prototype.setupInput;
    Game.prototype.setupInput = function(){
        originalSetupInput.call(this);
        this.mouse.right = false;
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.canvas.addEventListener('mousedown', e => {
            if (e.button === 2) {
                e.preventDefault();
                this.mouse.down = false;
                this.mouse.right = true;
                sound.init();
            }
        });
        this.canvas.addEventListener('mouseup', e => {
            if (e.button === 2) this.mouse.right = false;
        });
    };

    const originalUpdateHUD = Game.prototype.updateHUD;
    Game.prototype.updateHUD = function(){
        originalUpdateHUD.call(this);
        if (!this.player || !window.skinSystem) return;
        const skin = window.skinSystem.equipped();
        const skillBar = document.getElementById('skillBar');
        const label = document.querySelector('#skillCooldown span');
        if (skin && skin.id !== DEFAULT_SKIN && skillBar) {
            const max = this.player.skinSkillMax || skin.cooldown || 600;
            const pct = 1 - ((this.player.skinSkillTimer || 0) / max);
            skillBar.style.width = (clamp(pct, 0, 1) * 100) + '%';
            skillBar.className = 'cooldownBar ' + (pct >= 1 ? 'ready' : 'cooldown');
            if (label) label.textContent = 'Especial (Click der)';
        }
    };

    function renderSkinShop(){
        const c = document.getElementById('shopContent');
        if (!c) return;
        c.innerHTML = '';
        c.classList.add('advanced-shop-grid');
        for (const skin of window.skinSystem.skins) {
            const unlocked = window.skinSystem.isUnlocked(skin.id);
            const equipped = window.skinSystem.state.equipped === skin.id;
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'shop-item skin-card' + (equipped ? ' equipped' : '') + (unlocked ? ' unlocked' : ' locked');
            card.style.setProperty('--skin-color', skin.color);
            card.style.setProperty('--skin-accent', skin.accent);
            const action = equipped ? 'Desequipar' : unlocked ? 'Equipar' : 'Comprar';
            const price = unlocked ? (equipped ? 'Equipada' : 'Desbloqueada') : skin.price + ' monedas';
            card.innerHTML = '<div class="item-preview skin-preview"></div>' +
                '<div class="item-name">' + skin.name + '</div>' +
                '<div class="item-desc">' + skin.desc + '</div>' +
                '<div class="skin-meta"><span>' + price + '</span><strong>' + action + '</strong></div>';
            card.addEventListener('click', () => {
                const result = equipped ? window.skinSystem.unequip() : unlocked ? window.skinSystem.equip(skin.id) : window.skinSystem.buy(skin.id);
                showNotif(result.message, result.ok ? 'success' : 'error');
                renderSkinShop();
                updGamUI();
            });
            c.appendChild(card);
        }
    }

    window.rendShop = function(tab){
        if (tab && tab !== 'skin') {
            const c = document.getElementById('shopContent');
            if (!c) return;
            c.innerHTML = '<div class="shop-empty">Contenido en preparacion. Las skins avanzadas ya estan disponibles.</div>';
            return;
        }
        renderSkinShop();
    };
    rendShop = window.rendShop;

    const originalOpenPanel = window.openPanel || openPanel;
    window.openPanel = function(id){
        originalOpenPanel(id);
        if (id === 'shopPanel') renderSkinShop();
    };
    openPanel = window.openPanel;

    const originalInitGamUI = initGamUI;
    initGamUI = function(){
        originalInitGamUI();
        const params = new URLSearchParams(window.location.search);
        const panel = params.get('panel');
        if (panel) {
            document.getElementById('gamificationUI')?.classList.remove('hidden');
            if (panel === 'shop') openPanel('shopPanel');
            if (panel === 'missions') openPanel('missionsPanel');
            if (panel === 'ranking') openPanel('rankingPanel');
            if (panel === 'battlepass') openPanel('battlePassPanel');
        }
    };
})();