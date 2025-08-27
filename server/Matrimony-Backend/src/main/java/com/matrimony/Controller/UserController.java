package com.matrimony.Controller;

import com.matrimony.Dao.ProfileViewRepository;
import com.matrimony.Entity.ProfileView;
import com.matrimony.Entity.User;
import com.matrimony.Service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import com.matrimony.Service.MatchService;
import com.matrimony.Service.MessageService;
import com.matrimony.Service.PendingRequestService;
import com.matrimony.Service.ProfileViewService;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    
    @Autowired private PendingRequestService prs;
    @Autowired private ProfileViewService pvs;  // implement similarly
    
    @Autowired
    private ProfileViewRepository profileViewRepository;

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
        
        // ✅ ADD THESE DEBUG LOGS
        System.out.println("Generated token: " + token);
        System.out.println("Token for email: " + user.getEmail());

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
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            System.out.println("Received token: " + token); // Debug
            
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                System.out.println("JWT part: " + jwt); // Debug
                
                String email = jwtUtil.extractEmail(jwt);
                System.out.println("Extracted email: " + email); // Debug
                
                User user = userService.getUserByEmail(email);
                return ResponseEntity.ok(user);
            }
            System.out.println("Invalid token format"); // Debug
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage()); // Debug
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
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
            
            long profileViews = profileViewRepository.countByViewedUserId(userId);
            stats.put("profileViews", profileViews);
          

            // …
            stats.put("newMessages", messageService.getUnreadMessageCount(userId));
            stats.put("pendingRequests", prs.countPendingRequests(userId));
            stats.put("profileViews", pvs.countProfileViews(userId));


            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to fetch dashboard stats"));
        }
    }
    


    // Add this new endpoint
    @PostMapping("/profile/view/{viewedUserId}")
    public ResponseEntity<?> recordProfileView(@PathVariable Long viewedUserId, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                String email = jwtUtil.extractEmail(jwt);
                User viewer = userService.getUserByEmail(email);
                
                // Don't record if user views their own profile
                if (!viewer.getId().equals(viewedUserId)) {
                    // Check if already viewed recently (within last hour to avoid spam)
                    LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
                    long recentViews = profileViewRepository.countRecentViews(viewer.getId(), viewedUserId, oneHourAgo);
                    
                    if (recentViews == 0) {
                        ProfileView profileView = new ProfileView(viewer.getId(), viewedUserId);
                        profileViewRepository.save(profileView);
                        System.out.println("Profile view recorded: User " + viewer.getId() + " viewed User " + viewedUserId);
                    }
                }
                
                return ResponseEntity.ok("Profile view recorded");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            System.out.println("Error recording profile view: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error recording profile view");
        }
    }

}
