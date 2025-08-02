namespace SpendingTracker_API.Controllers.AuthenticationControllers.DTOs
{
    public class ResetPasswordRequestDto
    {
        public string UserId { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}
