import { createCrudStore } from '@/services/storeFactory';

export const useFollowUpStore = createCrudStore<any>('follow-ups');
