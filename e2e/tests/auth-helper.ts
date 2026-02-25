import { Page } from '@playwright/test';

/**
 * Authentication helper utilities for E2E tests
 *
 * Provides reusable login functions for different user roles
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with admin credentials
   */
  async loginAsAdmin() {
    await this.page.goto('/login');

    // Fill login form
    await this.page.fill('input[type="email"]', 'admin@open-inventory.app');
    await this.page.fill('input[type="password"]', '!Adm!N2026');

    // Click submit button
    await this.page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await this.page.waitForURL('/');
    await this.page.waitForLoadState('networkidle');

    // Verify login success
    await this.page.waitForSelector('text=Welcome to Open Inventory');

    console.log('✅ Admin login successful');
  }

  /**
   * Login with manager credentials (if available)
   */
  async loginAsManager() {
    // For now, we'll use admin credentials since manager might not exist
    await this.loginAsAdmin();
  }

  /**
   * Login with staff credentials (if available)
   */
  async loginAsStaff() {
    // For now, we'll use admin credentials since staff might not exist
    await this.loginAsAdmin();
  }

  /**
   * Verify current user is authenticated
   */
  async isAuthenticated() {
    try {
      await this.page.waitForSelector('text=Logout', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('text=Logout');
    await this.page.waitForURL('/login');
    console.log('✅ Logout successful');
  }

  /**
   * Get current user from localStorage
   */
  async getCurrentUser() {
    const user = await this.page.evaluate(() => {
      return localStorage.getItem('auth-user');
    });
    return user ? JSON.parse(user) : null;
  }
}

/**
 * Factory function to create AuthHelper instance
 */
export function createAuthHelper(page: Page) {
  return new AuthHelper(page);
}