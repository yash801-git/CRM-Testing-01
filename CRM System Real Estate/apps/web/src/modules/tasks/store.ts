import { createCrudStore } from '@/services/storeFactory';

export const useTaskStore = createCrudStore<any>('tasks');
