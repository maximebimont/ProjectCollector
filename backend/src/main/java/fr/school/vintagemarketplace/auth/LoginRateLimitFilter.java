package fr.school.vintagemarketplace.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limite les tentatives de connexion a 10 par minute et par IP, pour freiner
 * le brute-force sur /api/auth/login. Buckets en memoire (une seule
 * instance backend pour ce POC, pas besoin d'un store partage type Redis).
 */
@Component
@RequiredArgsConstructor
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final int MAX_ATTEMPTS_PER_MINUTE = 10;

    private final ObjectMapper objectMapper;

    private final Map<String, Bucket> bucketsByIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (!"POST".equalsIgnoreCase(request.getMethod()) || !LOGIN_PATH.equals(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        Bucket bucket = bucketsByIp.computeIfAbsent(resolveClientIp(request), ip -> newBucket());

        if (!bucket.tryConsume(1)) {
            writeTooManyRequests(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * En Docker Compose, le backend n'est plus expose sur l'hote (ports
     * retires de docker-compose.yml) : seule la gateway Nginx peut
     * l'atteindre, et c'est elle qui pose X-Forwarded-For avec l'IP reelle
     * du client (voir infra/gateway/nginx.conf). Aucun client externe ne
     * peut donc forger ce header directement au backend. Sans cette
     * garantie (backend joignable directement), faire confiance a ce
     * header serait une faille : n'importe qui pourrait le falsifier pour
     * obtenir un nouveau bucket a chaque requete et contourner la limite.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.classic(
                MAX_ATTEMPTS_PER_MINUTE,
                Refill.greedy(MAX_ATTEMPTS_PER_MINUTE, Duration.ofMinutes(1))
        );

        return Bucket.builder().addLimit(limit).build();
    }

    private void writeTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now(ZoneId.systemDefault()));
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        body.put("error", "Too Many Requests");
        body.put("message", "Trop de tentatives de connexion, veuillez reessayer dans une minute");

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
