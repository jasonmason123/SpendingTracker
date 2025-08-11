using SpendingTracker_API.DTOs.Web_Mobile.Authentication;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public interface IPasswordAuth
    {
        public Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials);
        public Task<RegistrationResult> RegisterAsync(RegistrationCredentialsDto registrationCredentials, bool requiresVerification = false);
        Task RequestResetPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest);
    }
}
