import { apiRequest } from "@/shared/api/api-client";
import { ApiError } from "@/shared/api/api-error";
import { endpoints } from "@/shared/api/endpoints";

export type ImageContentType = "image/jpeg" | "image/png" | "image/webp";

type UploadFields = Record<string, string>;

export type PresignedUploadResponse = {
  target: "profile_photo" | "dish_image";
  key: string;
  contentType: ImageContentType;
  maxSizeBytes: number;

  // حالت camelCase
  uploadUrl?: string;
  uploadFields?: UploadFields;
  publicUrl?: string;
  expiresIn?: number;

  // حالت snake_case، برای اینکه اگر بک‌اند این مدل برگرداند هم کار کند
  upload_url?: string;
  upload_fields?: UploadFields;
  public_url?: string;
  expires_in?: number;
};

const allowedImageTypes: ImageContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function assertSupportedImage(
  file: File
): asserts file is File & { type: ImageContentType } {
  if (!allowedImageTypes.includes(file.type as ImageContentType)) {
    throw new ApiError(
      "فرمت تصویر باید jpeg، png یا webp باشد.",
      400,
      "INVALID_CONTENT_TYPE"
    );
  }
}

function getUploadUrl(presign: PresignedUploadResponse) {
  return presign.uploadUrl || presign.upload_url;
}

function getUploadFields(presign: PresignedUploadResponse) {
  return presign.uploadFields || presign.upload_fields;
}

function getPublicUrl(presign: PresignedUploadResponse) {
  return presign.publicUrl || presign.public_url;
}

async function uploadToPresignedPost(
  file: File,
  presign: PresignedUploadResponse
) {
  const uploadUrl = getUploadUrl(presign);
  const uploadFields = getUploadFields(presign);
  const publicUrl = getPublicUrl(presign);

  if (!uploadUrl || !uploadFields || !publicUrl) {
    throw new ApiError(
      "اطلاعات آپلود از سرویس مدیا کامل نیست.",
      500,
      "INVALID_PRESIGN_RESPONSE"
    );
  }

  if (file.size > presign.maxSizeBytes) {
    throw new ApiError(
      "حجم تصویر بیشتر از حد مجاز سرویس مدیا است.",
      400,
      "FILE_TOO_LARGE"
    );
  }

  const formData = new FormData();

  Object.entries(uploadFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "ارتباط با آروان برای آپلود تصویر برقرار نشد.",
      0,
      "ARVAN_NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");

    throw new ApiError(
      errorText || "آپلود تصویر در آروان ناموفق بود.",
      response.status,
      "ARVAN_UPLOAD_FAILED",
      errorText
    );
  }

  return publicUrl;
}

export async function uploadProfilePhoto(file: File) {
  assertSupportedImage(file);

  const presign = await apiRequest<PresignedUploadResponse>(
    endpoints.media.profilePhotoPresign,
    {
      method: "POST",
      auth: true,
      body: {
        contentType: file.type,
      },
    }
  );

  return uploadToPresignedPost(file, presign);
}

export async function uploadDishImage(
  file: File,
  dishId: string | number = "draft"
) {
  assertSupportedImage(file);

  const presign = await apiRequest<PresignedUploadResponse>(
    endpoints.media.dishImagePresign,
    {
      method: "POST",
      auth: true,
      body: {
        contentType: file.type,
        dishId: String(dishId || "draft"),
      },
    }
  );

  return uploadToPresignedPost(file, presign);
}