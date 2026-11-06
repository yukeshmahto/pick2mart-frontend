'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import { mediaService } from '../services/media.service';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = 'Upload Image',
  required = false,
  helperText,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Normalize current images to an array for preview & manipulation
  const currentImages = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((img) => typeof img === 'string' && img.trim().length > 0);
    }
    if (typeof value === 'string') {
      // Could be comma-separated or single URL
      if (value.includes(',')) {
        return value.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return value.trim() ? [value.trim()] : [];
    }
    return [];
  }, [value]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setErrorMessage('');
    setIsUploading(true);

    try {
      const filesToUpload = multiple ? Array.from(files) : [files[0]];
      const uploadedUrls = [];

      for (const file of filesToUpload) {
        // 1. Validation: type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          throw new Error(
            `File "${file.name}" is not supported. Please select JPEG, PNG, WEBP, or GIF.`
          );
        }
        // 2. Validation: size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new Error(
            `File "${file.name}" exceeds the 5 MB maximum size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
          );
        }

        // 3. Upload to backend
        const res = await mediaService.uploadFile(file);
        if (res?.data?.url) {
          uploadedUrls.push(res.data.url);
        } else {
          throw new Error(res?.message || `Failed to upload "${file.name}"`);
        }
      }

      if (multiple) {
        const nextList = [...currentImages, ...uploadedUrls];
        if (typeof value === 'string') {
          onChange(nextList.join(', '));
        } else {
          onChange(nextList);
        }
      } else {
        const singleUrl = uploadedUrls[0] || '';
        onChange(singleUrl);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setErrorMessage(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (multiple) {
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      if (typeof value === 'string') {
        onChange(updated.join(', '));
      } else {
        onChange(updated);
      }
    } else {
      onChange('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {label && (
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{
          border: isDragOver ? '2px dashed #0284c7' : '2px dashed #cbd5e1',
          backgroundColor: isDragOver ? '#f0f9ff' : '#f8fafc',
          borderRadius: '10px',
          padding: '20px 16px',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
            <Loader2 size={28} className="animate-spin" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Uploading image to server...</span>
          </div>
        ) : (
          <>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Click to browse files
              </span>{' '}
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>or drag & drop</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              JPEG, PNG, WEBP, or GIF (Max 5MB each)
              {multiple && ' • Multi-file upload supported'}
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.825rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #fee2e2',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview Grid */}
      {currentImages.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
            {multiple ? `Uploaded Images (${currentImages.length})` : 'Current Image Preview'}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {currentImages.map((imgUrl, index) => (
              <div
                key={`${imgUrl}-${index}`}
                style={{
                  position: 'relative',
                  width: multiple ? '90px' : '140px',
                  height: multiple ? '90px' : '140px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    // Fallback visual placeholder if external legacy image fails to load
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <div
                  style={{
                    display: 'none',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                    color: '#94a3b8',
                    flexDirection: 'column',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    padding: '4px',
                  }}
                >
                  <ImageIcon size={20} />
                  <span>Image Preview</span>
                </div>

                {/* Delete / Remove overlay button */}
                <button
                  type="button"
                  title="Remove image"
                  onClick={(e) => handleRemoveImage(index, e)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {helperText && !errorMessage && (
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{helperText}</div>
      )}
    </div>
  );
}
