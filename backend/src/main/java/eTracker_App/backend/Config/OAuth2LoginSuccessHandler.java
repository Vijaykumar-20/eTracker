package eTracker_App.backend.Config;

import eTracker_App.backend.Model.Users;
import eTracker_App.backend.Repository.loginRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final loginRepository loginRepo;
    private final PasswordEncoder passwordEncoder;

    public OAuth2LoginSuccessHandler(loginRepository loginRepo, PasswordEncoder passwordEncoder) {
        this.loginRepo = loginRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<Users> userOpt = loginRepo.findByEmailId(email);
        Users user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = new Users();
            user.setUserName(name);
            user.setEmailId(email);
            // Default password for OAuth users (hashed for security)
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            // Mobile number is left null for Google users
            user = loginRepo.save(user);
        }

        // Redirect to frontend with the userId (internal database ID)
        String targetUrl = "http://localhost:5173/login-success?userId=" + user.getId();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
