using Microsoft.AspNetCore.Identity;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Messages;
using System.Security.Claims;

namespace SpendingTracker_API.Utils.UserRetriever
{
    public class UserClaimsRetriever : IUserClaimsRetriever
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<AppUser> _userManager;

        public UserClaimsRetriever(
            IHttpContextAccessor httpContextAccessor,
            UserManager<AppUser> userManager)
        {
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
        }

        /// <summary>
        /// sets the UserId to the current user's Id
        /// </summary>
        public string UserId =>
            _userManager.GetUserId(_httpContextAccessor.HttpContext?.User)
            ?? throw new InvalidOperationException(ErrorMessages.USER_NOT_AUTHENTICATED);

        /// <summary>
        /// get the current user's ClaimsPrincipal
        /// </summary>
        public ClaimsPrincipal User
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                if (user == null)
                {
                    throw new InvalidOperationException(ErrorMessages.USER_NOT_AUTHENTICATED);
                }
                return user;
            }
        }
    }
}
