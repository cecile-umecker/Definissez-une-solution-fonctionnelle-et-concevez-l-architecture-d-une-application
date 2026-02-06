package com.yourcar.yourway.dto;

public record UserResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String role
) {}