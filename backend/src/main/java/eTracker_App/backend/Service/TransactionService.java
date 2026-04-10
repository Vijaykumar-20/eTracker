package eTracker_App.backend.Service;

import eTracker_App.backend.Model.Transaction;
import eTracker_App.backend.Model.TransactionDTO;
import eTracker_App.backend.Repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction createTransaction(TransactionDTO dto) {
        Transaction transaction = new Transaction();
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setType(Transaction.TransactionType.valueOf(dto.getType().toUpperCase()));
        transaction.setDescription(dto.getDescription());
        transaction.setDate(dto.getDate() != null ? dto.getDate() : LocalDateTime.now());
        transaction.setUserId(dto.getUserId());
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByUserId(String userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public List<Transaction> getTransactionsByUserIdAndDateBetween(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}
