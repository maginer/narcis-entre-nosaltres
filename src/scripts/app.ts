import { DEMO_ANSWERS } from '../data/items';
import { createResultView } from './result';
import { score } from './scoring';
import { createStepper } from './stepper';
import { submitResult } from './submit';

// `?demo=1` omple el test amb un patró d'exemple i treu les animacions:
// serveix per a les captures del treball i per ensenyar-lo a la defensa.
const DEMO = new URLSearchParams(location.search).get('demo') === '1';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches || DEMO;
if (REDUCE) document.documentElement.classList.add('no-anim');

const result = createResultView({ reduce: REDUCE });
let lastKey = '';

function complete(answers: ReadonlyArray<number>): void {
  // Mateixes respostes que l'últim cop: només tornem al resultat, sense repetir càlcul ni animacions.
  const key = answers.join(',');
  if (key === lastKey) {
    result.reveal();
    return;
  }
  lastKey = key;
  result.show(score(answers));
  const consent = document.getElementById('consent') as HTMLInputElement | null;
  if (!DEMO && consent?.checked) {
    void submitResult(answers).then((ok) =>
      result.setNote(
        ok ? "Resultat afegit a l'estudi de manera anònima." : "No s'ha pogut afegir el resultat a l'estudi.",
      ),
    );
  }
}

const stepper = createStepper({ reduce: REDUCE, onComplete: complete });
result.onReset(() => {
  lastKey = '';
  stepper.reset();
  stepper.focus();
});

if (DEMO) {
  stepper.fill(DEMO_ANSWERS);
  complete(DEMO_ANSWERS);
}
