package eTracker_App.backend.Controller;

import eTracker_App.backend.Model.Transaction;
import eTracker_App.backend.Service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final TransactionService transactionService;

    @Autowired
    public DashboardController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/summary/{userId}")
    public ResponseEntity<Map<String, Object>> getSummary(
            @PathVariable String userId,
            @RequestParam(defaultValue = "MONTHLY") String period) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;

        switch (period.toUpperCase()) {
            case "DAILY":
                startDate = now.toLocalDate().atStartOfDay();
                break;
            case "WEEKLY":
                startDate = now.minusDays(7).toLocalDate().atStartOfDay();
                break;
            case "MONTHLY":
            default:
                startDate = now.minusDays(30).toLocalDate().atStartOfDay();
                break;
        }

        List<Transaction> transactions = transactionService.getTransactionsByUserIdAndDateBetween(userId, startDate, now);

        double totalIncome = 0;
        double totalExpense = 0;

        for (Transaction t : transactions) {
            if (t.getType() == Transaction.TransactionType.INCOME) {
                totalIncome += t.getAmount();
            } else if (t.getType() == Transaction.TransactionType.EXPENSE) {
                totalExpense += t.getAmount();
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("period", period.toUpperCase());
        response.put("totalIncome", totalIncome);
        response.put("totalExpense", totalExpense);
        response.put("netBalance", totalIncome - totalExpense);
        response.put("transactionCount", transactions.size());

        return ResponseEntity.ok(response);
    }
}
