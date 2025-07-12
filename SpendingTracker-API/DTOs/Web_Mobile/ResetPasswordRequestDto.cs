namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class ResetPasswordRequestDto
    {
        public string UserId { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}
