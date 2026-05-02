package com.paf.securefile.service;

import com.paf.securefile.model.User;
import com.paf.securefile.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerUser(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    public boolean validateUser(String username, String password) {
        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isPresent()) {
            return passwordEncoder.matches(password, optUser.get().getPasswordHash());
        }
        return false;
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isPresent()) {
            User user = optUser.get();
            if (passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(newPassword));
                userRepository.save(user);
            } else {
                throw new IllegalArgumentException("Incorrect current password.");
            }
        } else {
            throw new IllegalArgumentException("User not found.");
        }
    }
}
