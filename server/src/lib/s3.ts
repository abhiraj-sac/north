import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

if (!region || !bucket) {
  throw new Error(
    "AWS_REGION or AWS_S3_BUCKET is missing in environment variables."
  );
}

export const s3 = new S3Client({ region });

export const S3_BUCKET = bucket;

export async function testS3Connection() {
  await s3.send(
    new HeadBucketCommand({
      Bucket: S3_BUCKET,
    })
  );

  console.log("AWS S3 connection successful!");
}