package eTracker_App.backend.Controller;

import eTracker_App.backend.Model.Transaction;
import eTracker_App.backend.Model.TransactionDTO;
import eTracker_App.backend.Service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/create")
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionDTO dto) {
        try {
            return ResponseEntity.ok(transactionService.createTransaction(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable String userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok("Transaction deleted");
    }

    @PostMapping("/mock-paytm-sync")
    public ResponseEntity<String> mockPaytmSync(@RequestParam String userId) {
        try {
            transactionService.mockPaytmSync(userId);
            return ResponseEntity.ok("Successfully synced mock Paytm transactions");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to sync mock Paytm transactions: " + e.getMessage());
        }
    }

    @PostMapping("/upload-statement")
    public ResponseEntity<String> uploadStatement(@RequestParam("file") org.springframework.web.multipart.MultipartFile file, @RequestParam("userId") String userId) {
        try {
            transactionService.processCsvStatement(file, userId);
            return ResponseEntity.ok("Statement uploaded and processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to process statement: " + e.getMessage());
        }
    }
}
