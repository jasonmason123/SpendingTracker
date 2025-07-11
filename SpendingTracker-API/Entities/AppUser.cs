using Microsoft.AspNetCore.Identity;
using SpendingTracker_API.Utils.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpendingTracker_API.Entities
{
    [Table(nameof(AppUser))]
    public class AppUser : IdentityUser
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public FlagBoolean FlagDel { get; set; } = FlagBoolean.FALSE;
    }
}
