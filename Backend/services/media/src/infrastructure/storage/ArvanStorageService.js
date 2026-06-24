import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

export class ArvanStorageService {
  constructor({
    region,
    endpoint,
    accessKey,
    secretKey,
    bucket,
    publicBaseUrl = "",
    forcePathStyle = true,
    defaultAcl = "public-read"
  }) {
    if (!endpoint) {
      throw new Error("ARVAN_ENDPOINT is required");
    }

    if (!accessKey) {
      throw new Error("ARVAN_ACCESS_KEY is required");
    }

    if (!secretKey) {
      throw new Error("ARVAN_SECRET_KEY is required");
    }

    if (!bucket) {
      throw new Error("ARVAN_BUCKET is required");
    }

    this.endpoint = endpoint;
    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl.trim();
    this.defaultAcl = defaultAcl.trim();

    this.s3 = new S3Client({
      region: region || "default",
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
      },
      forcePathStyle
    });
  }

  async createPresignedImagePost({
    key,
    contentType,
    expiresInSeconds,
    maxSizeBytes,
    acl = this.defaultAcl
  }) {
    if (!key) {
      throw new Error("key is required");
    }

    if (!contentType) {
      throw new Error("contentType is required");
    }

    const fields = {
      key,
      "Content-Type": contentType
    };

    const conditions = [
      ["content-length-range", 1, maxSizeBytes],
      ["starts-with", "$Content-Type", "image/"]
    ];

    if (acl) {
      fields.acl = acl;
      conditions.push({ acl });
    }

    const { url, fields: uploadFields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresInSeconds,
      Fields: fields,
      Conditions: conditions
    });

    return {
      key,
      uploadUrl: url,
      uploadFields,
      publicUrl: this.publicUrlForKey(key),
      expiresIn: expiresInSeconds,
      upload_url: url,
      upload_fields: uploadFields,
      public_url: this.publicUrlForKey(key),
      expires_in: expiresInSeconds
    };
  }

  publicUrlForKey(key) {
    const safeKey = encodeKeyPath(key);

    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, "")}/${safeKey}`;
    }

    const endpoint = new URL(this.endpoint);

    return `https://${encodeURIComponent(this.bucket)}.${endpoint.host}/${safeKey}`;
  }
}

function encodeKeyPath(key) {
  return key
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}
