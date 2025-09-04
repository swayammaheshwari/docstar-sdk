// DocStar SDK Connection Script
// This script logs a success message when loaded in HTML

(function () {
    // Log connection success message
    console.log('connected successfully');

    // Optional: You can also add additional initialization logic here
    // For example, setting up global variables or event listeners

    // Make the script available globally if needed
    if (typeof window !== 'undefined') {
        window.DocStarSDK = {
            connected: true,
            version: '1.0.0'
        };
    }
})();