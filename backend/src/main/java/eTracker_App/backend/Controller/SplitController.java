package eTracker_App.backend.Controller;

import eTracker_App.backend.Model.Split;
import eTracker_App.backend.Model.SplitDTO;
import eTracker_App.backend.Service.SplitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/splits")
public class SplitController {

    private final SplitService splitService;

    @Autowired
    public SplitController(SplitService splitService) {
        this.splitService = splitService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSplit(@RequestBody SplitDTO splitDTO) {
        try {
            Split createdSplit = splitService.createSplit(splitDTO);
            return ResponseEntity.ok(createdSplit);
        } catch (IllegalArgumentException e) {
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Split>> getSplits(@PathVariable String userId) {
        return ResponseEntity.ok(splitService.getSplitsByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSplit(@PathVariable Long id) {
        splitService.deleteSplit(id);
        return ResponseEntity.ok("Split deleted");
    }
}
