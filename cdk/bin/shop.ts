#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ShopS3Stack } from "../lib/shop-s3-only-stack";
import { ShopStack } from "../lib/shop-stack";

const app = new cdk.App();
const s3only = app.node.tryGetContext("s3only") === "true";

if (s3only) {
  new ShopS3Stack(app, "ShopS3Stack", {
    description: "S3 and BucketDeployment: invalidate CloudFront manually if a distribution is in use",
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
} else {
  new ShopStack(app, "ShopStack", {
    description: "S3 with OAC, CloudFront, and cache invalidation on deploy",
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
}
