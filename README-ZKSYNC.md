# zkSync Authentication Guide

This document provides information about the zkSync authentication integration in our application, including common issues and troubleshooting steps.

## Overview

Our application uses zkSync SSO (Single Sign-On) for authentication, which provides a seamless, secure way to connect to Web3 applications without the complexity of seed phrases or private keys. The authentication is powered by the `zksync-sso` library.

## Features

- **Passkey Authentication**: No seed phrases required, just use your device's biometric authentication
- **Session Management**: Configure session expiry and fee limits
- **Smart Account Integration**: Each user gets a smart account on zkSync Era

## Common Issues and Troubleshooting

### "User rejected the request" Error

This error occurs when the authentication request is rejected, either by the user or by the browser.

**Possible causes:**
1. The user manually rejected the connection request
2. Browser security settings blocked the popup
3. Browser extensions interfered with the authentication flow
4. Session data from a previous connection attempt is causing conflicts

**Troubleshooting steps:**
1. **Allow popups**: Make sure your browser allows popups for our site
2. **Try a different browser**: Chrome or Firefox are recommended
3. **Clear browser data**: Clear your browser cache and cookies, then restart your browser
4. **Disable extensions**: Temporarily disable browser extensions, especially ad blockers or privacy extensions
5. **Check for updates**: Ensure your browser is up to date
6. **Try incognito mode**: Open the site in an incognito/private window to rule out extension conflicts

### Connection Timeout

If the connection process takes too long and eventually fails:

1. **Check your internet connection**: Ensure you have a stable internet connection
2. **Try again later**: The zkSync network might be experiencing high traffic
3. **Refresh the page**: Completely refresh the page and try again

### Other Authentication Issues

If you're experiencing other issues with zkSync authentication:

1. **Disconnect and reconnect**: Try disconnecting your wallet (if connected) and reconnecting
2. **Update your browser**: Make sure you're using the latest version of your browser
3. **Contact support**: If problems persist, please contact our support team with details about the error

## Technical Details

Our application uses:
- `zksync-sso` version 0.0.0-beta.10
- `viem` version 2.23.5
- `@wagmi/core` for wallet connection management

The authentication flow is managed by the `ZkSyncAuthContext` which handles connection, session management, and error handling.

## Network Information

The application connects to the zkSync Era Sepolia testnet. You can view your account on the [zkSync Era Sepolia Explorer](https://sepolia-era.zksync.network/).

## Feedback and Support

If you encounter any issues with the zkSync authentication, please report them to our support team with the following information:
- Browser name and version
- Operating system
- Detailed description of the error
- Any error messages displayed
- Steps to reproduce the issue

---

*Last updated: December 2024* 