package com.matrimony.Controller;

import com.matrimony.Entity.PendingRequest;
import com.matrimony.Entity.User;
import com.matrimony.Service.PendingRequestService;
import com.matrimony.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pending-requests")
@CrossOrigin(origins="http://localhost:3000")
public class PendingRequestController {

  @Autowired private PendingRequestService prs;
  @Autowired private UserService us;

  @PostMapping("/send")
  public ResponseEntity<?> send(@RequestParam Long senderId, @RequestParam Long receiverId) {
    User s = us.getUserById(senderId);
    User r = us.getUserById(receiverId);
    PendingRequest req = new PendingRequest();
    req.setSender(s);
    req.setReceiver(r);
    req.setStatus("PENDING");
    req.setTimestamp(LocalDateTime.now());
    prs.saveRequest(req);
    return ResponseEntity.ok(Map.of("success",true));
  }

  @GetMapping("/pending/{userId}")
  public ResponseEntity<List<PendingRequest>> list(@PathVariable Long userId) {
    return ResponseEntity.ok(prs.getPendingRequestsByUserId(userId));
  }

  @PostMapping("/accept/{id}")
  public ResponseEntity<?> accept(@PathVariable Long id) {
    prs.updateRequestStatus(id,"ACCEPTED");
    return ResponseEntity.ok(Map.of("accepted",true));
  }

  @PostMapping("/reject/{id}")
  public ResponseEntity<?> reject(@PathVariable Long id) {
    prs.updateRequestStatus(id,"REJECTED");
    return ResponseEntity.ok(Map.of("rejected",true));
  }

  @GetMapping("/is-connected")
  public ResponseEntity<Map<String,Boolean>> isConnected(
      @RequestParam Long userId1, @RequestParam Long userId2) {
    return ResponseEntity.ok(Collections.singletonMap("connected", 
                              prs.isConnected(userId1,userId2)));
  }

  @GetMapping("/has-sent")
  public ResponseEntity<Map<String,Boolean>> hasSent(
      @RequestParam Long senderId, @RequestParam Long receiverId) {
    return ResponseEntity.ok(Collections.singletonMap("hasSent",
                              prs.hasSentRequest(senderId,receiverId)));
  }
}
