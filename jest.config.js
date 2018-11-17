module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^guntree/(.+)": "<rootDir>/src/guntree/$1",
  },
};