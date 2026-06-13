// Lightweight Web Audio engine note + tyre-scrub, driven by ride state.
export class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  osc!: OscillatorNode; osc2!: OscillatorNode;
  engineGain!: GainNode; lp!: BiquadFilterNode;
  noise!: AudioBufferSourceNode; noiseGain!: GainNode; bp!: BiquadFilterNode;
  ready = false;

  init() {
    if (this.ready) return;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
    // engine
    this.lp = ctx.createBiquadFilter(); this.lp.type = "lowpass"; this.lp.frequency.value = 900;
    this.engineGain = ctx.createGain(); this.engineGain.gain.value = 0.0001;
    this.osc = ctx.createOscillator(); this.osc.type = "sawtooth"; this.osc.frequency.value = 60;
    this.osc2 = ctx.createOscillator(); this.osc2.type = "square"; this.osc2.frequency.value = 60; this.osc2.detune.value = -8;
    const og2 = ctx.createGain(); og2.gain.value = 0.4;
    this.osc.connect(this.lp); this.osc2.connect(og2); og2.connect(this.lp);
    this.lp.connect(this.engineGain); this.engineGain.connect(this.master);
    this.osc.start(); this.osc2.start();
    // tyre scrub noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = ctx.createBufferSource(); this.noise.buffer = buf; this.noise.loop = true;
    this.bp = ctx.createBiquadFilter(); this.bp.type = "bandpass"; this.bp.frequency.value = 1800; this.bp.Q.value = 0.8;
    this.noiseGain = ctx.createGain(); this.noiseGain.gain.value = 0.0001;
    this.noise.connect(this.bp); this.bp.connect(this.noiseGain); this.noiseGain.connect(this.master);
    this.noise.start();
    this.ready = true;
  }

  setEnabled(on: boolean) {
    if (on) { this.init(); this.ctx?.resume(); if (this.ctx) this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 0.05); }
    else if (this.ctx) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }

  update(rpm: number, throttle: number, sliding: boolean, slip: number, moving: boolean) {
    if (!this.ready || !this.ctx) return;
    const t = this.ctx.currentTime;
    const f = 42 + (rpm / 11000) * 210;
    this.osc.frequency.setTargetAtTime(f, t, 0.04);
    this.osc2.frequency.setTargetAtTime(f, t, 0.04);
    this.lp.frequency.setTargetAtTime(500 + throttle * 1600 + (rpm / 11000) * 1200, t, 0.05);
    const idle = moving ? 0.05 : 0.03;
    this.engineGain.gain.setTargetAtTime(idle + throttle * 0.13, t, 0.05);
    this.noiseGain.gain.setTargetAtTime(sliding ? Math.min(0.22, 0.06 + slip * 0.18) : 0.0001, t, 0.05);
  }
}
