package com.pos.auth.controllers;

import com.pos.auth.dtos.CsrfTokenResponseDTO;
import com.pos.auth.dtos.LoginRequestDTO;
import com.pos.auth.dtos.UserResponseDTO;
import com.pos.auth.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/csrf")
    public CsrfTokenResponseDTO csrf(CsrfToken csrfToken) {
        return new CsrfTokenResponseDTO(csrfToken.getToken());
    }

    @PostMapping("/login")
    public UserResponseDTO login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletResponse response
    ) {
        return authService.login(request, response);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        authService.logout(response);
    }

    @GetMapping("/me")
    public UserResponseDTO me() {
        return authService.me();
    }
}
