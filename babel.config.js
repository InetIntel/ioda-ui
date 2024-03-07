module.exports = function (api) {
  const presets = ["@babel/preset-react", "@babel/preset-env"];
  const plugins = [
    "transform-class-properties",
    "syntax-dynamic-import",
    "@babel/plugin-proposal-object-rest-spread",
    "istanbul",
  ];

  // Cache the Babel configuration based on the environment
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets,
    plugins,
  };
};
