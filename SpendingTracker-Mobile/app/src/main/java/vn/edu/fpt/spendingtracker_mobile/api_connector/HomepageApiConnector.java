package vn.edu.fpt.spendingtracker_mobile.api_connector;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;
import vn.edu.fpt.spendingtracker_mobile.dtos.IncomeExpenseDto;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;

public interface HomepageApiConnector {
    @GET("api/statistics/get-income-expense-custom-range")
    Call<IncomeExpenseDto> getIncomeExpenseCustomRange(
        @Query("dateFrom") String dateFromString,
        @Query("dateTo") String dateToString
    );

    @GET("api/statistics/get-top-recent")
    Call<List<Transaction>> getTopRecentTransactions(@Query("top") int top);
}
