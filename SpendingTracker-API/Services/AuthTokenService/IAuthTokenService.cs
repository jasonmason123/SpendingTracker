using SpendingTracker_API.Entities;
using System.Security.Claims;

namespace SpendingTracker_API.Services.AuthTokenService
{
    public interface IAuthTokenService
    {
        public string GenerateToken(AppUser user);
        public ClaimsPrincipal ValidateToken(string token);
    }
}
