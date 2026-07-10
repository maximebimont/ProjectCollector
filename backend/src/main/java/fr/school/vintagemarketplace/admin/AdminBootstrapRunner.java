package fr.school.vintagemarketplace.admin;

import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cree un compte administrateur de demonstration au demarrage, uniquement si
 * ADMIN_BOOTSTRAP_EMAIL et ADMIN_BOOTSTRAP_PASSWORD sont fournis (aucun
 * identifiant admin n'est jamais commite dans le depot, cf .env.example).
 * Sans ces variables, aucun compte n'est cree : il n'existe alors aucun
 * moyen d'obtenir un role ADMIN via l'API (register() force toujours
 * Role.USER), ce qui est le comportement attendu en production.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.email:}")
    private String bootstrapEmail;

    @Value("${app.admin.bootstrap.password:}")
    private String bootstrapPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (bootstrapEmail == null || bootstrapEmail.isBlank()
                || bootstrapPassword == null || bootstrapPassword.isBlank()) {
            return;
        }

        if (userRepository.existsByEmail(bootstrapEmail)) {
            return;
        }

        User admin = User.builder()
                .firstname("Admin")
                .lastname("Collector")
                .email(bootstrapEmail)
                .password(passwordEncoder.encode(bootstrapPassword))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);

        log.warn("Compte administrateur de demonstration cree ({}). "
                + "A ne jamais utiliser tel quel en production.", bootstrapEmail);
    }
}
