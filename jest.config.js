module.exports = {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  }
};
