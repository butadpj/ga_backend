import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@users/(.*)': '<rootDir>/users/$1',
    '@twitch/(.*)': '<rootDir>/twitch/$1',
    '@youtube/(.*)': '<rootDir>/youtube/$1',
    '@files/(.*)': '<rootDir>/files/$1',
    '@auth/(.*)': '<rootDir>/auth/$1',
    '@utils/(.*)': '<rootDir>/utils/$1',
  },
  setupFiles: ['dotenv/config'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    './src/twitch/__tests__/.*\\.service.spec.ts',
    './src/youtube/__tests__/.*\\.service.spec.ts',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

export default config;
