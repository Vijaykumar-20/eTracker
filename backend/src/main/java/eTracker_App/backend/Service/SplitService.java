package eTracker_App.backend.Service;

import eTracker_App.backend.Model.Split;
import eTracker_App.backend.Model.SplitDTO;
import eTracker_App.backend.Repository.SplitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SplitService {

    private final SplitRepository splitRepository;

    @Autowired
    public SplitService(SplitRepository splitRepository) {
        this.splitRepository = splitRepository;
    }

    public Split createSplit(SplitDTO splitDTO) {
        Split split = new Split();
        split.setAmount(splitDTO.getAmount());
        split.setCurrency(splitDTO.getCurrency());
        split.setSplitType(Split.SplitType.valueOf(splitDTO.getSplitType().toUpperCase()));
        split.setUserId(splitDTO.getUserId());
        return splitRepository.save(split);
    }

    public List<Split> getSplitsByUserId(String userId) {
        return splitRepository.findByUserId(userId);
    }

    public void deleteSplit(Long id) {
        splitRepository.deleteById(id);
    }
}
