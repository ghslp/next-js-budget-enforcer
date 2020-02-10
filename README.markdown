# Next.js JS Budget Enforcer

_**Note: This project is an unstable work-in-progress!** Behaviour and documented options will change over time. It almost definitely has compatibility issues with older versions of Next.js, and will need to be updated to maintain compatibility with future Next.js releases._

_PRs are welcome, and I plan on publishing a general roadmap soon._

---

Enforce a JavaScript budget for each page of a Next.js build.

This script will terminate with an exit code of 1 if any page exceeds the provided budget. It’s mean to be used in a continuous integration system such as [GitLab CI/CD](https://docs.gitlab.com/ee/ci/), in which a task ending with a non-zero exit code can halt the build and prevent feature branches from being merged.

Works by parsing `.next/build-manifest.json` and summing the file sizes of the referenced chunks (as well as some other unlisted chunks). These sums aim to match the “First load” totals reported by `next build`.

## Usage

### Install

With Yarn:

```
yarn add next-js-budget-enforcer --dev
```

With NPM:

```
npm install next-js-budget-enforcer --save-dev
```

### Configure

Add to the scripts section of your `package.json`:

```json
{
  […]
  "scripts": {
    […]
    "next-js-budget-enforcer": "next-js-budget-enforcer --max=170"
  },
  […]
}
```

Optionally pass a maximum JS size (in kB) using `--max`. Defaults to 170kb, which is the budget recommended by [Next.js](https://github.com/zeit/next.js/blob/f6e7a38101e9de98cdbc569264e105c4c5f474bd/packages/next/build/utils.ts#L68) and [Google’s Alex Russell](https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/).

### Run

With Yarn:

```
yarn next-js-budget-enforcer
```

With NPM:

```
npm run next-js-budget-enforcer
```
