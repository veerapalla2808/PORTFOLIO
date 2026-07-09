'use client';
// A faint, discipline-specific texture behind the whole page, under the
// particle field. Dark = an observability panel (ghosted log stream +
// sparkline). Light = a design canvas (baseline grid + guides).
import { useMemo } from 'react';

const LOG_LINES = [
  'GET /inventory/38122 200 12ms',
  'kafka: inv.updated ack offset=90233',
  'cache HIT pricing:sku:44120 redis',
  'POST /fulfillment/orders 201 41ms',
  'circuit=CLOSED feign:catalog',
  'deploy canary 5% → 25% healthy',
  'GET /inventory/70051 200 9ms',
  'kafka: order.placed ack offset=90234',
  'p95=180ms rps=2984 err=0.01%',
  'redis evict lru keys=128',
  'bedrock.invoke stream done 1.2s',
  'helm upgrade fulfillment rev=214',
];

export default function ThemeBackdrop({ theme }: { theme: 'light' | 'dark' }) {
  // sparkline path, generated once (deterministic — no Math.random in render)
  const spark = useMemo(() => {
    const pts = Array.from({ length: 40 }, (_, i) => {
      const v = 0.5 + Math.sin(i * 0.5) * 0.28 + Math.sin(i * 1.7) * 0.12;
      return `${(i / 39) * 100},${(1 - v) * 40}`;
    });
    return `M0,40 L${pts.join(' L')} L100,40 Z`;
  }, []);

  if (theme === 'dark') {
    return (
      <div className="backdrop backdrop--obs" aria-hidden="true">
        <div className="obs-log">
          <div className="obs-log-track">
            {[...LOG_LINES, ...LOG_LINES].map((l, i) => (
              <span key={i}>{String(i % LOG_LINES.length).padStart(2, '0')}:{l}</span>
            ))}
          </div>
        </div>
        <svg className="obs-spark" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d={spark} />
        </svg>
      </div>
    );
  }

  return <div className="backdrop backdrop--grid" aria-hidden="true" />;
}
