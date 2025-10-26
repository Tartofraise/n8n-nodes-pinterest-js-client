# n8n-nodes-pinterest-js-client

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that lets you use [Pinterest](https://www.pinterest.com) in your n8n workflows using the powerful [pinterest-js-client](https://github.com/Tartofraise/pinterest-js-client) library with advanced stealth features.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

> **⚠️ Important**: This node is designed for **self-hosted n8n instances only**. It requires the `pinterest-js-client` dependency with Puppeteer for browser-based authentication, which is not supported on n8n Cloud due to dependency restrictions.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Installation

1. In your n8n instance, go to **Settings** > **Community Nodes**
2. Select **Install** and enter: `n8n-nodes-pinterest-js-client`
3. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-pinterest-js-client
```

After installation, you'll need to install Playwright's Chromium browser:

```bash
npx playwright install chromium
```

## Operations

This node supports comprehensive Pinterest automation:

### Pin Operations
- **Create**: Create a new pin with image URL or local file
- **Repin**: Save/repin a pin to a board
- **Like**: Like a pin
- **Comment**: Add a comment to a pin
- **Delete**: Delete a pin

### Board Operations
- **Create**: Create a new board with privacy settings
- **Get Pins**: Retrieve pins from a board
- **Get User Boards**: Get all boards from a user
- **Follow**: Follow a board

### User Operations
- **Follow**: Follow a user
- **Unfollow**: Unfollow a user
- **Get Profile**: Get user profile information

### Search Operations
- **Search**: Search for pins, boards, or people

## Credentials

To use this node, you need to configure Pinterest credentials:

1. Go to **Credentials** > **New**
2. Select **Pinterest API**
3. Enter your credentials:
   - **Email**: Your Pinterest account email
   - **Password**: Your Pinterest account password
   - **Headless Mode**: Whether to run browser in headless mode (default: true)
   - **Use Fingerprint Suite**: Enable stealth features (default: true)
   - **Proxy Server** (optional): Proxy URL for IP masking
   - **Proxy Username** (optional): Proxy authentication username
   - **Proxy Password** (optional): Proxy authentication password

### Security Notes

- Credentials are stored securely in n8n's encrypted database
- **Persistent Session Storage**: Cookies are stored in a local SQLite database (`~/.n8n/pinterest-cookies/cookies.db`)
- **Multi-Account Support**: Each Pinterest account (email) has isolated cookie storage
- **Works with Manual & Automatic Executions**: Unlike workflow static data, SQLite persistence works in all execution contexts
- The node uses [pinterest-js-client](https://github.com/Tartofraise/pinterest-js-client) which includes advanced stealth features
- Browser fingerprinting and anti-detection measures are automatically applied
- Supports proxy configuration for additional privacy

## Compatibility

- **n8n version**: 0.198.0 or later
- **Node.js version**: 18.17.0 or later
- **Tested with n8n**: 1.0.0+

## Usage

### Example 1: Create a Pin

1. Add the Pinterest node to your workflow
2. Select **Resource**: Pin
3. Select **Operation**: Create
4. Configure:
   - **Image Source**: URL or File Path
   - **Image URL/File**: Your image location
   - **Title**: "Amazing Landscape"
   - **Description**: "Beautiful sunset view"
   - **Board Name**: "Travel"
   - **Link**: "https://example.com"

### Example 2: Search and Save Pins

Create a workflow that:
1. Uses Pinterest node to **Search** for pins (scope: pins, query: "web development")
2. Add a Code node to filter results
3. Use Pinterest node to **Repin** selected pins to your board

### Example 3: Bulk Pin Creation

1. Use a Spreadsheet node to read pin data (titles, images, boards)
2. Connect to Pinterest node (Operation: Create)
3. Map spreadsheet columns to pin fields
4. The node will automatically loop through all items

### Example 4: Auto-Follow Users

1. Use Pinterest node to **Search** for users (scope: people)
2. Add a Code node to process results
3. Use Pinterest node to **Follow** each user
4. Add a Wait node between follows for rate limiting

### Example 5: Monitor and Engage

Create a scheduled workflow that:
1. Searches for pins with specific hashtags
2. Likes the pins
3. Comments on them
4. Repins to your collection board

## Features

### Advanced Stealth Capabilities

This node leverages pinterest-js-client's advanced features:

- 🥷 **Undetected Browsing**: Uses fingerprint-suite for realistic browser fingerprints
- 🤖 **Human-like Behavior**: Random delays, natural mouse movements, human typing
- 🛡️ **Anti-Detection**: WebDriver masking, canvas & WebGL fingerprinting prevention
- 🔄 **Session Persistence**: Automatic cookie management per workflow (multi-account safe)
- 🌐 **Proxy Support**: Full proxy configuration with authentication
- ⚙️ **Highly Configurable**: Adjust headless mode, timeouts, and more

### Error Handling

- The node supports n8n's "Continue on Fail" mode
- Failed operations return error details in the output
- Browser is automatically closed even if operations fail

### Performance

- Browser instance is reused within a single workflow execution
- Automatic cleanup after workflow completion
- Efficient resource management

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [pinterest-js-client GitHub](https://github.com/Tartofraise/pinterest-js-client)
* [Pinterest Terms of Service](https://policy.pinterest.com/en/terms-of-service)

## Development

### Build the Node

```bash
npm install
npm run build
```

### Test Locally

Link the node to your local n8n installation:

```bash
npm link
cd ~/.n8n/custom
npm link n8n-nodes-pinterest-js-client
```

### Lint and Format

```bash
npm run lint
npm run lintfix
npm run format
```

## Version History

### 1.0.1
- **Fixed**: Cookie storage now per-workflow (no conflicts between multiple workflows/accounts)
- **Improved**: Session management using workflow static data instead of shared files
- Updated pinterest-js-client to 1.0.1

### 1.0.0
- Initial release
- Support for Pin, Board, User, and Search operations
- Full integration with pinterest-js-client
- Stealth features and proxy support
- Comprehensive error handling

## License

MIT

## Disclaimer

This is an unofficial Pinterest automation node. Please:
- Comply with Pinterest's Terms of Service
- Respect rate limits and avoid aggressive automation
- Use responsibly and ethically
- Test thoroughly before production use

## Support

For issues, questions, or feature requests:
- [GitHub Issues](https://github.com/Tartofraise/n8n-nodes-pinterest-js-client/issues)
- [n8n Community Forum](https://community.n8n.io/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for the n8n community**


