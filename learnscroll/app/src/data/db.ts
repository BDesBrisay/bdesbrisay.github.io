import Dexie, { type Table } from 'dexie';
import type {
  CardAttempt,
  InstalledPack,
  LearningCard,
  Profile,
  ReviewQueueItem
} from '../types/domain';

class LearnScrollDatabase extends Dexie {
  contentPacks!: Table<InstalledPack, string>;
  cards!: Table<LearningCard, string>;
  attempts!: Table<CardAttempt, string>;
  profile!: Table<Profile, 'profile'>;
  reviewQueue!: Table<ReviewQueueItem, string>;

  constructor() {
    super('learnscroll_db');

    this.version(1).stores({
      contentPacks: 'id,version,installedAt',
      cards: 'id,packId,type,*tags,difficulty',
      attempts: 'id,cardId,result,timestamp',
      profile: 'id,lastSessionDate,updatedAt',
      reviewQueue: 'cardId,nextDueAt,priority'
    });

    this.version(2).stores({
      contentPacks: 'id,version,installedAt,sourceUrl',
      cards: 'id,packId,type,*tags,difficulty',
      attempts: 'id,cardId,result,timestamp',
      profile: 'id,lastSessionDate,updatedAt,sessionGoal',
      reviewQueue: 'cardId,nextDueAt,priority'
    });

    this.version(3).stores({
      contentPacks: 'id,version,installedAt,sourceUrl',
      cards: 'id,packId,type,*tags,difficulty',
      attempts: 'id,cardId,result,timestamp',
      profile: 'id,lastSessionDate,updatedAt,sessionGoal,autoAdvanceEnabled,autoAdvanceDelayMs',
      reviewQueue: 'cardId,nextDueAt,priority'
    });

    this.version(4).stores({
      contentPacks:
        'id,version,installedAt,sourceUrl,domain,track,stage,recommendedOrder,*prerequisites',
      cards: 'id,packId,type,*tags,difficulty',
      attempts: 'id,cardId,result,timestamp',
      profile:
        'id,lastSessionDate,updatedAt,sessionGoal,autoAdvanceEnabled,autoAdvanceDelayMs,*activeDomains,*activeTracks,*activePackIds,dailyCurriculumMode',
      reviewQueue: 'cardId,nextDueAt,priority'
    });
  }
}

export const db = new LearnScrollDatabase();

export const resetDatabase = async (): Promise<void> => {
  await db.delete();
  await db.open();
};
