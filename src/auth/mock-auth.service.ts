import { Injectable } from '@nestjs/common';
import { IAuthService } from './interfaces/auth.interface';
import { UsersService } from '../users/users.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class MockAuthService implements IAuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateToken(token: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(token);
      return {
        user: {
          emails: [{ email: user.email }],
          name: {
            first_name: user.name
          }
        }
      };
    } catch (error) {
      return null;
    }
  }

  async authenticate(token: string): Promise<any> {
    // Generate fake user data
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const mockEmail = faker.internet.email({ firstName, lastName });
    
    // Create user in database
    const user = await this.usersService.create({
      name: `${firstName} ${lastName}`,
      email: mockEmail,
    });

    const userId = user._id.toString();

    return {
      status_code: 200,
      session_token: userId,
      user,
    };
  }
} 