package eTracker_App.backend.Repository;

import eTracker_App.backend.Model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    // Find all friendships for a user (accepted)
    List<Friendship> findByUserIdAndStatus(String userId, Friendship.FriendshipStatus status);

    // Find pending requests sent to this user
    @Query("SELECT f FROM Friendship f WHERE f.friend.id = :friendId AND f.status = :status")
    List<Friendship> findIncomingRequests(@Param("friendId") Long friendId, @Param("status") Friendship.FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE f.userId = :userId AND f.friend.id = :friendId")
    Optional<Friendship> findByUserIdAndFriendId(@Param("userId") String userId, @Param("friendId") Long friendId);
}
