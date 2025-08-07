// Login form types and interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormState {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  isVisible: boolean;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login form class to manage state and behavior
export class LoginForm {
  private state: LoginFormState = {
    isLoading: false,
    errors: {},
    isVisible: false
  };

  private formElement: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private passwordInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private errorContainer: HTMLDivElement | null = null;

  constructor() {
    this.bindMethods();
  }

  private bindMethods() {
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  // Validate email format
  private validateEmail(email: string): string | null {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  // Validate password
  private validatePassword(password: string): string | null {
    if (!password.trim()) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  }

  // Validate form data
  private validateForm(data: LoginFormData): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    const emailError = this.validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.password = passwordError;

    return errors;
  }

  // Handle input changes and clear errors
  private handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const fieldName = target.name as keyof LoginFormData;
    
    // Clear field-specific error when user starts typing
    if (this.state.errors[fieldName]) {
      this.state.errors = { ...this.state.errors };
      delete this.state.errors[fieldName];
      this.renderErrors();
    }
  }

  // Handle form submission
  private async handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.formElement) return;

    const formData = new FormData(this.formElement);
    const loginData: LoginFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    // Validate form
    const validationErrors = this.validateForm(loginData);
    if (Object.keys(validationErrors).length > 0) {
      this.state.errors = validationErrors;
      this.renderErrors();
      return;
    }

    // Set loading state
    this.setLoading(true);

    try {
      // Simulate API call
      await this.simulateLogin(loginData);
      
      // Success - you would typically redirect or update app state here
      this.state.errors = {};
      this.renderErrors();
      alert('Login successful! 🎉'); // In a real app, this would be handled differently
      this.hide();
      
    } catch (error) {
      this.state.errors = { 
        general: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      };
      this.renderErrors();
    } finally {
      this.setLoading(false);
    }
  }

  // Simulate login API call
  private async simulateLogin(data: LoginFormData): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate different responses based on email
        if (data.email === 'admin@fruitstore.com' && data.password === 'password123') {
          resolve();
        } else if (data.email === 'error@test.com') {
          reject(new Error('Server error. Please try again later.'));
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 1500); // Simulate network delay
    });
  }

  // Set loading state
  private setLoading(isLoading: boolean) {
    this.state.isLoading = isLoading;
    
    if (this.submitButton) {
      this.submitButton.disabled = isLoading;
      this.submitButton.textContent = isLoading ? 'Signing In...' : 'Sign In';
    }

    if (this.emailInput) this.emailInput.disabled = isLoading;
    if (this.passwordInput) this.passwordInput.disabled = isLoading;
  }

  // Render error messages
  private renderErrors() {
    if (!this.errorContainer) return;

    const errors = Object.values(this.state.errors);
    if (errors.length === 0) {
      this.errorContainer.innerHTML = '';
      this.errorContainer.style.display = 'none';
      return;
    }

    this.errorContainer.style.display = 'block';
    this.errorContainer.innerHTML = errors
      .map(error => `<div class="error-message">${error}</div>`)
      .join('');
  }

  // Show login form
  public show() {
    this.state.isVisible = true;
    this.render();
  }

  // Hide login form
  public hide() {
    this.state.isVisible = false;
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
      loginContainer.remove();
    }
  }

  // Render the login form
  public render() {
    if (!this.state.isVisible) return;
    
    // Remove existing login container if it exists
    const existingContainer = document.getElementById('login-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create login container
    const loginContainer = document.createElement('div');
    loginContainer.id = 'login-container';
    loginContainer.innerHTML = `
      <div class="login-overlay">
        <div class="login-modal">
          <div class="login-header">
            <h2>Sign In to Fruit Store</h2>
            <button type="button" class="close-btn" aria-label="Close login form">×</button>
          </div>
          
          <form class="login-form" novalidate>
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                placeholder="Enter your email"
                required
                aria-describedby="email-error"
              />
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                placeholder="Enter your password"
                required
                aria-describedby="password-error"
              />
            </div>
            
            <div class="error-container" style="display: none;"></div>
            
            <button type="submit" class="login-submit-btn">Sign In</button>
          </form>
          
          <div class="login-footer">
            <p class="demo-info">
              <strong>Demo Credentials:</strong><br>
              Email: admin@fruitstore.com<br>
              Password: password123
            </p>
          </div>
        </div>
      </div>
    `;

    // Insert login container
    document.body.appendChild(loginContainer);

    // Get form elements
    this.formElement = loginContainer.querySelector('.login-form');
    this.emailInput = loginContainer.querySelector('#email');
    this.passwordInput = loginContainer.querySelector('#password');
    this.submitButton = loginContainer.querySelector('.login-submit-btn');
    this.errorContainer = loginContainer.querySelector('.error-container');

    // Add event listeners
    if (this.formElement) {
      this.formElement.addEventListener('submit', this.handleSubmit);
    }

    if (this.emailInput) {
      this.emailInput.addEventListener('input', this.handleInputChange);
    }

    if (this.passwordInput) {
      this.passwordInput.addEventListener('input', this.handleInputChange);
    }

    // Close button functionality
    const closeBtn = loginContainer.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', this.hide);
    }

    // Close on overlay click
    const overlay = loginContainer.querySelector('.login-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isVisible) {
        this.hide();
      }
    });

    // Focus on email input
    if (this.emailInput) {
      this.emailInput.focus();
    }
  }
}

// Export singleton instance
export const loginForm = new LoginForm();
