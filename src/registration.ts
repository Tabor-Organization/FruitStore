// User registration functionality

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

// Password strength validation
function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  let messages: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    messages.push("at least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    messages.push("uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    messages.push("lowercase letter");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    messages.push("number");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    messages.push("special character");
  }

  let message = "";
  let color = "";

  if (score === 0) {
    message = "Enter a password";
    color = "#ccc";
  } else if (score < 3) {
    message = `Weak - needs: ${messages.join(", ")}`;
    color = "#ff4444";
  } else if (score < 5) {
    message = `Good - needs: ${messages.join(", ")}`;
    color = "#ffaa00";
  } else {
    message = "Strong password!";
    color = "#44aa44";
  }

  return { score, message, color };
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if email already exists
async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8000/users/${encodeURIComponent(email)}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

// Register user
async function registerUser(data: RegistrationData): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: result.message, user: result.user };
    } else {
      return { success: false, message: result.detail || 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

// Render registration form
export function renderRegistrationForm(): string {
  return `
    <div class="registration-container">
      <h2>Create Account</h2>
      <form id="registration-form" class="registration-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required>
          <div id="email-error" class="error-message"></div>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
          <div id="password-strength" class="password-strength"></div>
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input type="password" id="confirm-password" name="confirm-password" required>
          <div id="confirm-password-error" class="error-message"></div>
        </div>
        
        <button type="submit" id="register-btn" class="register-btn" disabled>
          Create Account
        </button>
        
        <div id="registration-message" class="message"></div>
      </form>
      
      <div class="login-link">
        Already have an account? <a href="#" id="show-login">Sign in</a>
      </div>
    </div>
  `;
}

// Setup registration form event listeners
export function setupRegistrationForm() {
  const form = document.getElementById('registration-form') as HTMLFormElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
  const registerBtn = document.getElementById('register-btn') as HTMLButtonElement;
  const emailError = document.getElementById('email-error') as HTMLDivElement;
  const passwordStrength = document.getElementById('password-strength') as HTMLDivElement;
  const confirmPasswordError = document.getElementById('confirm-password-error') as HTMLDivElement;
  const registrationMessage = document.getElementById('registration-message') as HTMLDivElement;

  let emailValid = false;
  let passwordValid = false;
  let confirmPasswordValid = false;

  // Email validation
  emailInput.addEventListener('blur', async () => {
    const email = emailInput.value.trim();
    
    if (!email) {
      emailError.textContent = 'Email is required';
      emailValid = false;
    } else if (!isValidEmail(email)) {
      emailError.textContent = 'Please enter a valid email address';
      emailValid = false;
    } else {
      const exists = await checkEmailExists(email);
      if (exists) {
        emailError.textContent = 'This email is already registered';
        emailValid = false;
      } else {
        emailError.textContent = '';
        emailValid = true;
      }
    }
    
    updateSubmitButton();
  });

  // Password strength validation
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);
    
    passwordStrength.textContent = strength.message;
    passwordStrength.style.color = strength.color;
    
    passwordValid = strength.score >= 5;
    
    // Re-validate confirm password if it has a value
    if (confirmPasswordInput.value) {
      validateConfirmPassword();
    }
    
    updateSubmitButton();
  });

  // Confirm password validation
  function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
      confirmPasswordError.textContent = 'Please confirm your password';
      confirmPasswordValid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError.textContent = 'Passwords do not match';
      confirmPasswordValid = false;
    } else {
      confirmPasswordError.textContent = '';
      confirmPasswordValid = true;
    }
  }

  confirmPasswordInput.addEventListener('input', () => {
    validateConfirmPassword();
    updateSubmitButton();
  });

  // Update submit button state
  function updateSubmitButton() {
    registerBtn.disabled = !(emailValid && passwordValid && confirmPasswordValid);
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating Account...';
    registrationMessage.textContent = '';
    
    const formData: RegistrationData = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    };
    
    const result = await registerUser(formData);
    
    if (result.success) {
      registrationMessage.className = 'message success';
      registrationMessage.textContent = result.message;
      
      // Clear form
      form.reset();
      passwordStrength.textContent = '';
      
      // Redirect to login or dashboard after 2 seconds
      setTimeout(() => {
        // For now, just show a success message
        // In a real app, you might redirect to login or dashboard
        alert('Registration successful! You can now log in.');
      }, 2000);
    } else {
      registrationMessage.className = 'message error';
      registrationMessage.textContent = result.message;
    }
    
    registerBtn.disabled = false;
    registerBtn.textContent = 'Create Account';
  });

  // Show login link (placeholder for navigation)
  const showLoginLink = document.getElementById('show-login');
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Login form would be shown here');
    });
  }
}
