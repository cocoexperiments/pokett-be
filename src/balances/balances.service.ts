import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Balance, BalanceDocument } from './schemas/balance.schema';

@Injectable()
export class BalancesService {
  constructor(
    @InjectModel(Balance.name) private balanceModel: Model<BalanceDocument>,
  ) {}

  private async findBalance(userId1: string, userId2: string, groupId?: string): Promise<Balance | null> {
    const query: Record<string, any> = {
      $or: [
        { creditorId: userId1, debtorId: userId2 },
        { creditorId: userId2, debtorId: userId1 }
      ]
    };
    
    if (groupId) {
      query.groupId = new Types.ObjectId(groupId);
    } else {
      query.groupId = { $exists: false };
    }
    
    return this.balanceModel.findOne(query);
  }

  async updateBalance(userId: string, otherUserId: string, amount: number, groupId?: string): Promise<void> {
    let balance = await this.findBalance(userId, otherUserId, groupId);
    
    if (!balance) {
      // Create new balance record with positive amount
      const [creditorId, debtorId] = amount >= 0 
        ? [userId, otherUserId] 
        : [otherUserId, userId];

      balance = new this.balanceModel({
        creditorId: new Types.ObjectId(creditorId),
        debtorId: new Types.ObjectId(debtorId),
        amount: Math.abs(amount),
        ...(groupId && { groupId: new Types.ObjectId(groupId) })
      });
    } else {
      // Update existing balance
      if (balance.creditorId.toString() === userId) {
        balance.amount += amount;
      } else {
        balance.amount -= amount;
      }

      // If balance becomes negative, swap creditor and debtor
      if (balance.amount < 0) {
        const tempId = balance.creditorId;
        balance.creditorId = balance.debtorId;
        balance.debtorId = tempId;
        balance.amount = Math.abs(balance.amount);
      }
    }
    
    await balance.save();
  }

  async getUserBalances(userId: string, groupId?: string): Promise<{ userId: string; amount: number }[]> {
    const query: Record<string, any> = {
      $or: [{ creditorId: new Types.ObjectId(userId) }, { debtorId: new Types.ObjectId(userId) }]
    };

    if (groupId) {
      query.groupId = new Types.ObjectId(groupId);
    }

    const balances = await this.balanceModel.find(query);
    console.log(balances, "---balances---")
    return balances.map(balance => {
      const isCreditor = balance.creditorId.toString() === userId;
      const otherUserId = isCreditor ? balance.debtorId.toString() : balance.creditorId.toString();
      const amount = isCreditor ? balance.amount : -balance.amount;
      
      return {
        userId: otherUserId,
        amount
      };
    });
  }

  async settleBalance(userId: string, otherUserId: string, amount: number): Promise<void> {
    // Get all non-group balances between the users
    const query: Record<string, any> = {
      $or: [
        { creditorId: otherUserId, debtorId: userId },
        { creditorId: userId, debtorId: otherUserId }
      ],
      groupId: { $exists: false }
    };

    const balances = await this.balanceModel
      .find(query)
      .sort({ updatedAt: 1 });

    // Calculate net balance
    let netBalance = 0;
    for (const balance of balances) {
      if (balance.creditorId.toString() === otherUserId) {
        // Other user is creditor, so current user owes them
        netBalance -= balance.amount;
      } else {
        // Current user is creditor, so other user owes them
        netBalance += balance.amount;
      }
    }

    // Delete all existing balances as we'll create a new consolidated one
    await this.balanceModel.deleteMany(query);

    console.log(netBalance, "---netBalance---")
    // Calculate the new balance after settlement
    const newNetBalance = netBalance + amount;

    // If there's a remaining balance, create a new record
    if (newNetBalance !== 0) {
      await this.balanceModel.create({
        creditorId: new Types.ObjectId(newNetBalance > 0 ? userId : otherUserId),
        debtorId: new Types.ObjectId(newNetBalance > 0 ? otherUserId : userId),
        amount: Math.abs(newNetBalance)
      });
    }
  }
} 