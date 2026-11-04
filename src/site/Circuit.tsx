import { useEffect, useRef } from 'react';

// The hero's circuit board: traces at 45° angles with signals running along them.
// Pure SVG and CSS, paused when off screen or when the visitor prefers less motion.
const TRACES = [
  'M40 120 H240 L300 180 H460 L520 120 H700',
  'M80 300 H200 L260 240 H420 L480 300 H620 L680 240 H780',
  'M0 420 H160 L220 480 H380 L440 420 H560',
  'M300 40 V100 L360 160 V260 L300 320 V420',
  'M620 40 V140 L560 200 V340 L620 400 V520',
  'M760 80 H700 L640 140 V220 L700 280 H800',
  'M120 520 H260 L320 460 H500 L560 520 H760',
  'M460 0 V60 L520 120 V180',
  'M20 200 H120 L180 260 V360 L120 420 H40',
];
const PADS = [[40, 120], [700, 120], [80, 300], [780, 240], [0, 420], [560, 420], [300, 40], [300, 420], [620, 40], [620, 520], [800, 280], [120, 520], [760, 520], [460, 0], [520, 180], [20, 200], [40, 420]];
const CHIPS = [[330, 200, 120, 80], [560, 300, 90, 70], [180, 330, 70, 50]];

export default function Circuit() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('paused', !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} className="circuit" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="traces">{TRACES.map((d, i) => <path key={i} d={d} pathLength={1000} />)}</g>
      <g className="chips">{CHIPS.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}</g>
      <g className="pads">{PADS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} />)}</g>
      <g className="signals">{TRACES.map((d, i) => <path key={i} d={d} pathLength={1000} style={{ animationDuration: `${5 + (i % 4) * 1.4}s`, animationDelay: `${-i * 0.9}s` }} />)}</g>
    </svg>
  );
}
