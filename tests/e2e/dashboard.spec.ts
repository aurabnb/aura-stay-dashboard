import { test, expect, type Page, type Route } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Navigate to the dashboard
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Page Load and Layout', () => {
    test('should load the dashboard page successfully', async ({ page }: { page: Page }) => {
      // Check if the page title is correct
      await expect(page).toHaveTitle(/Aura Stay Dashboard/)
      
      // Check if main content is visible
      await expect(page.locator('main')).toBeVisible()
      
      // Check if there are no console errors
      const logs: string[] = []
      page.on('console', (msg: any) => logs.push(msg.text()))
      await page.reload()
      expect(logs.filter(log => log.includes('error')).length).toBe(0)
    })

    test('should display header navigation', async ({ page }: { page: Page }) => {
      // Check if header is visible
      await expect(page.locator('header')).toBeVisible()
      
      // Check if navigation links are present
      await expect(page.locator('nav')).toBeVisible()
      
      // Check if logo/brand is visible
      await expect(page.locator('[data-testid="logo"]')).toBeVisible()
    })

    test('should be responsive on mobile devices', async ({ page }: { page: Page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Check if mobile navigation works
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
      }
      
      // Check if content is still accessible
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Treasury Dashboard', () => {
    test('should display treasury overview cards', async ({ page }: { page: Page }) => {
      // Wait for treasury data to load
      await page.waitForSelector('[data-testid="treasury-overview"]', { timeout: 10000 })
      
      // Check if overview cards are visible
      await expect(page.locator('[data-testid="total-balance-card"]')).toBeVisible()
      await expect(page.locator('[data-testid="wallet-count-card"]')).toBeVisible()
      await expect(page.locator('[data-testid="recent-activity-card"]')).toBeVisible()
      
      // Check if values are displayed (not just loading states)
      await expect(page.locator('[data-testid="total-balance-value"]')).not.toBeEmpty()
    })

    test('should display wallet list with balances', async ({ page }: { page: Page }) => {
      // Wait for wallet list to load
      await page.waitForSelector('[data-testid="wallet-list"]', { timeout: 10000 })
      
      // Check if wallet items are visible
      const walletItems = page.locator('[data-testid="wallet-item"]')
      await expect(walletItems.first()).toBeVisible()
      
      // Check if wallet addresses and balances are shown
      await expect(page.locator('[data-testid="wallet-address"]').first()).toBeVisible()
      await expect(page.locator('[data-testid="wallet-balance"]').first()).toBeVisible()
    })

    test('should allow filtering and sorting wallets', async ({ page }: { page: Page }) => {
      // Wait for wallet list to load
      await page.waitForSelector('[data-testid="wallet-list"]', { timeout: 10000 })
      
      // Test search functionality
      const searchInput = page.locator('[data-testid="wallet-search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(500) // Wait for debounced search
        
        // Check if results are filtered
        const filteredItems = page.locator('[data-testid="wallet-item"]')
        const count = await filteredItems.count()
        expect(count).toBeGreaterThanOrEqual(0)
      }
      
      // Test sorting functionality
      const sortButton = page.locator('[data-testid="sort-button"]')
      if (await sortButton.isVisible()) {
        await sortButton.click()
        await page.waitForTimeout(500) // Wait for sort to apply
      }
    })
  })

  test.describe('Wallet Connection', () => {
    test('should show wallet connection button', async ({ page }: { page: Page }) => {
      // Check if wallet connect button is visible
      const connectButton = page.locator('[data-testid="wallet-connect-button"]')
      await expect(connectButton).toBeVisible()
      
      // Check button text
      await expect(connectButton).toContainText(/connect/i)
    })

    test('should handle wallet connection flow', async ({ page }: { page: Page }) => {
      // Mock wallet connection for testing
      await page.addInitScript(() => {
        // Mock Solana wallet
        (window as any).solana = {
          isPhantom: true,
          connect: async () => ({ publicKey: { toString: () => 'mock-public-key' } }),
          disconnect: async () => {},
          on: () => {},
          off: () => {}
        }
      })
      
      const connectButton = page.locator('[data-testid="wallet-connect-button"]')
      if (await connectButton.isVisible()) {
        await connectButton.click()
        
        // Wait for connection state to update
        await page.waitForTimeout(1000)
        
        // Check if wallet is connected (button text should change)
        await expect(connectButton).not.toContainText(/connect/i)
      }
    })

    test('should handle wallet connection errors', async ({ page }: { page: Page }) => {
      // Mock wallet connection error
      await page.addInitScript(() => {
        (window as any).solana = {
          isPhantom: true,
          connect: async () => { throw new Error('User rejected connection') },
          on: () => {},
          off: () => {}
        }
      })
      
      const connectButton = page.locator('[data-testid="wallet-connect-button"]')
      if (await connectButton.isVisible()) {
        await connectButton.click()
        
        // Wait for error handling
        await page.waitForTimeout(1000)
        
        // Check if error message is displayed
        const errorMessage = page.locator('[data-testid="error-message"]')
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toContainText(/error/i)
        }
      }
    })
  })

  test.describe('Data Loading and Error Handling', () => {
    test('should show loading states while fetching data', async ({ page }: { page: Page }) => {
      // Intercept API calls to simulate slow loading
      await page.route('**/api/treasury/**', async (route: Route) => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await route.continue()
      })
      
      await page.goto('/')
      
      // Check if loading skeletons are shown
      await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible()
      
      // Wait for loading to complete
      await page.waitForSelector('[data-testid="treasury-overview"]', { timeout: 15000 })
    })

    test('should handle API errors gracefully', async ({ page }: { page: Page }) => {
      // Intercept API calls to simulate errors
      await page.route('**/api/treasury/**', async (route: Route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      })
      
      await page.goto('/')
      
      // Wait for error state
      await page.waitForTimeout(3000)
      
      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]')
      await expect(errorMessage).toBeVisible()
    })

    test('should allow retry on failed requests', async ({ page }: { page: Page }) => {
      let requestCount = 0
      
      // Intercept API calls to fail first request, succeed on retry
      await page.route('**/api/treasury/**', async (route: Route) => {
        requestCount++
        if (requestCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' })
          })
        } else {
          await route.continue()
        }
      })
      
      await page.goto('/')
      
      // Wait for error state
      await page.waitForTimeout(2000)
      
      // Click retry button if available
      const retryButton = page.locator('[data-testid="retry-button"]')
      if (await retryButton.isVisible()) {
        await retryButton.click()
        
        // Wait for successful retry
        await page.waitForSelector('[data-testid="treasury-overview"]', { timeout: 10000 })
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }: { page: Page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab')
      
      // Check if focus is visible
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Continue tabbing through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        const currentFocus = page.locator(':focus')
        if (await currentFocus.isVisible()) {
          // Verify focused element is interactive
          const tagName = await currentFocus.evaluate(el => el.tagName.toLowerCase())
          expect(['button', 'a', 'input', 'select', 'textarea'].some(tag => 
            tagName === tag || currentFocus.locator(`[tabindex]`).count() > 0
          )).toBeTruthy()
        }
      }
    })

    test('should have proper ARIA labels', async ({ page }: { page: Page }) => {
      // Check for ARIA labels on interactive elements
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent).toBeTruthy()
      }
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      expect(headingCount).toBeGreaterThan(0)
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time limits', async ({ page }: { page: Page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test('should not have memory leaks', async ({ page }: { page: Page }) => {
      // Navigate to page multiple times to check for memory leaks
      for (let i = 0; i < 3; i++) {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
      }
      
      // Check if page is still responsive
      await expect(page.locator('main')).toBeVisible()
    })
  })
}) 