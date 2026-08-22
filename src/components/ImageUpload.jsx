import React, { useRef } from 'react';

export default function ImageUpload({ 
  value = '', 
  onChange, 
  name = '', 
  size = 90, 
  className = '' 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Redimensionar e comprimir para Data URL de alta performance
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        onChange(compressedDataUrl);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initialLetter = name ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <div className={`patient-image-upload-wrapper ${className}`}>
      <div 
        className="image-upload-preview" 
        style={{ width: size, height: size }}
        onClick={() => fileInputRef.current?.click()}
        title="Clique para adicionar ou trocar a foto"
      >
        {value ? (
          <img src={value} alt={name || 'Foto do paciente'} className="uploaded-patient-photo" />
        ) : (
          <div className="avatar-letter-placeholder">
            <span>{initialLetter}</span>
            <div className="upload-camera-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <div className="image-upload-actions">
        <button 
          type="button" 
          className="btn-upload-action"
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? 'Alterar foto' : 'Adicionar foto'}
        </button>
        {value && (
          <button 
            type="button" 
            className="btn-remove-photo"
            onClick={handleRemove}
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
