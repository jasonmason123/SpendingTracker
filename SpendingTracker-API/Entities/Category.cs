using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Utils.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpendingTracker_API.Entities
{
    [Table(nameof(Category))]
    [Index(nameof(Name), nameof(UserId), IsUnique = true)]
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal MonthlyLimit { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public FlagBoolean FlagDel { get; set; } = FlagBoolean.FALSE;
        [ForeignKey(nameof(AppUser))]
        public string UserId { get; set; }
        public AppUser? User { get; set; }
    }
}
