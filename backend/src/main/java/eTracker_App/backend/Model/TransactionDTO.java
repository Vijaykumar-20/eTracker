package eTracker_App.backend.Model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Double amount;
    private String category;
    private String type; // INCOME or EXPENSE
    private String description;
    private LocalDateTime date;
    private String userId;
}
