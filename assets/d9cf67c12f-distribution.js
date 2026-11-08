import {assemblyTransform, placementForScroll} from '/grow-create-preview/assets/26928ce17e-distribution-math.mjs';

const sequence = document.querySelector('[data-design-distribution]');
if (sequence) {
  const source = sequence.querySelector('.assembly-drawing');
  const rows = [...sequence.querySelectorAll('[data-distribution-part]')];
  const parts = rows.map(row => ({
    slot: row.querySelector('.distribution-art-slot'),
    visual: row.querySelector('.distribution-part-visual'),
    svg: row.querySelector('.distribution-drawing'),
    animation: null,
    origin: '',
  }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const still = new URLSearchParams(location.search).has('still');
  const duration = 720;
  let placed = false;
  let enabled = false;
  let frame = 0;
  let resetPending = false;

  function cssTransform(value) {
    return `translate(${value.x}px, ${value.y}px) scale(${value.scale})`;
  }

  function updateOrigins() {
    const sourceRect = source.getBoundingClientRect();
    if (!sourceRect.width) return false;
    for (const part of parts) {
      const target = part.slot.getBoundingClientRect();
      if (!target.width) return false;
      part.origin = cssTransform(assemblyTransform(sourceRect, source.viewBox.baseVal,
                                                 target, part.svg.viewBox.baseVal));
    }
    return true;
  }

  function stop(part) {
    if (part.animation) {
      part.animation.onfinish = null;
      part.animation.cancel();
      part.animation = null;
    }
    part.visual.style.willChange = '';
  }

  function place(next, animate) {
    const from = parts.map(part => getComputedStyle(part.visual).transform);
    const startedAt = document.timeline.currentTime;
    placed = next;
    sequence.dataset.distributionState = placed ? 'placed' : 'assembled';
    parts.forEach((part, index) => {
      stop(part);
      const to = placed ? 'none' : part.origin;
      part.visual.style.transform = to;
      if (!animate) return;
      part.visual.style.willChange = 'transform';
      const animation = part.visual.animate([{transform: from[index]}, {transform: to}], {
        duration, easing: 'cubic-bezier(.22,.72,.25,1)', fill: 'both',
      });
      if (Number.isFinite(startedAt)) animation.startTime = startedAt;
      part.animation = animation;
      animation.onfinish = () => {
        if (part.animation === animation) stop(part);
      };
    });
  }

  function intendedPlacement() {
    return placementForScroll(rows[0].getBoundingClientRect().top, innerHeight, placed);
  }

  function reset() {
    enabled = !still && !reduced.matches && typeof Element.prototype.animate === 'function';
    parts.forEach(stop);
    sequence.dataset.motion = enabled ? 'animate' : 'still';
    if (!enabled || !updateOrigins()) {
      enabled = false;
      sequence.dataset.motion = 'still';
      place(true, false);
      return;
    }
    place(intendedPlacement(), false);
  }

  function paint() {
    frame = 0;
    if (resetPending) {
      resetPending = false;
      reset();
    } else if (enabled) {
      const next = intendedPlacement();
      if (next !== placed) place(next, true);
    }
  }

  function schedule(resetLayout = false) {
    resetPending ||= resetLayout;
    if (!frame) frame = requestAnimationFrame(paint);
  }

  window.addEventListener('scroll', () => schedule(), {passive: true});
  window.addEventListener('resize', () => schedule(true));
  window.addEventListener('pageshow', () => schedule(true));
  reduced.addEventListener('change', () => schedule(true));
  const observer = new ResizeObserver(() => schedule(true));
  observer.observe(sequence);
  observer.observe(source);
  parts.forEach(part => observer.observe(part.slot));
  document.fonts?.ready.then(() => schedule(true));
  reset();
}
