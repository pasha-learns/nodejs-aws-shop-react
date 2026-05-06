# React-shop-cloudfront

Frontend for the nodejs-aws mentoring program.

- Vite, React, react-router-dom, MUI, react-query, Formik, Yup, Vitest, MSW, ESLint, Prettier, TypeScript

## Scripts

`start` — dev with mocked API. `build` → `dist/`. `preview` — local prod build. `test` / `test:ui` / `test:coverage`. `lint`, `prettier`.

Deploy (from repo root, after `npm install` and `npm run build` working):

| Command | |
|---------|--|
| `npm run deploy:cdk:s3` | Build + deploy `ShopS3Stack` (S3 only). |
| `npm run deploy:cdk` | Build + deploy `ShopStack` (private S3, CloudFront OAC, invalidation on deploy). |
| `npm run cdk:destroy:s3` | Destroy `ShopS3Stack`. |
| `npm run cdk:destroy` | Destroy `ShopStack`. |

Bootstrap once per account/region (replace ids):

```bash
cd cdk && npx cdk bootstrap aws://<account-id>/<region>
```

CDK code: `cdk/bin/shop.ts`, `cdk/lib/shop-stack.ts`, `cdk/lib/shop-s3-only-stack.ts`.

## Deploy URLs

Fill after `npm run deploy:cdk`:

| | URL |
|--|-----|
| CloudFront | |
| S3 website | |

With OAC and a private bucket, use the CloudFront URL; the S3 website endpoint usually returns 403.
