export default {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  }
};
