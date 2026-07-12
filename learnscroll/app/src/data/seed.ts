import { db } from './db';
import { ensureProfile } from './profile';
import {
  installDefaultPacksFromManifest,
  migrateLegacyStarterInstalls
} from './packRepository';

export const ensureSeededData = async (): Promise<void> => {
  await ensureProfile();

  const cardCount = await db.cards.count();
  if (cardCount > 0) {
    await migrateLegacyStarterInstalls();
    return;
  }

  await installDefaultPacksFromManifest();
  await migrateLegacyStarterInstalls();
};
