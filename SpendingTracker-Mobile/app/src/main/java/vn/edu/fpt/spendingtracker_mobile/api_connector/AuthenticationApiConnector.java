package vn.edu.fpt.spendingtracker_mobile.api_connector;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import vn.edu.fpt.spendingtracker_mobile.dtos.AuthResponseDto;
import vn.edu.fpt.spendingtracker_mobile.dtos.GoogleIdTokenDto;
import vn.edu.fpt.spendingtracker_mobile.dtos.PasswordCredentialsDto;

public interface AuthenticationApiConnector {
    @POST("/api/auth/sign-in")
    Call<AuthResponseDto> signIn(@Body PasswordCredentialsDto credentials);

    @POST("/api/auth/sign-up")
    Call<AuthResponseDto> signUp(@Body PasswordCredentialsDto credentials);

    @POST("/api/auth/google/mobile-sign-in")
    Call<AuthResponseDto> googleSignIn(@Body GoogleIdTokenDto request);
}
