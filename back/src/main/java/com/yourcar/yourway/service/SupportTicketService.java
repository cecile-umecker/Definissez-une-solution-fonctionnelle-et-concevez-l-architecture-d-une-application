package com.yourcar.yourway.service;

import com.yourcar.yourway.dto.TicketListDTO;
import com.yourcar.yourway.model.SupportTicket;
import com.yourcar.yourway.model.User;
import com.yourcar.yourway.repository.SupportTicketRepository;
import com.yourcar.yourway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<TicketListDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<TicketListDTO> getTicketsByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public SupportTicket createTicket(Long userId, String subject) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(subject);
        ticket.setUser(user);
        ticket.setStatus(true);
        ticket.setCreatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    @Transactional
    public void closeTicket(Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        ticket.setStatus(false);
        ticketRepository.save(ticket);

        TicketStatusNotification notification = new TicketStatusNotification("TICKET_CLOSED", ticketId);

        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, notification);    }

    // Le mapper SOLID : centralisé et réutilisable
    private TicketListDTO mapToDTO(SupportTicket ticket) {
        return new TicketListDTO(
                ticket.getId(),
                ticket.getSubject(),
                ticket.getStatus(),
                ticket.getCreatedAt(),
                ticket.getAgent() != null ? ticket.getAgent().getId() : null
        );
    }

    public record TicketStatusNotification(String type, Long ticketId) {}
}