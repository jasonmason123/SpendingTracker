package vn.edu.fpt.spendingtracker_mobile.api_connector;

import java.util.Date;
import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;
import vn.edu.fpt.spendingtracker_mobile.dtos.IncomeExpenseDto;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;

public interface HomepageApiConnector {
    @GET("api/homepage/get-income-expense-by-period")
    Call<IncomeExpenseDto> getIncomeExpenseByPeriod(
        @Query("dateFrom") String dateFromString,
        @Query("dateTo") String dateToString
    );

    @GET("api/homepage/get-top-3-recent")
    Call<List<Transaction>> getTopThreeRecentTransactions();
}
