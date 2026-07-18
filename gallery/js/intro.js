import { PROFILE_EXHIBIT } from './config.js';

export function runIntro(config) {
  return new Promise((resolve) => {
    const titleEl = document.getElementById('intro-title');
    const tutorialEl = document.getElementById('intro-tutorial');
    const dismissBtn = document.getElementById('intro-tutorial-dismiss');

    if (!titleEl) {
      resolve();
      return;
    }

    titleEl.classList.remove('hidden');

    function startGame() {
      titleEl.classList.add('hidden');
      document.removeEventListener('keydown', onKey);
      titleEl.removeEventListener('click', startGame);

      const seen = localStorage.getItem(config.intro.tutorialStorageKey);
      if (!seen && tutorialEl) {
        tutorialEl.classList.remove('hidden');
        dismissBtn?.addEventListener('click', () => {
          tutorialEl.classList.add('hidden');
          localStorage.setItem(config.intro.tutorialStorageKey, '1');
          resolve();
        }, { once: true });
      } else {
        resolve();
      }
    }

    function onKey() { startGame(); }

    document.addEventListener('keydown', onKey);
    titleEl.addEventListener('click', startGame);

    const photo = titleEl.querySelector('.intro-photo');
    if (photo && PROFILE_EXHIBIT.image) {
      photo.src = PROFILE_EXHIBIT.image;
    }
  });
}
