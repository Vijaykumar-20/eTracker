package eTracker_App.backend.Controller;

import eTracker_App.backend.Model.Friendship;
import eTracker_App.backend.Model.Users;
import eTracker_App.backend.Service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendController {

    private final FriendService friendService;

    @Autowired
    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> sendRequest(@RequestParam String userId, @RequestParam String mobileNumber) {
        try {
            Friendship friendship = friendService.sendFriendRequest(userId, mobileNumber);
            return ResponseEntity.ok(friendship);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptRequest(@RequestParam String senderId, @RequestParam String receiverId) {
        try {
            friendService.acceptFriendRequest(senderId, receiverId);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Friend request accepted");
            }});
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/decline")
    public ResponseEntity<?> declineRequest(@RequestParam String senderId, @RequestParam String receiverId) {
        try {
            friendService.declineFriendRequest(senderId, receiverId);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Friend request declined");
            }});
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/requests/{userId}")
    public ResponseEntity<List<Users>> getRequests(@PathVariable String userId) {
        return ResponseEntity.ok(friendService.getPendingRequestSenders(userId));
    }

    @GetMapping("/list/{userId}")
    public ResponseEntity<List<Users>> getFriends(@PathVariable String userId) {
        return ResponseEntity.ok(friendService.getFriendsList(userId));
    }
}
