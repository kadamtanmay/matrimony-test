package com.matrimony.Service;

import com.matrimony.Dao.PendingRequestDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PendingRequestServiceImpl implements PendingRequestService {

    @Autowired
    private PendingRequestDao dao;

    @Override
    public int countPendingRequests(Long userId) {
        return dao.countPendingByUserId(userId);
    }

    @Override
    public boolean isConnected(Long userId1, Long userId2) {
        return dao.existsAcceptedConnection(userId1, userId2);
    }
}
