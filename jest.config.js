module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  preset: "jest-puppeteer",
  testEnvironment: "jsdom",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
};

