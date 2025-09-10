(function () {
  'use strict';

  // API endpoints for different environments
  const API_ENDPOINTS = {
    local: 'http://localhost:2000/p/global-search',
    dev: 'https://dev-api.docstar.io/p/global-search',
    prod: 'https://api.docstar.io/p/global-search'
  };

  // Function types for chatbot
  const FUNCTION_TYPES = {
    prod: 'production',
    dev: 'development'
  };

  // Configuration - will be set by user via configure() method
  let CONFIG = {
    environment: 'prod', // 'prod', 'dev', or 'local'
    collectionId: null,
    debounceDelay: 300,
    minSearchLength: 2,
    openMode: 'iframe', // 'iframe', 'newTab', or 'currentTab'
    enableKeyboardShortcut: true // Enable Cmd/Ctrl+K shortcut
  };

  // Global state
  let searchModal = null;
  let searchInput = null;
  let searchResults = null;
  let debounceTimer = null;
  let isModalOpen = false;
  let iframeSidebar = null;
  let isIframeOpen = false;
  let isConfigured = false;
  let currentHighlightIndex = -1;
  let searchResultItems = [];
  let chatbotLoaded = false;
  let threadId = null;
  let chatbotInitialized = false;

  // Debounce function
  function debounce(func, delay) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Generate short ID for thread
  function generateShortId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Initialize chatbot with configuration
  function initializeChatbot() {
    if (chatbotInitialized || !isConfigured) return;

    // Get or create thread ID
    threadId = localStorage.getItem('threadId');
    if (!threadId) {
      threadId = generateShortId();
      localStorage.setItem('threadId', threadId);
    }

    const timer = setInterval(() => {
      if (typeof window?.SendDataToChatbot === 'function') {
        const functionType = FUNCTION_TYPES[CONFIG.environment] || FUNCTION_TYPES.prod;

        window.SendDataToChatbot({
          bridgeName: 'techdoc_public_chatbot',
          threadId: threadId,
          helloId: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiIxMjQifQ.aI4h6OmkVvQP5dyiSNdtKpA4Z1TVNdlKjAe5D8XCrew',
          variables: {
            collectionId: CONFIG.collectionId,
            functionType: functionType,
          },
          hideIcon: 'true',
        });

        chatbotInitialized = true;
        clearInterval(timer);
        console.log('DocStar Chatbot initialized successfully');
      }
    }, 200);

    // Cleanup after 10 seconds if not initialized
    setTimeout(() => {
      clearInterval(timer);
    }, 10000);
  }

  // Load chatbot script
  function loadChatbot() {
    if (chatbotLoaded) return;

    const chatbotScript = document.createElement('script');
    chatbotScript.src = 'https://chatbot-embed.viasocket.com/chatbot-prod.js';
    chatbotScript.id = 'chatbot-main-script';
    chatbotScript.setAttribute('embedToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiIxMjQifQ.aI4h6OmkVvQP5dyiSNdtKpA4Z1TVNdlKjAe5D8XCrew');

    chatbotScript.onload = function () {
      console.log('DocStar Chatbot loaded successfully');
      chatbotLoaded = true;
      // Initialize chatbot after loading
      setTimeout(initializeChatbot, 500);
    };

    chatbotScript.onerror = function () {
      console.error('Failed to load DocStar Chatbot');
    };

    document.head.appendChild(chatbotScript);
  }

  // Ask AI function
  function askAI(query) {
    if (typeof window?.askAi === 'function') {
      window.askAi(query);
    } else {
      console.warn('askAi function not available');
    }
  }

  // Open chatbot function
  function openChatbot() {
    if (typeof window?.openChatbot === 'function') {
      window.openChatbot();
    } else {
      console.warn('openChatbot function not available');
    }
  }

  // Create modal HTML structure
  function createModalHTML() {
    return `
      <div id="docstar-search-modal" class="docstar-search-modal">
        <div class="docstar-search-backdrop"></div>
        <div class="docstar-search-container">
          <div class="docstar-search-header">
            <div class="docstar-search-input-wrapper">
              <svg class="docstar-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="text" 
                id="docstar-search-input" 
                class="docstar-search-input" 
                placeholder="Search anything..."
                autocomplete="off"
                spellcheck="false"
              />
              <button class="docstar-search-close" aria-label="Close search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="docstar-search-body">
            <div id="docstar-search-results" class="docstar-search-results">
              <div class="docstar-search-empty">
                <svg class="docstar-search-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>Start typing to search...</p>
              </div>
            </div>
          </div>
          <div class="docstar-search-footer">
            <div class="docstar-search-shortcuts">
              <span class="docstar-search-shortcut">
                <kbd>↑</kbd><kbd>↓</kbd> Navigate
              </span>
              <span class="docstar-search-shortcut">
                <kbd>Enter</kbd> Select
              </span>
              <span class="docstar-search-shortcut">
                <kbd>Esc</kbd> Close
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Create CSS styles
  function createStyles() {
    const styles = `
      .docstar-search-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999;
        display: none;
        align-items: flex-start;
        justify-content: center;
        padding-top: 10vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .docstar-search-modal.open {
        display: flex;
      }

      .docstar-search-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }

      .docstar-search-container {
        position: relative;
        width: 90%;
        max-width: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        animation: docstar-modal-enter 0.2s ease-out;
      }

      @keyframes docstar-modal-enter {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .docstar-search-header {
        border-bottom: 1px solid #e5e7eb;
        padding: 0;
      }

      .docstar-search-input-wrapper {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 12px;
      }

      .docstar-search-icon {
        color: #6b7280;
        flex-shrink: 0;
      }

      .docstar-search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        color: #111827;
        background: transparent;
      }

      .docstar-search-input::placeholder {
        color: #9ca3af;
      }

      .docstar-search-close {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #6b7280;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .docstar-search-close:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .docstar-search-body {
        max-height: 400px;
        overflow-y: auto;
      }

      .docstar-search-results {
        padding: 8px 0;
      }

      .docstar-search-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #6b7280;
        text-align: center;
      }

      .docstar-search-empty-icon {
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .docstar-search-empty p {
        margin: 0;
        font-size: 14px;
      }

      .docstar-search-result-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        cursor: pointer;
        transition: background-color 0.15s;
        text-decoration: none;
        color: inherit;
        border-left: 3px solid transparent;
      }

      .docstar-search-result-item:hover,
      .docstar-search-result-item.highlighted {
        background: #f8fafc;
        border-left-color: #3b82f6;
      }

      .docstar-search-result-icon {
        width: 20px;
        height: 20px;
        margin-right: 12px;
        color: #6b7280;
        flex-shrink: 0;
      }

      .docstar-search-result-content {
        flex: 1;
        min-width: 0;
      }

      .docstar-search-result-title {
        font-size: 14px;
        font-weight: 500;
        color: #111827;
        margin: 0 0 2px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .docstar-search-result-url {
        display: none;
      }

      .docstar-search-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: #6b7280;
      }

      .docstar-search-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: docstar-spin 1s linear infinite;
        margin-right: 8px;
      }

      @keyframes docstar-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .docstar-search-footer {
        border-top: 1px solid #e5e7eb;
        padding: 12px 20px;
        background: #f9fafb;
      }

      .docstar-search-shortcuts {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #6b7280;
      }

      .docstar-search-shortcut kbd {
        color: #6b7280;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 11px;
        font-family: inherit;
        margin: 0 2px;
      }

      .docstar-search-no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #6b7280;
        text-align: center;
      }

      .docstar-search-no-results p {
        margin: 0;
        font-size: 14px;
      }

      .docstar-ask-ai-section {
        padding: 12px 20px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .docstar-ask-ai-label {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }

      .docstar-ask-ai-button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }

      .docstar-ask-ai-button:hover {
        background: #e5e7eb;
        border-color: #9ca3af;
      }

      .docstar-sparkles-icon {
        color: #3b82f6;
        flex-shrink: 0;
      }

      .docstar-ask-ai-button span {
        flex: 1;
        font-weight: 400;
      }

      .docstar-iframe-sidebar {
        position: fixed;
        top: 0;
        right: -40%;
        width: 40%;
        height: 100vh;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
        z-index: 999998;
        transition: right 0.3s ease;
        border-left: 1px solid rgba(229, 231, 235, 0.8);
      }

      .docstar-iframe-sidebar.open {
        right: 0;
      }

      .docstar-iframe-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(229, 231, 235, 0.8);
        background: rgba(249, 250, 251, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .docstar-iframe-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .docstar-iframe-new-tab {
        background: none;
        color: #374151;
        border: none;
        padding: 0;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .docstar-iframe-new-tab:hover {
        color: #1f2937;
      }

      .docstar-iframe-title {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin: 0;
      }

      .docstar-iframe-close {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color:rgb(243, 107, 107);
        font-size: 14px;
        transition: all 0.2s;
      }

      .docstar-iframe-close:hover {
        color: #1f2937;
      }

      .docstar-iframe-content {
        width: 100%;
        height: calc(100vh - 60px);
        border: none;
        border-radius: 8px;
      }

      .docstar-iframe-sidebar.open ~ .docstar-search-modal {
        padding-right: 40%;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // API call function
  async function searchAPI(searchTerm) {
    try {
      const apiEndpoint = API_ENDPOINTS[CONFIG.environment];
      if (!apiEndpoint) {
        throw new Error(`Invalid environment: ${CONFIG.environment}`);
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: CONFIG.collectionId,
          searchTerm: searchTerm,
          returnLinks: true,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search API error:', error);
      return null;
    }
  }

  // Display search results
  function displayResults(data, searchTerm) {
    if (!data || !data.links || !Array.isArray(data.links)) {
      searchResults.innerHTML = `
        <div class="docstar-search-no-results">
          <p>No results found for "${searchTerm}"</p>
        </div>
      `;
      return;
    }

    const links = data.links;
    if (links.length === 0) {
      searchResults.innerHTML = `
        <div class="docstar-search-no-results">
          <p>No results found for "${searchTerm}"</p>
        </div>
      `;
      return;
    }

    const resultsHTML = links.map((item, index) => {
      const url = item.link || '#';
      const title = item.name || 'Untitled';

      return `
        <div class="docstar-search-result-item" data-index="${index}" data-url="${url}" onclick="handleResultClick('${url}', event)">
          <svg class="docstar-search-result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <div class="docstar-search-result-content">
            <div class="docstar-search-result-title">${title}</div>
            <div class="docstar-search-result-url">${url}</div>
          </div>
        </div>
      `;
    }).join('');

    // Add Ask AI button after results
    const askAIButton = `
      <div class="docstar-ask-ai-section">
        <p class="docstar-ask-ai-label">Ask AI assistant</p>
        <button class="docstar-ask-ai-button" onclick="handleAskAI('${searchTerm.replace(/'/g, "\\'")}')">
          <svg class="docstar-sparkles-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0L9.937 15.5Z"/>
          </svg>
          <span>Can you tell me about ${searchTerm}?</span>
        </button>
      </div>
    `;

    searchResults.innerHTML = resultsHTML + askAIButton;

    // Update search result items for navigation
    searchResultItems = searchResults.querySelectorAll('.docstar-search-result-item');
    currentHighlightIndex = -1;
  }

  // Handle Ask AI button click
  window.handleAskAI = function (searchTerm) {
    openChatbot();
    askAI(searchTerm);
    closeModal();
  };

  // Handle result click
  window.handleResultClick = function (url, event) {
    event.preventDefault();

    const openMode = CONFIG.openMode;

    if (openMode === 'iframe') {
      openInIframeSidebar(url);
    } else if (openMode === 'newTab') {
      window.open(url, '_blank');
    } else if (openMode === 'currentTab') {
      window.location.href = url;
    }

    // Close search modal
    closeModal();
  };

  // Create iframe sidebar
  function createIframeSidebar() {
    const sidebarHTML = `
      <div id="docstar-iframe-sidebar" class="docstar-iframe-sidebar">
        <div class="docstar-iframe-header">
          <div class="docstar-iframe-actions">
            <button class="docstar-iframe-new-tab" onclick="openCurrentIframeInNewTab()" aria-label="Open in new tab">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
            <button class="docstar-iframe-close" onclick="closeIframeSidebar()" aria-label="Close preview">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <iframe id="docstar-iframe-content" class="docstar-iframe-content" src="about:blank"></iframe>
      </div>
    `;

    const sidebarContainer = document.createElement('div');
    sidebarContainer.innerHTML = sidebarHTML;
    document.body.appendChild(sidebarContainer.firstElementChild);

    iframeSidebar = document.getElementById('docstar-iframe-sidebar');
  }

  // Open in iframe sidebar
  function openInIframeSidebar(url) {
    if (!iframeSidebar) {
      createIframeSidebar();
    }

    const iframe = document.getElementById('docstar-iframe-content');
    iframe.src = url;

    iframeSidebar.classList.add('open');
    isIframeOpen = true;

    // Adjust body padding
    document.body.style.paddingRight = '30%';
  }

  // Open current iframe content in new tab
  window.openCurrentIframeInNewTab = function () {
    const iframe = document.getElementById('docstar-iframe-content');
    if (iframe && iframe.src && iframe.src !== 'about:blank') {
      window.open(iframe.src, '_blank');
    }
  };

  // Close iframe sidebar
  window.closeIframeSidebar = function () {
    if (iframeSidebar) {
      iframeSidebar.classList.remove('open');
      isIframeOpen = false;

      // Reset body padding
      document.body.style.paddingRight = '';

      // Clear iframe src after animation
      setTimeout(() => {
        const iframe = document.getElementById('docstar-iframe-content');
        if (iframe) {
          iframe.src = 'about:blank';
        }
      }, 300);
    }
  };

  // Show loading state
  function showLoading() {
    searchResults.innerHTML = `
      <div class="docstar-search-loading">
        <div class="docstar-search-spinner"></div>
        <span>Searching...</span>
      </div>
    `;
  }

  // Show empty state
  function showEmptyState() {
    searchResults.innerHTML = `
      <div class="docstar-search-empty">
        <svg class="docstar-search-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>Start typing to search...</p>
      </div>
    `;
    searchResultItems = [];
    currentHighlightIndex = -1;
  }

  // Navigation functions
  function highlightResult(index) {
    // Remove previous highlight
    searchResultItems.forEach(item => item.classList.remove('highlighted'));

    if (index >= 0 && index < searchResultItems.length) {
      currentHighlightIndex = index;
      searchResultItems[index].classList.add('highlighted');

      // Scroll into view if needed
      searchResultItems[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    } else {
      currentHighlightIndex = -1;
    }
  }

  function navigateUp() {
    if (searchResultItems.length === 0) return;

    const newIndex = currentHighlightIndex <= 0
      ? searchResultItems.length - 1
      : currentHighlightIndex - 1;

    highlightResult(newIndex);
  }

  function navigateDown() {
    if (searchResultItems.length === 0) return;

    const newIndex = currentHighlightIndex >= searchResultItems.length - 1
      ? 0
      : currentHighlightIndex + 1;

    highlightResult(newIndex);
  }

  function selectCurrentResult() {
    if (currentHighlightIndex >= 0 && currentHighlightIndex < searchResultItems.length) {
      const selectedItem = searchResultItems[currentHighlightIndex];
      const url = selectedItem.getAttribute('data-url');
      if (url) {
        handleResultClick(url, { preventDefault: () => { } });
      }
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(async (searchTerm) => {
    if (searchTerm.length < CONFIG.minSearchLength) {
      showEmptyState();
      return;
    }

    showLoading();
    const results = await searchAPI(searchTerm);
    displayResults(results, searchTerm);
  }, CONFIG.debounceDelay);

  // Handle search input
  function handleSearchInput(event) {
    const searchTerm = event.target.value.trim();

    if (searchTerm === '') {
      showEmptyState();
      return;
    }

    debouncedSearch(searchTerm);
  }

  // Open modal
  function openModal() {
    if (!isConfigured) {
      console.error('DocStar Search SDK: Configuration required. Please call window.DocStarSearch.configure() with collectionId and openMode.');
      return;
    }

    if (isModalOpen) return;

    isModalOpen = true;
    searchModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus on input after animation
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  // Close modal
  function closeModal() {
    if (!isModalOpen) return;

    isModalOpen = false;
    searchModal.classList.remove('open');
    document.body.style.overflow = '';

    // Clear search
    searchInput.value = '';
    showEmptyState();
  }

  // Handle keyboard shortcuts
  function handleKeydown(event) {
    // Global Cmd/Ctrl + K shortcut (only if enabled)
    if (CONFIG.enableKeyboardShortcut && (event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      if (!isConfigured) {
        console.error('DocStar Search SDK: Configuration required. Please call window.DocStarSearch.configure() with collectionId and openMode.');
        return;
      }
      openModal();
      return;
    }

    // Modal-specific shortcuts
    if (isModalOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateUp();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateDown();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        selectCurrentResult();
      }
    }

    // Iframe-specific shortcuts
    if (isIframeOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeIframeSidebar();
      }
    }
  }

  // Initialize the search modal
  function initializeModal() {
    // Create styles
    createStyles();

    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = createModalHTML();
    document.body.appendChild(modalContainer.firstElementChild);

    // Get references
    searchModal = document.getElementById('docstar-search-modal');
    searchInput = document.getElementById('docstar-search-input');
    searchResults = document.getElementById('docstar-search-results');

    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);

    // Close button
    const closeButton = searchModal.querySelector('.docstar-search-close');
    closeButton.addEventListener('click', closeModal);

    // Backdrop click
    const backdrop = searchModal.querySelector('.docstar-search-backdrop');
    backdrop.addEventListener('click', closeModal);

    // Prevent modal close when clicking inside container
    const container = searchModal.querySelector('.docstar-search-container');
    container.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  // Configuration function
  window.DocStarSearch = {
    init: function (options = {}) {
      // Initialize modal without configuration
      initializeModal();
      // Load chatbot
      loadChatbot();
    },

    open: openModal,
    close: closeModal,

    configure: function (options) {
      // Validate required fields
      if (!options.collectionId) {
        throw new Error('DocStar Search SDK: collectionId is required');
      }
      if (!options.openMode) {
        throw new Error('DocStar Search SDK: openMode is required (iframe, newTab, or currentTab)');
      }

      // Validate openMode values
      const validModes = ['iframe', 'newTab', 'currentTab'];
      if (!validModes.includes(options.openMode)) {
        throw new Error('DocStar Search SDK: openMode must be one of: iframe, newTab, currentTab');
      }

      // Validate environment if provided
      if (options.environment && !API_ENDPOINTS[options.environment]) {
        throw new Error('DocStar Search SDK: environment must be one of: prod, dev, local');
      }

      // Set default environment to prod if not provided
      if (!options.environment) {
        options.environment = 'prod';
      }

      // Merge options with default config
      Object.assign(CONFIG, options);
      isConfigured = true;

      // Initialize chatbot after configuration
      if (chatbotLoaded) {
        initializeChatbot();
      }

      console.log('DocStar Search SDK: Configuration successful');
    }
  };

  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.DocStarSearch.init();
    });
  } else {
    window.DocStarSearch.init();
  }

})();