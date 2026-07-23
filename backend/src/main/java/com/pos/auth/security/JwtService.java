package com.pos.auth.security;

import com.pos.auth.config.PosSecurityProperties;
import com.pos.auth.models.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final PosSecurityProperties properties;
    private final SecretKey key;

    public JwtService(PosSecurityProperties properties) {
        this.properties = properties;
        byte[] secretBytes = properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(secretBytes);
    }

    public String createToken(UUID userId, String username, Role role, UUID storeId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(properties.getJwt().getTtl());

        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("username", username)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry));

        if (storeId != null) {
            builder.claim("storeId", storeId.toString());
        }

        return builder.signWith(key).compact();
    }

    public ParsedToken parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            UUID userId = UUID.fromString(claims.getSubject());
            String username = claims.get("username", String.class);
            Role role = Role.valueOf(claims.get("role", String.class));
            String storeIdValue = claims.get("storeId", String.class);
            UUID storeId = storeIdValue == null ? null : UUID.fromString(storeIdValue);
            return new ParsedToken(userId, username, role, storeId);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid JWT", ex);
        }
    }

    public record ParsedToken(UUID userId, String username, Role role, UUID storeId) {
    }
}
