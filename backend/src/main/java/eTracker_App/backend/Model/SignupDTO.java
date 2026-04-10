package eTracker_App.backend.Model;

import lombok.Data;

@Data
public class SignupDTO {
    private String userName;
    private String mobileNumber;
    private String password;
    private String emailId;
}
