package com.yourcar.yourway.service;

import com.yourcar.yourway.dto.LoginRequest;
import com.yourcar.yourway.dto.RegisterRequest;
import com.yourcar.yourway.dto.UserResponse;
import com.yourcar.yourway.model.User;
import com.yourcar.yourway.repository.UserRepository;
import com.yourcar.yourway.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest request) {
        var user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .address(request.address())
                .birthDate(request.birthDate())
                .role(request.role())
                .build();
        userRepository.save(user);
    }

    public ResponseCookie authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        
        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        
        String jwt = jwtService.generateToken(user);
        
        return ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Strict")
                .build();
    }

    public ResponseCookie logout() {
        return ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
    }

    public UserResponse getAuthenticatedUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication();
        
        User user = (User) authentication.getPrincipal();
        
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
        }
}