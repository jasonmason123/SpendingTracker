using SpendingTracker_API.Utils.Enums;

namespace SpendingTracker_API.DTOs.EntityDtos
{
    public class BudgetDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public decimal BudgetAmount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public FlagBoolean FlagDel { get; set; } = FlagBoolean.FALSE;
        public ICollection<BudgetHistoryDto>? BudgetHistory { get; set; } = new List<BudgetHistoryDto>();
    }
}
