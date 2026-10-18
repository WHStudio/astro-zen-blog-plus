export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Resolve after `element` finishes transitioning `propertyName`, or after a fallback. */
export function whenTransitionEnds(element: Element, propertyName: string, fallbackMs = 450) {
  if (prefersReducedMotion()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
      resolve();
    };
    const started = performance.now();
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== element || event.propertyName !== propertyName) return;
      // Ignore the transitionend from the animation this close just interrupted.
      if (performance.now() - started < 100) return;
      finish();
    };
    element.addEventListener('transitionend', onEnd);
    const timer = window.setTimeout(finish, fallbackMs);
  });
}
