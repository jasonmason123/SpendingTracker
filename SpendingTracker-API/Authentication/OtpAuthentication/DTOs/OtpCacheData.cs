namespace SpendingTracker_API.Authentication.OtpAuthentication.DTOs
{
    public class OtpCacheData
    {
        public string? OtpCode { get; set; }
        public string? ConfirmationToken { get; set; }
        public string? UserId { get; set; }
        public int FailedAttempts { get; set; } = 0;
    }
}
