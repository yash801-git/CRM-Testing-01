import { createCrudStore } from '@/services/storeFactory';

export const useDealStore = createCrudStore<any>('deals');
