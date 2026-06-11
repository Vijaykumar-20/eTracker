package eTracker_App.backend.Model;

import lombok.Data;

@Data
public class SplitParticipantDTO {
    private String name;
    private String share; // Can store percentage or amount based on context
}
