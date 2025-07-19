package vn.edu.fpt.spendingtracker_mobile.dtos;

public class GoogleIdTokenDto {
    public String idToken;
    public boolean rememberMe;
    public String email;

    public GoogleIdTokenDto(String idToken, boolean rememberMe, String email) {
        this.idToken = idToken;
        this.rememberMe = rememberMe;
        this.email = email;
    }
}
