import { User } from '../schemas/user.schema';

export class FriendsResponseDto implements Partial<User> {
  _id: string;
  name: string;
  email?: string;
} 