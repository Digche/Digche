export class ApiError extends Error {
  status: number;
  code?: string;
  backendMessage?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    backendMessage?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.backendMessage = backendMessage;
  }
}

export function getFallbackHttpErrorMessage(status: number) {
  if (status === 400) return "اطلاعات ارسال‌شده معتبر نیست.";
  if (status === 401) return "نشست کاربری منقضی شده یا وارد حساب نشده‌اید.";
  if (status === 403) return "شما اجازه انجام این عملیات را ندارید.";
  if (status === 404) return "اطلاعات موردنظر پیدا نشد.";
  if (status === 409) return "این عملیات با وضعیت فعلی قابل انجام نیست.";
  if (status === 422) return "اطلاعات فرم معتبر نیست.";
  if (status === 429) return "تعداد درخواست‌ها زیاد شده است. کمی بعد تلاش کنید.";
  if (status >= 500) return "خطای داخلی سرور رخ داده است.";

  return "درخواست ناموفق بود.";
}