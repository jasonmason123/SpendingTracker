namespace SpendingTracker_API.DTOs.Statistics
{
    public class IncomeExpenseResult
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public decimal Income { get; set; }
        public decimal? Expense { get; set; }
    }
}
