<div dir="rtl">

# راهنمای خیلی ساده آپلود و نمایش عکس پروفایل با Arvan Object Storage (MVP)

این سند برای تیمی نوشته شده که تجربه‌ی قبلی با Arvan Object Storage ندارد. ایده‌ی اصلی این است که **فایل عکس داخل بک‌اند آپلود نمی‌شود**؛ فرانت **مستقیم** عکس را داخل Arvan آپلود می‌کند و فقط **لینک عکس** در دیتابیس سرویس Profile ذخیره می‌شود.

## تصویر بزرگ ماجرا (چرا این کار را می‌کنیم؟)

- **Auth Service** فقط اطلاعات پایه‌ی کاربر را نگه می‌دارد (مثل `id`, `phone`, `first_name`, `last_name`, `username`, `roles`).
- **Profile Service** اطلاعات تکمیلی را نگه می‌دارد (مثل therapist/client details).
- **عکس پروفایل** یک فایل است و باید روی فضای ذخیره‌سازی (Arvan Object Storage) قرار بگیرد.
- در دیتابیس Profile فقط **`photo_url`** ذخیره می‌شود (آدرس عکس).

## مفاهیم لازم (خیلی خلاصه)

### Presign چیست؟
بک‌اند یک «مجوز موقت» به فرانت می‌دهد تا فرانت بتواند **مستقیم** روی Arvan آپلود کند.
این مجوز شامل:
- `upload_url`: آدرسی که باید به آن درخواست آپلود بزنیم
- `upload_fields`: فیلدهای امضا شده‌ای که باید دقیقاً همان‌ها ارسال شوند
- `public_url`: آدرس نهایی عکس (برای ذخیره داخل DB و نمایش در UI)
- `expires_in`: زمان اعتبار (کوتاه است؛ پس سریع باید آپلود شود)

## فلوی کامل آپلود عکس (اولین بار)

### 1) فرانت presign می‌گیرد (از Profile Service)
فرانت با JWT کاربر درخواست می‌زند:

`POST /profile/me/photo/presign`

Body:
```json
{ "content_type": "image/png" }
```

پاسخ نمونه:
```json
{
  "key": "avatars/<userId>/<uuid>.png",
  "upload_url": "https://s3....../<bucket>",
  "upload_fields": {
    "key": "...",
    "Content-Type": "image/png",
    "policy": "...",
    "x-amz-algorithm": "...",
    "x-amz-credential": "...",
    "x-amz-date": "...",
    "x-amz-signature": "..."
  },
  "public_url": "https://s3....../<bucket>/avatars/<userId>/<uuid>.png",
  "expires_in": 600
}
```

> نکته: `expires_in` یعنی این مجوز موقت است. اگر دیر اقدام کنید، خطای `Policy expired` می‌گیرید و باید دوباره presign بگیرید.

### 2) فرانت فایل را مستقیم به Arvan آپلود می‌کند (POST + FormData)

این مرحله **مهم‌ترین** بخش است:

- فرانت باید **تمام** فیلدهای `upload_fields` را دقیقاً اضافه کند.
- سپس فایل را با نام `file` اضافه کند.
- هیچ فیلدی را کم/زیاد/حدس نکند.

نمونه کد فرانت (Pseudo-code):
```js
// 1) گرفتن presign
const presign = await fetch("/profile/me/photo/presign", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ content_type: file.type }),
}).then((r) => r.json());

// 2) آپلود مستقیم به Arvan
const form = new FormData();
for (const [k, v] of Object.entries(presign.upload_fields)) {
  form.append(k, v);
}
form.append("file", file);

const uploadRes = await fetch(presign.upload_url, {
  method: "POST",
  body: form,
});

if (!uploadRes.ok) throw new Error("Upload failed");
```

✅ اگر موفق باشد معمولاً `204` یا `201` برمی‌گردد.

### 3) بعد از آپلود موفق، فرانت `photo_url` را در Profile DB ذخیره می‌کند

فرانت باید `public_url` را داخل پروفایل کاربر ثبت کند:

`PUT /profile/me`

Body:
```json
{
  "details": {
    "photo_url": "<public_url>"
  }
}
```

از این لحظه به بعد، عکس پروفایل برای کاربر ثبت شده است.

## تغییر عکس (Update Photo)

برای تغییر عکس، دقیقاً همین ۳ مرحله تکرار می‌شود:

1. گرفتن presign جدید
2. آپلود فایل جدید به Arvan
3. ذخیره‌ی `photo_url` جدید با `PUT /profile/me`

> در MVP لازم نیست عکس قبلی را پاک کنیم. فقط لینک جدید جایگزین می‌شود.

## نمایش عکس در فرانت (حالت عادی)

برای نمایش عکس کافی است فرانت پروفایل را بگیرد و `photo_url` را داخل `<img>` بگذارد:

- برای خود کاربر: `GET /profile/me`
- برای نمایش عمومی تراپیست: `GET /profile/therapists/:therapistId`

نمونه:
```html
<img src="{details.photo_url}" />
```

## نکته مهم درباره Public/Private بودن باکت

- اگر Object Storage شما **Private** باشد، باز کردن `photo_url` در مرورگر ممکن است `403` بدهد.
- برای MVP معمولاً یکی از این دو راه را داریم:
  1. اجازه‌ی `GET` روی مسیر عکس‌ها (مثلاً `avatars/*`) با Bucket Policy (خواندن عمومی)
  2. در آینده یک endpoint برای **Presigned GET** بسازیم تا لینک موقت نمایش بدهد

## خطاهای رایج (خیلی خلاصه)

- `401 Unauthorized`: توکن JWT درست نیست یا ارسال نشده
- `400 invalid content_type`: فرمت فایل غیرمجاز است (فقط png/jpg/webp)
- `403 Policy expired`: دیر آپلود کردید؛ دوباره presign بگیرید
- `403 AccessDenied`: فیلدهای `upload_fields` دقیق ارسال نشده‌اند (کم/زیاد/تغییر داده شده)

</div>
