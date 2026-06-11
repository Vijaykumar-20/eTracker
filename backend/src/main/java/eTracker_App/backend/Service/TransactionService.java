package eTracker_App.backend.Service;

import eTracker_App.backend.Model.Transaction;
import eTracker_App.backend.Model.TransactionDTO;
import eTracker_App.backend.Repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.springframework.web.multipart.MultipartFile;

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

    public void processCsvStatement(MultipartFile file, String userId) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            while ((line = br.readLine()) != null) {
                if (isFirstLine) { isFirstLine = false; continue; } // skip header
                String[] values = line.split(",");
                if (values.length >= 4) {
                    TransactionDTO dto = new TransactionDTO();
                    try {
                        dto.setDate(LocalDateTime.parse(values[0].trim()));
                    } catch(Exception e){
                        dto.setDate(LocalDateTime.now());
                    }
                    dto.setDescription(values[1].trim());
                    String typeStr = values[2].trim().toUpperCase();
                    dto.setType(typeStr.equals("CREDIT") || typeStr.equals("INCOME") ? "INCOME" : "EXPENSE");
                    try {
                        dto.setAmount(Double.parseDouble(values[3].trim()));
                    } catch(Exception e) {
                        dto.setAmount(0.0);
                    }
                    dto.setCategory("Paytm Import");
                    dto.setUserId(userId);
                    createTransaction(dto);
                }
            }
        }
    }

    public void mockPaytmSync(String userId) {
        List<TransactionDTO> mocks = new ArrayList<>();
        
        TransactionDTO t1 = new TransactionDTO();
        t1.setAmount(450.0); t1.setCategory("Paytm Sync"); t1.setType("EXPENSE");
        t1.setDescription("Zomato Delivery"); t1.setDate(LocalDateTime.now().minusDays(1)); t1.setUserId(userId);
        mocks.add(t1);
        
        TransactionDTO t2 = new TransactionDTO();
        t2.setAmount(100.0); t2.setCategory("Paytm Sync"); t2.setType("INCOME");
        t2.setDescription("Cashback Received"); t2.setDate(LocalDateTime.now().minusDays(2)); t2.setUserId(userId);
        mocks.add(t2);

        TransactionDTO t3 = new TransactionDTO();
        t3.setAmount(1200.0); t3.setCategory("Paytm Sync"); t3.setType("EXPENSE");
        t3.setDescription("Supermarket"); t3.setDate(LocalDateTime.now().minusHours(5)); t3.setUserId(userId);
        mocks.add(t3);

        for(TransactionDTO dto : mocks) {
            createTransaction(dto);
        }
    }
}
