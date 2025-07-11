using SpendingTracker_API.Utils.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpendingTracker_API.Entities
{
    [Table(nameof(Transaction))]
    public class Transaction
    {
        private decimal _amount;

        [Key]
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Merchant { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount {
            get => _amount;
            set
            {
                if(TransactionType == TransactionType.INCOME && value < 0)
                    _amount = Math.Abs(value);
                else if (TransactionType == TransactionType.EXPENSE && value > 0)
                    _amount = -value;
            }
        }
        public TransactionType TransactionType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        [ForeignKey(nameof(AppUser))]
        public string UserId { get; set; }
        public AppUser? User { get; set; }
    }
}
