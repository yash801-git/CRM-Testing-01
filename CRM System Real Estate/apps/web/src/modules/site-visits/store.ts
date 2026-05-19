import { createCrudStore } from '@/services/storeFactory';

export const useVisitStore = createCrudStore<any>('site-visits');
