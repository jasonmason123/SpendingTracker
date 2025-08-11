namespace SpendingTracker_API.DTOs.EntityDtos
{
    public class BudgetHistoryDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int BudgetId { get; set; }
        public string BudgetName { get; set; }
    }
}
