using System.Security.Claims;

namespace SpendingTracker_API.Utils.UserRetriever
{
    public interface IUserRetriever
    {
        string UserId { get; }
        ClaimsPrincipal User { get; }
    }
}
