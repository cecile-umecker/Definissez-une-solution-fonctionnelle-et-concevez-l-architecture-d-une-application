package com.yourcar.yourway.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long id;
    private String text;
    private Long senderId;
    private String timestamp;
}
