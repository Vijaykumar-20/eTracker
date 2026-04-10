package eTracker_App.backend.Repository;

import eTracker_App.backend.Model.Split;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SplitRepository extends JpaRepository<Split, Long> {
    List<Split> findByUserId(String userId);
}
