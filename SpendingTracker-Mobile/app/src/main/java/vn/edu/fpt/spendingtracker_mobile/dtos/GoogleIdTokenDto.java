package vn.edu.fpt.spendingtracker_mobile.dtos;

public class GoogleIdTokenDto {
    public String idToken;
    public boolean rememberMe;

    public GoogleIdTokenDto(String idToken, boolean rememberMe) {
        this.idToken = idToken;
        this.rememberMe = rememberMe;
    }
}
