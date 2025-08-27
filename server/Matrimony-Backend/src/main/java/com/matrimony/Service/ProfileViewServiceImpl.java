package com.matrimony.Service;

import com.matrimony.Dao.ProfileViewDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileViewServiceImpl implements ProfileViewService {

    @Autowired
    private ProfileViewDao profileViewDao;

    @Override
    public int countProfileViews(Long userId) {
        return profileViewDao.countViewsByUserId(userId);
    }
}
