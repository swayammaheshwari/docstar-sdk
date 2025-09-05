# DocStar SDK

A powerful, easy-to-integrate search functionality for modern web applications. Add instant search capabilities to any website with beautiful UI, configurable opening modes, and seamless integration.

## 🚀 Features

- **Beautiful Search Modal** - Dark blur background with smooth animations
- **Multiple Opening Modes** - Iframe sidebar, new tab, or current tab
- **Keyboard Shortcuts** - Optional Cmd/Ctrl+K support
- **Debounced API Calls** - Configurable delay to prevent excessive requests
- **Cross-Platform** - Works with HTML, React, Vue, Angular, and any web framework
- **Responsive Design** - Mobile-friendly interface
- **Easy Integration** - Just two script tags to get started

## 📦 Installation

### CDN (Recommended)

```html
<!-- Include the DocStar Search SDK -->
<script src="https://swayammaheshwari.github.io/docstar-sdk/scripts/search-sdk/search-sdk.script.min.js"></script>

<!-- Configure the SDK -->
<script>
  window.DocStarSearch.configure({
    apiEndpoint: "your-api-endpoint",
    collectionId: "your-collection-id",
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
| `apiEndpoint` | string | **required** | Your search API endpoint |
| `collectionId` | string | **required** | Collection ID for search |
| `openMode` | string | `"iframe"` | How results open: `"iframe"`, `"newTab"`, `"currentTab"` |
| `debounceDelay` | number | `300` | Delay in ms before API call (100-2000) |
| `enableKeyboardShortcut` | boolean | `true` | Enable Cmd/Ctrl+K shortcut |
| `minSearchLength` | number | `2` | Minimum characters before search |

## 🎯 Usage

### Basic Usage

```javascript
// Open search modal programmatically
window.DocStarSearch.open();

// Close search modal
window.DocStarSearch.close();
```

### Custom Event Trigger

```javascript
// Trigger search modal via custom event
window.dispatchEvent(new CustomEvent('openPublicSearchBar'));
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

## 🔧 API Response Format

Your API endpoint should return data in this format:

```json
{
  "matches": [
    {
      "name": "Page Title",
      "link": "https://example.com/page"
    }
  ]
}
```

## 🎨 Opening Modes

### Iframe Sidebar
- Opens results in a sidebar overlay
- Users can preview content without leaving the page
- Includes "Open in New Tab" option

### New Tab
- Opens search results in a new browser tab
- Best for external links

### Current Tab
- Navigates to the result in the current tab
- Traditional navigation behavior

## ⌨️ Keyboard Shortcuts

- **Cmd/Ctrl + K** - Open search modal (if enabled)
- **Escape** - Close search modal or iframe sidebar
- **Cmd/Ctrl + Shift + O** - Open current iframe content in new tab (when iframe is open)

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

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation website
- Review the configuration examples

---

Built with ❤️ for developers by the DocStar SDK team.
