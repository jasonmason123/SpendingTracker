using SpendingTracker_API.Utils.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpendingTracker_API.Entities
{
    [Table(nameof(Transaction))]
    public class Transaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Merchant { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        [ForeignKey(nameof(AppUser))]
        public string UserId { get; set; }
        public AppUser? User { get; set; }
        [ForeignKey(nameof(Category))]
        public int CategoryId { get; set; }
        public Category? TransactionCategory { get; set; }
    }
}
