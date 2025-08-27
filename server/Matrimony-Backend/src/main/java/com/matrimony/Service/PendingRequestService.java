package com.matrimony.Service;

public interface PendingRequestService {
    int countPendingRequests(Long userId);
    boolean isConnected(Long userId1, Long userId2);
}
