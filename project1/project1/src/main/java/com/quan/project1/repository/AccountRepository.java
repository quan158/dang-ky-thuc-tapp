package com.quan.project1.repository;

import com.quan.project1.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AccountRepository extends JpaRepository<Account, String> {
        boolean existsByUsername(String username);
        Optional<Account> findByUsername(String username);
}
