package com.pos.auth.security;

import com.pos.auth.config.PosSecurityProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {

    private final PosSecurityProperties properties;

    public AuthCookieService(PosSecurityProperties properties) {
        this.properties = properties;
    }

    public void writeJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = baseCookie(token)
                .maxAge(properties.getJwt().getTtl())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearJwtCookie(HttpServletResponse response) {
        ResponseCookie cookie = baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public String readJwtCookie(Cookie[] cookies) {
        if (cookies == null) {
            return null;
        }
        String name = properties.getJwt().getCookieName();
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(properties.getJwt().getCookieName(), value)
                .httpOnly(true)
                .secure(properties.getCookie().isSecure())
                .path("/")
                .sameSite(properties.getCookie().getSameSite());
    }
}
