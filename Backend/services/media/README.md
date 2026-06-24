# Media Service

Central service for creating presigned image upload requests against Arvan Object Storage / S3-compatible storage.

## Setup

Create the local env file:

```bash
cp services/media/.env.example services/media/.env
```

Then fill these values in `services/media/.env`:

```env
ARVAN_ENDPOINT=https://YOUR_ARVAN_S3_ENDPOINT
ARVAN_ACCESS_KEY=YOUR_ARVAN_ACCESS_KEY
ARVAN_SECRET_KEY=YOUR_ARVAN_SECRET_KEY
ARVAN_BUCKET=YOUR_BUCKET_NAME
ARVAN_PUBLIC_BASE_URL=
```

`JWT_SECRET` must match the auth-service `JWT_SECRET`.

## Public Endpoints

All public endpoints require an auth-service access token.

### Presign Profile Photo

```http
POST /media/profile-photo/presign
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "contentType": "image/png"
}
```

### Presign Dish Image

```http
POST /media/dish-images/presign
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "contentType": "image/webp",
  "dishId": "dish-id-or-draft"
}
```

## Internal Endpoint

For future service-to-service calls from core or other services:

```http
POST /media/internal/images/presign
x-internal-api-key: <MEDIA_INTERNAL_API_KEY>
Content-Type: application/json
```

```json
{
  "target": "dish_image",
  "contentType": "image/jpeg",
  "dishId": "dish-id"
}
```

## Upload Flow

1. Call one of the presign endpoints.
2. Upload the file directly to `uploadUrl` using multipart form fields from `uploadFields`.
3. Store `publicUrl` in the owning service, for example auth `photoUrl` or future core dish image fields.

The response also includes snake_case aliases (`upload_url`, `upload_fields`, `public_url`) for compatibility.
