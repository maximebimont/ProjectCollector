package fr.school.vintagemarketplace.common;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldHandleIllegalArgumentException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleIllegalArgumentException(new IllegalArgumentException("Objet introuvable"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("status", 400);
        assertThat(response.getBody()).containsEntry("error", "Bad Request");
        assertThat(response.getBody()).containsEntry("message", "Objet introuvable");
        assertThat(response.getBody()).containsKey("timestamp");
    }

    @Test
    void shouldHandleBadCredentialsException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleBadCredentialsException(new BadCredentialsException("bad creds"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).containsEntry("status", 401);
        assertThat(response.getBody()).containsEntry("message", "Email ou mot de passe incorrect");
    }

    @Test
    void shouldHandleDisabledException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleDisabledException(new DisabledException("disabled"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).containsEntry("status", 401);
        assertThat(response.getBody()).containsEntry("message", "Ce compte a ete desactive par un administrateur");
    }

    @Test
    void shouldHandleAccessDeniedException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDeniedException(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("status", 403);
        assertThat(response.getBody()).containsEntry("message", "Vous n'avez pas les droits necessaires pour cette action");
    }

    @Test
    void shouldHandleValidationException() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "registerRequest");
        bindingResult.addError(new FieldError("registerRequest", "email", "L'email est obligatoire"));

        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandler.class.getDeclaredMethod(
                        "handleValidationException", MethodArgumentNotValidException.class
                ),
                0
        );
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Validation Error");

        @SuppressWarnings("unchecked")
        Map<String, Object> messages = (Map<String, Object>) response.getBody().get("messages");
        assertThat(messages).containsEntry("email", "L'email est obligatoire");
    }

    @Test
    void shouldHandleDataIntegrityViolationException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleDataIntegrityViolationException(new DataIntegrityViolationException("constraint"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message", "Une contrainte de données a été violée");
    }

    @Test
    void shouldHandleGenericException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleGenericException(new RuntimeException("boom"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("message", "Une erreur interne est survenue");
    }
}
