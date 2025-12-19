'use client';

import { useState, useRef } from 'react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  uploadLabel: string;
  uploadingLabel: string;
  uploadingSuccess: string;
  uploadingError: string;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userName,
  uploadLabel,
  uploadingLabel,
  uploadingSuccess,
  uploadingError,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auth/avatar/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: uploadingSuccess });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || uploadingError });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setMessage({ type: 'error', text: uploadingError });
    } finally {
      setIsUploading(false);
    }
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: 24,
        background: '#f0f9f7',
        borderRadius: 12,
        border: '1px solid #d1e8e3',
      }}
    >
      {/* Avatar Display */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: currentAvatarUrl
            ? `url('${currentAvatarUrl}')`
            : 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          fontWeight: 700,
          color: 'white',
          border: '4px solid white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {!currentAvatarUrl && initials}
      </div>

      {/* Upload Section */}
      <div style={{ textAlign: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {isUploading ? uploadingLabel : `📸 ${uploadLabel}`}
        </button>

        <p style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 0 0' }}>
          JPG, PNG hoặc GIF. Tối đa 5MB.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            width: '100%',
          }}
        >
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}
    </div>
  );
}
