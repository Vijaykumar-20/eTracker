package eTracker_App.backend.Repository;

import eTracker_App.backend.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface loginRepository extends JpaRepository<Users, Long>{
    Optional<Users> findByMobileNumber(String mobileNumber);
    Optional<Users> findByEmailId(String emailId);
}
