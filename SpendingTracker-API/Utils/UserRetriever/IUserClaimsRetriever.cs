using System.Security.Claims;

namespace SpendingTracker_API.Utils.UserRetriever
{
    public interface IUserClaimsRetriever
    {
        string UserId { get; }
        ClaimsPrincipal User { get; }
    }
}
