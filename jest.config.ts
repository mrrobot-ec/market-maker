import type { Config } from 'jest';

const config: Config = {
  testRegex: '(/__tests__/.*|\\.(test))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  verbose: true,
  preset: 'ts-jest'
};

export default config;