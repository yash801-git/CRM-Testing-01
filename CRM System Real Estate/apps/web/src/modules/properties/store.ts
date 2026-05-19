import { createCrudStore } from '@/services/storeFactory';

export const usePropertyStore = createCrudStore<any>('properties');
