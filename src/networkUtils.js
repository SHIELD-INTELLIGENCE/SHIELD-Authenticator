// Copyright © 2026 SHIELD Intelligence. All rights reserved.

/**
 * Check if error is network-related
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
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
    !navigator.onLine
  );
}

/**
 * Get user-friendly error message
 */
export function getNetworkErrorMessage(error) {
  if (!navigator.onLine) {
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
    return 'Account not found. Please check your email.';
  }
  if (errorCode === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  }
  if (errorCode === 'auth/invalid-email') {
    return 'Invalid email address.';
  }
  if (errorCode === 'auth/email-already-in-use') {
    return 'Email already registered. Try logging in instead.';
  }
  if (errorCode === 'auth/weak-password') {
    return 'Password too weak. Use at least 6 characters.';
  }
  
  // Firestore errors
  if (errorCode === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.';
  }
  if (errorCode === 'permission-denied') {
    return 'Permission denied. Please log in again.';
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
  
  // Return custom message or original error message
  return customMessage || error?.message || 'An unexpected error occurred';
}
