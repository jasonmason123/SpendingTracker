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
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;

public interface TransactionApiConnector {
    @GET("api/transaction/get/{id}")
    Call<Transaction> get(@Path("id") int id);

    @GET("api/transaction/get-list")
    Call<List<Transaction>> getPagedList(
            @Query("searchString") @Nullable String searchString,
            @Query("pageNumber") int pageNumber,
            @Query("pageSize") int pageSize
    );

    @POST("api/transaction/add")
    Call<Transaction> add(@Body Transaction transactionDto);

    @PUT("api/transaction/update/{id}")
    Call<Transaction> update(@Path("id") int id, @Body Transaction transactionDto);

    @DELETE("api/transaction/delete/{id}")
    Call<Transaction> delete(@Path("id") int id);
}
