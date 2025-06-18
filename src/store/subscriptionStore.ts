import { create } from 'zustand';
import { database, Subscription } from '../database/database';

interface SubscriptionStore {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSubscriptions: () => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscription: (id: number, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: number) => Promise<void>;
  getMonthlyTotal: () => number;
  getSubscriptionsByCategory: () => Promise<{ category: string; total: number }[]>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  loadSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const subscriptions = await database.getAllSubscriptions();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false 
      });
    }
  },

  addSubscription: async (subscription) => {
    set({ isLoading: true, error: null });
    try {
      await database.addSubscription(subscription);
      const subscriptions = await database.getAllSubscriptions();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al agregar suscripción',
        isLoading: false 
      });
    }
  },

  updateSubscription: async (id, subscription) => {
    set({ isLoading: true, error: null });
    try {
      await database.updateSubscription(id, subscription);
      const subscriptions = await database.getAllSubscriptions();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar suscripción',
        isLoading: false 
      });
    }
  },

  deleteSubscription: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await database.deleteSubscription(id);
      const subscriptions = await database.getAllSubscriptions();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar suscripción',
        isLoading: false 
      });
    }
  },

  getMonthlyTotal: () => {
    const { subscriptions } = get();
    return subscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.frequency === 'annual' ? sub.amount / 12 : sub.amount;
      return total + monthlyAmount;
    }, 0);
  },

  getSubscriptionsByCategory: async () => {
    try {
      return await database.getSubscriptionsByCategory();
    } catch (error) {
      console.error('Error getting subscriptions by category:', error);
      return [];
    }
  },
}));