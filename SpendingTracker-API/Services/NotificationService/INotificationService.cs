namespace SpendingTracker_API.Services.NotificationService
{
    public interface INotificationService
    {
        public Task SendAsync(string recipient, MessageStructureDto emailContent);
    }
}
