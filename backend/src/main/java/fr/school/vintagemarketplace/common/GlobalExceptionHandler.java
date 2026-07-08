package fr.school.vintagemarketplace.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException exception
    ) {
        log.warn("Requete rejetee (400) : {}", exception.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(400, "Bad Request", exception.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(
            BadCredentialsException exception
    ) {
        log.warn("Tentative d'authentification refusee (401)");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildErrorResponse(401, "Unauthorized", "Email ou mot de passe incorrect"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException exception
    ) {
        Map<String, Object> errors = new HashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now(ZoneId.systemDefault()));
        response.put("status", 400);
        response.put("error", "Validation Error");
        response.put("messages", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(
            DataIntegrityViolationException exception
    ) {
        log.warn("Contrainte de donnees violee (409) : {}", exception.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildErrorResponse(409, "Conflict", "Une contrainte de données a été violée"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception exception
    ) {
        log.error("Erreur interne non geree (500)", exception);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(500, "Internal Server Error", "Une erreur interne est survenue"));
    }

    private Map<String, Object> buildErrorResponse(int status, String error, Object message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now(ZoneId.systemDefault()));
        response.put("status", status);
        response.put("error", error);
        response.put("message", message);
        return response;
    }
}
