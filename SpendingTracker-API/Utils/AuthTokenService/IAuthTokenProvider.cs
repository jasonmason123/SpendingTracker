using SpendingTracker_API.Entities;
using System.Security.Claims;

namespace SpendingTracker_API.Utils.AuthTokenService
{
    public interface IAuthTokenProvider
    {
        public string GenerateToken(AppUser user);
        public ClaimsPrincipal ValidateToken(string token);
    }
}
