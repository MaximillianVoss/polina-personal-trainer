import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

export function Dialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector<HTMLElement>('input, select') ?? ref.current?.querySelector<HTMLElement>('button');
    first?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busyRef.current) closeRef.current();
      if (event.key !== 'Tab') return;
      const fields = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]') ?? [])];
      const first = fields[0];
      const last = fields[fields.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = scroll; previous?.focus(); };
  }, []);

  return <div className="dialog-backdrop" onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
      <div className="dialog-heading"><div><p className="eyebrow">PERSONAL TRAINER</p><h2 id={titleId}>{title}</h2></div><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Закрыть окно">×</button></div>
      {children}
    </div>
  </div>;
}
