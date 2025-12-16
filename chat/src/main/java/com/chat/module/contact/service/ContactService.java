package com.chat.module.contact.service;

import com.chat.exception.CustomExceptions;
import com.chat.model.postgres.Contact;
import com.chat.model.postgres.User;
import com.chat.module.auth.repository.UserRepository;
import com.chat.module.contact.dto.AddContactRequest;
import com.chat.module.contact.dto.ContactRequest;
import com.chat.module.contact.dto.ContactResponse;
import com.chat.module.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    public ContactResponse addContact(Long userId, ContactRequest request) {
        log.info("Adding contact for user: {} with contact user: {}", userId, request.getContactUserId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        User contactUser = userRepository.findById(request.getContactUserId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact user not found"));

        if (userId.equals(request.getContactUserId())) {
            throw new CustomExceptions.BadRequestException("Cannot add yourself as a contact");
        }

        if (contactRepository.existsByUserIdAndContactUserId(userId, request.getContactUserId())) {
            throw new CustomExceptions.ConflictException("Contact already exists");
        }

        Contact contact = new Contact();
        contact.setUser(user);
        contact.setContactUser(contactUser);
        contact.setNickname(request.getNickname());
        contact.setIsBlocked(false);
        contact.setIsFavorite(false);

        contact = contactRepository.save(contact);
        log.info("Contact added successfully: {}", contact.getId());

        return ContactResponse.fromContact(contact);
    }

    @Transactional
    public ContactResponse addContactByUsernameOrEmail(Long userId, AddContactRequest request) {
        log.info("Adding contact for user: {} with username/email: {}", userId, request.getUsernameOrEmail());

        User contactUser = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail()
        ).orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact user not found"));

        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setContactUserId(contactUser.getId());
        contactRequest.setNickname(request.getNickname());

        return addContact(userId, contactRequest);
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getAllContacts(Long userId) {
        log.info("Getting all contacts for user: {}", userId);

        List<Contact> contacts = contactRepository.findByUserId(userId);
        return contacts.stream()
                .map(ContactResponse::fromContact)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public ContactResponse getContact(Long userId, Long contactId) {
        log.info("Getting contact: {} for user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        return ContactResponse.fromContact(contact);
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getBlockedContacts(Long userId) {
        log.info("Getting blocked contacts for user: {}", userId);

        List<Contact> contacts = contactRepository.findByUserIdAndIsBlocked(userId, true);
        return contacts.stream()
                .map(ContactResponse::fromContact)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getFavoriteContacts(Long userId) {
        log.info("Getting favorite contacts for user: {}", userId);

        List<Contact> contacts = contactRepository.findByUserIdAndIsFavorite(userId, true);
        return contacts.stream()
                .map(ContactResponse::fromContact)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> searchContacts(Long userId, String searchTerm) {
        log.info("Searching contacts for user: {} with term: {}", userId, searchTerm);

        List<Contact> contacts = contactRepository.searchContacts(userId, searchTerm);
        return contacts.stream()
                .map(ContactResponse::fromContact)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactResponse updateNickname(Long userId, Long contactId, String nickname) {
        log.info("Updating nickname for contact: {} of user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        contact.setNickname(nickname);
        contact = contactRepository.save(contact);

        log.info("Nickname updated successfully for contact: {}", contactId);
        return ContactResponse.fromContact(contact);
    }

    @Transactional
    public ContactResponse blockContact(Long userId, Long contactId) {
        log.info("Blocking contact: {} for user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        contact.setIsBlocked(true);
        contact = contactRepository.save(contact);

        log.info("Contact blocked successfully: {}", contactId);
        return ContactResponse.fromContact(contact);
    }

    @Transactional
    public ContactResponse unblockContact(Long userId, Long contactId) {
        log.info("Unblocking contact: {} for user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        contact.setIsBlocked(false);
        contact = contactRepository.save(contact);

        log.info("Contact unblocked successfully: {}", contactId);
        return ContactResponse.fromContact(contact);
    }

    @Transactional
    public ContactResponse markAsFavorite(Long userId, Long contactId) {
        log.info("Marking contact as favorite: {} for user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        contact.setIsFavorite(true);
        contact = contactRepository.save(contact);

        log.info("Contact marked as favorite successfully: {}", contactId);
        return ContactResponse.fromContact(contact);
    }

    @Transactional
    public ContactResponse unmarkAsFavorite(Long userId, Long contactId) {
        log.info("Unmarking contact as favorite: {} for user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        contact.setIsFavorite(false);
        contact = contactRepository.save(contact);

        log.info("Contact unmarked as favorite successfully: {}", contactId);
        return ContactResponse.fromContact(contact);
    }

    @Transactional
    public void deleteContact(Long userId, Long contactId) {
        log.info("Deleting contact: {} for user: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this contact");
        }

        contactRepository.delete(contact);
        log.info("Contact deleted successfully: {}", contactId);
    }

    @Transactional(readOnly = true)
    public boolean areContacts(Long userId, Long contactUserId) {
        return contactRepository.existsByUserIdAndContactUserId(userId, contactUserId);
    }
}