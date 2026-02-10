package com.yourcar.yourway.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketListDTO {
    private Long id;
    private String subject;
    private Boolean status;
    private LocalDateTime createdAt;

    public TicketListDTO(Long id, String subject, Boolean status, LocalDateTime createdAt) {
        this.id = id;
        this.subject = subject;
        this.status = status;
        this.createdAt = createdAt;
    }
}