package org.rtiassist.entity;

import jakarta.persistence.*;
import org.rtiassist.model.CaseDocument;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "case_id", length = 64, nullable = false)
    private String caseId;

    @Column(name = "filename", length = 255, nullable = false)
    private String filename;

    @Column(name = "content_type", length = 128)
    private String contentType;

    @Column(name = "storage_path", length = 512)
    private String storagePath;

    @Column(name = "uploaded_at", length = 64)
    private String uploadedAt;

    @Column(name = "kind", length = 64)
    private String kind = "attachment"; // 'reply', 'petition', 'appeal', 'attachment'

    @Column(name = "file_size")
    private Long fileSize;

    public DocumentEntity() {}

    public DocumentEntity(CaseDocument model, String storagePath, String kind) {
        if (model == null) return;
        this.id = model.getId();
        this.caseId = model.getCaseId();
        this.filename = model.getFileName();
        this.contentType = model.getMimeType();
        this.storagePath = storagePath != null ? storagePath : model.getFileUrl();
        this.uploadedAt = model.getUploadedAt();
        this.kind = kind != null ? kind : model.getCategory();
        this.fileSize = model.getFileSize();
    }

    public CaseDocument toModel() {
        CaseDocument doc = new CaseDocument();
        doc.setId(this.id);
        doc.setCaseId(this.caseId);
        doc.setFileName(this.filename);
        doc.setMimeType(this.contentType);
        doc.setFileUrl(this.storagePath != null ? this.storagePath : "#");
        doc.setCategory(this.kind);
        doc.setFileSize(this.fileSize);
        doc.setUploadedAt(this.uploadedAt);
        return doc;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }
    public String getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}
