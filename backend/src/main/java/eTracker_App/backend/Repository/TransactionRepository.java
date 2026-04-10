package eTracker_App.backend.Repository;

import eTracker_App.backend.Model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByDateDesc(String userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.date >= :startDate AND t.date <= :endDate")
    List<Transaction> findByUserIdAndDateBetween(String userId, LocalDateTime startDate, LocalDateTime endDate);
}
