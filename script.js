document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const uploadContainer = document.getElementById('uploadContainer');
    const compressionInterface = document.getElementById('compressionInterface');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalInfo = document.getElementById('originalInfo');
    const compressedInfo = document.getElementById('compressedInfo');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const formatSelect = document.getElementById('format');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    let currentFile = null;
    let compressedFileBlob = null;
    
    // Event Listeners
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    // Quality slider update
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value;
    });
    
    // Compress button
    compressBtn.addEventListener('click', compressImage);
    
    // Download button
    downloadBtn.addEventListener('click', downloadCompressedImage);
    
    // File handling
    function handleFiles(e) {
        const files = e.target.files;
        if (files.length === 0) return;
        
        currentFile = files[0];
        
        // Check if file is an image
        if (!currentFile.type.match('image.*')) {
            alert('Please select an image file (JPG, PNG, or WebP)');
            return;
        }
        
        // Show the compression interface
        uploadContainer.style.display = 'none';
        compressionInterface.style.display = 'block';
        
        // Display original image
        const reader = new FileReader();
        reader.onload = function(e) {
            originalPreview.innerHTML = `<img src="${e.target.result}" alt="Original">`;
            
            // Display file info
            const fileSize = formatFileSize(currentFile.size);
            originalInfo.textContent = `${currentFile.name} • ${fileSize} • ${currentFile.type}`;
        };
        reader.readAsDataURL(currentFile);
    }
    
    // Image compression
    function compressImage() {
        if (!currentFile) return;
        
        // Show progress
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = 'Compressing...';
        compressBtn.disabled = true;
        
        // Simulate progress (in a real app, this would be the actual compression progress)
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                finishCompression();
            }
        }, 100);
        
        // In a real implementation, you would use:
        // 1. The Canvas API for basic compression
        // 2. A library like Compressor.js for more advanced options
        // 3. WebAssembly for near-native performance with libraries like MozJPEG or WebP
    }
    
    function finishCompression() {
        progressText.textContent = 'Compression complete!';
        compressBtn.disabled = false;
        
        // In a real app, this would be the actual compressed image
        // For demo purposes, we'll just use the original image
        const quality = qualitySlider.value / 100;
        const format = formatSelect.value === 'auto' 
            ? currentFile.type.split('/')[1] 
            : formatSelect.value;
        
        // Simulate compression by reducing quality
        compressWithCanvas(currentFile, quality, format)
            .then(compressedBlob => {
                compressedFileBlob = compressedBlob;
                
                // Display compressed image
                const compressedUrl = URL.createObjectURL(compressedBlob);
                compressedPreview.innerHTML = `<img src="${compressedUrl}" alt="Compressed">`;
                
                // Display compressed file info
                const fileSize = formatFileSize(compressedBlob.size);
                compressedInfo.textContent = `compressed.${format} • ${fileSize} • ${compressedBlob.type}`;
                
                // Show download button
                downloadBtn.style.display = 'block';
            });
    }
    
    function compressWithCanvas(file, quality, format) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions (optional: you could add resizing)
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert to blob with specified quality and format
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, `image/${format}`, quality);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    function downloadCompressedImage() {
        if (!compressedFileBlob) return;
        
        const a = document.createElement('a');
        const url = URL.createObjectURL(compressedFileBlob);
        const format = formatSelect.value === 'auto' 
            ? currentFile.name.split('.').pop() 
            : formatSelect.value;
        
        a.href = url;
        a.download = `compressed.${format}`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
