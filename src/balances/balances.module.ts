import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BalancesService } from './balances.service';
import { BalancesController } from './balances.controller';
import { Balance, BalanceSchema } from './schemas/balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Balance.name, schema: BalanceSchema }]),
  ],
  controllers: [BalancesController],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {} 