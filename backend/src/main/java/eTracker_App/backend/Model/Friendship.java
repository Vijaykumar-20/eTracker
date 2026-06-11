package eTracker_App.backend.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friendships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Friendship {

    public enum FriendshipStatus {
        PENDING, ACCEPTED, DECLINED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId; // The sender of the request (User A)

    @ManyToOne
    @JoinColumn(name = "friend_user_id", nullable = false)
    private Users friend; // The receiver of the request (User B)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status = FriendshipStatus.PENDING;
}
