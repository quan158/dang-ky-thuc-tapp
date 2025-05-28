// components/ImageUploader.tsx
import { useState } from 'react';

interface ImageUploaderProps {
    defaultImage: string;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  // Sửa type ở đây
    className?: string;
}

function ImageUploader({ defaultImage, onImageChange, className = "" }: ImageUploaderProps) {
    const [imagePreview, setImagePreview] = useState(defaultImage);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                onImageChange(e); // Truyền toàn bộ event

                const reader = new FileReader();
                reader.onload = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file (jpg, jpeg, png, gif, etc.)');
                e.target.value = '';
            }
        }
    };

    return (
        <div className={`d-flex flex-column image-uploader ${className}`}>
            <img
                src={imagePreview}
                className="mb-3"
                alt="preview"
                style={{ maxWidth: '100%', height: 'auto' }}
            />
            <input
                type="file"
                className="form-control-mini"
                accept="image/*"
                onChange={handleImageChange}
            />
        </div>
    );
}

export default ImageUploader;