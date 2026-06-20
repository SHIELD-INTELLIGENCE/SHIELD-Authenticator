// Copyright © 2026 SHIELD Intelligence. All rights reserved.

/**
 * Check if error is network-related
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const errorMessage = (typeof error.message === 'string' ? error.message : '').toLowerCase();
  const errorCode = (typeof error.code === 'string' ? error.code : '').toLowerCase();
  
  // Check for common network error patterns
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('no internet') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network request failed') ||
    errorCode.includes('network') ||
    errorCode === 'unavailable' ||
    errorCode === 'auth/network-request-failed' ||
    !checkOnlineStatus()
  );
}

/**
 * Get user-friendly error message
 */
export function getNetworkErrorMessage(error) {
  if (!checkOnlineStatus()) {
    return 'No internet connection. Please check your network and try again.';
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Firebase-specific errors
  const errorCode = error.code;
  const errorMessage = error.message || '';
  
  // Auth errors
  if (errorCode === 'auth/network-request-failed') {
    return 'Unable to connect. Please check your internet connection.';
  }
  if (errorCode === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later.';
  }
  if (errorCode === 'auth/user-not-found') {
    return 'Invalid email or password. Please try again.';
  }
  if (errorCode === 'auth/wrong-password') {
    return 'Invalid email or password. Please try again.';
  }
  if (errorCode === 'auth/invalid-credential') {
    return 'Invalid email or password. Please try again.';
  }
  if (errorCode === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (errorCode === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (errorCode === 'auth/weak-password') {
    return 'Password is too weak. Use at least 6 characters.';
  }
  if (errorCode === 'auth/user-disabled') {
    return 'This account has been disabled. Please contact support.';
  }
  if (errorCode === 'auth/operation-not-allowed') {
    return 'Email/password sign-in is not enabled. Please contact support.';
  }
  if (errorCode === 'auth/expired-action-code') {
    return 'This verification link has expired. Please request a new one.';
  }
  if (errorCode === 'auth/invalid-action-code') {
    return 'This verification link is invalid or has already been used.';
  }
  
  // Firestore errors
  if (errorCode === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.';
  }
  if (errorCode === 'permission-denied') {
    return 'Action blocked by server security rules. Unlock your vault and verify your session. On rooted devices, storage behavior can be less reliable and is your responsibility.';
  }
  if (errorCode === 'deadline-exceeded' || errorCode === 'timeout') {
    return 'Request timed out. Please try again.';
  }
  
  // Generic network issues
  if (errorMessage.includes('Failed to fetch')) {
    return 'Unable to reach server. Please check your connection.';
  }
  
  return null; // Return null if not a network error, let original error message show
}

/**
 * Check if device is online
 */
export function checkOnlineStatus() {
  if (typeof window !== 'undefined' && typeof window.__shieldOnlineStatus === 'boolean') {
    return window.__shieldOnlineStatus;
  }

  return navigator.onLine;
}

/**
 * Wait for network to be available
 */
export function waitForNetwork(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }
    
    const timer = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Network timeout'));
    }, timeout);
    
    const onlineHandler = () => {
      clearTimeout(timer);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };
    
    window.addEventListener('online', onlineHandler);
  });
}

/**
 * Enhanced error handler with network detection
 */
export function handleError(error, customMessage) {
  const networkError = getNetworkErrorMessage(error);
  
  if (networkError) {
    return networkError;
  }
  
  // Return custom message or generic fallback
  return customMessage || 'An unexpected error occurred. Please try again.';
}
