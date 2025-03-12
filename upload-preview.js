import { html2canvas } from 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm';

// Function to capture the preview page as an image
async function capturePreview() {
    const previewPage = window.open('social-preview.html', '_blank');
    
    // Wait for the preview page to load
    await new Promise(resolve => {
        previewPage.onload = resolve;
    });

    try {
        // Capture the preview page as an image
        const canvas = await html2canvas(previewPage.document.body);
        previewPage.close();
        
        // Convert canvas to base64
        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        
        // Upload to Firebase Storage
        const imageUrl = await window.storage.uploadPreviewImage(base64Image);
        console.log('Preview image uploaded:', imageUrl);
        
        // Update meta tags
        const metaTags = document.querySelectorAll('meta[property="og:image"], meta[property="twitter:image"]');
        metaTags.forEach(tag => {
            tag.setAttribute('content', imageUrl);
        });
        
        console.log('Meta tags updated successfully');
    } catch (error) {
        console.error('Error capturing and uploading preview:', error);
    }
}

// Run the capture and upload process
capturePreview();
