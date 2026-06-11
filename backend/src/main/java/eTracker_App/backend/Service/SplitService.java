package eTracker_App.backend.Service;

import eTracker_App.backend.Model.Split;
import eTracker_App.backend.Model.SplitDTO;
import eTracker_App.backend.Repository.SplitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import eTracker_App.backend.Model.SplitParticipant;
import eTracker_App.backend.Model.SplitParticipantDTO;
import eTracker_App.backend.Model.Users;
import eTracker_App.backend.Repository.loginRepository;
import java.util.Optional;
import java.util.ArrayList;

import java.util.List;

@Service
public class SplitService {

    private final SplitRepository splitRepository;
    private final loginRepository loginRepo;

    @Autowired
    public SplitService(SplitRepository splitRepository, loginRepository loginRepo) {
        this.splitRepository = splitRepository;
        this.loginRepo = loginRepo;
    }

    public Split createSplit(SplitDTO splitDTO) {
        Split split = new Split();
        split.setAmount(splitDTO.getAmount());
        split.setCurrency(splitDTO.getCurrency());
        split.setSplitType(Split.SplitType.valueOf(splitDTO.getSplitType().toUpperCase()));
        split.setUserId(splitDTO.getUserId());
        split.setDescription(splitDTO.getDescription());

        java.util.List<SplitParticipant> participants = new ArrayList<>();
        if (splitDTO.getSplitUsers() != null && !splitDTO.getSplitUsers().isEmpty()) {
            Double amountPerPerson = 0.0;
            if (split.getSplitType() == Split.SplitType.EQUAL) {
                // Including the current user + friends
                amountPerPerson = split.getAmount() / (splitDTO.getSplitUsers().size() + 1);
            }
            
            for (SplitParticipantDTO pDTO : splitDTO.getSplitUsers()) {
                String ident = pDTO.getName();
                Optional<Users> participantUserOpt = loginRepo.findByMobileNumber(ident);
                if (participantUserOpt.isEmpty()) {
                    participantUserOpt = loginRepo.findByUserName(ident);
                }
                if (participantUserOpt.isEmpty()) {
                    participantUserOpt = loginRepo.findByEmailId(ident);
                }
                if (participantUserOpt.isEmpty()) {
                    throw new IllegalArgumentException("Participant '" + ident + "' is not registered.");
                }
                Users participantUser = participantUserOpt.get();

                SplitParticipant p = new SplitParticipant();
                p.setName(participantUser.getUserName());
                p.setShare(pDTO.getShare());
                p.setSplit(split);
                
                if (split.getSplitType() == Split.SplitType.EQUAL) {
                    p.setAmountOwed(amountPerPerson);
                } else if (split.getSplitType() == Split.SplitType.PERCENTAGE) {
                    try {
                        Double percentage = Double.parseDouble(pDTO.getShare());
                        p.setAmountOwed(split.getAmount() * (percentage / 100.0));
                    } catch (NumberFormatException e) {
                        p.setAmountOwed(0.0);
                    }
                }
                participants.add(p);
            }
        }
        split.setParticipants(participants);
        return splitRepository.save(split);
    }

    public List<Split> getSplitsByUserId(String userId) {
        try {
            Long id = Long.parseLong(userId);
            Optional<Users> userOpt = loginRepo.findById(id);
            if (userOpt.isPresent()) {
                Users user = userOpt.get();
                List<Split> splits = splitRepository.findByUserIdOrParticipant(
                    userId, 
                    user.getUserName(), 
                    user.getEmailId(), 
                    user.getMobileNumber()
                );
                
                for (Split s : splits) {
                    try {
                        Long creatorId = Long.parseLong(s.getUserId());
                        loginRepo.findById(creatorId).ifPresent(creator -> s.setCreatorName(creator.getUserName()));
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }
                return splits;
            }
        } catch (NumberFormatException e) {
            // ignore
        }
        return splitRepository.findByUserId(userId);
    }

    public void deleteSplit(Long id) {
        splitRepository.deleteById(id);
    }
}
