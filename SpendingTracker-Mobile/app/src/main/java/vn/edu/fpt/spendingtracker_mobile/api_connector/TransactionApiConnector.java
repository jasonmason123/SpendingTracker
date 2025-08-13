package vn.edu.fpt.spendingtracker_mobile.api_connector;

import androidx.annotation.Nullable;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;
import vn.edu.fpt.spendingtracker_mobile.dtos.PagedListResult;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;

public interface TransactionApiConnector {
    @GET("api/transactions/get/{id}")
    Call<Transaction> get(@Path("id") int id);

    @GET("api/transactions/get-list")
    Call<PagedListResult<Transaction>> getPagedList(
            @Query("searchString") @Nullable String searchString,
            @Query("pageNumber") int pageNumber,
            @Query("pageSize") int pageSize
    );

    @POST("api/transactions/add")
    Call<Transaction> add(@Body Transaction transactionDto);

    @PUT("api/transactions/update/{id}")
    Call<Transaction> update(@Path("id") int id, @Body Transaction transactionDto);

    @DELETE("api/transactions/delete/{id}")
    Call<Transaction> delete(@Path("id") int id);
}
