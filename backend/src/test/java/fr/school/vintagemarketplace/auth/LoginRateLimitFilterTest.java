package fr.school.vintagemarketplace.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginRateLimitFilterTest {

    private static final String LOGIN_PATH = "/api/auth/login";

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private LoginRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new LoginRateLimitFilter(new ObjectMapper().registerModule(new JavaTimeModule()));
        lenient().when(request.getRemoteAddr()).thenReturn("192.168.1.10");
        lenient().when(request.getMethod()).thenReturn("POST");
        lenient().when(request.getRequestURI()).thenReturn(LOGIN_PATH);
    }

    @Test
    void shouldAllowUpToTheLimitThenBlock() throws Exception {
        PrintWriter writer = new PrintWriter(new StringWriter());
        when(response.getWriter()).thenReturn(writer);

        for (int i = 0; i < 10; i++) {
            filter.doFilterInternal(request, response, filterChain);
        }
        verify(filterChain, times(10)).doFilter(request, response);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(10)).doFilter(request, response);
        verify(response).setStatus(429);
    }

    @Test
    void shouldNotRateLimitOtherEndpoints() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/items");

        for (int i = 0; i < 20; i++) {
            filter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(20)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void shouldTrackAttemptsPerIpIndependently() throws Exception {
        PrintWriter writer = new PrintWriter(new StringWriter());
        lenient().when(response.getWriter()).thenReturn(writer);

        for (int i = 0; i < 10; i++) {
            filter.doFilterInternal(request, response, filterChain);
        }
        filter.doFilterInternal(request, response, filterChain);
        verify(response).setStatus(429);

        HttpServletRequest otherIpRequest = mock(HttpServletRequest.class);
        when(otherIpRequest.getRemoteAddr()).thenReturn("10.0.0.5");
        when(otherIpRequest.getMethod()).thenReturn("POST");
        when(otherIpRequest.getRequestURI()).thenReturn(LOGIN_PATH);

        filter.doFilterInternal(otherIpRequest, response, filterChain);

        verify(filterChain, times(10)).doFilter(request, response);
        verify(filterChain).doFilter(otherIpRequest, response);
    }

    @Test
    void shouldWriteAFrenchJsonErrorBodyWhenBlocked() throws Exception {
        StringWriter body = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(body));

        for (int i = 0; i < 11; i++) {
            filter.doFilterInternal(request, response, filterChain);
        }

        assertThat(body.toString()).contains("Trop de tentatives de connexion");
    }
}
