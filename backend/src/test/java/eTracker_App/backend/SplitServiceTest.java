package eTracker_App.backend;

import eTracker_App.backend.Model.*;
import eTracker_App.backend.Repository.*;
import eTracker_App.backend.Service.SplitService;
import eTracker_App.backend.Service.FriendService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class SplitServiceTest {

    @Autowired
    private SplitService splitService;

    @Autowired
    private FriendService friendService;

    @Autowired
    private loginRepository loginRepo;

    @Autowired
    private SplitRepository splitRepo;

    @Test
    public void testSplitReflectingInParticipantAccount() {
        // 1. Create User A (creator)
        Users userA = new Users();
        userA.setUserName("bob");
        userA.setEmailId("bob@example.com");
        userA.setMobileNumber("1234567890");
        userA.setPassword("encoded_password");
        userA = loginRepo.save(userA);

        // 2. Create User B (participant)
        Users userB = new Users();
        userB.setUserName("alice");
        userB.setEmailId("alice@example.com");
        userB.setMobileNumber("9876543210");
        userB.setPassword("encoded_password");
        userB = loginRepo.save(userB);

        // 3. User A creates a split transaction for 100 with User B
        SplitDTO splitDTO = new SplitDTO();
        splitDTO.setAmount(100.0);
        splitDTO.setCurrency("INR");
        splitDTO.setSplitType("EQUAL");
        splitDTO.setUserId(userA.getId().toString());
        splitDTO.setDescription("Lunch Split");

        SplitParticipantDTO participantDTO = new SplitParticipantDTO();
        participantDTO.setName("alice"); // matches username of User B
        participantDTO.setShare("50.0"); // equal share doesn't strictly parse this but good practice

        splitDTO.setSplitUsers(Collections.singletonList(participantDTO));

        Split createdSplit = splitService.createSplit(splitDTO);
        assertNotNull(createdSplit.getId());

        // 4. Verify User A gets the split
        List<Split> bobSplits = splitService.getSplitsByUserId(userA.getId().toString());
        assertEquals(1, bobSplits.size());
        assertEquals("bob", bobSplits.get(0).getCreatorName());

        // 5. Verify User B (alice) ALSO gets the split!
        List<Split> aliceSplits = splitService.getSplitsByUserId(userB.getId().toString());
        assertEquals(1, aliceSplits.size(), "Split should reflect in participant (Alice) account!");
        assertEquals("bob", aliceSplits.get(0).getCreatorName(), "Creator name should be populated as 'bob'!");
    }

    @Test
    public void testFriendshipAndMutualCreation() {
        // Create Bob
        Users bob = new Users();
        bob.setUserName("bob_friend");
        bob.setEmailId("bob_f@example.com");
        bob.setMobileNumber("1112223333");
        bob.setPassword("password");
        bob = loginRepo.save(bob);

        // Create Alice
        Users alice = new Users();
        alice.setUserName("alice_friend");
        alice.setEmailId("alice_f@example.com");
        alice.setMobileNumber("4445556666");
        alice.setPassword("password");
        alice = loginRepo.save(alice);

        // Bob adds Alice as friend by mobile
        friendService.sendFriendRequest(bob.getId().toString(), alice.getMobileNumber());
        friendService.acceptFriendRequest(bob.getId().toString(), alice.getId().toString());

        // Verify Bob's friends list contains Alice
        List<Users> bobFriends = friendService.getFriendsList(bob.getId().toString());
        assertEquals(1, bobFriends.size());
        assertEquals("alice_friend", bobFriends.get(0).getUserName());

        // Verify Alice's friends list contains Bob (mutual)
        List<Users> aliceFriends = friendService.getFriendsList(alice.getId().toString());
        assertEquals(1, aliceFriends.size());
        assertEquals("bob_friend", aliceFriends.get(0).getUserName());
    }

    @Test
    public void testSplitCreationFailsForUnregisteredParticipant() {
        // Create Bob
        Users bob = new Users();
        bob.setUserName("bob_unregistered");
        bob.setEmailId("bob_un@example.com");
        bob.setMobileNumber("7778889999");
        bob.setPassword("password");
        bob = loginRepo.save(bob);

        SplitDTO splitDTO = new SplitDTO();
        splitDTO.setAmount(150.0);
        splitDTO.setCurrency("INR");
        splitDTO.setSplitType("EQUAL");
        splitDTO.setUserId(bob.getId().toString());
        splitDTO.setDescription("Unregistered Split");

        SplitParticipantDTO participantDTO = new SplitParticipantDTO();
        participantDTO.setName("unregistered_person");
        participantDTO.setShare("50.0");
        splitDTO.setSplitUsers(Collections.singletonList(participantDTO));

        // Attempting to create should throw IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> {
            splitService.createSplit(splitDTO);
        });
    }
}
