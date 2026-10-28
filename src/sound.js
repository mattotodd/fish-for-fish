// All sounds are made on the fly with the browser's Web Audio API. No sound files.
let ctx = null;
let muted = false;
let musicTimer = null;

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// One beep. `slide` glides the pitch to another note while it plays.
function tone(freq, dur, type = "square", vol = 0.08, slide = 0, delay = 0) {
  if (muted) return;
  const a = audio();
  const t = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.linearRampToValueAtTime(slide, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function noise(dur, vol = 0.1) {
  if (muted) return;
  const a = audio();
  const buffer = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const gain = a.createGain();
  gain.gain.value = vol;
  src.buffer = buffer;
  src.connect(gain).connect(a.destination);
  src.start();
}

export const sfx = {
  charge: (power) => tone(200 + power * 500, 0.06, "triangle", 0.04),
  cast: () => tone(700, 0.25, "sine", 0.08, 200),
  splash: () => noise(0.35, 0.12),
  bite: () => {
    tone(880, 0.1, "square", 0.08);
    tone(880, 0.1, "square", 0.08, 0, 0.14);
  },
  reel: () => tone(300, 0.04, "square", 0.03),
  snap: () => {
    noise(0.15, 0.15);
    tone(400, 0.3, "sawtooth", 0.08, 80);
  },
  miss: () => tone(300, 0.3, "triangle", 0.08, 150),
  catch: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, "square", 0.07, 0, i * 0.1)),
  legendary: () => {
    [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, "square", 0.08, 0, i * 0.14));
    [262, 330, 392, 523].forEach((f, i) => tone(f, 0.5, "triangle", 0.07, 0, 1.2 + i * 0.1));
  },
  bloop: () => {
    tone(190, 1.6, "sine", 0.14, 35);
    tone(95, 1.9, "sine", 0.12, 28, 0.15);
  },
  junk: () => tone(200, 0.4, "sawtooth", 0.06, 100),
  coin: () => {
    tone(988, 0.08, "square", 0.06);
    tone(1319, 0.2, "square", 0.06, 0, 0.08);
  },
  eat: () => {
    tone(420, 0.07, "square", 0.05);
    tone(360, 0.07, "square", 0.05, 0, 0.1);
    tone(520, 0.12, "triangle", 0.06, 0, 0.22);
  },
  select: () => tone(600, 0.05, "square", 0.05),
  no: () => tone(150, 0.2, "square", 0.07),
};

// A little chiptune loop.
const MELODY = [0, 4, 7, 4, 9, 7, 4, 2, 0, 4, 7, 12, 9, 7, 4, null];
const BASS = [-12, -12, -17, -17];
const hz = (semi) => 261.63 * 2 ** (semi / 12);

export function startMusic() {
  if (musicTimer) return;
  audio();
  let step = 0;
  musicTimer = setInterval(() => {
    const note = MELODY[step % MELODY.length];
    if (note !== null) tone(hz(note), 0.25, "triangle", 0.05);
    if (step % 4 === 0) tone(hz(BASS[(step / 4) % BASS.length]), 0.5, "square", 0.025);
    step++;
  }, 280);
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
