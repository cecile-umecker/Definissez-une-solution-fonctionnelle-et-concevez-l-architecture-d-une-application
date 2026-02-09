package com.yourcar.yourway.dto;
import java.time.LocalDate;

public record RegisterRequest(
    String firstName,
    String lastName,
    String email,
    String password,
    String address,
    LocalDate birthDate,
    String role
) {}