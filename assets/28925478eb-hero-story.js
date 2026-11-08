import {DURATION, TRACKS, GROWTH, opacityFrames} from '/grow-create-preview/assets/abd82ea200-hero-story-timeline.mjs';

const root = document.querySelector('.hero--story');
if (root) {
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [];
  let finished = false;

  function finish(mode = 'still') {
    finished = true;
    clearTimeout(window.__growStoryFallback25);
    html.dataset.heroStory = mode;
    animations.forEach(animation => animation.cancel());
  }

  reduced.addEventListener('change', event => { if (event.matches) finish(); });
  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });

  async function start() {
    if (html.hasAttribute('data-hero-still') || reduced.matches || html.dataset.heroStory !== 'pending') {
      finish();
      return;
    }
    const urls = [...new Set([...root.querySelectorAll('image')].map(image => image.getAttribute('href')))];
    try {
      await Promise.all(urls.map(url => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Hero image unavailable'));
        image.src = url;
        if (image.decode) image.decode().then(resolve, reject);
      })));
      if (finished || reduced.matches || html.dataset.heroStory !== 'pending') return;
      clearTimeout(window.__growStoryFallback25);
      const clock = document.timeline.currentTime;
      const play = (element, frames, options = {}) => {
        const animation = element.animate(frames, {duration: DURATION, fill: 'both', ...options});
        if (Number.isFinite(clock)) animation.startTime = clock;
        animations.push(animation);
      };
      const selectors = {
        planting: '[data-story-pose="planting"]', watering: '[data-story-pose="watering"]',
        watching: '[data-story-pose="watching"]', resting: '[data-story-pose="resting"]',
        seed: '.hero-seed', sprout: '.hero-stage-sprout', young: '.hero-stage-young',
        developing: '.hero-stage-developing', mature: '.hero-growing-tree',
        water: '.hero-story-water', town: '.hero-story-town',
      };
      for (const [name, selector] of Object.entries(selectors)) play(root.querySelector(selector), opacityFrames(TRACKS[name]));
      for (const [name, growth] of Object.entries(GROWTH)) {
        const initial = `scale(${growth.scale}) rotate(${growth.rotate}deg)`;
        play(root.querySelector(selectors[name]), [
          {offset: 0, transform: initial},
          {offset: growth.start / DURATION, transform: initial, easing: 'cubic-bezier(.22,.6,.36,1)'},
          {offset: growth.end / DURATION, transform: 'scale(1) rotate(0deg)'},
          {offset: 1, transform: 'scale(1) rotate(0deg)'},
        ]);
      }
      play(root.querySelector('.hero-story-town'), [
        {offset: 0, clipPath: 'inset(0 49.8% 0 49.8%)', transform: 'translateY(28px) scale(.97)'},
        {offset: TRACKS.town.start / DURATION, clipPath: 'inset(0 49.8% 0 49.8%)', transform: 'translateY(28px) scale(.97)', easing: 'cubic-bezier(.22,.6,.36,1)'},
        {offset: 1, clipPath: 'inset(0 0% 0 0%)', transform: 'none'},
      ]);
      play(root.querySelector('.hero-story-water'), [{strokeDashoffset: '0'}, {strokeDashoffset: '-24'}], {
        duration: 680, delay: 2250, iterations: 5,
      });
      root.querySelectorAll('.hero-char').forEach(character => {
        const delay = parseFloat(character.style.getPropertyValue('--char-delay')) || 0;
        play(character, [{opacity: 0, transform: 'translateY(.18em)'}, {opacity: 1, transform: 'none'}], {
          duration: 250, delay, easing: 'cubic-bezier(.2,.65,.3,1)',
        });
      });
      html.dataset.heroStoryStarted = String(Date.now());
      html.dataset.heroStoryDuration = String(DURATION);
      html.dataset.heroStory = 'playing';
      Promise.all(animations.map(animation => animation.finished)).then(() => {
        if (!finished) finish('complete');
      }).catch(() => {});
    } catch {
      html.dataset.heroStoryError = 'asset';
      finish();
    }
  }
  start();
}
