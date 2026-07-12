import { registerSW } from 'virtual:pwa-register';
import { useSessionStore } from './store/sessionStore';

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null;

export const registerPwa = (): void => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  updateServiceWorker = registerSW({
    onNeedRefresh() {
      useSessionStore.getState().setUpdateAvailable(true);
    }
  });
};

export const triggerAppUpdate = async (): Promise<void> => {
  if (updateServiceWorker) {
    await updateServiceWorker(true);
    return;
  }

  window.location.reload();
};
