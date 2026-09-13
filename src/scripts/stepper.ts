import { ITEMS, N_ITEMS } from '../data/items';
import { all, byId } from './dom';

export interface StepperOptions {
  /** Sense animacions ni esperes (moviment reduït o mode de demostració). */
  reduce: boolean;
  /** Es crida amb les 21 respostes quan totes són contestades i es demana el resultat. */
  onComplete: (answers: ReadonlyArray<number>) => void;
}

export interface Stepper {
  reset(): void;
  fill(answers: ReadonlyArray<number>): void;
}

const ADVANCE_DELAY_MS = 320;

/** Una pregunta per pantalla, amb teclat, punts de navegació i validació de les que falten. */
export function createStepper(opts: StepperOptions): Stepper {
  const stmt = byId<HTMLParagraphElement>('stmt');
  const scaleButtons = all<HTMLButtonElement>('#scale button');
  const prev = byId<HTMLButtonElement>('prev');
  const next = byId<HTMLButtonElement>('next');
  const dots = byId<HTMLDivElement>('dots');
  const pcount = byId('pcount');
  const pdone = byId('pdone');
  const pfill = byId('pfill');
  const alert = byId('alert');

  let answers: ReadonlyArray<number | null> = Array.from({ length: N_ITEMS }, () => null);
  let cur = 0;
  let advanceTimer: number | undefined;

  ITEMS.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Pregunta ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dots.appendChild(b);
  });
  const dotButtons = all<HTMLButtonElement>('button', dots);

  function render(direction: 'next' | 'prev' | 'none' = 'none'): void {
    const item = ITEMS[cur]!;
    stmt.textContent = item.text;
    stmt.classList.remove('enter-next', 'enter-prev');
    if (!opts.reduce && direction !== 'none') {
      void stmt.offsetWidth; // reinicia l'animació
      stmt.classList.add(direction === 'next' ? 'enter-next' : 'enter-prev');
    }
    const done = answers.filter((a) => a !== null).length;
    pcount.textContent = `Pregunta ${cur + 1} de ${N_ITEMS}`;
    pdone.textContent = done === 1 ? '1 resposta' : `${done} respostes`;
    pfill.style.width = `${(100 * done) / N_ITEMS}%`;
    scaleButtons.forEach((b) => b.setAttribute('aria-checked', String(answers[cur] === Number(b.dataset.v))));
    dotButtons.forEach((b, i) => {
      b.classList.toggle('done', answers[i] !== null);
      b.classList.toggle('cur', i === cur);
    });
    prev.disabled = cur === 0;
    const isLast = cur === N_ITEMS - 1;
    next.textContent = isLast ? 'Veure el resultat' : 'Següent';
    next.classList.toggle('primary', isLast);
  }

  function go(i: number): void {
    window.clearTimeout(advanceTimer);
    const target = Math.max(0, Math.min(N_ITEMS - 1, i));
    const direction = target > cur ? 'next' : target < cur ? 'prev' : 'none';
    cur = target;
    render(direction);
  }

  function answer(v: number): void {
    answers = answers.map((a, i) => (i === cur ? v : a));
    dotButtons[cur]?.classList.remove('miss');
    alert.textContent = '';
    render();
    if (cur < N_ITEMS - 1) {
      window.clearTimeout(advanceTimer);
      advanceTimer = window.setTimeout(() => go(cur + 1), opts.reduce ? 0 : ADVANCE_DELAY_MS);
    }
  }

  function finish(): void {
    const missing = answers.map((a, i) => (a === null ? i : -1)).filter((i) => i >= 0);
    if (missing.length > 0) {
      missing.forEach((i) => dotButtons[i]?.classList.add('miss'));
      alert.textContent =
        missing.length === 1
          ? 'Et falta una pregunta per respondre.'
          : `Et falten ${missing.length} preguntes per respondre.`;
      go(missing[0]!);
      return;
    }
    opts.onComplete(answers as ReadonlyArray<number>);
  }

  function onNext(): void {
    if (cur < N_ITEMS - 1) go(cur + 1);
    else finish();
  }

  scaleButtons.forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.v))));
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', onNext);
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement | null;
    if (target?.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key >= '1' && e.key <= '5') {
      answer(Number(e.key));
      e.preventDefault();
    } else if (e.key === 'ArrowRight') go(cur + 1);
    else if (e.key === 'ArrowLeft') go(cur - 1);
    else if (e.key === 'Enter' && document.activeElement?.closest('#test')) onNext();
  });

  render();

  return {
    reset() {
      answers = Array.from({ length: N_ITEMS }, () => null);
      cur = 0;
      dotButtons.forEach((b) => b.classList.remove('miss'));
      alert.textContent = '';
      render();
    },
    fill(values) {
      answers = values.slice(0, N_ITEMS);
      cur = N_ITEMS - 1;
      render();
    },
  };
}
