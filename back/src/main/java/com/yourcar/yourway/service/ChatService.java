package com.yourcar.yourway.service;

import com.yourcar.yourway.dto.ChatMessageDTO;
import com.yourcar.yourway.model.Message;
import com.yourcar.yourway.model.SupportTicket;
import com.yourcar.yourway.model.User;
import com.yourcar.yourway.repository.MessageRepository;
import com.yourcar.yourway.repository.SupportTicketRepository;
import com.yourcar.yourway.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageDTO saveMessage(Long ticketId, ChatMessageDTO dto) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        
        User sender = userRepository.findById(dto.getSenderId())
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

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
}