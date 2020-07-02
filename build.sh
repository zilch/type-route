set -e

rm -rf dist
rm -rf .temp-dist
mkdir .temp-dist

echo "\n===CREATING CORE BUNDLE===\n"

tsdx build --entry ./src/core.ts --tsconfig ./tsconfig.build.json
mv dist/core.d.ts dist/index.d.ts
rollup -c rollup.dts.config.js
rm dist/*.d.ts
mv dist/index.temp dist/index.d.ts
mv dist .temp-dist/core

echo "\n===CREATING REACT BUNDLE===\n"

tsdx build --entry ./src/react.ts --tsconfig ./tsconfig.build.json
mv dist/react.d.ts dist/index.d.ts
rollup -c rollup.dts.config.js
rm dist/*.d.ts
mv dist/index.temp dist/index.d.ts

mv .temp-dist/core dist/core

rm -rf .temp-dist

echo "\n===DONE===\n"

ls -lhSR dist
