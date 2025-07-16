package vn.edu.fpt.spendingtracker_mobile.api_connector;

import android.content.SharedPreferences;
import android.util.Log;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okio.Buffer;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class AuthInterceptor implements Interceptor {
    private SharedPreferences prefs;

    public AuthInterceptor(SharedPreferences prefs) {
        this.prefs = prefs;
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        String token = prefs.getString(AppConstants.AUTH_TOKEN_NAME, null);
        Request originalRequest = chain.request();

        if (token == null) {
            return chain.proceed(originalRequest); // No token, proceed without auth
        }

        Request newRequest = originalRequest.newBuilder()
                .header("Authorization", "Bearer " + token)
                .build();

        Log.i("Request url", newRequest.url().toString());

        RequestBody requestBody = newRequest.body();
        if(requestBody != null) {
            Buffer buffer = new Buffer();
            requestBody.writeTo(buffer); // Write the body into the buffer
            String bodyString = buffer.readUtf8(); // Read it as UTF-8 string

            Log.i("Request body", bodyString); // Now it prints actual JSON
        }

        return chain.proceed(newRequest);
    }
}
