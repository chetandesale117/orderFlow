package com.orderflow.auth.repository;

import com.orderflow.auth.entity.AuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthCredentialRepository extends JpaRepository<AuthCredential, UUID> {
    Optional<AuthCredential> findByEmail(String email);
    boolean existsByEmail(String email);
}
