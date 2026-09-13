import { DIM_HELP } from '../data/items';
import { cardFile, downloadCard, renderCard } from './card';
import { all, byId } from './dom';
import { easeOutCubic } from './geometry';
import { drawRadar } from './radar';
import { resultText, type Result } from './scoring';

export interface ResultOptions {
  reduce: boolean;
}

export interface ResultView {
  show(r: Result): void;
  /** Torna a portar la vista al resultat ja calculat, sense repetir res. */
  reveal(): void;
  hide(): void;
  onReset(handler: () => void): void;
}

const COUNT_MS = 1100;

/** La pantalla de resultat: percentatge, banda, radar, dimensions i accions. */
export function createResultView(opts: ResultOptions): ResultView {
  const section = byId<HTMLElement>('result');
  const pct = byId('pct');
  const band = byId('band');
  const bandText = byId('bandtext');
  const bandLabels = all<HTMLSpanElement>('#bandlabels span');
  const marker = byId<HTMLElement>('marker');
  const dims = byId('dims');
  const radar = byId<SVGSVGElement>('radar');
  const note = byId('note');
  const btnImage = byId<HTMLButtonElement>('btn-image');
  const btnShare = byId<HTMLButtonElement>('btn-share');
  const btnCopy = byId<HTMLButtonElement>('btn-copy');
  const btnPrint = byId<HTMLButtonElement>('btn-print');
  const btnReset = byId<HTMLButtonElement>('btn-reset');

  let last: Result | null = null;
  let resetHandler: () => void = () => {};
  let generation = 0;

  const later = (f: () => void): void => {
    if (opts.reduce) f();
    else window.setTimeout(f, 50);
  };

  function paintPct(v: number): void {
    pct.innerHTML = `${v}<small>%</small>`;
  }

  function countUp(to: number, mine: number): void {
    if (opts.reduce) {
      paintPct(to);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number): void => {
      if (mine !== generation) return;
      const k = Math.min(1, (now - t0) / COUNT_MS);
      paintPct(Math.round(to * easeOutCubic(k)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function renderDims(r: Result): void {
    const values = r.dims.map((d) => d.pct);
    const hi = Math.max(...values);
    const lo = Math.min(...values);
    dims.replaceChildren(
      ...r.dims.map((d, i) => {
        const row = document.createElement('div');
        row.className = 'dim';
        row.style.setProperty('--i', String(i));
        const tag =
          hi !== lo && d.pct === hi
            ? '<small>la més alta</small>'
            : hi !== lo && d.pct === lo
              ? '<small>la més baixa</small>'
              : '';
        row.innerHTML = `<span class="name">${d.dim}${tag}</span><span class="val">${d.pct} %</span><div class="bar"><i></i></div><span class="desc">${DIM_HELP[d.dim]}</span>`;
        return row;
      }),
    );
    later(() => {
      all<HTMLElement>('.bar i', dims).forEach((el, i) => {
        el.style.width = `${r.dims[i]!.pct}%`;
      });
    });
  }

  function scrollTo(el: HTMLElement): void {
    el.scrollIntoView({ behavior: opts.reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function show(r: Result): void {
    last = r;
    const mine = ++generation;
    section.classList.remove('hidden');
    section.classList.add('show');
    countUp(r.pct, mine);
    band.textContent = r.band.name;
    bandText.textContent = r.band.text;
    bandLabels.forEach((s, i) => s.classList.toggle('on', i === r.bandIndex));
    later(() => {
      marker.style.left = `${r.pct}%`;
    });
    renderDims(r);
    drawRadar(radar, r.dims, !opts.reduce);
    note.textContent = '';
    scrollTo(section);
    section.focus({ preventScroll: true });
  }

  function reveal(): void {
    if (!last) return;
    scrollTo(section);
    section.focus({ preventScroll: true });
  }

  function hide(): void {
    last = null;
    generation++;
    section.classList.add('hidden');
    section.classList.remove('show');
  }

  const describe = (e: unknown, fallback: string): string => (e instanceof Error && e.message ? e.message : fallback);
  const isCancelled = (e: unknown): boolean => e instanceof DOMException && e.name === 'AbortError';

  btnImage.addEventListener('click', async () => {
    if (!last) return;
    note.textContent = 'Preparant la imatge…';
    try {
      downloadCard(await renderCard(last));
      note.textContent = 'Imatge desada.';
    } catch (e) {
      note.textContent = describe(e, "No s'ha pogut desar la imatge.");
    }
  });

  const canShare = typeof navigator.share === 'function';
  btnShare.hidden = !canShare;
  btnShare.addEventListener('click', async () => {
    if (!last) return;
    const title = 'Com de narcisista ets?';
    const text = resultText(last);
    try {
      const file = cardFile(await renderCard(last));
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title, text });
      else await navigator.share({ title, text, url: 'https://maginer.com' });
    } catch (e) {
      if (isCancelled(e)) return;
      note.textContent = describe(e, "No s'ha pogut compartir.");
    }
  });

  btnCopy.addEventListener('click', async () => {
    if (!last) return;
    const text = resultText(last);
    try {
      await navigator.clipboard.writeText(text);
      note.textContent = 'Resultat copiat.';
    } catch {
      window.prompt('Copia el text:', text);
    }
  });

  btnPrint.addEventListener('click', () => window.print());

  btnReset.addEventListener('click', () => {
    hide();
    resetHandler();
    scrollTo(byId<HTMLElement>('test'));
  });

  return {
    show,
    reveal,
    hide,
    onReset(handler) {
      resetHandler = handler;
    },
  };
}
