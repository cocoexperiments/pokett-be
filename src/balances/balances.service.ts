import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Balance, BalanceDocument } from './schemas/balance.schema';

@Injectable()
export class BalancesService {
  constructor(
    @InjectModel(Balance.name) private balanceModel: Model<BalanceDocument>,
  ) {}

  private async findBalance(userId1: string, userId2: string): Promise<Balance | null> {
    return this.balanceModel.findOne({
      $or: [
        { creditorId: userId1, debtorId: userId2 },
        { creditorId: userId2, debtorId: userId1 }
      ]
    });
  }

  async getBalance(userId: string, otherUserId: string): Promise<number> {
    const balance = await this.findBalance(userId, otherUserId);
    if (!balance) {
      return 0;
    }
    return balance.creditorId.toString() === userId ? balance.amount : -balance.amount;
  }

  async updateBalance(userId: string, otherUserId: string, amount: number): Promise<void> {
    let balance = await this.findBalance(userId, otherUserId);
    
    if (!balance) {
      // Create new balance record with positive amount
      const [creditorId, debtorId] = amount >= 0 
        ? [userId, otherUserId] 
        : [otherUserId, userId];

      balance = new this.balanceModel({
        creditorId: new Types.ObjectId(creditorId),
        debtorId: new Types.ObjectId(debtorId),
        amount: Math.abs(amount)
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

  async getUserBalances(userId: string): Promise<{ userId: string; amount: number }[]> {
    const balances = await this.balanceModel.find({
      $or: [{ creditorId: userId }, { debtorId: userId }]
    });

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
} 