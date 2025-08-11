namespace SpendingTracker_API.Utils.NotificationService
{
    public interface INotificationSender
    {
        public Task SendAsync(string recipient, MessageStructureDto emailContent);
    }
}
