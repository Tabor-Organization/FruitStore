// Login form component for Fruit Store application
// Demo credentials should be updated from Slack #context channel

export interface LoginCredentials {
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

// Demo credentials - UPDATED FROM SLACK #context CHANNEL
const DEMO_CREDENTIALS = {
  email: 'DemoEmail@avanade.com',
  password: 'demoPassword123!',
  // Alternative credentials for testing different scenarios
  admin: {
    email: 'admin@fruitstore.com',
    password: 'admin123'
  },
  customer: {
    email: 'customer@fruitstore.com', 
    password: 'customer123'
  }
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LoginFormComponent {
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
  private loginContainer: HTMLDivElement | null = null;

  constructor() {
    this.bindMethods();
  }

  private bindMethods(): void {
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  // Validate email format
  private validateEmail(email: string): string | null {
    if (!email.trim()) {
      return 'Email address is required';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
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
  private validateForm(credentials: LoginCredentials): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    const emailError = this.validateEmail(credentials.email);
    if (emailError) errors.email = emailError;

    const passwordError = this.validatePassword(credentials.password);
    if (passwordError) errors.password = passwordError;

    return errors;
  }

  // Handle input changes and clear field-specific errors
  private handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const fieldName = target.name as keyof LoginCredentials;
    
    // Clear field-specific error when user starts typing
    if (this.state.errors[fieldName]) {
      this.state.errors = { ...this.state.errors };
      delete this.state.errors[fieldName];
      this.renderErrors();
    }

    // Clear general error as well
    if (this.state.errors.general) {
      this.state.errors = { ...this.state.errors };
      delete this.state.errors.general;
      this.renderErrors();
    }
  }

  // Handle keyboard events
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.state.isVisible) {
      this.hide();
    }
  }

  // Handle form submission
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.formElement) return;

    const formData = new FormData(this.formElement);
    const credentials: LoginCredentials = {
      email: (formData.get('email') as string || '').trim(),
      password: formData.get('password') as string || ''
    };

    // Validate form
    const validationErrors = this.validateForm(credentials);
    if (Object.keys(validationErrors).length > 0) {
      this.state.errors = validationErrors;
      this.renderErrors();
      return;
    }

    // Set loading state
    this.setLoading(true);

    try {
      // Simulate API call with demo credentials
      await this.authenticateUser(credentials);
      
      // Success - clear errors and hide form
      this.state.errors = {};
      this.renderErrors();
      this.showSuccessMessage();
      
      // Hide form after short delay
      setTimeout(() => {
        this.hide();
      }, 2000);
      
    } catch (error) {
      this.state.errors = { 
        general: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      };
      this.renderErrors();
    } finally {
      this.setLoading(false);
    }
  }

  // Simulate user authentication
  private async authenticateUser(credentials: LoginCredentials): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check against demo credentials
        const isValidDemo = credentials.email === DEMO_CREDENTIALS.email && 
                           credentials.password === DEMO_CREDENTIALS.password;
        
        const isValidAdmin = credentials.email === DEMO_CREDENTIALS.admin.email && 
                            credentials.password === DEMO_CREDENTIALS.admin.password;
        
        const isValidCustomer = credentials.email === DEMO_CREDENTIALS.customer.email && 
                               credentials.password === DEMO_CREDENTIALS.customer.password;

        if (isValidDemo || isValidAdmin || isValidCustomer) {
          resolve();
        } else if (credentials.email === 'error@test.com') {
          reject(new Error('Server error. Please try again later.'));
        } else {
          reject(new Error('Invalid email or password. Please check your credentials and try again.'));
        }
      }, 1500); // Simulate network delay
    });
  }

  // Set loading state
  private setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    
    if (this.submitButton) {
      this.submitButton.disabled = isLoading;
      this.submitButton.textContent = isLoading ? 'Signing In...' : 'Sign In';
    }

    if (this.emailInput) this.emailInput.disabled = isLoading;
    if (this.passwordInput) this.passwordInput.disabled = isLoading;
  }

  // Show success message
  private showSuccessMessage(): void {
    if (!this.errorContainer) return;

    this.errorContainer.style.display = 'block';
    this.errorContainer.innerHTML = `
      <div class="success-message">
        <span class="success-icon">✅</span>
        Login successful! Welcome to Fruit Store.
      </div>
    `;
  }

  // Render error messages
  private renderErrors(): void {
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
  public show(): void {
    this.state.isVisible = true;
    this.render();
  }

  // Hide login form
  public hide(): void {
    this.state.isVisible = false;
    if (this.loginContainer) {
      this.loginContainer.remove();
      this.loginContainer = null;
    }
    
    // Remove global event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  // Render the login form
  public render(): void {
    if (!this.state.isVisible) return;
    
    // Remove existing login container if it exists
    this.hide();

    // Create login container
    this.loginContainer = document.createElement('div');
    this.loginContainer.id = 'login-container';
    this.loginContainer.innerHTML = `
      <div class="login-overlay">
        <div class="login-modal">
          <div class="login-header">
            <h2>🍎 Sign In to Fruit Store</h2>
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
                placeholder="Enter your email address"
                required
                autocomplete="email"
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
                autocomplete="current-password"
                aria-describedby="password-error"
              />
            </div>
            
            <div class="error-container" style="display: none;"></div>
            
            <button type="submit" class="login-submit-btn">Sign In</button>
          </form>
          
          <div class="login-footer">
            <div class="demo-info">
              <h4>🧪 Demo Credentials</h4>
              <div class="credentials-grid">
                <div class="credential-item">
                  <strong>Demo Account:</strong><br>
                  <code>${DEMO_CREDENTIALS.email}</code><br>
                  <code>${DEMO_CREDENTIALS.password}</code>
                </div>
                <div class="credential-item">
                  <strong>Admin Account:</strong><br>
                  <code>${DEMO_CREDENTIALS.admin.email}</code><br>
                  <code>${DEMO_CREDENTIALS.admin.password}</code>
                </div>
                <div class="credential-item">
                  <strong>Customer Account:</strong><br>
                  <code>${DEMO_CREDENTIALS.customer.email}</code><br>
                  <code>${DEMO_CREDENTIALS.customer.password}</code>
                </div>
              </div>
              <p class="note">
                <em>Note: Demo credentials should be updated from Slack #context channel</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert login container
    document.body.appendChild(this.loginContainer);

    // Get form elements
    this.formElement = this.loginContainer.querySelector('.login-form');
    this.emailInput = this.loginContainer.querySelector('#email');
    this.passwordInput = this.loginContainer.querySelector('#password');
    this.submitButton = this.loginContainer.querySelector('.login-submit-btn');
    this.errorContainer = this.loginContainer.querySelector('.error-container');

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
    const closeBtn = this.loginContainer.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', this.hide);
    }

    // Close on overlay click
    const overlay = this.loginContainer.querySelector('.login-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Global keyboard event listener
    document.addEventListener('keydown', this.handleKeyDown);

    // Focus on email input
    if (this.emailInput) {
      setTimeout(() => {
        this.emailInput?.focus();
      }, 100);
    }
  }

  // Public method to update demo credentials (can be called from external config)
  public updateDemoCredentials(newCredentials: typeof DEMO_CREDENTIALS): void {
    Object.assign(DEMO_CREDENTIALS, newCredentials);
  }
}

// Export singleton instance
export const loginForm = new LoginFormComponent();
