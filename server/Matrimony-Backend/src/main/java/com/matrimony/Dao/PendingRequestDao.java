package com.matrimony.Dao;

import com.matrimony.Entity.PendingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PendingRequestDao extends JpaRepository<PendingRequest, Long> {

    @Query("SELECT COUNT(r) FROM PendingRequest r WHERE r.receiver.id = :userId AND r.status = 'PENDING'")
    int countPendingByUserId(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM PendingRequest r " +
           "WHERE ((r.sender.id = :userId1 AND r.receiver.id = :userId2) OR (r.sender.id = :userId2 AND r.receiver.id = :userId1)) " +
           "AND r.status = 'ACCEPTED'")
    boolean existsAcceptedConnection(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
