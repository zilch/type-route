const dts = require("rollup-plugin-dts").default;

const config = [
  {
    input: "./dist/index.d.ts",
    output: [{ file: "dist/index.temp", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
