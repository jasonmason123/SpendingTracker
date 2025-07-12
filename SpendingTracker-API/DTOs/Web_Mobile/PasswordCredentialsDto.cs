namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class PasswordCredentialsDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public object? OtherData { get; set; }
    }
}
