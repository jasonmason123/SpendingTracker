package vn.edu.fpt.spendingtracker_mobile.api_connector;

import androidx.annotation.Nullable;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;
import vn.edu.fpt.spendingtracker_mobile.dtos.PagedListResult;
import vn.edu.fpt.spendingtracker_mobile.entities.Category;

public interface CategoryApiCaller {
    @GET("api/categories/get/{id}")
    Call<Category> get(@Path("id") int id);

    @GET("api/categories/get-list")
    Call<PagedListResult<Category>> getPagedList(
            @Query("searchString") @Nullable String searchString,
            @Query("pageNumber") int pageNumber,
            @Query("pageSize") int pageSize
    );

    @POST("api/categories/add")
    Call<Category> add(@Body Category transactionDto);

    @PUT("api/categories/update/{id}")
    Call<Category> update(@Path("id") int id, @Body Category transactionDto);

    @DELETE("api/categories/delete/{id}")
    Call<Category> delete(@Path("id") int id);
}
