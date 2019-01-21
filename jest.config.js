module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^guntree/(.+)": "<rootDir>/src/$1",
  },
};