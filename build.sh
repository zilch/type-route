#!/bin/bash
set -e

rm -rf lib
mkdir -p lib

npx tsc --noEmit

npx tsc ./src/index.ts --noEmitOnError --skipLibCheck --declaration --emitDeclarationOnly --out lib/index.js --module amd

echo "
declare module \"type-route\" {
    import main = require(\"index\");
    export = main;
}
" >> lib/index.d.ts

npx ncc build ./src/index.ts -e history -m -o lib
