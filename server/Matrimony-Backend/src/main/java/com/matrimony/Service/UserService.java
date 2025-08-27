package com.matrimony.Service;

import com.matrimony.Dao.UserDao;
import com.matrimony.Entity.User;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserDao userDao;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ Register a new user
    public ResponseEntity<?> addUser(User user) {
        if (userDao.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email already registered.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userDao.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // ✅ Authenticate user and generate JWT token
    public ResponseEntity<?> authenticateUser(String email, String password) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
        return ResponseEntity.ok(user);
    }

    // ✅ Update user details
    public ResponseEntity<?> updateUser(Long userId, User updatedUser) {
        Optional<User> existingUserOpt = userDao.findById(userId);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        User existingUser = existingUserOpt.get();

        // Update only non-null fields
        if (updatedUser.getFirstName() != null)    existingUser.setFirstName(updatedUser.getFirstName());
        if (updatedUser.getLastName() != null)     existingUser.setLastName(updatedUser.getLastName());
        if (updatedUser.getEmail() != null)        existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPhone() != null)        existingUser.setPhone(updatedUser.getPhone());
        if (updatedUser.getAddress() != null)      existingUser.setAddress(updatedUser.getAddress());
        if (updatedUser.getMaritalStatus() != null)existingUser.setMaritalStatus(updatedUser.getMaritalStatus());
        if (updatedUser.getReligion() != null)     existingUser.setReligion(updatedUser.getReligion());
        if (updatedUser.getCaste() != null)        existingUser.setCaste(updatedUser.getCaste());
        if (updatedUser.getMotherTongue() != null) existingUser.setMotherTongue(updatedUser.getMotherTongue());
        if (updatedUser.getEducation() != null)    existingUser.setEducation(updatedUser.getEducation());
        if (updatedUser.getProfession() != null)   existingUser.setProfession(updatedUser.getProfession());
        if (updatedUser.getAnnualIncome() != null) existingUser.setAnnualIncome(updatedUser.getAnnualIncome());
        if (updatedUser.getBio() != null)          existingUser.setBio(updatedUser.getBio());
        if (updatedUser.getHobbies() != null)      existingUser.setHobbies(updatedUser.getHobbies());

        // ⬇️ Add these two lines to handle age and location:
        if (updatedUser.getAge() != null)          existingUser.setAge(updatedUser.getAge());
        if (updatedUser.getLocation() != null)     existingUser.setLocation(updatedUser.getLocation());

        userDao.save(existingUser);
        return ResponseEntity.ok(existingUser);
    }
    
    public User getUserByEmail(String email) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isPresent()) {
            return userOpt.get();
        } else {
            throw new RuntimeException("User not found with email: " + email);
        }
    }

    // ✅ Get user by ID
    public User getUserById(Long id) {
        Optional<User> user = userDao.findById(id);
        if (user.isPresent()) {
            return user.get();
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
