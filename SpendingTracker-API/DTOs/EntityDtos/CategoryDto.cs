using SpendingTracker_API.Utils.Enums;

namespace SpendingTracker_API.DTOs.EntityDtos
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public FlagBoolean FlagDel { get; set; } = FlagBoolean.FALSE;
    }
}
