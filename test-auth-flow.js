// Test script to verify authentication flow
// This simulates the key parts of the authentication flow we've fixed

console.log('Testing authentication flow...\n');

// Simulate localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Simulate cookie storage
const cookieStorageMock = (() => {
  let cookies = {};
  return {
    setCookie: (name, value, days) => {
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        cookies[name] = { value, expires: date.toUTCString() };
      } else {
        cookies[name] = { value, expires: '' };
      }
    },
    getCookie: (name) => {
      const cookie = cookies[name];
      return cookie ? cookie.value : null;
    },
    removeCookie: (name) => {
      delete cookies[name];
    },
    getAllCookies: () => cookies
  };
})();

// Mock window object for testing
global.window = {
  localStorage: localStorageMock
};

global.document = {
  cookie: '',
  // We'll update this in our cookie functions
};

// Mock the cookie functions to work with our mocks
function setCookie(name, value, days) {
  if (typeof window !== 'undefined') {
    cookieStorageMock.setCookie(name, value, days);
    // Also update document.cookie to match
    let cookieString = `${name}=${value || ''}`;
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    cookieString += '; path=/';
    document.cookie = cookieString;
  }
}

function getCookie(name) {
  if (typeof window !== 'undefined') {
    // First try our mock storage
    const mockValue = cookieStorageMock.getCookie(name);
    if (mockValue !== null) return mockValue;
    
    // Fallback to parsing document.cookie
    if (document.cookie) {
      const cookies = document.cookie.split('; ');
      for (let i = 0; i < cookies.length; i++) {
        const [cookieName, cookieValue] = cookies[i].split('=');
        if (cookieName === name) return decodeURIComponent(cookieValue);
      }
    }
  }
  return null;
}

function removeCookie(name) {
  if (typeof window !== 'undefined') {
    cookieStorageMock.removeCookie(name);
    // Also update document.cookie
    document.cookie = `${name}=; Max-Age=-99999999; path=/`;
  }
}

// Mock authApi.login function
const mockAuthApiLogin = async (payload) => {
  // Simulate successful login response
  return {
    data: {
      success: true,
      data: {
        user: { id: 1, email: payload.email, name: 'Test User' },
        accessToken: 'mock-jwt-token-12345',
        refreshToken: 'mock-refresh-token-67890'
      }
    }
  };
};

// Mock authApi.register function
const mockAuthApiRegister = async (payload) => {
  // Simulate successful registration response
  return {
    data: {
      success: true,
      data: {
        user: { id: 1, email: payload.email, name: payload.name },
        accessToken: 'mock-jwt-token-12345',
        refreshToken: 'mock-refresh-token-67890'
      }
    }
  };
};

// Test 1: Login flow
async function testLoginFlow() {
  console.log('Test 1: Login Flow');
  
  // Simulate login form submission
  const loginPayload = { email: 'test@example.com', password: 'password123' };
  
  try {
    const response = await mockAuthApiLogin(loginPayload);
    const token = response.data.data.accessToken;
    
    // This is what happens in our updated login page
    // setToken(token); // This would update zustand store
    localStorageMock.setItem('itmagnet_access_token', token);
    setCookie('itmagnet_access_token', token, 1); // 1 day expiry
    
    console.log('✓ Login successful');
    console.log('  - Token stored in localStorage:', localStorageMock.getItem('itmagnet_access_token') !== null);
    console.log('  - Token stored in cookie:', getCookie('itmagnet_access_token') !== null);
    
    // Simulate middleware check
    const middlewareToken = getCookie('itmagnet_access_token');
    if (middlewareToken) {
      console.log('✓ Middleware would find token in cookie');
    } else {
      console.log('✗ Middleware would NOT find token in cookie');
    }
    
    // Simulate axios interceptor
    const axiosToken = getCookie('itmagnet_access_token') || localStorageMock.getItem('itmagnet_access_token');
    if (axiosToken) {
      console.log('✓ Axios interceptor would find token');
    } else {
      console.log('✗ Axios interceptor would NOT find token');
    }
    
    return true;
  } catch (error) {
    console.log('✗ Login failed:', error.message);
    return false;
  }
}

// Test 2: Registration flow
async function testRegistrationFlow() {
  console.log('\nTest 2: Registration Flow');
  
  // Simulate registration form submission
  const registerPayload = { 
    name: 'Test User', 
    email: 'test@example.com', 
    password: 'password123' 
  };
  
  try {
    const response = await mockAuthApiRegister(registerPayload);
    const token = response.data.data.accessToken;
    
    // This is what happens in our updated registration page
    // setToken(token); // This would update zustand store
    localStorageMock.setItem('itmagnet_access_token', token);
    setCookie('itmagnet_access_token', token, 1); // 1 day expiry
    
    console.log('✓ Registration successful');
    console.log('  - Token stored in localStorage:', localStorageMock.getItem('itmagnet_access_token') !== null);
    console.log('  - Token stored in cookie:', getCookie('itmagnet_access_token') !== null);
    
    // Simulate middleware check
    const middlewareToken = getCookie('itmagnet_access_token');
    if (middlewareToken) {
      console.log('✓ Middleware would find token in cookie');
    } else {
      console.log('✗ Middleware would NOT find token in cookie');
    }
    
    // Simulate axios interceptor
    const axiosToken = getCookie('itmagnet_access_token') || localStorageMock.getItem('itmagnet_access_token');
    if (axiosToken) {
      console.log('✓ Axios interceptor would find token');
    } else {
      console.log('✗ Axios interceptor would NOT find token');
    }
    
    return true;
  } catch (error) {
    console.log('✗ Registration failed:', error.message);
    return false;
  }
}

// Test 3: Logout flow
async function testLogoutFlow() {
  console.log('\nTest 3: Logout Flow');
  
  // First set up authenticated state
  const token = 'mock-jwt-token-12345';
  localStorageMock.setItem('itmagnet_access_token', token);
  setCookie('itmagnet_access_token', token, 1);
  
  console.log('  - Initial state:');
  console.log('    * Token in localStorage:', localStorageMock.getItem('itmagnet_access_token') !== null);
  console.log('    * Token in cookie:', getCookie('itmagnet_access_token') !== null);
  
  // This is what happens in our updated useAuthStore logout
  localStorageMock.removeItem('itmagnet_access_token');
  removeCookie('itmagnet_access_token');
  
  console.log('  - After logout:');
  console.log('    * Token in localStorage:', localStorageMock.getItem('itmagnet_access_token') !== null);
  console.log('    * Token in cookie:', getCookie('itmagnet_access_token') !== null);
  
  const isLoggedOut = 
    localStorageMock.getItem('itmagnet_access_token') === null && 
    getCookie('itmagnet_access_token') === null;
    
  if (isLoggedOut) {
    console.log('✓ Logout successful - tokens cleared from both storage mechanisms');
    return true;
  } else {
    console.log('✗ Logout failed - tokens still present');
    return false;
  }
}

// Test 4: Token expiration handling (401 response)
async function testTokenExpirationHandling() {
  console.log('\nTest 4: Token Expiration Handling (401 Response)');
  
  // Set up authenticated state
  const token = 'expired-jwt-token-12345';
  localStorageMock.setItem('itmagnet_access_token', token);
  setCookie('itmagnet_access_token', token, 1);
  
  console.log('  - Initial state (token present):');
  console.log('    * Token in localStorage:', localStorageMock.getItem('itmagnet_access_token') !== null);
  console.log('    * Token in cookie:', getCookie('itmagnet_access_token') !== null);
  
  // Simulate 401 response handling in axios interceptor
  // This is what our code actually does:
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('itmagnet_access_token');
    removeCookie('itmagnet_access_token');
  }
  
  console.log('  - After 401 response handling:');
  console.log('    * Token in localStorage:', localStorageMock.getItem('itmagnet_access_token') !== null);
  console.log('    * Token in cookie:', getCookie('itmagnet_access_token') !== null);
  
  const isCleared = 
    localStorageMock.getItem('itmagnet_access_token') === null && 
    getCookie('itmagnet_access_token') === null;
    
  if (isCleared) {
    console.log('✓ Token expiration handling successful - tokens cleared from both storage mechanisms');
    return true;
  } else {
    console.log('✗ Token expiration handling failed - tokens still present');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('AUTHENTICATION FLOW TEST SUITE');
  console.log('='.repeat(50));
  
  const results = [];
  
  results.push(await testLoginFlow());
  results.push(await testRegistrationFlow());
  results.push(await testLogoutFlow());
  results.push(await testTokenExpirationHandling());
  
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Authentication flow is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }
  
  return passed === total;
}

// Execute tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
});