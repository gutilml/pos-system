package com.pos.auth.services;

import com.pos.auth.dtos.LoginRequestDTO;
import com.pos.auth.dtos.UserResponseDTO;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.AuthCookieService;
import com.pos.auth.security.JwtService;
import com.pos.auth.security.PosUserDetails;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthCookieService authCookieService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authCookieService = authCookieService;
    }

    @Transactional(readOnly = true)
    public UserResponseDTO login(LoginRequestDTO request, HttpServletResponse response) {
        User user = userRepository.findByUsernameIgnoreCase(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        var store = user.getStore();
        String token = jwtService.createToken(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                store == null ? null : store.getId()
        );
        authCookieService.writeJwtCookie(response, token);
        return toResponse(user);
    }

    public void logout(HttpServletResponse response) {
        authCookieService.clearJwtCookie(response);
        SecurityContextHolder.clearContext();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof PosUserDetails details)) {
            throw new BadCredentialsException("Not authenticated");
        }
        User user = userRepository.findByUsernameIgnoreCase(details.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Not authenticated"));
        if (!user.isActive()) {
            throw new BadCredentialsException("Not authenticated");
        }
        return toResponse(user);
    }

    private static UserResponseDTO toResponse(User user) {
        var store = user.getStore();
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                store == null ? null : store.getId(),
                store == null ? null : store.getStoreName(),
                user.isActive()
        );
    }
}
