package com.yourcar.yourway.service;

import com.yourcar.yourway.dto.ChatMessageDTO;
import com.yourcar.yourway.model.Message;
import com.yourcar.yourway.model.SupportTicket;
import com.yourcar.yourway.model.User;
import com.yourcar.yourway.repository.MessageRepository;
import com.yourcar.yourway.repository.SupportTicketRepository;
import com.yourcar.yourway.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate; // 👈 Ajout import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatMessageDTO saveMessage(Long ticketId, ChatMessageDTO dto) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        
        User sender = userRepository.findById(dto.getSenderId())
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if ("ROLE_AGENT".equals(sender.getRole()) && ticket.getAgent() == null) {
            System.out.println("Assignation de l'agent " + sender.getId() + " au ticket " + ticketId);
            ticket.setAgent(sender);
            
            // On force la sauvegarde du ticket immédiatement
            ticketRepository.saveAndFlush(ticket); 

            // Notification WebSocket
            TicketEventNotification event = new TicketEventNotification("TICKET_ASSIGNED", ticketId, sender.getId());
            messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, event);
        }

        Message message = Message.builder()
                .content(dto.getText())
                .timestamp(LocalDateTime.now())
                .isRealTime(true)
                .ticket(ticket)
                .sender(sender)
                .build();

        Message saved = messageRepository.save(message);
        
        dto.setId(saved.getId());
        dto.setTimestamp(saved.getTimestamp().toString());
        return dto;
    }

    

    public List<ChatMessageDTO> getMessagesByTicketId(Long ticketId) {
        return messageRepository.findByTicketIdOrderByTimestampAsc(ticketId)
            .stream()
            .map(msg -> {
                ChatMessageDTO dto = new ChatMessageDTO();
                dto.setId(msg.getId());
                dto.setText(msg.getContent());
                dto.setSenderId(msg.getSender().getId());
                dto.setTimestamp(msg.getTimestamp().toString());
                return dto;
            })
            .collect(Collectors.toList());
    }
}

record TicketEventNotification(String type, Long ticketId, Long agentId) {}