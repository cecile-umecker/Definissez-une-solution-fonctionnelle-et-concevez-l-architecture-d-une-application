package com.yourcar.yourway.controller;

import com.yourcar.yourway.dto.ChatMessageDTO;
import com.yourcar.yourway.service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
}