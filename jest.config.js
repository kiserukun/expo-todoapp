module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // transform: {
  //   '^.+\\.[jt]sx?$': 'babel-jest',
  // },
  // transformIgnorePatterns: [
  //   'node_modules/(?!(@react-native|react-native|@react-navigation|react-clone-referenced-element)/)',
  // ],
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/app/$1',
  // },


};
// module.exports = {
//   preset: 'jest-expo',
//   testEnvironment: 'node',
//   transformIgnorePatterns: [
//     // node_modules内のESMモジュールをBabelで変換する
//     "node_modules/(?!(jest-)?@?react-native|@react-native|@expo|@unimodules|expo(nent)?|@expo/vector-icons)"
//   ],
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
// };