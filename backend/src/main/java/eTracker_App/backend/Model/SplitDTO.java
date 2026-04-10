package eTracker_App.backend.Model;

import lombok.Data;

@Data
public class SplitDTO {
    private Double amount;
    private String currency;
    private String splitType;
    private String userId;
}
