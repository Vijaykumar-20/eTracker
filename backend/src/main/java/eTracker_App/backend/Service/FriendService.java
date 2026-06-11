package eTracker_App.backend.Service;

import eTracker_App.backend.Model.Friendship;
import eTracker_App.backend.Model.Users;
import eTracker_App.backend.Repository.FriendshipRepository;
import eTracker_App.backend.Repository.loginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class FriendService {

    private final FriendshipRepository friendshipRepo;
    private final loginRepository loginRepo;

    @Autowired
    public FriendService(FriendshipRepository friendshipRepo, loginRepository loginRepo) {
        this.friendshipRepo = friendshipRepo;
        this.loginRepo = loginRepo;
    }

    public Friendship sendFriendRequest(String senderId, String mobileNumber) {
        Long senderLongId;
        try {
            senderLongId = Long.parseLong(senderId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format.");
        }

        Optional<Users> senderOpt = loginRepo.findById(senderLongId);
        if (senderOpt.isEmpty()) {
            throw new IllegalArgumentException("Sending user does not exist.");
        }

        // Find target friend
        Optional<Users> targetOpt = loginRepo.findByMobileNumber(mobileNumber);
        if (targetOpt.isEmpty()) {
            throw new IllegalArgumentException("User with mobile number " + mobileNumber + " is not registered.");
        }
        Users target = targetOpt.get();

        // Check if trying to add oneself
        if (target.getId().toString().equals(senderId)) {
            throw new IllegalArgumentException("You cannot add yourself as a friend.");
        }

        // Check if already friends or request pending
        Optional<Friendship> existing = friendshipRepo.findByUserIdAndFriendId(senderId, target.getId());
        if (existing.isPresent()) {
            Friendship.FriendshipStatus status = existing.get().getStatus();
            if (status == Friendship.FriendshipStatus.ACCEPTED) {
                throw new IllegalArgumentException("User is already in your friends list.");
            } else if (status == Friendship.FriendshipStatus.PENDING) {
                throw new IllegalArgumentException("Friend request is already pending.");
            } else {
                // If declined, let them request again by resetting status to PENDING
                Friendship request = existing.get();
                request.setStatus(Friendship.FriendshipStatus.PENDING);
                return friendshipRepo.save(request);
            }
        }

        // Check if there is an incoming request from the target user to the sender
        Optional<Friendship> incoming = friendshipRepo.findByUserIdAndFriendId(target.getId().toString(), senderLongId);
        if (incoming.isPresent()) {
            if (incoming.get().getStatus() == Friendship.FriendshipStatus.PENDING) {
                // Auto-accept if they already sent a request to you!
                acceptFriendRequest(target.getId().toString(), senderId);
                return incoming.get();
            }
        }

        // Create pending request: Sender -> Receiver
        Friendship request = new Friendship();
        request.setUserId(senderId);
        request.setFriend(target);
        request.setStatus(Friendship.FriendshipStatus.PENDING);
        return friendshipRepo.save(request);
    }

    public void acceptFriendRequest(String senderId, String receiverId) {
        // Find the pending request (Sender -> Receiver)
        Long receiverLongId = Long.parseLong(receiverId);
        Optional<Friendship> requestOpt = friendshipRepo.findByUserIdAndFriendId(senderId, receiverLongId);
        if (requestOpt.isEmpty() || requestOpt.get().getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new IllegalArgumentException("No pending request found.");
        }

        Friendship request = requestOpt.get();
        request.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepo.save(request);

        // Also create a mutual record for the receiver to sender (Receiver -> Sender)
        Optional<Users> senderOpt = loginRepo.findById(Long.parseLong(senderId));
        if (senderOpt.isPresent()) {
            Friendship mutual = new Friendship();
            mutual.setUserId(receiverId);
            mutual.setFriend(senderOpt.get());
            mutual.setStatus(Friendship.FriendshipStatus.ACCEPTED);
            friendshipRepo.save(mutual);
        }
    }

    public void declineFriendRequest(String senderId, String receiverId) {
        Long receiverLongId = Long.parseLong(receiverId);
        Optional<Friendship> requestOpt = friendshipRepo.findByUserIdAndFriendId(senderId, receiverLongId);
        if (requestOpt.isEmpty() || requestOpt.get().getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new IllegalArgumentException("No pending request found.");
        }

        Friendship request = requestOpt.get();
        request.setStatus(Friendship.FriendshipStatus.DECLINED);
        friendshipRepo.save(request);
    }

    public List<Friendship> getPendingRequests(String userId) {
        try {
            Long userLongId = Long.parseLong(userId);
            return friendshipRepo.findIncomingRequests(userLongId, Friendship.FriendshipStatus.PENDING);
        } catch (NumberFormatException e) {
            return new ArrayList<>();
        }
    }

    // Get sender users who sent requests
    public List<Users> getPendingRequestSenders(String userId) {
        List<Friendship> pending = getPendingRequests(userId);
        List<Users> senders = new ArrayList<>();
        for (Friendship f : pending) {
            Optional<Users> senderOpt = loginRepo.findById(Long.parseLong(f.getUserId()));
            senderOpt.ifPresent(senders::add);
        }
        return senders;
    }

    public List<Users> getFriendsList(String userId) {
        List<Friendship> friendships = friendshipRepo.findByUserIdAndStatus(userId, Friendship.FriendshipStatus.ACCEPTED);
        List<Users> friends = new ArrayList<>();
        for (Friendship f : friendships) {
            friends.add(f.getFriend());
        }
        return friends;
    }
}
