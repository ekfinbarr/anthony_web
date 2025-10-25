"use client";
import { useEffect } from "react";

export default function EmbedVidWidget() {
  useEffect(() => {
    const scriptId = "embedvidio-a01a59e4-b533-44b8-afe5-621aeb118f68-widget";
    if (document.getElementById(scriptId)) return; // Prevent duplicate load

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://www.embedvid.io/embedjs/embedvidio.js";
    script.async = true;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }, []);

  return (
    <div id="embedvidio-a01a59e4-b533-44b8-afe5-621aeb118f68" />
  );
}
// Replace with your actual EmbedVid.io widget ID
// Ensure the script is loaded only once
// The div with the specific ID is where the widget will be rendered

// Usage: <EmbedVidWidget /> in your components/pages/Live.tsx or any other page where you want to embed the video widget
// Make sure to replace "YOUR_WIDGET_ID" with your actual widget ID from EmbedVid.io

// Example usage in a React component:
// import EmbedVidWidget from './components/live/EmbedVidWidget';
// ...
// <EmbedVidWidget />
// ...

// This component handles loading the EmbedVid.io script and rendering the widget
// It uses useEffect to ensure the script is only loaded once when the component mounts
// The widget will appear in the div with the specified ID

// Note: Ensure that your project allows loading external scripts and that you trust the source
// Always check for any updates or changes in the EmbedVid.io documentation for best practices
// This implementation assumes you want to embed a video widget from EmbedVid.io
// Adjust the styling and placement as needed based on your application's design
// Test the component to ensure the widget loads correctly and functions as expected
// If you encounter any issues, refer to the EmbedVid.io support or documentation for troubleshooting
// Remember to handle any potential errors or loading states as necessary for a better user experience
// This is a basic implementation; you can enhance it further based on your requirements
// Consider adding props to customize the widget ID or other parameters if needed in the future
// Keep your dependencies updated to avoid any security vulnerabilities with external scripts
// Always review third-party scripts for security and performance implications in your application
// This component is designed for React; adapt it accordingly if you're using a different framework or library
// Ensure that your application complies with any terms of service or usage policies of EmbedVid.io when using their widgets
// Happy coding!