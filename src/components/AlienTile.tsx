import React from 'react';
import { motion } from 'motion/react';

/** 외계인 얼굴 (외계인이 천체를 숨긴 타일에 그려진다) */
export const AlienFace: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="8 2 84 92" className={className} style={{ overflow: 'visible', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))' }}>
    <defs>
      <radialGradient id="alienHead" cx="40%" cy="30%" r="75%">
        <stop offset="0" stopColor="#ecfccb" />
        <stop offset="0.55" stopColor="#84cc16" />
        <stop offset="1" stopColor="#3f6212" />
      </radialGradient>
      <radialGradient id="alienEye" cx="35%" cy="30%" r="70%">
        <stop offset="0" stopColor="#334155" />
        <stop offset="1" stopColor="#020617" />
      </radialGradient>
    </defs>
    <line x1="38" y1="20" x2="30" y2="6" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
    <circle cx="30" cy="6" r="4.5" fill="#fde047" />
    <line x1="62" y1="20" x2="70" y2="6" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
    <circle cx="70" cy="6" r="4.5" fill="#fde047" />
    <path
      d="M50 16 C 76 16 90 36 86 56 C 82 76 64 92 50 92 C 36 92 18 76 14 56 C 10 36 24 16 50 16 Z"
      fill="url(#alienHead)"
      stroke="#365314"
      strokeWidth="2"
    />
    <ellipse cx="34" cy="52" rx="13" ry="17" transform="rotate(-28 34 52)" fill="url(#alienEye)" />
    <ellipse cx="66" cy="52" rx="13" ry="17" transform="rotate(28 66 52)" fill="url(#alienEye)" />
    <ellipse cx="30" cy="45" rx="4" ry="5.5" fill="#fff" opacity="0.9" />
    <ellipse cx="62" cy="45" rx="4" ry="5.5" fill="#fff" opacity="0.9" />
    <path d="M42 77 Q50 82 58 77" stroke="#365314" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <ellipse cx="38" cy="26" rx="10" ry="4" fill="#fff" opacity="0.35" />
  </svg>
);

/** 외계인 타일을 눌렀을 때: 외계인이 빙글 돌며 위로 날아가 사라진다 */
export const AlienFlyAway: React.FC<{ id: number; x: number; y: number }> = ({ id, x, y }) => (
  <div className="fixed inset-0 pointer-events-none z-[95]">
    <motion.div
      key={id}
      initial={{ x: x - 24, y: y - 24, scale: 1, rotate: 0, opacity: 1 }}
      animate={{ x: x - 24 + 60, y: y - 24 - 220, scale: 0.4, rotate: 300, opacity: 0 }}
      transition={{ duration: 0.85, ease: [0.3, 0, 0.7, 1] }}
      className="absolute left-0 top-0 w-12 h-12"
    >
      <AlienFace className="w-12 h-12" />
    </motion.div>
  </div>
);
