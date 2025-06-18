import * as SQLite from 'expo-sqlite';

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'annual';
  next_payment_date: string;
  payment_method?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync('subscriptions.db');
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'ARS',
        frequency TEXT CHECK(frequency IN ('monthly', 'annual')) DEFAULT 'monthly',
        next_payment_date TEXT NOT NULL,
        payment_method TEXT,
        category TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM subscriptions ORDER BY created_at DESC'
    );
    return result as Subscription[];
  }

  async addSubscription(
    subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO subscriptions (name, amount, currency, frequency, next_payment_date, payment_method, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        subscription.name,
        subscription.amount,
        subscription.currency,
        subscription.frequency,
        subscription.next_payment_date,
        subscription.payment_method ?? null,
        subscription.category ?? null,
      ]
    );
  }

  async updateSubscription(
    id: number,
    subscription: Partial<Subscription>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateFields = [];
    const values = [];

    Object.entries(subscription).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) return;

    updateFields.push('updated_at = datetime("now")');
    values.push(id);

    await this.db.runAsync(
      `UPDATE subscriptions SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteSubscription(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
  }

  async getSubscriptionsByCategory(): Promise<
    { category: string; total: number }[]
  > {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(`
      SELECT 
        COALESCE(category, 'Sin categoría') as category,
        SUM(CASE 
          WHEN frequency = 'annual' THEN amount / 12 
          ELSE amount 
        END) as total
      FROM subscriptions 
      GROUP BY category
      ORDER BY total DESC
    `);

    return result as { category: string; total: number }[];
  }

  async getMonthlyTotal(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(`
      SELECT SUM(CASE 
        WHEN frequency = 'annual' THEN amount / 12 
        ELSE amount 
      END) as total
      FROM subscriptions
    `)) as { total: number } | null;

    return result?.total ?? 0;
  }
}

export const database = new Database();
