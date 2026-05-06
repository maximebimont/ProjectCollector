package fr.school.vintagemarketplace.auth;

import fr.school.vintagemarketplace.auth.dto.AuthResponse;
import fr.school.vintagemarketplace.auth.dto.LoginRequest;
import fr.school.vintagemarketplace.auth.dto.RegisterRequest;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet email");
        }

        User user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return toAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        String token = jwtService.generateToken(user);

        return toAuthResponse(user, token);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getRole()
        );
    }
}