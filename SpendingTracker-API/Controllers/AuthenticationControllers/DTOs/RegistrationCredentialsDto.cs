namespace SpendingTracker_API.Controllers.AuthenticationControllers.DTOs
{
    public class RegistrationCredentialsDto : PasswordCredentialsDto
    {
        public string? Username { get; set; }
        public string? RedirectUrl { get; set; }
    }
}
