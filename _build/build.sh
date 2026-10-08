#!/bin/sh
# Vercel build step: copy the static site into dist/ and restore the tree image
# from its base64 parts (kept as text so the repo can be updated without binary uploads).
set -eu
rm -rf dist
mkdir dist
cp -R *.html skills assets dist/
cat _build/tree-b64/part-* | base64 -d > dist/assets/img/tree.jpg
(cd dist/assets/img && sha256sum -c ../../../_build/tree.jpg.sha256)
echo "Capability Garden static site ready in dist/"
