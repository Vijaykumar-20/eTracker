package eTracker_App.backend.Model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "SplitParticipants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SplitParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String share;

    @Column(nullable = false)
    private Double amountOwed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "split_id", nullable = false)
    @JsonIgnore
    private Split split;
}
