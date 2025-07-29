using SpendingTracker_API.DTOs.Web_Mobile;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public interface IPasswordAuth
    {
        public Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials);
        public Task<RegistrationResult> RegisterAsync(RegistrationCredentialsDto registrationCredentials, bool requiresVerification = false);
        public Task<AuthenticationResult> VerifyRegistrationAsync(string userId, string token);
        Task<bool> GenerateResetPasswordTokenAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest);
    }
}
