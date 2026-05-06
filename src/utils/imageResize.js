// utils/imageResize.js
export async function resizeImage(file, maxWidth, maxHeight, quality = 0.92) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Scale down only if larger than target; never upscale
            const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(url);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        img.src = url;
    });
}