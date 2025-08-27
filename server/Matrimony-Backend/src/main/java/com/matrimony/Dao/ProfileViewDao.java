package com.matrimony.Dao;

import com.matrimony.Entity.ProfileView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProfileViewDao extends JpaRepository<ProfileView, Long> {

    @Query("SELECT COUNT(v) FROM ProfileView v WHERE v.viewedUser.id = :userId")
    int countViewsByUserId(@Param("userId") Long userId);

}
