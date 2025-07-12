using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Utils.Enums;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public interface IPasswordAuth
    {
        public Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials);
        public Task<RegistrationResult> RegisterAsync(PasswordCredentialsDto passwordCredentials, bool requiresVerification = false);
        public Task<AuthenticationResult> VerifyRegistrationAsync(string userId, string token);
        Task<bool> GenerateResetPasswordTokenAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest);
    }
}
