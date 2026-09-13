import { DEMO_ANSWERS } from '../data/items';
import { createResultView } from './result';
import { score } from './scoring';
import { createStepper } from './stepper';

// `?demo=1` omple el test amb un patró d'exemple i treu les animacions:
// serveix per a les captures del treball i per ensenyar-lo a la defensa.
const DEMO = new URLSearchParams(location.search).get('demo') === '1';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches || DEMO;
if (REDUCE) document.documentElement.classList.add('no-anim');

const result = createResultView({ reduce: REDUCE });
const stepper = createStepper({
  reduce: REDUCE,
  onComplete: (answers) => result.show(score(answers)),
});
result.onReset(() => stepper.reset());

if (DEMO) {
  stepper.fill(DEMO_ANSWERS);
  result.show(score(DEMO_ANSWERS));
}
