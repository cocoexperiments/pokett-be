import { Types, Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Balance, BalanceDocument } from '../../../../src/balances/schemas/balance.schema';

export class BalanceFactory {
  private static model: Model<BalanceDocument>;

  static setModel(model: Model<BalanceDocument>) {
    this.model = model;
  }

  /**
   * Creates and saves a balance object to the database
   * @param params - Balance parameters
   * @returns Promise resolving to the saved balance document
   */
  static async createForDb(params: {
    creditorId: string | Types.ObjectId;
    debtorId: string | Types.ObjectId;
    amount?: number;
    groupId?: string | Types.ObjectId;
  }): Promise<BalanceDocument> {
    if (!this.model) {
      throw new Error('Model not set. Call BalanceFactory.setModel() first.');
    }
    const balance = this.create(params);
    return this.model.create(balance);
  }

  /**
   * Creates and saves multiple balance objects to the database
   * @param count - Number of balances to create
   * @param params - Base parameters for all balances
   * @returns Promise resolving to an array of saved balance documents
   */
  static async createManyForDb(
    count: number,
    params: {
      creditorId: string | Types.ObjectId;
      debtorId: string | Types.ObjectId;
      groupId?: string | Types.ObjectId;
    }
  ): Promise<BalanceDocument[]> {
    if (!this.model) {
      throw new Error('Model not set. Call BalanceFactory.setModel() first.');
    }
    const balances = this.createMany(count, params);
    return this.model.create(balances);
  }

  /**
   * Creates and saves a random balance object to the database
   * @param params - Optional parameters to override random values
   * @returns Promise resolving to the saved balance document
   */
  static async createRandomForDb(params: Partial<{
    creditorId: string | Types.ObjectId;
    debtorId: string | Types.ObjectId;
    amount: number;
    groupId: string | Types.ObjectId;
  }> = {}): Promise<BalanceDocument> {
    if (!this.model) {
      throw new Error('Model not set. Call BalanceFactory.setModel() first.');
    }
    const balance = this.createRandom(params);
    return this.model.create(balance);
  }

  /**
   * Creates a balance object with the given parameters
   * @param creditorId - ID of the user who is owed money
   * @param debtorId - ID of the user who owes money
   * @param amount - Amount of money owed (always positive)
   * @param groupId - Optional group ID if the balance is associated with a group
   * @returns A balance object ready to be saved to the database
   */
  static create(params: {
    creditorId: string | Types.ObjectId;
    debtorId: string | Types.ObjectId;
    amount?: number;
    groupId?: string | Types.ObjectId;
  }): Partial<Balance> {
    const amount = params.amount ?? faker.number.float({ min: 1, max: 1000, fractionDigits: 2 });
    
    return {
      creditorId: typeof params.creditorId === 'string' ? new Types.ObjectId(params.creditorId) : params.creditorId,
      debtorId: typeof params.debtorId === 'string' ? new Types.ObjectId(params.debtorId) : params.debtorId,
      amount,
      ...(params.groupId && {
        groupId: typeof params.groupId === 'string' ? new Types.ObjectId(params.groupId) : params.groupId
      })
    };
  }

  /**
   * Creates multiple balance objects
   * @param count - Number of balances to create
   * @param params - Base parameters for all balances
   * @returns An array of balance objects
   */
  static createMany(
    count: number,
    params: {
      creditorId: string | Types.ObjectId;
      debtorId: string | Types.ObjectId;
      groupId?: string | Types.ObjectId;
    }
  ): Partial<Balance>[] {
    return Array.from({ length: count }, () => this.create(params));
  }

  /**
   * Creates a random balance object
   * @param params - Optional parameters to override random values
   * @returns A balance object with random values
   */
  static createRandom(params: Partial<{
    creditorId: string | Types.ObjectId;
    debtorId: string | Types.ObjectId;
    amount: number;
    groupId: string | Types.ObjectId;
  }> = {}): Partial<Balance> {
    return this.create({
      creditorId: params.creditorId ?? new Types.ObjectId(),
      debtorId: params.debtorId ?? new Types.ObjectId(),
      amount: params.amount,
      groupId: params.groupId
    });
  }
} 