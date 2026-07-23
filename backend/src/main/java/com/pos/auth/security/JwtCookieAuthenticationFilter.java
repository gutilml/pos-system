package com.pos.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtCookieAuthenticationFilter extends OncePerRequestFilter {

    private final AuthCookieService authCookieService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtCookieAuthenticationFilter(
            AuthCookieService authCookieService,
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.authCookieService = authCookieService;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = authCookieService.readJwtCookie(request.getCookies());
            if (token != null && !token.isBlank()) {
                try {
                    JwtService.ParsedToken parsed = jwtService.parse(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(parsed.username());
                    if (userDetails.isEnabled() && userDetails.isAccountNonLocked()) {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (IllegalArgumentException ignored) {
                    // Invalid token → leave unauthenticated; protected routes return 401.
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
