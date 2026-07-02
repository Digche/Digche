using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FoodOrdering.Core.Domain.Interfaces
{
    // ============================
    // DTO های مربوط به پاسخ سرویس Auth
    // ============================

    public class AuthUserResponse
    {
        public AuthUserDto User { get; set; }
    }

    public class AuthUserDto
    {
        public Guid Id { get; set; }
        public string Phone { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string DisplayName { get; set; }
        public string PhotoUrl { get; set; }
        public string Address { get; set; }        // شهر
        public List<string> Roles { get; set; }
        public bool HasCompletedProfile { get; set; }
        public int TokenVersion { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ChefInfoDto Chef { get; set; }      // اختیاری
    }

    public class ChefInfoDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // ============================
    // اینترفیس سرویس کلاینت
    // ============================

    public interface IUserServiceClient
    {
        Task<AuthUserDto> GetUserInfoAsync(Guid userId, CancellationToken cancellation = default);
    }
}