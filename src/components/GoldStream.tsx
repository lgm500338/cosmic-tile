import React, { useMemo } from 'react';
import { motion } from 'motion/react';

/**
 * 3개를 맞췄을 때: 맞춘 자리에서 수도꼭지를 튼 것처럼 황금이 굵은 한 줄기로 와르르 쏟아진다.
 * 화면 전체를 덮지 않도록 폭은 좁게, 길이는 화면 절반 정도, 1초 남짓.
 */
interface GoldStreamProps {
  id: number;
  x: number; // 줄기가 시작되는 화면 좌표 (px)
  y: number;
  comboCount: number;
  label?: string; // 'GREAT!' 등 작은 콤보 문구
}

export const GoldStream: React.FC<GoldStreamProps> = ({ id, x, y, comboCount, label }) => {
  const fall = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.5, 420) : 380;
  // 콤보가 높을수록 줄기가 조금 더 굵고 풍성해진다
  const count = Math.min(46, 26 + comboCount * 5);
  const width = Math.min(46, 26 + comboCount * 4);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const kind = i % 5 === 0 ? 'spark' : 'coin';
        return {
          i,
          kind,
          dx: (Math.random() - 0.5) * width,
          drift: (Math.random() - 0.5) * 14,
          size: kind === 'coin' ? 11 + Math.random() * 7 : 6 + Math.random() * 4,
          delay: (i / count) * 0.45 + Math.random() * 0.05,
          dur: 0.75 + Math.random() * 0.25,
          spin: (Math.random() - 0.5) * 540,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden select-none">
      {/* 줄기 뒤의 은은한 금빛 기둥 */}
      <motion.div
        key={`glow-${id}`}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: [0, 0.75, 0], scaleY: [0, 1, 1] }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="absolute rounded-full blur-md"
        style={{
          left: x - width / 2,
          top: y,
          width,
          height: fall,
          transformOrigin: 'top',
          background: 'linear-gradient(to bottom, rgba(253,224,71,0.85), rgba(251,191,36,0.35) 60%, rgba(251,191,36,0))',
        }}
      />

      {/* 쏟아지는 금화와 반짝이 */}
      {pieces.map(p => (
        <motion.div
          key={`${id}-${p.i}`}
          initial={{ x: x + p.dx * 0.3, y, opacity: 1, rotate: 0 }}
          animate={{ x: x + p.dx + p.drift, y: y + fall, opacity: [1, 1, 0], rotate: p.spin }}
          transition={{ duration: p.dur, delay: p.delay, ease: [0.45, 0, 0.9, 0.6] }}
          className="absolute"
          style={{ left: -p.size / 2, top: 0, width: p.size, height: p.size }}
        >
          {p.kind === 'coin' ? (
            <div
              className="w-full h-full rounded-full border border-yellow-100"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #fffbe6 0%, #fde047 30%, #f59e0b 70%, #b45309 100%)',
                boxShadow: '0 0 8px rgba(251,191,36,0.9)',
              }}
            />
          ) : (
            <div
              className="w-full h-full rotate-45"
              style={{ background: '#fffbe6', boxShadow: '0 0 10px 2px rgba(255,236,150,0.95)' }}
            />
          )}
        </motion.div>
      ))}

      {/* 작은 콤보 문구 (맞춘 자리 바로 아래) */}
      {label && (
        <motion.div
          key={`label-${id}`}
          initial={{ opacity: 0, y: y + 4, scale: 0.6 }}
          animate={{ opacity: [0, 1, 1, 0], y: y + 14, scale: [0.6, 1.1, 1, 1] }}
          transition={{ duration: 1.2, times: [0, 0.2, 0.75, 1] }}
          className="absolute -translate-x-1/2 whitespace-nowrap font-black italic text-lg"
          style={{
            left: x,
            top: 0,
            color: '#fde047',
            WebkitTextStroke: '1.5px #78350f',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {label}
          {comboCount > 1 && <span className="ml-1 text-sm text-amber-200">x{comboCount}</span>}
        </motion.div>
      )}
    </div>
  );
};
