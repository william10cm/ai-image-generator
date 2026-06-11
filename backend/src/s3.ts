import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// The S3 client reads AWS credentials and region from environment
// variables automatically (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
// AWS_REGION) - no need to pass them in explicitly.
const s3 = new S3Client({});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// Uploads an image buffer to S3 under a unique key (filename) and
// returns that key. We store the key (not a full URL) because our
// bucket is private - URLs need to be "signed" with a temporary
// access token each time we want to view the image.
export async function uploadImage(buffer: Buffer, contentType: string): Promise<string> {
  const key = `images/${randomUUID()}.png`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return key;
}

// Generates a temporary, signed URL that lets a browser view a private
// S3 object for a limited time (default: 1 hour). This is the standard
// way to serve files from a private bucket without making it public.
export async function getImageUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
