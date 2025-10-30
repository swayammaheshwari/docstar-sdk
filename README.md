# DocStar SDK

A powerful, easy-to-integrate search functionality for modern web applications. Add instant search capabilities to any website with beautiful UI, configurable opening modes, and seamless integration.

## 🚀 Features

- **Beautiful Search Modal** - Dark blur background with smooth animations
- **Multiple Opening Modes** - Iframe sidebar, new tab, or current tab
- **Environment-Based Configuration** - Support for production, development, and local environments
- **AI Chatbot Integration** - Built-in AI assistant for enhanced search experience
- **Keyboard Shortcuts** - Optional Cmd/Ctrl+K support
- **Debounced API Calls** - Configurable delay to prevent excessive requests
- **Cross-Platform** - Works with HTML, React, Vue, Angular, and any web framework
- **Responsive Design** - Mobile-friendly interface
- **Easy Integration** - Just two script tags to get started

## 📦 Installation

### CDN (Recommended)

```html
<!-- Include the DocStar Search SDK -->
<script src="https://cdn.jsdelivr.net/gh/swayammaheshwari/docstar-sdk/scripts/search-sdk/search-sdk.script.min.js"></script>

<!-- Configure the SDK -->
<script>
  window.DocStarSearch.configure({
    collectionId: "your-collection-id",
    environment: "prod", // "prod", "dev", or "local"
    openMode: "iframe", // "iframe", "newTab", or "currentTab"
    debounceDelay: 300,
    enableKeyboardShortcut: true,
    minSearchLength: 2
  });
</script>
```

### Local Installation

1. Download the SDK files
2. Include in your project
3. Configure as shown above

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collectionId` | string | **required** | Collection ID for search |
| `environment` | string | `"prod"` | API environment: `"prod"`, `"dev"`, or `"local"` |
| `openMode` | string | `"iframe"` | How results open: `"iframe"`, `"newTab"`, `"currentTab"` |
| `debounceDelay` | number | `300` | Delay in ms before API call (100-2000) |
| `enableKeyboardShortcut` | boolean | `true` | Enable Cmd/Ctrl+K shortcut |
| `minSearchLength` | number | `2` | Minimum characters before search |

### Environment Configuration

The SDK automatically selects the appropriate API endpoint based on the environment:

| Environment | API Endpoint | Description |
|-------------|--------------|-------------|
| `prod` | `https://api.docstar.io/p/global-search` | Production environment (default) |
| `dev` | `https://dev-api.docstar.io/p/global-search` | Development environment |
| `local` | `http://localhost:2000/p/global-search` | Local development server |

## 🎯 Usage

### Basic Usage

```javascript
// Open search modal programmatically
window.DocStarSearch.open();

// Close search modal
window.DocStarSearch.close();
```

### React Integration

```jsx
import { useEffect } from 'react';

function SearchButton() {
  const handleSearch = () => {
    if (window.DocStarSearch) {
      window.DocStarSearch.open();
    }
  };

  return (
    <button onClick={handleSearch}>
      Search
    </button>
  );
}
```

### Advanced Configuration Examples

#### Development Environment Setup
```javascript
window.DocStarSearch.configure({
  collectionId: "dev-collection-123",
  environment: "dev",
  openMode: "iframe",
  debounceDelay: 500, // Slower for development
  enableKeyboardShortcut: true,
  minSearchLength: 1 // More sensitive for testing
});
```

#### Production Environment with New Tab Opening
```javascript
window.DocStarSearch.configure({
  collectionId: "prod-collection-456",
  environment: "prod",
  openMode: "newTab",
  debounceDelay: 200, // Faster for production
  enableKeyboardShortcut: false, // Disabled to avoid conflicts
  minSearchLength: 3 // More restrictive
});
```

#### Local Development Setup
```javascript
window.DocStarSearch.configure({
  collectionId: "local-test-789",
  environment: "local",
  openMode: "currentTab",
  debounceDelay: 100,
  enableKeyboardShortcut: true,
  minSearchLength: 2
});
```

## 🔧 API Response Format

Your API endpoint should return data in this format:

```json
{
  "links": [
    {
      "name": "Page Title",
      "link": "https://example.com/page"
    }
  ]
}
```

## 🤖 AI Chatbot Integration

The SDK includes built-in AI chatbot functionality that enhances the search experience:

- **Ask AI Button** - Appears after search results for natural language queries
- **Automatic Initialization** - Chatbot loads automatically when SDK is configured
- **Thread Management** - Maintains conversation context across sessions
- **Environment-Aware** - Uses appropriate function types based on environment

### AI Features
- Click "Ask AI" button in search results to get AI-powered answers
- Chatbot opens automatically when AI assistance is requested
- Persistent thread ID for conversation continuity

## 🎨 Opening Modes

### Iframe Sidebar
- Opens results in a sidebar overlay (40% of screen width)
- Users can preview content without leaving the page
- Includes "Open in New Tab" and "Close" controls
- Responsive design with mobile-friendly interface
- Automatic hamburger menu injection for better UX

### New Tab
- Opens search results in a new browser tab
- Best for external links

### Current Tab
- Navigates to the result in the current tab
- Traditional navigation behavior

## ⌨️ Keyboard Shortcuts

- **Cmd/Ctrl + K** - Open search modal (if enabled)
- **Escape** - Close search modal or iframe sidebar
- **Arrow Up/Down** - Navigate through search results
- **Enter** - Select highlighted search result
- **Escape** (in iframe) - Close iframe sidebar

## 🔨 Development

### Building the SDK

```bash
# Install dependencies
npm install

# Build minified version
npm run build

# Or use terser directly
npm run minify
```

### File Structure

```
scripts/
├── search-sdk/
│   ├── search-sdk.script.js      # Source code
│   └── search-sdk.script.min.js  # Minified version
└── build.js                      # Build script
```

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🔍 Troubleshooting

### Common Issues

**Search modal doesn't open**
- Ensure you've called `window.DocStarSearch.configure()` with required parameters
- Check browser console for configuration errors
- Verify `collectionId` is provided

**API requests failing**
- Check if the correct `environment` is set
- Verify your collection ID is valid for the selected environment
- Check network tab for API response errors

**Keyboard shortcut not working**
- Ensure `enableKeyboardShortcut` is set to `true`
- Check for conflicts with other keyboard shortcuts on the page
- Verify the modal is properly initialized

**Iframe sidebar not displaying correctly**
- Check for CSS conflicts with your existing styles
- Ensure the target URL allows iframe embedding
- Verify the iframe content loads properly

### Debug Mode

Enable debug logging by opening browser console - the SDK logs configuration and initialization status.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation website
- Review the configuration examples
- Enable browser console logging for debugging

---

Built with ❤️ for developers by the DocStar SDK team.
