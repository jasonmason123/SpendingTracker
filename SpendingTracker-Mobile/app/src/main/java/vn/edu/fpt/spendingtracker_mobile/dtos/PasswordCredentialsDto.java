package vn.edu.fpt.spendingtracker_mobile.dtos;

public class PasswordCredentialsDto {
    public String email;
    public String password;
    public Object otherData;

    public PasswordCredentialsDto() {
    }

    public PasswordCredentialsDto(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public PasswordCredentialsDto(String email, String password, Object otherData) {
        this.email = email;
        this.password = password;
        this.otherData = otherData;
    }
}
