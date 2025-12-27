// Text Counter App - Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const sentenceCount = document.getElementById('sentenceCount');
    const paragraphCount = document.getElementById('paragraphCount');
    const editStatus = document.getElementById('editStatus');
    const savedItems = document.getElementById('savedItems');
    
    // Buttons
    const uppercaseBtn = document.getElementById('uppercaseBtn');
    const lowercaseBtn = document.getElementById('lowercaseBtn');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadSavedBtn = document.getElementById('loadSavedBtn');
    const toggleEditBtn = document.getElementById('toggleEditBtn');
    const themeSwitch = document.getElementById('checkbox');
    
    // State
    let isEditable = true;
    let savedTexts = JSON.parse(localStorage.getItem('textCounterSavedTexts')) || [];
    
    // Initialize
    updateCounters();
    loadSavedTextsList();
    loadSavedTheme();
    
    // Event Listeners
    textInput.addEventListener('input', updateCounters);
    
    uppercaseBtn.addEventListener('click', function() {
        textInput.value = textInput.value.toUpperCase();
        updateCounters();
        showToast('Text converted to UPPERCASE');
    });
    
    lowercaseBtn.addEventListener('click', function() {
        textInput.value = textInput.value.toLowerCase();
        updateCounters();
        showToast('Text converted to lowercase');
    });
    
    copyBtn.addEventListener('click', copyTextToClipboard);
    
    saveBtn.addEventListener('click', saveCurrentText);
    
    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all text?')) {
            textInput.value = '';
            updateCounters();
            showToast('Text cleared successfully');
        }
    });
    
    loadSavedBtn.addEventListener('click', function() {
        if (savedTexts.length === 0) {
            showToast('No saved texts found', 'warning');
            return;
        }
        showSavedTextsModal();
    });
    
    toggleEditBtn.addEventListener('click', toggleEditMode);
    
    themeSwitch.addEventListener('change', toggleTheme);
    
    // Functions
    function updateCounters() {
        const text = textInput.value;
        
        // Character count
        charCount.textContent = text.length;
        
        // Word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = words.length;
        
        // Sentence count
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        sentenceCount.textContent = sentences.length;
        
        // Paragraph count
        const paragraphs = text.split(/\n+/).filter(paragraph => paragraph.trim().length > 0);
        paragraphCount.textContent = paragraphs.length;
    }
    
    function copyTextToClipboard() {
        if (!textInput.value.trim()) {
            showToast('No text to copy', 'warning');
            return;
        }
        
        textInput.select();
        textInput.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            navigator.clipboard.writeText(textInput.value)
                .then(() => {
                    showToast('Text copied to clipboard!');
                })
                .catch(err => {
                    // Fallback for older browsers
                    document.execCommand('copy');
                    showToast('Text copied to clipboard!');
                });
        } catch (err) {
            // Final fallback
            document.execCommand('copy');
            showToast('Text copied to clipboard!');
        }
    }
    
    function saveCurrentText() {
        const text = textInput.value.trim();
        if (!text) {
            showToast('No text to save', 'warning');
            return;
        }
        
        const timestamp = new Date().toLocaleString();
        const textPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
        
        const savedItem = {
            id: Date.now(),
            text: text,
            preview: textPreview,
            timestamp: timestamp,
            characters: text.length,
            words: text.split(/\s+/).filter(word => word.length > 0).length
        };
        
        savedTexts.unshift(savedItem);
        
        // Keep only last 10 saved items
        if (savedTexts.length > 10) {
            savedTexts.pop();
        }
        
        localStorage.setItem('textCounterSavedTexts', JSON.stringify(savedTexts));
        loadSavedTextsList();
        
        showToast('Text saved successfully!');
    }
    
    function loadSavedTextsList() {
        if (savedTexts.length === 0) {
            savedItems.innerHTML = '<p class="empty-message">No saved text yet</p>';
            return;
        }
        
        savedItems.innerHTML = savedTexts.map(item => `
            <div class="saved-item" data-id="${item.id}">
                <p><strong>${item.preview}</strong></p>
                <small>${item.words} words, ${item.characters} chars • ${item.timestamp}</small>
            </div>
        `).join('');
        
        // Add click event to saved items
        document.querySelectorAll('.saved-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                loadTextById(id);
            });
        });
    }
    
    function loadTextById(id) {
        const item = savedTexts.find(text => text.id === id);
        if (item) {
            textInput.value = item.text;
            updateCounters();
            showToast('Text loaded successfully!');
        }
    }
    
    function showSavedTextsModal() {
        const modalContent = savedTexts.map(item => `
            <div class="modal-item" data-id="${item.id}">
                <div class="modal-item-content">
                    <p><strong>${item.preview}</strong></p>
                    <small>${item.words} words, ${item.characters} chars • ${item.timestamp}</small>
                </div>
                <button class="btn-delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-open"></i> Saved Texts</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${modalContent || '<p class="empty-message">No saved texts</p>'}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeModalBtn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal {
                background-color: var(--light-card-bg);
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                animation: slideIn 0.3s;
            }
            
            .dark-mode .modal {
                background-color: var(--dark-card-bg);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--light-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .dark-mode .modal-header {
                border-color: var(--dark-border);
            }
            
            .modal-header h3 {
                margin: 0;
                color: var(--primary);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--light-secondary);
            }
            
            .dark-mode .modal-close {
                color: var(--dark-secondary);
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-item {
                padding: 15px;
                margin-bottom: 10px;
                background-color: rgba(67, 97, 238, 0.1);
                border-radius: 8px;
                border-left: 4px solid var(--primary);
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background-color 0.2s;
            }
            
            .modal-item:hover {
                background-color: rgba(67, 97, 238, 0.2);
            }
            
            .modal-item-content {
                flex: 1;
            }
            
            .modal-item-content p {
                margin: 0 0 5px 0;
            }
            
            .btn-delete {
                background: none;
                border: none;
                color: var(--warning);
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .btn-delete:hover {
                background-color: rgba(247, 37, 133, 0.1);
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid var(--light-border);
                text-align: right;
            }
            
            .dark-mode .modal-footer {
                border-color: var(--dark-border);
            }
        `;
        document.head.appendChild(style);
        
        // Event listeners for modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelector('#closeModalBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelectorAll('.modal-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.btn-delete')) {
                    const id = parseInt(this.getAttribute('data-id'));
                    loadTextById(id);
                    document.body.removeChild(modal);
                    document.head.removeChild(style);
                }
            });
        });
        
        modal.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.getAttribute('data-id'));
                deleteSavedText(id);
                this.closest('.modal-item').remove();
                
                if (modal.querySelectorAll('.modal-item').length === 0) {
                    modal.querySelector('.modal-body').innerHTML = '<p class="empty-message">No saved texts</p>';
                }
            });
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }
    
    function deleteSavedText(id) {
        savedTexts = savedTexts.filter(text => text.id !== id);
        localStorage.setItem('textCounterSavedTexts', JSON.stringify(savedTexts));
        loadSavedTextsList();
        showToast('Text deleted successfully');
    }
    
    function toggleEditMode() {
        isEditable = !isEditable;
        textInput.disabled = !isEditable;
        
        if (isEditable) {
            editStatus.innerHTML = '<i class="fas fa-edit"></i> Edit Mode: Active';
            toggleEditBtn.innerHTML = '<i class="fas fa-lock"></i> Disable Edit';
            showToast('Edit mode enabled');
        } else {
            editStatus.innerHTML = '<i class="fas fa-lock"></i> Edit Mode: Disabled';
            toggleEditBtn.innerHTML = '<i class="fas fa-pen"></i> Enable Edit';
            showToast('Edit mode disabled');
        }
    }
    
    function toggleTheme() {
        if (themeSwitch.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('textCounterTheme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('textCounterTheme', 'light');
        }
    }
    
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('textCounterTheme') || 'light';
        if (savedTheme === 'dark') {
            themeSwitch.checked = true;
            document.body.classList.add('dark-mode');
        } else {
            themeSwitch.checked = false;
            document.body.classList.add('light-mode');
        }
    }
    
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        toastMessage.textContent = message;
        
        // Set icon based on type
        if (type === 'warning') {
            toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
            toast.style.backgroundColor = 'var(--warning)';
        } else if (type === 'error') {
            toastIcon.className = 'fas fa-times-circle toast-icon';
            toast.style.backgroundColor = 'var(--danger)';
        } else {
            toastIcon.className = 'fas fa-check-circle toast-icon';
            toast.style.backgroundColor = 'var(--success)';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Initialize with sample text
    const sampleText = `Welcome to Text Counter Pro!

This is a sample text to demonstrate the features of this application.

You can:
- Count characters, words, sentences, and paragraphs
- Convert text to uppercase or lowercase
- Copy text to clipboard
- Save text for later use
- Toggle edit mode
- Switch between dark and light themes

Try editing this text and see the counters update in real-time!`;
    
    textInput.value = sampleText;
    updateCounters();
});