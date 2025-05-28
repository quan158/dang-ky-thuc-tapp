package com.quan.project1.service;

import com.dropbox.core.DbxException;
import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.oauth.DbxCredential;
import com.dropbox.core.v2.DbxClientV2;
import com.dropbox.core.v2.files.FileMetadata;
import com.dropbox.core.v2.files.UploadErrorException;
import com.dropbox.core.v2.files.WriteMode;
import com.dropbox.core.v2.sharing.CreateSharedLinkWithSettingsErrorException;
import com.dropbox.core.v2.sharing.SharedLinkMetadata;
import com.dropbox.core.v2.sharing.SharedLinkSettings;
// import lombok.Value; // Đã xóa import nhầm lẫn này
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // Import đúng của Spring
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
@Slf4j
public class DropboxService {
    @Value("${dropbox.app-key}")
    private String appKey;

    @Value("${dropbox.app-secret}")
    private String appSecret;

    @Value("${dropbox.refresh-token}")
    private String refreshToken;

    private DbxClientV2 dbxClient; // Khai báo client instance

    public DropboxService(
            @Value("${dropbox.app-key}") String appKey,
            @Value("${dropbox.app-secret}") String appSecret,
            @Value("${dropbox.refresh-token}") String refreshToken) {
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.refreshToken = refreshToken;

        DbxRequestConfig config = DbxRequestConfig
                .newBuilder("student-cv-uploader").build();

        DbxCredential credential = new DbxCredential(
                "",
                0L,
                this.refreshToken,
                this.appKey,
                this.appSecret
        );

        this.dbxClient = new DbxClientV2(config, credential);
        log.info("Dropbox DbxClientV2 initialized with refresh token.");
    }

    public String normalizePath(String path) {
        String normalized = Normalizer.normalize(path, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").replaceAll("[^\\p{ASCII}]", "");
    }

    public String uploadFile(MultipartFile file, String dropboxPath) {

        String normalizedPath = normalizePath(dropboxPath);
        log.info("Normalized path: {}", normalizedPath);

        try {
            // Sử dụng dbxClient instance đã được khởi tạo trong constructor
            FileMetadata metadata;
            try (InputStream in = file.getInputStream()) {
                metadata = dbxClient.files().uploadBuilder(normalizedPath)
                        .withMode(WriteMode.OVERWRITE)
                        .uploadAndFinish(in);

            } catch (UploadErrorException uee) {
                log.error("Upload error: {}", uee.getMessage(), uee);
                throw new RuntimeException("Upload error: " + uee.getMessage());
            } catch (DbxException dbxe) {
                // SDK sẽ tự động thử refresh token khi gặp lỗi 401.
                log.error("Dropbox API error during upload (possibly after refresh attempt): {}"
                        , dbxe.getMessage(), dbxe);
                throw new RuntimeException("Dropbox API error during upload: " + dbxe.getMessage());
            } catch (IOException ioe) {
                log.error("File read error: {}", ioe.getMessage(), ioe);
                throw new RuntimeException("File read error: " + ioe.getMessage());
            }

            try {
                SharedLinkSettings settings = SharedLinkSettings.newBuilder().build();
                // Sử dụng dbxClient instance để tạo/lấy share link
                SharedLinkMetadata sharedLinkMetadata = dbxClient.sharing()
                        .createSharedLinkWithSettings(metadata.getPathLower(), settings);

                String sharedUrl = sharedLinkMetadata.getUrl();
                log.info("Created public share link: {}", sharedUrl);

                // Chuyển đổi link share sang link raw (direct view)
                if (sharedUrl != null && sharedUrl.contains("dl=0")) {
                    sharedUrl = sharedUrl.replace("dl=0", "raw=1");
                    log.info("Converted to direct view link: {}", sharedUrl);
                }

                return sharedUrl;
            } catch (CreateSharedLinkWithSettingsErrorException cslwsee) {
                log.warn("Error creating share link (may already exist): {}", cslwsee.getMessage());
                try {
                    // Thử lấy link đã tồn tại nếu có lỗi tạo link
                    SharedLinkMetadata existingLink = dbxClient.sharing().listSharedLinksBuilder()
                            .withPath(metadata.getPathLower())
                            .withDirectOnly(true)
                            .start()
                            .getLinks()
                            .stream()
                            .findFirst()
                            .orElse(null);

                    if (existingLink != null) {
                        String existingUrl = existingLink.getUrl();
                        if (existingUrl != null && existingUrl.contains("dl=0")) {
                            existingUrl = existingUrl.replace("dl=0", "raw=1");
                        }
                        log.info("Retrieved existing share link: {}", existingUrl);
                        return existingUrl;
                    } else {
                        log.error("Cannot create or retrieve share link for file: {}", metadata.getPathDisplay());
                        throw new RuntimeException("Cannot create or retrieve share link for file.");
                    }
                } catch (DbxException e) {
                    log.error("Error retrieving existing share link (possibly after refresh attempt): {}"
                            , e.getMessage(), e);
                    throw new RuntimeException("Error creating or retrieving share link: " + e.getMessage());
                }

            } catch (DbxException dbxe) {
                // SDK sẽ tự động thử refresh token khi gặp lỗi 401
                log.error("Dropbox API error creating share link (possibly after refresh attempt): {}"
                        , dbxe.getMessage(), dbxe);
                throw new RuntimeException("Dropbox API error creating share link: " + dbxe.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error creating share link: {}", e.getMessage(), e);
                throw new RuntimeException("Unexpected error creating share link: " + e.getMessage());
            }

        } catch (Exception e) {
            log.error("General error during upload or share link creation: {}", e.getMessage(), e);
            throw new RuntimeException("Error during upload or share link creation: " + e.getMessage());
        }
    }

}