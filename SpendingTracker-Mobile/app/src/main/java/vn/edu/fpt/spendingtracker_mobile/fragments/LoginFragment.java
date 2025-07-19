package vn.edu.fpt.spendingtracker_mobile.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.api_connector.AuthenticationApiConnector;
import vn.edu.fpt.spendingtracker_mobile.dtos.AuthResponseDto;
import vn.edu.fpt.spendingtracker_mobile.dtos.GoogleIdTokenDto;
import vn.edu.fpt.spendingtracker_mobile.dtos.PasswordCredentialsDto;
import vn.edu.fpt.spendingtracker_mobile.utils.HelperMethods;

public class LoginFragment extends BaseFragment {
    @Override
    protected boolean shouldShowBottomNavigation() {
        return false;
    }

    // callback method implemented by MainActivity
    public interface LoginFragmentListener {
        public void onAuthenticationCompleted(String authToken, String email);
    }
    private LoginFragmentListener listener;
    private EditText emailEditText;
    private EditText passwordEditText;
    private TextView errorMessageTextView;
    private Retrofit retrofit;
    private GoogleSignInClient mGoogleSignInClient;
    private AuthenticationApiConnector apiConnector;
    private static final int RC_SIGN_IN = 1001;

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        listener = (LoginFragmentListener) activity;
    }

    @Override
    public void onDetach() {
        super.onDetach();
        listener = null;
    }

    @Override
    public View onCreateView(LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        super.onCreateView(inflater, container, savedInstanceState);
        setRetainInstance(true);

        View view = inflater.inflate(R.layout.fragment_login, container,false);
        emailEditText = (EditText) view.findViewById(R.id.emailEditText);
        passwordEditText = (EditText) view.findViewById(R.id.passwordEditText);
        errorMessageTextView = (TextView) view.findViewById(R.id.errorMessageTextView);
        Button loginButton = (Button) view.findViewById(R.id.loginButton);
        loginButton.setOnClickListener(loginButtonClicked);
        Button loginWithGoogleButton = (Button) view.findViewById(R.id.loginWithGoogleButton);
        loginWithGoogleButton.setOnClickListener(loginWithGoogleButtonClicked);
        Button signupButton = (Button) view.findViewById(R.id.signupButton);
        signupButton.setOnClickListener(signupButtonClicked);

        //Initialize api connector
        apiConnector = MyApp.getApiConnector(AuthenticationApiConnector.class);

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(requireActivity(), gso);

        return view;
    }

    // responds to event generated when the user logs-in
    View.OnClickListener loginButtonClicked = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            String email = emailEditText.getText().toString().trim();
            String password = passwordEditText.getText().toString().trim();
            if(email.length() != 0 && password.length() != 0) {
                login(email, password);
            } else {
                new AlertDialog.Builder(requireContext())
                        .setMessage(R.string.error_message)
                        .setPositiveButton(R.string.ok, null)
                        .show();
            }
        }
    };

    View.OnClickListener signupButtonClicked = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            String email = emailEditText.getText().toString().trim();
            String password = passwordEditText.getText().toString().trim();
            if(email.length() != 0 && password.length() != 0) {
                signup(email, password);
            } else {
                HelperMethods.showMessageDialog(R.string.error_message, requireContext());
            }
        }
    };

    View.OnClickListener loginWithGoogleButtonClicked = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            startActivityForResult(signInIntent, RC_SIGN_IN);
        }
    };

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                if (account != null) {
                    String idToken = account.getIdToken();
                    Log.d("GoogleLogin", "ID Token: " + idToken);
                    loginWithGoogle(new GoogleIdTokenDto(idToken, true, account.getEmail())); // 👈 Call your backend
                }
            } catch (ApiException e) {
                Log.e("GoogleLogin", "Sign-in failed: " + e.getMessage());
            }
        }
    }

    private void login(String email, String password) {
        PasswordCredentialsDto credentials = new PasswordCredentialsDto(email, password);
        apiConnector.signIn(credentials).enqueue(new Callback<AuthResponseDto>() {
            @Override
            public void onResponse(Call<AuthResponseDto> call, Response<AuthResponseDto> response) {
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponseDto auth = response.body();
                    listener.onAuthenticationCompleted(auth.token, email);
                } else {
                    // Handle invalid credentials, 401, etc.
                    try {
                        String error = response.errorBody().string();
                        Log.e("Login", "Failed: " + error);
                        if(errorMessageTextView.getVisibility() != View.VISIBLE)
                            errorMessageTextView.setVisibility(View.VISIBLE);
                        errorMessageTextView.setText(error);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void onFailure(Call<AuthResponseDto> call, Throwable t) {
                Log.e("Login", "Network or parse error: " + t.getMessage());
            }
        });
    }

    private void signup(String email, String password) {
        PasswordCredentialsDto credentials = new PasswordCredentialsDto(email, password);
        apiConnector.signUp(credentials).enqueue(new Callback<AuthResponseDto>() {
            @Override
            public void onResponse(Call<AuthResponseDto> call, Response<AuthResponseDto> response) {
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponseDto auth = response.body();
                    listener.onAuthenticationCompleted(auth.token, email);
                } else {
                    // Handle invalid credentials, 401, etc.
                    try {
                        String error = response.errorBody().string();
                        Log.e("Signup", "Failed: " + error);
                        if(errorMessageTextView.getVisibility() != View.VISIBLE)
                            errorMessageTextView.setVisibility(View.VISIBLE);
                        errorMessageTextView.setText(error);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void onFailure(Call<AuthResponseDto> call, Throwable t) {
                Log.e("Login", "Network or parse error: " + t.getMessage());
            }
        });
    }

    private void loginWithGoogle(GoogleIdTokenDto token) {
        apiConnector.googleSignIn(token).enqueue(new Callback<AuthResponseDto>() {
            @Override
            public void onResponse(Call<AuthResponseDto> call, Response<AuthResponseDto> response) {
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponseDto auth = response.body();
                    listener.onAuthenticationCompleted(auth.token, token.email); // notify activity
                } else {
                    try {
                        String error = response.errorBody().string();
                        Log.e("GoogleLogin", "Failed: " + response.errorBody().string());
                        if(errorMessageTextView.getVisibility() != View.VISIBLE)
                            errorMessageTextView.setVisibility(View.VISIBLE);
                        errorMessageTextView.setText(error);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void onFailure(Call<AuthResponseDto> call, Throwable t) {
                Log.e("GoogleLogin", "Error: " + t.getMessage());
            }
        });
    }
}
