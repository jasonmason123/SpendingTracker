namespace SpendingTracker_API.Controllers.AuthenticationControllers.DTOs
{
    public class PasswordCredentialsDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public object? OtherData { get; set; }
    }
}
