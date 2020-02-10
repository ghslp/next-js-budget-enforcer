#!/usr/bin/env node

import fs from 'fs';
import gzipSize from 'gzip-size';
import path from 'path';
import prettyBytes from 'pretty-bytes';
import yargs from 'yargs';

const nextPath = path.join(process.cwd(), '.next');

const maxSize = (
  typeof yargs.argv.max === 'number'
    ? yargs.argv.max * 1000
    : 170000
);

const maxSizePretty = prettyBytes(maxSize);

interface BuildManifest {
  devFiles: [];
  pages: {
    [pagePath: string]: Array<string>;
  };
}

const calculatePageGzippedSize = ({
  chunkPaths,
  isModernBuild,
}: {
  isModernBuild: boolean;
  chunkPaths: Array<string>;
}) => {
  const buildIdPath = path.join(nextPath, '/BUILD_ID');
  const buildId = fs.readFileSync(buildIdPath, 'utf8');

  const unlistedChunkPaths = (
    isModernBuild
      ? [
        `static/${buildId}/_buildManifest.module.js`,
        `static/${buildId}/pages/_app.module.js`,
        `static/${buildId}/pages/AboutPageFa.module.js`,
      ]
      : [
        `static/${buildId}/pages/_app.js`,
        `static/${buildId}/pages/index.js`,
      ]
  )

  const allChunkPaths = [
    ...chunkPaths,
    ...unlistedChunkPaths,
  ];

  const pageGzippedSize = allChunkPaths.reduce(
    (total, pageFileRelativePath) => {
      if (isModernBuild && !pageFileRelativePath.endsWith('.module.js')) {
        return total;
      }

      const pageFileAbsolutePath = path.join(nextPath, pageFileRelativePath);
      const pageFileGzipSize = gzipSize.fileSync(pageFileAbsolutePath);

      return total + pageFileGzipSize;
    },
    0,
  );

  return pageGzippedSize;
};

const nextJsBudgetEnforcer = async () => {
  const buildManifestPath = path.join(nextPath, '/build-manifest.json');

  const buildManifest: BuildManifest = JSON.parse(
    fs.readFileSync(buildManifestPath, 'utf8'),
  );

  const chunkPathsByPagePath = buildManifest.pages;
  const pagePaths = Object.keys(chunkPathsByPagePath);

  const isModernBuild = pagePaths.some((pagePath) => (
    chunkPathsByPagePath[pagePath].some((chunkPath) => chunkPath.endsWith('.module.js'))
  ));

  const failedPagePaths = Object.keys(chunkPathsByPagePath).filter((pagePath) => {
    const pageGzippedSize = calculatePageGzippedSize({
      isModernBuild,
      chunkPaths: chunkPathsByPagePath[pagePath],
    });

    // console.log(`${pagePath}: ${pageGzippedSize} (${prettyBytes(pageGzippedSize)})`);

    if (pageGzippedSize > maxSize) {
      const sizePretty = prettyBytes(pageGzippedSize);

      console.error(
        `${pagePath} is too large! (${sizePretty} > ${maxSizePretty})`,
      );

      return true;
    }

    return false;
  });

  if (failedPagePaths.length > 0) {
    process.exit(1);
  }

  console.info(`All pages have less than ${maxSizePretty} of JavaScript.`)
};

nextJsBudgetEnforcer();
