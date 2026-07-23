package com.pos.auth.security;

import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class PosUserDetails implements UserDetails {

    private final UUID id;
    private final String username;
    private final String passwordHash;
    private final Role role;
    private final UUID storeId;
    private final String storeName;
    private final boolean active;

    public PosUserDetails(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.passwordHash = user.getPasswordHash();
        this.role = user.getRole();
        this.storeId = user.getStore() == null ? null : user.getStore().getId();
        this.storeName = user.getStore() == null ? null : user.getStore().getStoreName();
        this.active = user.isActive();
    }

    public PosUserDetails(
            UUID id,
            String username,
            String passwordHash,
            Role role,
            UUID storeId,
            String storeName,
            boolean active
    ) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.storeId = storeId;
        this.storeName = storeName;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public Role getRole() {
        return role;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public String getStoreName() {
        return storeName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
