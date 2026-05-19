import { createCrudStore } from '@/services/storeFactory';

export const useAgentStore = createCrudStore<any>('users');
