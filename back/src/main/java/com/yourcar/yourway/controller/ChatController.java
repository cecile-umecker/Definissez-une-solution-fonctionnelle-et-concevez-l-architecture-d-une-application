package com.yourcar.yourway.controller;

import com.yourcar.yourway.dto.ChatMessageDTO;
import com.yourcar.yourway.service.ChatService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;


@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat/{ticketId}")
    @SendTo("/topic/ticket/{ticketId}")
    public ChatMessageDTO processMessage(@DestinationVariable Long ticketId, @Payload ChatMessageDTO message) {
        ChatMessageDTO savedMessage = chatService.saveMessage(ticketId, message);
        System.out.println("Message sauvegardé pour le ticket " + ticketId);
        return savedMessage;
    }

    @MessageMapping("/chat/{ticketId}/history")
    public void sendHistory(@DestinationVariable Long ticketId, Authentication authentication) {
        // 1. Récupérer l'historique
        List<ChatMessageDTO> history = chatService.getMessagesByTicketId(ticketId);
        
        // 2. Le renvoyer UNIQUEMENT à l'utilisateur qui le demande (via son topic privé ou le topic du ticket)
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, history);
    }

    @MessageMapping("/chat/{ticketId}/load")
    public void loadHistory(@DestinationVariable Long ticketId) {
        List<ChatMessageDTO> history = chatService.getMessagesByTicketId(ticketId);
        // On renvoie l'historique sur le topic du ticket
        // Tous ceux connectés au ticket verront l'historique s'afficher (ou juste toi si on affinait)
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, history);
    }

}