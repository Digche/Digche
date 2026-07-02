using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodOrdering.Core.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace FoodOrdering.Core.Infrastructure.Services
{
    public class UserServiceClient : IUserServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<UserServiceClient> _logger;

        public UserServiceClient(HttpClient httpClient, ILogger<UserServiceClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<AuthUserDto> GetUserInfoAsync(Guid userId, CancellationToken cancellation = default)
        {
            try
            {
                var response = await _httpClient.GetAsync($"internal/auth/users/{userId}", cancellation);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<AuthUserResponse>(cancellationToken: cancellation);
                    return result?.User;
                }

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("User with ID {UserId} not found in auth service.", userId);
                    return null;
                }

                _logger.LogError("Failed to get user info for {UserId}. Status: {Status}", userId, response.StatusCode);
                throw new HttpRequestException($"Failed to retrieve user with ID {userId}. Status code: {response.StatusCode}");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling auth service for {UserId}", userId);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error when calling auth service for {UserId}", userId);
                return null;
            }
        }
    }
}