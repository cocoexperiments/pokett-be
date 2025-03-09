import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balances.service';
import { getModelToken } from '@nestjs/mongoose';
import { Balance } from './schemas/balance.schema';
import { Model, Types } from 'mongoose';

describe('BalancesService', () => {
  let service: BalancesService;
  let model: Model<Balance>;

  const userId = new Types.ObjectId().toString();
  const otherUserId = new Types.ObjectId().toString();
  const groupId = new Types.ObjectId().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: getModelToken(Balance.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BalancesService>(BalancesService);
    model = module.get<Model<Balance>>(getModelToken(Balance.name));
  });

  describe('settleBalance', () => {
    it('should fully settle when A owes B 50 and settles 50', async () => {
      const mockBalance = {
        _id: new Types.ObjectId(),
        creditorId: new Types.ObjectId(otherUserId),
        debtorId: new Types.ObjectId(userId),
        amount: 50,
      };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([mockBalance]),
      };
      jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      await service.settleBalance(userId, otherUserId, 50);

      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { creditorId: otherUserId, debtorId: userId },
          { creditorId: userId, debtorId: otherUserId },
        ],
        groupId: { $exists: false },
      });
      expect(model.deleteMany).toHaveBeenCalled();
      // No new balance should be created as it's fully settled
    });

    it('should handle partial settlement when A owes B 50 and settles 30', async () => {
      const mockBalance = {
        _id: new Types.ObjectId(),
        creditorId: new Types.ObjectId(otherUserId),
        debtorId: new Types.ObjectId(userId),
        amount: 50,
      };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([mockBalance]),
      };
      jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
      const mockCreate = jest.spyOn(model, 'create').mockImplementation();

      await service.settleBalance(userId, otherUserId, 30);

      expect(mockCreate).toHaveBeenCalledWith({
        creditorId: new Types.ObjectId(otherUserId),
        debtorId: new Types.ObjectId(userId),
        amount: 20, // 50 - 30 = 20 remaining
      });
    });

    it('should handle overpayment when A owes B 50 and settles 70', async () => {
      const mockBalance = {
        _id: new Types.ObjectId(),
        creditorId: new Types.ObjectId(otherUserId),
        debtorId: new Types.ObjectId(userId),
        amount: 50,
      };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([mockBalance]),
      };
      jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
      const mockCreate = jest.spyOn(model, 'create').mockImplementation();

      await service.settleBalance(userId, otherUserId, 70);

      expect(mockCreate).toHaveBeenCalledWith({
        creditorId: new Types.ObjectId(userId),
        debtorId: new Types.ObjectId(otherUserId),
        amount: 20, // 70 - 50 = 20 in opposite direction
      });
    });

    it('should handle settlement when both users have balances with each other', async () => {
      const mockBalances = [
        {
          _id: new Types.ObjectId(),
          creditorId: new Types.ObjectId(otherUserId),
          debtorId: new Types.ObjectId(userId),
          amount: 50,
        },
        {
          _id: new Types.ObjectId(),
          creditorId: new Types.ObjectId(userId),
          debtorId: new Types.ObjectId(otherUserId),
          amount: 30,
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockBalances),
      };
      jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 2 });
      const mockCreate = jest.spyOn(model, 'create').mockImplementation();

      await service.settleBalance(userId, otherUserId, 40);

      expect(mockCreate).toHaveBeenCalledWith({
        creditorId: new Types.ObjectId(userId),
        debtorId: new Types.ObjectId(otherUserId),
        amount: 20, // Net: -50 + 30 + 40 = 20
      });
    });

    it('should ignore group balances', async () => {
      const mockBalances = [
        {
          _id: new Types.ObjectId(),
          creditorId: new Types.ObjectId(otherUserId),
          debtorId: new Types.ObjectId(userId),
          amount: 50,
          groupId: undefined,
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockBalances),
      };
      jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      await service.settleBalance(userId, otherUserId, 50);

      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: { $exists: false },
        }),
      );
    });

    it('should handle settlement when no existing balances', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 0 });
      const mockCreate = jest.spyOn(model, 'create').mockImplementation();

      await service.settleBalance(userId, otherUserId, 50);

      expect(mockCreate).toHaveBeenCalledWith({
        creditorId: new Types.ObjectId(userId),
        debtorId: new Types.ObjectId(otherUserId),
        amount: 50,
      });
    });
  });
}); 