package com.pos.auth.security;

import com.pos.auth.config.PosSecurityProperties;
import com.pos.auth.models.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        PosSecurityProperties properties = new PosSecurityProperties();
        properties.getJwt().setSecret("test-jwt-secret-key-at-least-32-bytes-long!!");
        properties.getJwt().setCookieName("POS_TOKEN");
        properties.getJwt().setTtl(Duration.ofHours(1));
        jwtService = new JwtService(properties);
    }

    @Test
    void createAndParse_roundTripsClaims() {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000401");
        UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");

        String token = jwtService.createToken(userId, "admin", Role.ADMIN, storeId);
        JwtService.ParsedToken parsed = jwtService.parse(token);

        assertThat(parsed.userId()).isEqualTo(userId);
        assertThat(parsed.username()).isEqualTo("admin");
        assertThat(parsed.role()).isEqualTo(Role.ADMIN);
        assertThat(parsed.storeId()).isEqualTo(storeId);
    }

    @Test
    void parse_rejectsTamperedToken() {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000401");
        String token = jwtService.createToken(userId, "admin", Role.ADMIN, null);

        assertThatThrownBy(() -> jwtService.parse(token + "x"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
