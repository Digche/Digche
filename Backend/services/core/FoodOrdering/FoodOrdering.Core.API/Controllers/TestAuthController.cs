using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FoodOrdering.Core.API.Controllers;

[ApiController]
[Route("api/core/test")]
public class TestAuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public TestAuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("token")]
    public IActionResult GetTestToken([FromQuery] string role = "customer")
    {
        // 1. کلید مخفی (مشترک با سرویس Auth)
        var secret = _configuration["Jwt:Secret"] 
            ?? throw new Exception("JWT Secret not configured");
        var key = Encoding.UTF8.GetBytes(secret);

        // 2. اطلاعات کاربر (مصنوعی)
        var userId = Guid.NewGuid();
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim("phoneNumber", "09121234567") // اختیاری
        };

        // 3. ساخت توکن
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwtToken = tokenHandler.WriteToken(token);

        return Ok(new
        {
            accessToken = jwtToken,
            userId = userId,
            role = role,
            message = "⚠️ This token is for TESTING only. Use in development environment."
        });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            service = "FoodOrdering Core API",
            environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Development"
        });
    }
}