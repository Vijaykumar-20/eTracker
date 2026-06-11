package eTracker_App.backend.Service;

import eTracker_App.backend.Model.Users;
import eTracker_App.backend.Model.SignupDTO;
import eTracker_App.backend.Model.LoginDTO;
import eTracker_App.backend.Repository.loginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class loginService {

    private final loginRepository loginRepo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public loginService(loginRepository loginRepo, PasswordEncoder passwordEncoder) {
        this.loginRepo = loginRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public String signupUser(SignupDTO signupDTO) {
        if (loginRepo.findByMobileNumber(signupDTO.getMobileNumber()).isPresent()) {
            return "User with this mobile number already exists.";
        }
        if (loginRepo.findByEmailId(signupDTO.getEmailId()).isPresent()) {
            return "User with this email ID already exists.";
        }
        Users newUser = new Users();
        newUser.setUserName(signupDTO.getUserName());
        newUser.setMobileNumber(signupDTO.getMobileNumber());
        newUser.setPassword(passwordEncoder.encode(signupDTO.getPassword()));
        newUser.setEmailId(signupDTO.getEmailId());
        
        newUser = loginRepo.save(newUser);
        return newUser.getId().toString();
    }

    public String signinUser(LoginDTO loginDTO) {
        Optional<Users> userOpt = loginRepo.findByMobileNumber(loginDTO.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = loginRepo.findByEmailId(loginDTO.getIdentifier());
        }
        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            if (passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
                return user.getId().toString();
            }
        }
        return null;
    }
    
    public Optional<Users> getProfile(Long userId) {
        return loginRepo.findById(userId);
    }

    public Optional<Users> findByMobileNumber(String mobileNumber) {
        return loginRepo.findByMobileNumber(mobileNumber);
    }

    public Users updateProfile(Long userId, String userName, String mobileNumber) {
        Optional<Users> userOpt = loginRepo.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }
        Users user = userOpt.get();
        if (userName != null && !userName.trim().isEmpty()) {
            user.setUserName(userName);
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            // Check if mobile number is already taken by another user
            Optional<Users> existing = loginRepo.findByMobileNumber(mobileNumber);
            if (existing.isPresent() && !existing.get().getId().equals(userId)) {
                throw new IllegalArgumentException("Mobile number is already registered by another user.");
            }
            user.setMobileNumber(mobileNumber);
        }
        return loginRepo.save(user);
    }
}
