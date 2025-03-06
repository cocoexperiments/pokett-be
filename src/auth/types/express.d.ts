import { User } from '../../users/schemas/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
} 