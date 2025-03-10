import { Connection } from 'mongoose';
import { Balance, BalanceDocument } from '../../../../src/balances/schemas/balance.schema';
import { BalanceFactory } from './balance.factory';

export function initFactories(connection: Connection): void {
  // Initialize Balance factory
  const balanceModel = connection.model<BalanceDocument>(Balance.name, connection.models[Balance.name].schema);
  BalanceFactory.setModel(balanceModel);
} 