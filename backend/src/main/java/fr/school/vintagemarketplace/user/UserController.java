package fr.school.vintagemarketplace.user;

import fr.school.vintagemarketplace.user.dto.UserResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal User user) {
        return UserResponse.from(user);
    }
}