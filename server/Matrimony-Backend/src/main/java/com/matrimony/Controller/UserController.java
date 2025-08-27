package com.matrimony.Controller;

import com.matrimony.Entity.User;
import com.matrimony.Service.UserService;
import com.matrimony.Service.MatchService;
import com.matrimony.Service.MessageService;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MatchService matchService;

    @Autowired
    private MessageService messageService;

    // ✅ Sign Up (Registers a new user with password hashing)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        try {
            return userService.addUser(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error during registration: " + e.getMessage());
        }
    }

    // ✅ Login (Authenticates user and returns JWT token)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        ResponseEntity<?> authResponse =
                userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        if (authResponse.getStatusCode() != HttpStatus.OK) {
            return authResponse;
        }

        User user = (User) authResponse.getBody();
        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("user", user);

        return ResponseEntity.ok(responseBody);
    }

    // ✅ Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }

    // ✅ Update user details
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }

    // ✅ Dashboard stats endpoint
    @GetMapping("/dashboard-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Total matches
            List<User> matches = matchService.getMatches(userId);
            stats.put("totalMatches", matches != null ? matches.size() : 0);

            // Unread messages
            int unread = messageService.getUnreadMessageCount(userId);
            stats.put("newMessages", unread);

            // Placeholder values (implement later)
            stats.put("pendingRequests", 0);
            stats.put("profileViews", 0);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to fetch dashboard stats"));
        }
    }
}
