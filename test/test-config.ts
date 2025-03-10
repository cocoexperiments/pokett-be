import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment configuration
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test')
});

export const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokett-test';
export const TEST_PORT = parseInt(process.env.PORT || '3001', 10);

// Ensure we're in test mode
if (process.env.NODE_ENV !== 'test') {
  console.warn('Warning: Tests are not running in test environment. Please check your configuration.');
}

// Validate required test configuration
if (!process.env.USE_MOCK_AUTH || process.env.USE_MOCK_AUTH !== 'true') {
  throw new Error('USE_MOCK_AUTH must be set to true in test environment');
} 