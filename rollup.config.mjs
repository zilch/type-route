import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

const external = ["history", "react"];

const cjsEntry = `'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./type-route.cjs.production.min.js')
} else {
  module.exports = require('./type-route.cjs.development.js')
}
`;

function bundle({ input, dir, emitCjsEntry, isDev, isMinified, output }) {
  return {
    input,
    external,
    output: { dir, sourcemap: true, ...output },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          __DEV__: isDev ? '(process.env.NODE_ENV !== "production")' : "false",
        },
      }),
      typescript({
        tsconfig: "./tsconfig.build.json",
        declaration: false,
        importHelpers: false,
        noEmitOnError: true,
      }),
      isMinified && terser(),
      emitCjsEntry && {
        name: "cjs-entry",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "index.js",
            source: cjsEntry,
          });
        },
      },
    ],
  };
}

function entry(input, dir) {
  return [
    bundle({
      input,
      dir,
      isDev: true,
      output: { format: "es", entryFileNames: "type-route.esm.js" },
    }),
    bundle({
      input,
      dir,
      isDev: true,
      emitCjsEntry: true,
      output: {
        format: "cjs",
        exports: "named",
        entryFileNames: "type-route.cjs.development.js",
      },
    }),
    bundle({
      input,
      dir,
      isDev: false,
      isMinified: true,
      output: {
        format: "cjs",
        exports: "named",
        entryFileNames: "type-route.cjs.production.min.js",
      },
    }),
    {
      input,
      external,
      output: { file: `${dir}/index.d.ts`, format: "es" },
      plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
    },
  ];
}

export default [
  ...entry("./src/react.ts", "dist"),
  ...entry("./src/core.ts", "dist/core"),
];
