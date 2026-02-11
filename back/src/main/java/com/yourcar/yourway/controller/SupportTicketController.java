package com.yourcar.yourway.controller;

import com.yourcar.yourway.dto.TicketListDTO;
import com.yourcar.yourway.model.SupportTicket;
import com.yourcar.yourway.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for support ticket management (create, list, close).
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SupportTicketController {

    private final SupportTicketService ticketService;

    @PostMapping("/create")
    public SupportTicket createTicket(@RequestBody Map<String, Object> payload) {
        return ticketService.createTicket(
                Long.valueOf(payload.get("userId").toString()),
                (String) payload.get("subject")
        );
    }

    @GetMapping("/my")
    public List<TicketListDTO> getMyTickets(Authentication authentication) {
        return ticketService.getTicketsByUserEmail(authentication.getName());
    }

    @GetMapping("/all")
    public List<TicketListDTO> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @PutMapping("/{id}/close")
    public void closeTicket(@PathVariable Long id) {
        ticketService.closeTicket(id);
    }
}