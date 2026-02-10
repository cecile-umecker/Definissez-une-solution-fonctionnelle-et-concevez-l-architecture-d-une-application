package com.yourcar.yourway.repository;

import com.yourcar.yourway.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    
    List<SupportTicket> findByUserId(Long userId);
    
    List<SupportTicket> findByStatusTrue();
}