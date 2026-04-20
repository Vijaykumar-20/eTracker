package eTracker_App.backend.Controller;

import eTracker_App.backend.Model.Users;
import eTracker_App.backend.Model.SignupDTO;
import eTracker_App.backend.Model.LoginDTO;
import eTracker_App.backend.Service.loginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class loginController {

    private final loginService loginService;

    @Autowired
    public loginController(loginService loginService) {
        this.loginService = loginService;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleExceptions(Exception ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("ConstraintViolationException")) {
            return ResponseEntity.badRequest().body("Invalid input: Please verify mobile number is exactly 10 digits.");
        }
        return ResponseEntity.status(500).body("Server error: " + msg);
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupDTO signupDTO) {
        String response = loginService.signupUser(signupDTO);
        try {
            Long.parseLong(response);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<String> signin(@RequestBody LoginDTO loginDTO) {
        String loggedInUserId = loginService.signinUser(loginDTO);
        if (loggedInUserId != null) {
            return ResponseEntity.ok(loggedInUserId);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Users> getProfile(@PathVariable Long userId) {
        Optional<Users> user = loginService.getProfile(userId);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
