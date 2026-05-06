# React-shop-cloudfront

This is frontend starter project for nodejs-aws mentoring program. It uses the following technologies:

- [Vite](https://vitejs.dev/) as a project bundler
- [React](https://beta.reactjs.org/) as a frontend framework
- [React-router-dom](https://reactrouterdotcom.fly.dev/) as a routing library
- [MUI](https://mui.com/) as a UI framework
- [React-query](https://react-query-v3.tanstack.com/) as a data fetching library
- [Formik](https://formik.org/) as a form library
- [Yup](https://github.com/jquense/yup) as a validation schema
- [Vitest](https://vitest.dev/) as a test runner
- [MSW](https://mswjs.io/) as an API mocking library
- [Eslint](https://eslint.org/) as a code linting tool
- [Prettier](https://prettier.io/) as a code formatting tool
- [TypeScript](https://www.typescriptlang.org/) as a type checking tool

## Available Scripts

### `start`

Starts the project in dev mode with mocked API on local environment.

### `build`

Builds the project for production in `dist` folder.

### `preview`

Starts the project in production mode on local environment.

### `test`, `test:ui`, `test:coverage`

Runs tests in console, in browser or with coverage.

### `lint`, `prettier`

Runs linting and formatting for all files in `src` folder.

## Task 2 — deployment links

| Resource | URL |
|----------|-----|
| **CloudFront** (serves the app) | `https://<YOUR_CLOUDFRONT_DOMAIN>` — replace with the `CloudFrontUrl` output after `npm run deploy:cdk` (see [CDK](cdk/) stack `ShopStack`). |
| **S3 static website** | After the same deploy, the `S3WebsiteUrl` stack output. Direct access should return **403 Access Denied** (bucket is private; only CloudFront via OAC can read objects), while the CloudFront URL serves the app. |

### Prerequisites

- [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) — use `npx cdk` from the `cdk` folder or the npm scripts below.
- AWS credentials for the CLI and CDK (`aws configure` or equivalent).
- One-time per account/region: `cdk bootstrap aws://<ACCOUNT_ID>/<REGION>` (from `cdk/` or with `npx`).

### Manual deployment (Task 2.1)

Use the AWS Console: create an S3 bucket, enable static website hosting, upload the `dist` folder, create a CloudFront distribution with OAC, then a cache invalidation after changes. The automated CDK path below recreates the intended final state (private S3, CloudFront, invalidation on deploy).

### Automated CDK (Task 2.2)

From the repository root (after `npm install`):

| Script | What it does |
|--------|----------------|
| `npm run deploy:cdk:s3` | Builds the app, deploys `ShopS3Stack` (S3 + `BucketDeployment` only). If you have CloudFront in front, create a cache invalidation in the console. |
| `npm run cdk:destroy` | Destroys `ShopStack` (default, no `s3only` context). |
| `npm run cdk:destroy:s3` | Destroys `ShopS3Stack` (`-c s3only=true`). |
| `npm run deploy:cdk` | Builds the app, deploys `ShopStack` (S3, CloudFront with OAC, and automatic invalidation on each deploy). |

In `cdk/`, the app switches with context: `-c s3only=true` selects `ShopS3Stack`; the default is `ShopStack` with CloudFront and invalidation.

Copy the **CloudFront** and **S3 website** URLs from the CDK stack outputs (or the AWS console) into the table above in your PR description.
