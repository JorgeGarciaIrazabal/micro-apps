import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

/* ═══════════════════════════════════════════════════════════════
   GAME DATA — 12 eggs, clues, rooms, emoji passcodes
   ═══════════════════════════════════════════════════════════════ */

const EMOJI_POOL = [
  '🐰','🥕','🌸','🌈','🦋','🐣','🌷','🍫','⭐',
  '🎀','🐝','🌻','🍓','🦄','💜','🐞','🎈','🌺',
];

const EGGS = [
  {
    id: 1,
    room: 'pbed',
    roomLabel: 'Mom & Dad\'s Room',
    clue: 'Look in the dark hamper!',
    icons: ['basket','clothes'],
    passcode: ['🐰','🥕','🌸'],
    hint: 'The laundry hamper by the dresser',
  },
  {
    id: 2,
    room: 'pbed',
    roomLabel: 'Mom & Dad\'s Room',
    clue: 'Under the makeup table chair!',
    icons: ['chair','table'],
    passcode: ['🌈','🦋','🐣'],
    hint: 'The stool at the vanity',
  },
  {
    id: 3,
    room: 'pcloset',
    roomLabel: 'Big Closet',
    clue: 'On the bottom shelf!',
    icons: ['shelf','clothes'],
    passcode: ['🌷','🍫','⭐'],
    hint: 'Bottom wire shelf in the walk-in closet',
  },
  {
    id: 4,
    room: 'cbed',
    roomLabel: 'Clara\'s Room',
    clue: 'Behind your blue globe!',
    icons: ['globe','desk'],
    passcode: ['🎀','🐝','🌻'],
    hint: 'Behind the globe on your desk',
  },
  {
    id: 5,
    room: 'cbed',
    roomLabel: 'Clara\'s Room',
    clue: 'Check the grey couch cushions!',
    icons: ['couch','door'],
    passcode: ['🍓','🦄','💜'],
    hint: 'The small sofa near the slider',
  },
  {
    id: 6,
    room: 'cbath',
    roomLabel: 'Clara\'s Bathroom',
    clue: 'Under the unicorn bunny picture!',
    icons: ['unicorn','wall'],
    passcode: ['🐞','🎈','🌺'],
    hint: 'Under the unicorn bunny picture',
  },
  {
    id: 7,
    room: 'hall',
    roomLabel: 'Hallway',
    clue: 'In the black sports bag!',
    icons: ['bag','pocket'],
    passcode: ['🐰','🌸','⭐'],
    hint: 'The pickleball bag in the hallway',
  },
  {
    id: 8,
    room: 'living',
    roomLabel: 'Living Room',
    clue: 'On the piano keys!',
    icons: ['piano','music'],
    passcode: ['🦋','🍫','🎀'],
    hint: 'On the piano keys',
  },
  {
    id: 9,
    room: 'living',
    roomLabel: 'Living Room',
    clue: 'Behind the big plant!',
    icons: ['plant','tv'],
    passcode: ['🌈','🐣','🌻'],
    hint: 'Behind the olive tree near the TV',
  },
  {
    id: 10,
    room: 'kitchen',
    roomLabel: 'Kitchen',
    clue: 'Under the pink step stool!',
    icons: ['step','trash'],
    passcode: ['🌷','🦄','🐞'],
    hint: 'Under the pink step stool',
  },
  {
    id: 11,
    room: 'pantry',
    roomLabel: 'Kitchen Pantry',
    clue: 'On the bottom pantry shelf!',
    icons: ['door','shelf'],
    passcode: ['🥕','💜','🎈'],
    hint: 'Bottom shelf of the pantry',
  },
  {
    id: 12,
    room: 'office',
    roomLabel: 'Office',
    clue: 'In the cat tree cubby!',
    icons: ['cat','tree'],
    passcode: ['🐰','🍓','🌺'],
    hint: 'In the cat tree cubby',
  },
];

/* ═══════════════════════════════════════════════════════════════
   SOUND ENGINE — Web Audio API
   ═══════════════════════════════════════════════════════════════ */

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playNote(freq, duration, delay = 0, type = 'sine', vol = 0.3) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function playSuccessChime() {
  playNote(523, 0.15, 0, 'sine', 0.25);
  playNote(659, 0.15, 0.12, 'sine', 0.25);
  playNote(784, 0.15, 0.24, 'sine', 0.25);
  playNote(1047, 0.3, 0.36, 'sine', 0.3);
}

function playEmojiTap(slotIndex = 0) {
  const pitches = [660, 784, 988];
  playNote(pitches[slotIndex] || 880, 0.1, 0, 'sine', 0.18);
}

function playWrongBuzz() {
  playNote(200, 0.15, 0, 'sawtooth', 0.12);
  playNote(180, 0.15, 0.1, 'sawtooth', 0.12);
}

function playFanfare() {
  const notes = [523,659,784,1047,784,1047,1319,1047,1319,1568];
  notes.forEach((f, i) => {
    playNote(f, 0.25, i * 0.15, 'sine', 0.2);
    playNote(f * 0.5, 0.25, i * 0.15, 'triangle', 0.1);
  });
  // add some sparkle
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      playNote(1200 + Math.random() * 1500, 0.15, i * 0.1, 'sine', 0.08);
    }
  }, 1500);
}

function playStartJingle() {
  playNote(392, 0.2, 0, 'sine', 0.2);
  playNote(523, 0.2, 0.15, 'sine', 0.2);
  playNote(659, 0.3, 0.3, 'sine', 0.25);
}

function playScreenTransition() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
}

function playMapOpen() {
  playNote(440, 0.08, 0, 'sine', 0.1);
  playNote(554, 0.08, 0.06, 'sine', 0.1);
}

function playMapClose() {
  playNote(554, 0.08, 0, 'sine', 0.1);
  playNote(440, 0.08, 0.06, 'sine', 0.1);
}

function playEggFoundCelebration() {
  playNote(523, 0.15, 0, 'sine', 0.2);
  playNote(659, 0.15, 0.1, 'sine', 0.2);
  playNote(784, 0.2, 0.2, 'triangle', 0.25);
  for (let i = 0; i < 4; i++) {
    playNote(1000 + Math.random() * 800, 0.1, 0.3 + i * 0.08, 'sine', 0.06);
  }
}

function playMilestone() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    playNote(f, 0.2, i * 0.1, 'sine', 0.15);
    playNote(f * 1.5, 0.15, i * 0.1 + 0.05, 'triangle', 0.05);
  });
}

function playButtonPress() {
  playNote(600, 0.04, 0, 'square', 0.05);
}

function haptic(style = 'light') {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 25 : 50);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS — little helper drawings for clue words
   ═══════════════════════════════════════════════════════════════ */

const ICONS = {
  basket: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="6" y="18" width="28" height="18" rx="4" fill="#8B7355" stroke="#5C4033" strokeWidth="2"/>
      <path d="M8 18 Q20 6 32 18" fill="none" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="12" y2="32" stroke="#5C4033" strokeWidth="1.5"/>
      <line x1="20" y1="22" x2="20" y2="32" stroke="#5C4033" strokeWidth="1.5"/>
      <line x1="28" y1="22" x2="28" y2="32" stroke="#5C4033" strokeWidth="1.5"/>
    </svg>
  ),
  clothes: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="10" y="14" width="20" height="20" rx="2" fill="#B19CD9" stroke="#7B68AE" strokeWidth="2"/>
      <rect x="12" y="16" width="16" height="5" rx="1" fill="#D8BFD8"/>
      <rect x="12" y="23" width="16" height="5" rx="1" fill="#C4A7D7"/>
      <rect x="12" y="30" width="16" height="3" rx="1" fill="#D8BFD8"/>
      <path d="M14 8 L20 12 L26 8" fill="none" stroke="#7B68AE" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  chair: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="10" y="20" width="20" height="5" rx="2" fill="#DEB887" stroke="#8B7355" strokeWidth="1.5"/>
      <line x1="12" y1="25" x2="12" y2="36" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="25" x2="28" y2="36" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="25" x2="16" y2="36" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="25" x2="24" y2="36" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  table: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="5" y="16" width="30" height="4" rx="2" fill="#DEB887" stroke="#8B7355" strokeWidth="1.5"/>
      <line x1="9" y1="20" x2="9" y2="36" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="31" y1="20" x2="31" y2="36" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="15" cy="10" r="3" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1"/>
      <circle cx="25" cy="11" r="2.5" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1"/>
    </svg>
  ),
  shelf: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="6" y="8" width="28" height="3" rx="1" fill="#8B7355"/>
      <rect x="6" y="18" width="28" height="3" rx="1" fill="#8B7355"/>
      <rect x="6" y="28" width="28" height="3" rx="1" fill="#8B7355"/>
      <line x1="8" y1="8" x2="8" y2="36" stroke="#5C4033" strokeWidth="2"/>
      <line x1="32" y1="8" x2="32" y2="36" stroke="#5C4033" strokeWidth="2"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <circle cx="20" cy="18" r="12" fill="#87CEEB" stroke="#4682B4" strokeWidth="2"/>
      <ellipse cx="20" cy="18" rx="5" ry="12" fill="none" stroke="#4682B4" strokeWidth="1.2"/>
      <line x1="8" y1="18" x2="32" y2="18" stroke="#4682B4" strokeWidth="1.2"/>
      <path d="M10 12 Q20 10 30 12" fill="none" stroke="#228B22" strokeWidth="2"/>
      <path d="M12 22 Q20 20 28 22" fill="none" stroke="#228B22" strokeWidth="2"/>
      <line x1="20" y1="30" x2="20" y2="36" stroke="#8B7355" strokeWidth="2.5"/>
      <line x1="14" y1="36" x2="26" y2="36" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  desk: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="4" y="16" width="32" height="4" rx="1" fill="#F5F5DC" stroke="#8B7355" strokeWidth="1.5"/>
      <line x1="8" y1="20" x2="8" y2="36" stroke="#8B7355" strokeWidth="2.5"/>
      <line x1="32" y1="20" x2="32" y2="36" stroke="#8B7355" strokeWidth="2.5"/>
      <rect x="22" y="20" width="8" height="8" rx="1" fill="#F5F5DC" stroke="#8B7355" strokeWidth="1.5"/>
    </svg>
  ),
  couch: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="4" y="18" width="32" height="14" rx="4" fill="#B0B0B0" stroke="#808080" strokeWidth="2"/>
      <rect x="8" y="14" width="24" height="8" rx="3" fill="#C8C8C8" stroke="#808080" strokeWidth="1.5"/>
      <rect x="4" y="32" width="6" height="4" rx="1" fill="#808080"/>
      <rect x="30" y="32" width="6" height="4" rx="1" fill="#808080"/>
    </svg>
  ),
  door: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="10" y="4" width="20" height="32" rx="2" fill="#DEB887" stroke="#8B7355" strokeWidth="2"/>
      <circle cx="25" cy="22" r="2" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
      <rect x="14" y="8" width="12" height="8" rx="1" fill="#F5DEB3" stroke="#8B7355" strokeWidth="1"/>
    </svg>
  ),
  unicorn: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <circle cx="20" cy="22" r="10" fill="white" stroke="#DDA0DD" strokeWidth="2"/>
      <path d="M20 12 L18 4 L22 4 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
      <circle cx="16" cy="20" r="1.5" fill="#333"/>
      <path d="M14 26 Q20 30 26 26" fill="none" stroke="#FF69B4" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 18 Q34 16 32 22" fill="none" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 16 Q6 12 8 18" fill="none" stroke="#DDA0DD" strokeWidth="1.5"/>
    </svg>
  ),
  wall: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="4" y="4" width="32" height="32" rx="2" fill="#F0E6D2" stroke="#C4A777" strokeWidth="2"/>
      <line x1="4" y1="14" x2="36" y2="14" stroke="#C4A777" strokeWidth="1.5"/>
      <line x1="4" y1="24" x2="36" y2="24" stroke="#C4A777" strokeWidth="1.5"/>
      <line x1="20" y1="4" x2="20" y2="14" stroke="#C4A777" strokeWidth="1.5"/>
      <line x1="12" y1="14" x2="12" y2="24" stroke="#C4A777" strokeWidth="1.5"/>
      <line x1="28" y1="14" x2="28" y2="24" stroke="#C4A777" strokeWidth="1.5"/>
      <line x1="20" y1="24" x2="20" y2="36" stroke="#C4A777" strokeWidth="1.5"/>
    </svg>
  ),
  bag: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="8" y="14" width="24" height="22" rx="3" fill="#333" stroke="#111" strokeWidth="2"/>
      <path d="M14 14 L14 8 Q20 4 26 8 L26 14" fill="none" stroke="#555" strokeWidth="2.5"/>
      <rect x="28" y="18" width="4" height="14" rx="1" fill="#555" stroke="#333" strokeWidth="1"/>
    </svg>
  ),
  pocket: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <path d="M10 12 L10 34 Q20 38 30 34 L30 12 Z" fill="#555" stroke="#333" strokeWidth="2"/>
      <path d="M10 12 Q20 18 30 12" fill="none" stroke="#777" strokeWidth="2"/>
      <circle cx="20" cy="24" r="3" fill="#FFD700"/>
    </svg>
  ),
  piano: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="4" y="10" width="32" height="24" rx="2" fill="#222" stroke="#000" strokeWidth="2"/>
      <rect x="6" y="12" width="4" height="18" rx="1" fill="white"/>
      <rect x="11" y="12" width="4" height="18" rx="1" fill="white"/>
      <rect x="16" y="12" width="4" height="18" rx="1" fill="white"/>
      <rect x="21" y="12" width="4" height="18" rx="1" fill="white"/>
      <rect x="26" y="12" width="4" height="18" rx="1" fill="white"/>
      <rect x="31" y="12" width="4" height="18" rx="1" fill="white"/>
      <rect x="9" y="12" width="3" height="11" rx="1" fill="#333"/>
      <rect x="14" y="12" width="3" height="11" rx="1" fill="#333"/>
      <rect x="24" y="12" width="3" height="11" rx="1" fill="#333"/>
      <rect x="29" y="12" width="3" height="11" rx="1" fill="#333"/>
    </svg>
  ),
  music: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <circle cx="12" cy="30" r="5" fill="#FF69B4" stroke="#FF1493" strokeWidth="1.5"/>
      <circle cx="28" cy="26" r="5" fill="#FF69B4" stroke="#FF1493" strokeWidth="1.5"/>
      <line x1="17" y1="30" x2="17" y2="8" stroke="#333" strokeWidth="2.5"/>
      <line x1="33" y1="26" x2="33" y2="6" stroke="#333" strokeWidth="2.5"/>
      <line x1="17" y1="8" x2="33" y2="6" stroke="#333" strokeWidth="2.5"/>
    </svg>
  ),
  plant: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="14" y="28" width="12" height="10" rx="2" fill="#8B4513" stroke="#5C3317" strokeWidth="1.5"/>
      <line x1="20" y1="28" x2="20" y2="12" stroke="#228B22" strokeWidth="2.5"/>
      <circle cx="14" cy="12" r="5" fill="#32CD32" opacity="0.8"/>
      <circle cx="26" cy="10" r="5" fill="#32CD32" opacity="0.8"/>
      <circle cx="20" cy="6" r="5" fill="#228B22" opacity="0.9"/>
      <circle cx="10" cy="18" r="4" fill="#32CD32" opacity="0.7"/>
      <circle cx="30" cy="16" r="4" fill="#32CD32" opacity="0.7"/>
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="4" y="8" width="32" height="20" rx="2" fill="#333" stroke="#111" strokeWidth="2"/>
      <rect x="6" y="10" width="28" height="16" rx="1" fill="#4FC3F7"/>
      <rect x="16" y="28" width="8" height="3" fill="#555"/>
      <rect x="12" y="31" width="16" height="2" rx="1" fill="#555"/>
    </svg>
  ),
  step: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="6" y="24" width="28" height="12" rx="3" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="2"/>
      <rect x="8" y="26" width="24" height="3" rx="1" fill="#FFC0CB"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="10" y="12" width="20" height="24" rx="2" fill="#444" stroke="#222" strokeWidth="2"/>
      <rect x="8" y="8" width="24" height="4" rx="2" fill="#555" stroke="#333" strokeWidth="1.5"/>
      <line x1="16" y1="16" x2="16" y2="32" stroke="#666" strokeWidth="1.5"/>
      <line x1="20" y1="16" x2="20" y2="32" stroke="#666" strokeWidth="1.5"/>
      <line x1="24" y1="16" x2="24" y2="32" stroke="#666" strokeWidth="1.5"/>
    </svg>
  ),
  cat: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <ellipse cx="20" cy="24" rx="10" ry="12" fill="#F5DEB3" stroke="#DEB887" strokeWidth="2"/>
      <polygon points="12,14 8,4 16,12" fill="#F5DEB3" stroke="#DEB887" strokeWidth="1.5"/>
      <polygon points="28,14 32,4 24,12" fill="#F5DEB3" stroke="#DEB887" strokeWidth="1.5"/>
      <circle cx="16" cy="20" r="2" fill="#333"/>
      <circle cx="24" cy="20" r="2" fill="#333"/>
      <ellipse cx="20" cy="24" rx="2" ry="1.5" fill="#FFB6C1"/>
      <path d="M18 26 Q20 28 22 26" fill="none" stroke="#DEB887" strokeWidth="1.5"/>
      <line x1="6" y1="22" x2="14" y2="23" stroke="#DEB887" strokeWidth="1"/>
      <line x1="6" y1="25" x2="14" y2="25" stroke="#DEB887" strokeWidth="1"/>
      <line x1="26" y1="23" x2="34" y2="22" stroke="#DEB887" strokeWidth="1"/>
      <line x1="26" y1="25" x2="34" y2="25" stroke="#DEB887" strokeWidth="1"/>
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 40 40" width="36" height="36">
      <rect x="16" y="24" width="8" height="12" rx="1" fill="#8B7355" stroke="#5C4033" strokeWidth="1.5"/>
      <polygon points="20,2 6,18 34,18" fill="#228B22" stroke="#006400" strokeWidth="1.5"/>
      <polygon points="20,8 8,22 32,22" fill="#32CD32" stroke="#228B22" strokeWidth="1.5"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   HOUSE MAP COMPONENT — simplified SVG floor plan
   ═══════════════════════════════════════════════════════════════ */

const ROOMS = [
  // Top — hall spans width
  { id: 'hall',    name: 'Hall',               x: 40,  y: 40,  w: 440, h: 40,  fill: '#f8fafc' },
  // Bedrooms
  { id: 'pbed',   name: 'Mom & Dad\'s\nRoom', x: 40,  y: 80,  w: 220, h: 150, fill: '#f3e8ff' },
  { id: 'cbed',   name: 'Clara\'s\nRoom',     x: 260, y: 80,  w: 220, h: 150, fill: '#fce7f3' },
  // Closet & baths (closet in M&D area, next to bath)
  { id: 'pcloset', name: 'Big\nCloset',       x: 40,  y: 230, w: 70,  h: 60,  fill: '#f1f5f9' },
  { id: 'pbath',  name: 'Bath',               x: 110, y: 230, w: 150, h: 60,  fill: '#e0f2fe' },
  { id: 'cbath',  name: 'Clara\'s\nBath',     x: 260, y: 230, w: 220, h: 60,  fill: '#e0f2fe' },
  // Kitchen & living area
  { id: 'kitchen', name: 'Kitchen',           x: 40,  y: 290, w: 220, h: 140, fill: '#fef3c7' },
  { id: 'pantry',  name: 'Pantry',            x: 40,  y: 380, w: 40,  h: 50,  fill: '#f1f5f9' },
  { id: 'living',  name: 'Living\nRoom',      x: 260, y: 290, w: 220, h: 240, fill: '#fae8ff' },
  // Dining (below kitchen)
  { id: 'dining',  name: 'Dining',            x: 40,  y: 430, w: 220, h: 100, fill: '#ffedd5' },
  // Office at bottom, touches living room
  { id: 'office',  name: 'Office',            x: 120, y: 530, w: 360, h: 80,  fill: '#ecfccb' },
];

function HouseMap({ activeRoom, foundRooms }) {
  return (
    <svg viewBox="20 20 480 610" style={{ width: '100%', maxWidth: 420, height: 'auto', borderRadius: 16, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}>
      <rect x="20" y="20" width="480" height="610" rx="12" fill="white" opacity="0.5"/>
      {ROOMS.map((room) => {
        const isActive = room.id === activeRoom;
        const isFound = foundRooms.includes(room.id);
        let fillColor = room.fill;
        if (isActive) fillColor = '#FDE68A';
        else if (isFound) fillColor = '#BBF7D0';

        return (
          <g key={room.id}>
            <rect
              className="room-rect"
              x={room.x} y={room.y} width={room.w} height={room.h}
              fill={fillColor}
              stroke={isActive ? '#F59E0B' : '#94a3b8'}
              strokeWidth={isActive ? 4 : 2}
              rx={4}
            />
            {isActive && (
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4}
                rx={4}
                opacity={0.6}
              >
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
              </rect>
            )}
            {room.name.split('\n').map((line, i, arr) => (
              <text
                key={i}
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 + (i - (arr.length - 1) / 2) * 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={room.w < 60 ? 8 : 11}
                fontFamily="Nunito, sans-serif"
                fontWeight="700"
                fill={isActive ? '#92400E' : '#475569'}
              >
                {line}
              </text>
            ))}
            {isActive && (
              <text
                x={room.x + room.w / 2}
                y={room.y - 6}
                textAnchor="middle"
                fontSize="18"
              >
                🥚
              </text>
            )}
            {isFound && !isActive && (
              <text
                x={room.x + room.w - 8}
                y={room.y + 14}
                textAnchor="middle"
                fontSize="12"
              >
                ✅
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFETTI / CELEBRATION
   ═══════════════════════════════════════════════════════════════ */

function Confetti({ count = 60 }) {
  const pieces = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      color: ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF85B3','#C780FA','#45CFDD','#FF9F45'][i % 8],
      size: 8 + Math.random() * 12,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }))
  ).current;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-5%',
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.6 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Fireworks() {
  const bursts = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 60,
      delay: Math.random() * 4,
      duration: 1.2 + Math.random() * 0.8,
      color: ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF85B3','#C780FA'][i % 6],
      size: 40 + Math.random() * 60,
    }))
  ).current;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
      {bursts.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            border: `3px solid ${b.color}`,
            animation: `fireworkBurst ${b.duration}s ease-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING PARTICLES — ambient background emojis
   ═══════════════════════════════════════════════════════════════ */

const PARTICLE_EMOJIS = ['✨','🌸','⭐','💫','🦋'];

function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 12 + Math.random() * 10,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 12,
      emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
    }))
  ).current;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: '-5%',
          fontSize: p.size,
          animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DECORATIVE EGGS — background floating eggs
   ═══════════════════════════════════════════════════════════════ */

function EggSVG({ color1 = '#FFB6C1', color2 = '#FF69B4', pattern = 'dots', size = 50 }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={size * 1.33}>
      <defs>
        <linearGradient id={`eg-${color1}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color1}/>
          <stop offset="100%" stopColor={color2}/>
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="42" rx="24" ry="32" fill={`url(#eg-${color1})`} stroke={color2} strokeWidth="2"/>
      {pattern === 'dots' && (
        <>
          <circle cx="20" cy="35" r="3" fill="white" opacity="0.5"/>
          <circle cx="35" cy="30" r="2.5" fill="white" opacity="0.5"/>
          <circle cx="28" cy="50" r="3" fill="white" opacity="0.4"/>
          <circle cx="38" cy="45" r="2" fill="white" opacity="0.5"/>
        </>
      )}
      {pattern === 'stripes' && (
        <>
          <path d="M10 35 Q30 30 50 35" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5"/>
          <path d="M12 45 Q30 40 48 45" fill="none" stroke="white" strokeWidth="2.5" opacity="0.4"/>
          <path d="M15 55 Q30 50 45 55" fill="none" stroke="white" strokeWidth="2" opacity="0.3"/>
        </>
      )}
      {pattern === 'zigzag' && (
        <path d="M12 38 L18 32 L24 38 L30 32 L36 38 L42 32 L48 38" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5"/>
      )}
      {/* Shine highlight */}
      <ellipse cx="22" cy="28" rx="6" ry="8" fill="white" opacity="0.2" transform="rotate(-20 22 28)"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */

export default function App() {
  const [screen, setScreen] = useState('start'); // start | clue | passcode | success | finale
  const [currentEgg, setCurrentEgg] = useState(0);
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [foundRooms, setFoundRooms] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [screenPhase, setScreenPhase] = useState('visible'); // visible | fading-out | fading-in

  const egg = EGGS[currentEgg];

  const transitionTo = useCallback((newScreen, preTransition) => {
    playScreenTransition();
    setScreenPhase('fading-out');
    setTimeout(() => {
      if (preTransition) preTransition();
      setScreen(newScreen);
      setScreenPhase('fading-in');
      setTimeout(() => setScreenPhase('visible'), 220);
    }, 200);
  }, []);

  const transitionStyle = {
    opacity: screenPhase === 'fading-out' ? 0 : 1,
    transform: screenPhase === 'fading-out' ? 'scale(0.96)' : 'scale(1)',
    transition: 'opacity 200ms ease, transform 200ms ease',
  };

  // Build a shuffled emoji grid for the current egg (always includes the 3 correct ones + 6 random)
  const [emojiGrid, setEmojiGrid] = useState([]);
  useEffect(() => {
    if (!egg) return;
    const correct = egg.passcode;
    const others = EMOJI_POOL.filter(e => !correct.includes(e));
    // pick 6 random others
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 6);
    const grid = [...correct, ...shuffled].sort(() => Math.random() - 0.5);
    setEmojiGrid(grid);
    setSelectedEmojis([]);
    setWrongAttempt(false);
  }, [currentEgg]);

  const handleStart = useCallback(() => {
    playStartJingle();
    haptic('medium');
    transitionTo('clue');
  }, [transitionTo]);

  const handleShowPasscode = useCallback(() => {
    playButtonPress();
    haptic('light');
    transitionTo('passcode');
  }, [transitionTo]);

  const handleEmojiTap = useCallback((emoji) => {
    setSelectedEmojis(prev => {
      if (prev.length >= 3) return prev;
      playEmojiTap(prev.length);
      haptic('light');
      return [...prev, emoji];
    });
  }, []);

  const handleClearEmojis = useCallback(() => {
    setSelectedEmojis([]);
    setWrongAttempt(false);
  }, []);

  const handleCheckPasscode = useCallback(() => {
    const correct = egg.passcode;
    if (
      selectedEmojis.length === 3 &&
      selectedEmojis[0] === correct[0] &&
      selectedEmojis[1] === correct[1] &&
      selectedEmojis[2] === correct[2]
    ) {
      playSuccessChime();
      haptic('medium');
      setFoundRooms(prev => [...prev, egg.room]);
      if (currentEgg === EGGS.length - 1) {
        transitionTo('finale');
        setTimeout(() => playFanfare(), 500);
      } else {
        playEggFoundCelebration();
        const isMilestone = currentEgg === 5 || currentEgg === 9;
        if (isMilestone) setTimeout(() => playMilestone(), 400);
        transitionTo('success');
      }
    } else {
      playWrongBuzz();
      haptic('heavy');
      setWrongAttempt(true);
      setTimeout(() => {
        setSelectedEmojis([]);
        setWrongAttempt(false);
      }, 1200);
    }
  }, [selectedEmojis, egg, currentEgg, transitionTo]);

  const handleNextEgg = useCallback(() => {
    transitionTo('clue', () => {
      setCurrentEgg(prev => prev + 1);
      setShowMap(false);
    });
  }, [transitionTo]);

  const handleMapToggle = useCallback(() => {
    if (showMap) playMapClose(); else playMapOpen();
    setShowMap(prev => !prev);
  }, [showMap]);

  /* ── START SCREEN ── */
  if (screen === 'start') {
    return (
      <div style={{ ...styles.container, ...transitionStyle }}>
        <FloatingParticles/>
        <div style={styles.startCard}>
          <div className="bounce-egg" style={{ fontSize: 80, marginBottom: 8 }}>🥚</div>
          <h1 style={styles.title}>Clara&apos;s Easter Egg Hunt!</h1>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
            <EggSVG color1="#FFB6C1" color2="#FF69B4" pattern="dots" size={38}/>
            <EggSVG color1="#B19CD9" color2="#7B68AE" pattern="stripes" size={38}/>
            <EggSVG color1="#87CEEB" color2="#4682B4" pattern="zigzag" size={38}/>
            <EggSVG color1="#98FB98" color2="#3CB371" pattern="dots" size={38}/>
            <EggSVG color1="#FFD700" color2="#DAA520" pattern="stripes" size={38}/>
          </div>
          <p style={styles.subtitle}>
            Find <strong>12 hidden eggs</strong> around the house!
          </p>
          <p style={{ ...styles.subtitle, fontSize: 16, color: '#9CA3AF' }}>
            Read each clue, find the egg, then enter the secret emoji code!
          </p>
          <button style={styles.bigButton} onClick={handleStart} className="pulse btn-big">
            🐰 Start the Hunt! 🐰
          </button>
        </div>
        {/* Floating decorative eggs */}
        <div style={{ position: 'fixed', top: '10%', left: '5%', opacity: 0.2 }} className="float">
          <EggSVG color1="#FFB6C1" color2="#FF69B4" size={60}/>
        </div>
        <div style={{ position: 'fixed', top: '20%', right: '8%', opacity: 0.15, animationDelay: '1s' }} className="float">
          <EggSVG color1="#B19CD9" color2="#7B68AE" pattern="stripes" size={50}/>
        </div>
        <div style={{ position: 'fixed', bottom: '15%', left: '10%', opacity: 0.15, animationDelay: '0.5s' }} className="float">
          <EggSVG color1="#87CEEB" color2="#4682B4" pattern="zigzag" size={45}/>
        </div>
      </div>
    );
  }

  /* ── CLUE SCREEN ── */
  if (screen === 'clue') {
    return (
      <div style={{ ...styles.container, ...transitionStyle }}>
        <FloatingParticles/>
        <div style={styles.card} className="pop-in">
          {/* Progress */}
          <div className="stagger-1">
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(currentEgg / EGGS.length) * 100}%` }}/>
            </div>
            <p style={styles.progressText}>Egg {currentEgg + 1} of {EGGS.length}</p>
          </div>

          {/* Room label */}
          <div className="stagger-2" style={styles.roomBadge}>
            📍 Go to: <strong>{egg.roomLabel}</strong>
          </div>

          {/* Map toggle */}
          <button style={styles.mapToggle} onClick={handleMapToggle} className="btn-map stagger-2">
            {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>

          <div style={{
            maxHeight: showMap ? 500 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.4s ease, opacity 0.3s ease',
            opacity: showMap ? 1 : 0,
            margin: showMap ? '8px 0' : '0',
          }}>
            <HouseMap activeRoom={egg.room} foundRooms={foundRooms}/>
          </div>

          {/* Clue */}
          <div style={styles.clueBox} className="stagger-3">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {egg.icons.map((iconName, i) => (
                <div key={i} style={styles.iconBubble} className="pop-in">
                  {ICONS[iconName]}
                </div>
              ))}
            </div>
            <p style={styles.clueText}>{egg.clue}</p>
          </div>

          {/* Bouncing egg */}
          <div className="bounce-egg stagger-4" style={{ fontSize: 56, textAlign: 'center', margin: '8px 0' }}>
            🥚
          </div>

          <div className="stagger-5">
            <button style={styles.bigButton} onClick={handleShowPasscode} className="btn-big">
              ✅ I Found It!
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PASSCODE SCREEN ── */
  if (screen === 'passcode') {
    return (
      <div style={{ ...styles.container, ...transitionStyle }}>
        <FloatingParticles/>
        <div style={styles.card} className={`slide-up ${wrongAttempt ? 'shake' : ''}`}>
          <h2 style={styles.heading}>Enter the Secret Code!</h2>
          <p style={styles.subtitle}>
            Look at the paper next to the egg.<br/>
            Tap the 3 emojis in order!
          </p>

          {/* Selected emojis display */}
          <div style={styles.passcodeDisplay}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  ...styles.passcodeSlot,
                  borderColor: wrongAttempt ? '#EF4444' : (selectedEmojis[i] ? '#10B981' : '#D1D5DB'),
                  backgroundColor: wrongAttempt ? '#FEE2E2' : (selectedEmojis[i] ? '#D1FAE5' : '#F9FAFB'),
                }}
                className={`${wrongAttempt ? 'wiggle' : ''} ${selectedEmojis.length === 3 && !wrongAttempt ? 'slot-glow' : ''}`}
              >
                <span
                  style={{ fontSize: 36 }}
                  className={selectedEmojis[i] ? 'slot-filled' : ''}
                >
                  {selectedEmojis[i] || '?'}
                </span>
              </div>
            ))}
          </div>

          {wrongAttempt && (
            <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 18, textAlign: 'center', margin: '4px 0' }}>
              Oops! Try again! 🙈
            </p>
          )}

          {/* Emoji grid */}
          <div style={styles.emojiGrid}>
            {emojiGrid.map((emoji, i) => (
              <button
                key={i}
                style={{
                  ...styles.emojiBtn,
                  opacity: selectedEmojis.length >= 3 ? 0.5 : 1,
                }}
                className={`emoji-btn ${selectedEmojis.includes(emoji) && selectedEmojis.length < 3 ? 'emoji-btn--selected' : ''}`}
                onClick={() => handleEmojiTap(emoji)}
                disabled={selectedEmojis.length >= 3}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={styles.secondaryButton} onClick={handleClearEmojis} className="btn-secondary">
              🔄 Clear
            </button>
            <button
              style={{
                ...styles.bigButton,
                opacity: selectedEmojis.length === 3 ? 1 : 0.5,
                flex: 1,
                maxWidth: 220,
              }}
              className="btn-big"
              onClick={handleCheckPasscode}
              disabled={selectedEmojis.length < 3}
            >
              🔓 Check!
            </button>
            <button style={styles.secondaryButton} onClick={() => transitionTo('clue')} className="btn-secondary">
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SUCCESS SCREEN (between eggs) ── */
  if (screen === 'success') {
    const isMilestone = currentEgg === 5 || currentEgg === 9;
    const milestoneMsg = currentEgg === 5 ? 'Halfway there! Keep going!' : currentEgg === 9 ? 'Almost done! Just 2 more!' : null;
    const celebrationEmojis = ['🎉','⭐','✨','🌟','💫','🎊'];

    return (
      <div style={{ ...styles.container, ...transitionStyle }}>
        <Confetti count={isMilestone ? 60 : 50}/>
        {/* Floating celebration emojis */}
        {celebrationEmojis.map((em, i) => (
          <div key={i} style={{
            position: 'fixed',
            left: `${15 + i * 14}%`,
            top: '50%',
            fontSize: 28 + Math.random() * 12,
            animation: `floatUp 1.5s ease-out ${i * 0.15}s both`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}>{em}</div>
        ))}
        <div style={styles.card} className="pop-in">
          <div style={{ fontSize: 72, textAlign: 'center' }} className="bounce-text">🎉</div>
          <h2 style={{ ...styles.heading, color: '#10B981' }} className="bounce-text">
            You Found Egg #{currentEgg + 1}!
          </h2>
          {milestoneMsg && (
            <p style={{
              fontSize: 20,
              fontWeight: 800,
              textAlign: 'center',
              margin: '4px 0',
              background: 'linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'rainbowBg 2s linear infinite',
            }}>{milestoneMsg}</p>
          )}
          <p style={styles.subtitle}>
            Great job! {EGGS.length - currentEgg - 1} more egg{EGGS.length - currentEgg - 1 !== 1 ? 's' : ''} to go!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '8px 0', flexWrap: 'wrap' }}>
            {EGGS.map((_, i) => (
              <span key={i} style={{
                fontSize: 24,
                opacity: i <= currentEgg ? 1 : 0.25,
                animation: i <= currentEgg ? `popIn 0.3s ease-out ${i * 0.05}s both` : 'none',
                display: 'inline-block',
              }}>
                {i <= currentEgg ? '🥚' : '⬜'}
              </span>
            ))}
          </div>
          <button style={styles.bigButton} onClick={handleNextEgg} className="pulse btn-big">
            🔍 Next Clue! →
          </button>
        </div>
      </div>
    );
  }

  /* ── FINALE SCREEN ── */
  if (screen === 'finale') {
    return (
      <div style={{ ...styles.container, ...transitionStyle, background: 'linear-gradient(135deg, #fdf2f8, #ede9fe, #e0f2fe, #ecfccb)', backgroundSize: '400% 400%', animation: 'rainbowBg 4s ease infinite' }}>
        <Confetti count={100}/>
        <Fireworks/>
        <div style={{ ...styles.card, maxWidth: 500, textAlign: 'center', zIndex: 10000, position: 'relative' }} className="pop-in">
          <div style={{ fontSize: 64 }}>🏆</div>
          <h1 style={{
            fontSize: 42,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF85B3)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'rainbowBg 2s linear infinite',
            margin: '8px 0',
            lineHeight: 1.2,
          }}>
            HAPPY EASTER,<br/>CLARA!
          </h1>
          <p style={{ fontSize: 22, color: '#6B7280', fontWeight: 700, margin: '8px 0' }}>
            You found ALL 12 eggs! 🥚🥚🥚
          </p>
          <div style={{ fontSize: 48, margin: '12px 0' }}>
            🐰🌸🎀🦋🌈⭐
          </div>
          <p style={{ fontSize: 20, color: '#9CA3AF', fontWeight: 600 }}>
            You are an amazing egg hunter!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '12px 0', flexWrap: 'wrap' }}>
            {EGGS.map((_, i) => (
              <span key={i} style={{ fontSize: 28 }}>🥚</span>
            ))}
          </div>

          {/* Stars */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              fontSize: 20 + Math.random() * 16,
              animation: `sparkle ${1 + Math.random()}s ease-in-out ${Math.random() * 2}s infinite`,
              pointerEvents: 'none',
            }}>⭐</div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   STYLES — inline for single-file friendliness
   ═══════════════════════════════════════════════════════════════ */

const styles = {
  container: {
    minHeight: '100vh',
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  startCard: {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    borderRadius: 28,
    padding: '32px 24px',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderRadius: 24,
    padding: '20px 18px',
    maxWidth: 440,
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    color: '#7C3AED',
    marginBottom: 4,
    lineHeight: 1.2,
  },
  heading: {
    fontSize: 26,
    fontWeight: 900,
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  bigButton: {
    display: 'block',
    width: '100%',
    maxWidth: 320,
    margin: '16px auto 0',
    padding: '18px 24px',
    fontSize: 22,
    fontWeight: 900,
    fontFamily: "'Nunito', 'Comic Sans MS', 'Chalkboard SE', system-ui, sans-serif",
    color: 'white',
    background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
    touchAction: 'manipulation',
  },
  secondaryButton: {
    padding: '14px 18px',
    fontSize: 17,
    fontWeight: 700,
    fontFamily: "'Nunito', 'Comic Sans MS', 'Chalkboard SE', system-ui, sans-serif",
    color: '#7C3AED',
    background: '#EDE9FE',
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
    touchAction: 'manipulation',
  },
  progressBar: {
    width: '100%',
    height: 10,
    background: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #A78BFA 0%, #C4B5FD 40%, #E9D5FF 50%, #C4B5FD 60%, #7C3AED 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s linear infinite',
    borderRadius: 5,
    transition: 'width 0.5s ease',
    boxShadow: '0 0 8px rgba(124,58,237,0.4)',
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 8,
  },
  roomBadge: {
    display: 'inline-block',
    background: '#FEF3C7',
    color: '#92400E',
    padding: '8px 16px',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  mapToggle: {
    display: 'block',
    margin: '0 auto 8px',
    padding: '8px 16px',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Nunito', 'Comic Sans MS', 'Chalkboard SE', system-ui, sans-serif",
    color: '#6B7280',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    touchAction: 'manipulation',
  },
  clueBox: {
    background: 'linear-gradient(135deg, #FDF2F8, #EDE9FE)',
    borderRadius: 18,
    padding: '16px 14px',
    marginBottom: 8,
    border: '2px dashed #D8B4FE',
  },
  clueText: {
    fontSize: 22,
    fontWeight: 700,
    color: '#4C1D95',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  iconBubble: {
    background: 'white',
    borderRadius: 14,
    padding: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passcodeDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    margin: '16px 0',
  },
  passcodeSlot: {
    width: 72,
    height: 72,
    borderRadius: 16,
    border: '3px solid #D1D5DB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    maxWidth: 300,
    margin: '12px auto 16px',
  },
  emojiBtn: {
    width: '100%',
    aspectRatio: '1',
    fontSize: 36,
    background: 'white',
    border: '2px solid #E5E7EB',
    borderRadius: 16,
    cursor: 'pointer',
    touchAction: 'manipulation',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.15s ease',
    fontFamily: 'inherit',
  },
};
