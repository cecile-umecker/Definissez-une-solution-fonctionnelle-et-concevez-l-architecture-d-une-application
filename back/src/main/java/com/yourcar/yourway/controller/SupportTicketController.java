package com.yourcar.yourway.controller;

import com.yourcar.yourway.dto.TicketListDTO;
import com.yourcar.yourway.model.SupportTicket;
import com.yourcar.yourway.model.User;
import com.yourcar.yourway.repository.SupportTicketRepository;
import com.yourcar.yourway.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SupportTicketController {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    @PostMapping("/create")
    public SupportTicket createTicket(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String subject = (String) payload.get("subject");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(subject);
        ticket.setUser(user);
        ticket.setStatus(true); // true = ouvert
        ticket.setCreatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    @GetMapping("/my")
    public List<TicketListDTO> getMyTickets(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(t -> new TicketListDTO(t.getId(), t.getSubject(), t.getStatus(), t.getCreatedAt()))
                .toList();
    }

    @GetMapping("/all")
    public List<TicketListDTO> getAllTickets() {
        // On transforme les entités en DTO pour que l'Agent ait le même format que le Client
        return ticketRepository.findAll().stream()
                .map(t -> new TicketListDTO(
                    t.getId(), 
                    t.getSubject(), 
                    t.getStatus(), 
                    t.getCreatedAt()
                ))
                .toList();
    }
}