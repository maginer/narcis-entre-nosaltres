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
  /** Porta el focus a la pregunta actual (després de reiniciar). */
  focus(): void;
}

const ADVANCE_DELAY_MS = 320;

type Direction = 'next' | 'prev' | 'none';

/** Una pregunta per pantalla, amb teclat, punts de navegació i validació de les que falten. */
export function createStepper(opts: StepperOptions): Stepper {
  const stmt = byId<HTMLParagraphElement>('stmt');
  const scaleButtons = all<HTMLButtonElement>('#scale button');
  const prev = byId<HTMLButtonElement>('prev');
  const next = byId<HTMLButtonElement>('next');
  const dots = byId<HTMLDivElement>('dots');
  const pcount = byId('pcount');
  const pdone = byId('pdone');
  const pfill = byId<HTMLElement>('pfill');
  const topfill = byId<HTMLElement>('topfill');
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

  function render(direction: Direction = 'none'): void {
    const item = ITEMS[cur]!;
    stmt.textContent = item.text;
    stmt.classList.remove('enter-next', 'enter-prev');
    if (!opts.reduce && direction !== 'none') {
      void stmt.offsetWidth; // reinicia l'animació
      stmt.classList.add(direction === 'next' ? 'enter-next' : 'enter-prev');
    }
    const done = answers.filter((a) => a !== null).length;
    const pct = `${(100 * done) / N_ITEMS}%`;
    pcount.textContent = `Pregunta ${cur + 1} de ${N_ITEMS}`;
    pdone.textContent = done === 1 ? '1 resposta' : `${done} respostes`;
    pfill.style.width = pct;
    topfill.style.width = pct;
    // Grup de ràdio amb focus itinerant: només l'opció triada (o la primera) entra amb Tab.
    const checked = answers[cur];
    scaleButtons.forEach((b, i) => {
      const isChecked = checked === Number(b.dataset.v);
      b.setAttribute('aria-checked', String(isChecked));
      b.tabIndex = isChecked || (checked === null && i === 0) ? 0 : -1;
    });
    dotButtons.forEach((b, i) => {
      b.classList.toggle('done', answers[i] !== null);
      b.classList.toggle('cur', i === cur);
      if (i === cur) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    prev.disabled = cur === 0;
    const isLast = cur === N_ITEMS - 1;
    next.textContent = isLast ? 'Veure el resultat' : 'Següent';
    next.classList.toggle('primary', isLast);
  }

  function go(i: number): void {
    window.clearTimeout(advanceTimer);
    const target = Math.max(0, Math.min(N_ITEMS - 1, i));
    const direction: Direction = target > cur ? 'next' : target < cur ? 'prev' : 'none';
    cur = target;
    render(direction);
  }

  /** Registra la resposta; amb `advance`, passa sola a la pregunta següent al cap d'un moment. */
  function answer(v: number, advance: boolean): void {
    answers = answers.map((a, i) => (i === cur ? v : a));
    dotButtons[cur]?.classList.remove('miss');
    alert.textContent = '';
    render();
    const picked = scaleButtons.find((b) => Number(b.dataset.v) === v);
    if (picked && !opts.reduce) {
      picked.classList.remove('picked');
      void picked.offsetWidth;
      picked.classList.add('picked');
    }
    if (advance && cur < N_ITEMS - 1) {
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

  /** Fletxes dins del grup de ràdio: mouen el focus i trien l'opció, sense avançar de pregunta. */
  function moveWithinScale(from: HTMLButtonElement, delta: number): void {
    const i = scaleButtons.indexOf(from);
    const target = scaleButtons[(i + delta + scaleButtons.length) % scaleButtons.length]!;
    answer(Number(target.dataset.v), false);
    target.focus();
  }

  scaleButtons.forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.v), true)));
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', onNext);
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target || target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const inScale = target instanceof HTMLButtonElement && scaleButtons.includes(target);
    if (e.key >= '1' && e.key <= '5') {
      answer(Number(e.key), true);
      e.preventDefault();
    } else if (inScale && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
      moveWithinScale(target, 1);
      e.preventDefault();
    } else if (inScale && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
      moveWithinScale(target, -1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') go(cur + 1);
    else if (e.key === 'ArrowLeft') go(cur - 1);
    else if (e.key === 'Enter' && target.closest('#test')) {
      onNext();
      e.preventDefault();
    }
  });

  render();

  return {
    reset() {
      window.clearTimeout(advanceTimer);
      answers = Array.from({ length: N_ITEMS }, () => null);
      cur = 0;
      dotButtons.forEach((b) => b.classList.remove('miss'));
      alert.textContent = '';
      render();
    },
    fill(values) {
      if (values.length !== N_ITEMS || values.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) {
        throw new Error(`Calen ${N_ITEMS} respostes d'1 a 5.`);
      }
      answers = [...values];
      cur = N_ITEMS - 1;
      render();
    },
    focus() {
      scaleButtons.find((b) => b.tabIndex === 0)?.focus();
    },
  };
}
