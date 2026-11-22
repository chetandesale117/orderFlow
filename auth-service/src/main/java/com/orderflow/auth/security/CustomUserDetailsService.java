package com.orderflow.auth.security;

import com.orderflow.auth.entity.AuthCredential;
import com.orderflow.auth.repository.AuthCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthCredentialRepository authCredentialRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AuthCredential credential = authCredentialRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new User(
                credential.getEmail(),
                credential.getPasswordHash(),
                credential.getIsEnabled(),
                true,
                true,
                !credential.getIsLocked(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + credential.getRole().name()))
        );
    }
}
