package com.pos.auth.services;

import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordApprovalService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordApprovalService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean matchesCurrentUserPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            return false;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof PosUserDetails details)) {
            throw new BadCredentialsException("Not authenticated");
        }
        User user = userRepository.findByUsernameIgnoreCase(details.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Not authenticated"));
        if (!user.isActive()) {
            throw new BadCredentialsException("Not authenticated");
        }
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }
}
