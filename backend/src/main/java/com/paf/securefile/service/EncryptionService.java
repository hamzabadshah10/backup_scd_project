package com.paf.securefile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.spec.SecretKeySpec;
import java.io.InputStream;

@Service
public class EncryptionService {

    @Value("${app.security.encryption-key}")
    private String encryptionKey;

    private static final String ALGORITHM = "AES";

    public CipherInputStream encryptStream(InputStream inputStream) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        return new CipherInputStream(inputStream, cipher);
    }

    public CipherInputStream decryptStream(InputStream inputStream) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec);
        return new CipherInputStream(inputStream, cipher);
    }
}
