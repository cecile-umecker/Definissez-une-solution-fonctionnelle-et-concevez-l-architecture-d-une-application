package com.yourcar.yourway.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yourcar.yourway.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

}
