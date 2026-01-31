# AI Coding Agents Dashboard 2026 🤖

A comprehensive, interactive dashboard for comparing AI-powered coding assistants, agents, and frameworks. This project provides detailed information about 20+ AI coding tools, including their capabilities, pricing, autonomy levels, and ideal use cases.

## 🌟 Features

- **Interactive Grid/List Views**: Browse agents in grid or list layout
- **Advanced Filtering**: Filter by type, autonomy level, and tags
- **Real-time Search**: Search across names, vendors, capabilities, and more
- **Comparison Mode**: Compare up to 3 agents side-by-side
- **Detailed Modal Views**: Click any agent for comprehensive information
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile
- **Tag-based Navigation**: Quick filtering by technology tags
- **Sorting Options**: Sort by name, autonomy level, or type

## 📊 Included AI Coding Tools

The dashboard covers a wide range of AI coding tools across different categories:

### IDE Assistants
- GitHub Copilot
- Amazon CodeWhisperer
- Tabnine
- Cursor AI Editor
- Replit Ghostwriter
- JetBrains AI Assistant

### CLI Agents
- GitHub Copilot CLI
- Anthropic Claude Code (CLI)
- Google Gemini CLI
- Aider

### Autonomous Agents
- Devin AI
- SWE-Agent

### Frameworks
- GPT-Engineer
- Auto-GPT
- BabyAGI
- SuperAGI
- MetaGPT

### Foundation Models
- OpenAI Codex
- OpenAI GPT-4
- Anthropic Claude 2
- Google Gemini
- Meta Code Llama
- Hugging Face StarCoder

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/coding-agents-2026.git
cd coding-agents-2026
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### GitHub Pages Deployment

1. Fork or clone this repository to your GitHub account

2. Go to repository Settings → Pages

3. Under "Source", select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`

4. Click "Save"

5. Your dashboard will be available at:
   `https://yourusername.github.io/coding-agents-2026/`

## 📁 Project Structure

```
coding-agents-2026/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js             # JavaScript functionality
├── dataset.json       # AI agents data
└── README.md          # This file
```

## 🎨 Customization

### Adding New Agents

Edit `dataset.json` and add a new entry following this structure:

```json
{
  "name": "Agent Name",
  "vendor": "Vendor Name",
  "type": "IDE Assistant|CLI Agent|Autonomous Agent|Framework|Foundation Model",
  "capabilities": "Description of capabilities...",
  "use_cases": "Description of use cases...",
  "autonomy_level": "Low|Medium|High",
  "integration": "Integration details...",
  "supported_languages": "List of supported languages...",
  "backend_model": "Model information...",
  "pricing": "Pricing details...",
  "links": {
    "website": "https://...",
    "docs": "https://...",
    "github": "https://..."
  },
  "tags": ["Tag1", "Tag2", "Tag3"],
  "ideal_user_profile": "Description of ideal users..."
}
```

### Customizing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    /* ... more variables */
}
```

## 🔍 Features in Detail

### Search
- Real-time search with 300ms debounce
- Searches across: name, vendor, capabilities, use cases, backend model, and tags
- Case-insensitive matching

### Filtering
- **Type Filter**: IDE Assistant, CLI Agent, Autonomous Agent, Framework, Foundation Model
- **Autonomy Filter**: Low, Medium, High
- **Tag Filter**: Click any tag pill to filter by technology/category
- **Combined Filters**: All filters work together

### Sorting
- Name (A-Z)
- Name (Z-A)
- Autonomy Level (High to Low)
- Type (Alphabetical)

### Comparison Mode
- Select up to 3 agents
- Side-by-side comparison
- Compare key attributes: type, vendor, autonomy, backend, pricing, languages, integration, use cases

### Keyboard Shortcuts
- `/` - Focus search input
- `Esc` - Close modal

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

- Desktop: > 768px
- Tablet: 481px - 768px
- Mobile: ≤ 480px

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Add New Agents**: Submit PRs with new AI coding tools
2. **Update Information**: Keep existing data current
3. **Report Issues**: Found a bug? Open an issue
4. **Improve UI/UX**: Suggest or implement design improvements
5. **Add Features**: Propose new functionality

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Data Sources

Information compiled from:
- Official vendor documentation
- Research papers and technical blogs
- Product websites and pricing pages
- Community feedback and reviews

**Last Updated**: January 2026

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Data compiled from various official sources and research papers
- Built with vanilla JavaScript (no frameworks required)
- Designed with modern CSS features and responsive design principles

## 📧 Contact

For questions, suggestions, or feedback:
- Open an issue on GitHub
- Submit a pull request
- Contact the maintainers

---

**Note**: This dashboard is for informational purposes. Always verify pricing, features, and capabilities with official vendor sources before making decisions.

Made with ❤️ for the developer community
