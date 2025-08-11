using SpendingTracker_API.Utils.Enums;

namespace SpendingTracker_API.Repositories._FilterParams
{
    public class TransactionFilterParams
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public TransactionType? TransactionType { get; set; }
    }
}
