namespace SpendingTracker_API.Controllers.StatisticsController.DTOs
{
    public class IncomeExpenseResult
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public decimal Income { get; set; }
        public decimal? Expense { get; set; }
    }
}
