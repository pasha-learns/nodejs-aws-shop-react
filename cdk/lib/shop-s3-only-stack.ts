import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

const distPath = path.join(__dirname, "..", "..", "dist");

export class ShopS3Stack extends cdk.Stack {
  public readonly websiteBucket: s3.Bucket;
  public readonly s3WebsiteUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.websiteBucket = new s3.Bucket(this, "ShopWebsiteBucketS3Only", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    this.s3WebsiteUrl = this.websiteBucket.bucketWebsiteUrl;

    new s3deploy.BucketDeployment(this, "DeployToS3", {
      sources: [s3deploy.Source.asset(distPath)],
      destinationBucket: this.websiteBucket,
    });

    new cdk.CfnOutput(this, "S3BucketName", { value: this.websiteBucket.bucketName });
    new cdk.CfnOutput(this, "S3WebsiteUrl", { value: this.s3WebsiteUrl });
  }
}
