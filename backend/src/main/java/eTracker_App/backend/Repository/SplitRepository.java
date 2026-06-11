package eTracker_App.backend.Repository;

import eTracker_App.backend.Model.Split;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface SplitRepository extends JpaRepository<Split, Long> {
    List<Split> findByUserId(String userId);

    @Query("SELECT DISTINCT s FROM Split s LEFT JOIN s.participants p " +
           "WHERE s.userId = :userId " +
           "OR LOWER(p.name) = LOWER(:userName) " +
           "OR LOWER(p.name) = LOWER(:emailId) " +
           "OR p.name = :mobileNumber")
    List<Split> findByUserIdOrParticipant(
        @Param("userId") String userId,
        @Param("userName") String userName,
        @Param("emailId") String emailId,
        @Param("mobileNumber") String mobileNumber
    );
}
