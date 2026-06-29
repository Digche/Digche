using System;

namespace FoodOrdering.Core.Domain.Interfaces;


/// <summary>
/// سرویس برای دریافت اطلاعات کاربر جاری از HttpContext
/// </summary>
public interface IUserContext
{
    /// <summary>
    /// تلاش برای دریافت شناسه کاربر جاری (بدون پرتاب استثناء)
    /// </summary>
    /// <param name="userId">شناسه کاربر در صورت موفقیت</param>
    /// <returns>در صورت موفقیت true، در غیر این صورت false</returns>
    bool TryGetCurrentUserId(out Guid userId);

    /// <summary>
    /// دریافت شناسه کاربر جاری (در صورت عدم وجود، استثناء پرتاب می‌کند)
    /// </summary>
    /// <exception cref="UnauthorizedAccessException">در صورت احراز نشدن کاربر یا نبودن شناسه</exception>
    Guid GetCurrentUserId();

    /// <summary>
    /// دریافت نقش کاربر جاری (در صورت وجود)
    /// </summary>
    string? GetCurrentUserRole();

    /// <summary>
    /// بررسی احراز هویت کاربر
    /// </summary>
    bool IsAuthenticated();
}