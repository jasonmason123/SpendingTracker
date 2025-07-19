package vn.edu.fpt.spendingtracker_mobile;

import android.app.Application;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class MyApp extends Application {
    private static volatile Retrofit retrofit;

    @Override
    public void onCreate() {
        super.onCreate();
        // Initialize SharedPreferences
        SharedPreferences sharedPreferences =
                getSharedPreferences(AppConstants.AUTH_PREFERENCE_NAME, MODE_PRIVATE);

        // Configure OkHttp with auth token interceptor
        OkHttpClient client = new OkHttpClient.Builder()
            .addInterceptor(new Interceptor() {
                @NonNull
                @Override
                public okhttp3.Response intercept(@NonNull Chain chain) throws IOException {
                    String token = sharedPreferences.getString(AppConstants.AUTH_TOKEN_NAME, null);
                    Request.Builder requestBuilder = chain.request().newBuilder();
                    if (token != null) {
                        requestBuilder.addHeader("Authorization", "Bearer " + token);
                    }
                    return chain.proceed(requestBuilder.build());
                }
            })
            .build();

        // Initialize Retrofit
        retrofit = new Retrofit.Builder()
                .baseUrl(AppConstants.API_DOMAIN)
                .addConverterFactory(
                        GsonConverterFactory.create(AppConstants.GSON_CONFIG))
                .client(client)
                .build();
    }

    public static <T> T getApiConnector(Class<T> serviceClass) {
        if (retrofit == null) {
            throw new IllegalStateException("Retrofit not initialized. Ensure MyApp.onCreate is called.");
        }
        return retrofit.create(serviceClass);
    }
}
