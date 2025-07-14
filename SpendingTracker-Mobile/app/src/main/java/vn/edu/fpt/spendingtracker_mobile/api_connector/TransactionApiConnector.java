package vn.edu.fpt.spendingtracker_mobile.api_connector;

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
    @GET("/api/transaction/get/{id}")
    Call<Transaction> get(@Path("id") int id);

    @GET("api/transaction/get-list")
    Call<List<Transaction>> getList(@Query("pageNumber") int pagNumber, @Query("pageSize") int pageSize);

    @GET("api/transaction/search")
    Call<List<Transaction>> getList(@Query("searchString") String searchString, @Query("pageNumber") int pagNumber, @Query("pageSize") int pageSize);

    @POST("api/transaction/add")
    Call<Transaction> add(@Body Transaction transaction);

    @PUT("api/transaction/update")
    Call<Transaction> update(@Body Transaction transaction);

    @DELETE("api/transaction/delete/{id}")
    Call<Transaction> delete(@Path("id") int id);
}
