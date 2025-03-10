import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export interface AuthResponse {
  session_token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export async function authenticateUser(app: INestApplication): Promise<AuthResponse> {
  const response = await request(app.getHttpServer())
    .get('/api/auth/authenticate')
    .send({ token: 'mock-token' }); // token value doesn't matter for mock auth

  return response.body;
}

export async function getAuthHeader(app: INestApplication, userId?: string): Promise<{ Authorization: string }> {
  if (!userId) {
    const { session_token } = await authenticateUser(app);
    return { Authorization: `Bearer ${session_token}` };
  }
  return { Authorization: `Bearer ${userId}` };
} 