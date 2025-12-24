# Dify AI Chat Setup

This application now includes a custom Dify AI chatbot with **light mode** styling and support for **multiple chat sessions**.

## Getting Your Dify API Credentials

1. **Log in to Dify**: Go to [https://cloud.dify.ai](https://cloud.dify.ai) or [https://udify.app](https://udify.app)

2. **Open Your App**: Navigate to your "Velocity Agent" or chatbot application

3. **Get API Key**:
   - Click on **"API Access"** or **"API Reference"** in the left sidebar
   - You'll see your **API Key** (starts with `app-`)
   - Copy this key

4. **Get App ID** (if needed):
   - The App ID is usually visible in the API settings or URL
   - It's a UUID format like `v9v2VI9I7QBWnpmF`

## Configuration

Open `src/pages/AI.tsx` and replace the placeholder values:

```typescript
<DifyChat 
  apiUrl="https://udify.app/api"
  apiKey="app-YOUR_ACTUAL_API_KEY_HERE"  // Replace with your API key
  appId="YOUR_APP_ID_HERE"                // Replace with your App ID
/>
```

## Features

✅ **Light Mode** - Clean, modern light theme that matches your Velocity AI branding
✅ **Multiple Chats** - "New Chat" button to start fresh conversations
✅ **Conversation History** - Maintains context within each chat session
✅ **Smooth Animations** - Professional fade-in effects and transitions
✅ **Responsive Design** - Works on all screen sizes
✅ **Custom Styling** - Fully customizable colors in `src/components/DifyChat.css`

## Customizing Colors

Edit `src/components/DifyChat.css` to change the color scheme:

```css
/* Header gradient */
.dify-chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* User message bubble */
.dify-message-user .dify-message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Send button */
.dify-send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## Troubleshooting

**Issue**: "Error processing your request"
- Check that your API key is correct
- Verify the API URL matches your Dify instance
- Check browser console for detailed error messages

**Issue**: Messages not sending
- Ensure your Dify app is published and active
- Verify API permissions in Dify dashboard

**Issue**: Styling looks wrong
- Clear browser cache
- Check that `DifyChat.css` is properly imported
- Verify no CSS conflicts with other components
