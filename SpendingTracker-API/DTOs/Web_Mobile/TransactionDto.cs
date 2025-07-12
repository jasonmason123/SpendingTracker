using SpendingTracker_API.Utils.Enums;

namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class TransactionDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Merchant { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
