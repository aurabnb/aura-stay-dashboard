import { test, expect } from '@playwright/test'

test.describe('Governance E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to governance page
    await page.goto('/governance')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Governance Dashboard', () => {
    test('should display governance overview', async ({ page }) => {
      // Check if governance stats are displayed
      await expect(page.locator('[data-testid="governance-stats"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-proposals"]')).toBeVisible()
      await expect(page.locator('[data-testid="active-proposals"]')).toBeVisible()
      await expect(page.locator('[data-testid="participation-rate"]')).toBeVisible()
      
      // Check if proposal list is displayed
      await expect(page.locator('[data-testid="proposal-list"]')).toBeVisible()
    })

    test('should filter proposals by status', async ({ page }) => {
      // Test filtering by active proposals
      await page.selectOption('[data-testid="status-filter"]', 'ACTIVE')
      await page.waitForTimeout(1000)
      
      // Check if only active proposals are shown
      const proposalItems = page.locator('[data-testid="proposal-item"]')
      if (await proposalItems.count() > 0) {
        await expect(proposalItems.first().locator('.proposal-status')).toContainText('Active')
      }
      
      // Test filtering by passed proposals
      await page.selectOption('[data-testid="status-filter"]', 'PASSED')
      await page.waitForTimeout(1000)
      
      if (await proposalItems.count() > 0) {
        await expect(proposalItems.first().locator('.proposal-status')).toContainText('Passed')
      }
    })

    test('should filter proposals by category', async ({ page }) => {
      // Test filtering by treasury category
      await page.selectOption('[data-testid="category-filter"]', 'TREASURY')
      await page.waitForTimeout(1000)
      
      const proposalItems = page.locator('[data-testid="proposal-item"]')
      if (await proposalItems.count() > 0) {
        await expect(proposalItems.first().locator('.proposal-category')).toContainText('Treasury')
      }
    })
  })

  test.describe('Proposal Creation', () => {
    test('should open proposal creation modal', async ({ page }) => {
      // Mock wallet connection
      await page.addInitScript(() => {
        window.mockWallet = {
          connected: true,
          publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' }
        }
      })
      
      await page.click('[data-testid="create-proposal-btn"]')
      
      // Check if proposal creation modal opens
      await expect(page.locator('[data-testid="proposal-modal"]')).toBeVisible()
      await expect(page.locator('input[name="title"]')).toBeVisible()
      await expect(page.locator('textarea[name="description"]')).toBeVisible()
      await expect(page.locator('select[name="category"]')).toBeVisible()
    })

    test('should validate proposal form fields', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: true, publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' } }
      })
      
      await page.click('[data-testid="create-proposal-btn"]')
      
      // Try to submit empty form
      await page.click('[data-testid="submit-proposal-btn"]')
      
      // Check for validation errors
      await expect(page.locator('text=Title is required')).toBeVisible()
      await expect(page.locator('text=Description is required')).toBeVisible()
    })

    test('should create a new proposal successfully', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: true, publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' } }
      })
      
      // Mock successful API response
      await page.route('**/api/governance/proposals', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'proposal-123',
              title: 'Test Proposal',
              status: 'ACTIVE'
            })
          })
        } else {
          await route.continue()
        }
      })
      
      await page.click('[data-testid="create-proposal-btn"]')
      
      // Fill out the form
      await page.fill('input[name="title"]', 'Test Proposal for E2E')
      await page.fill('textarea[name="description"]', 'This is a test proposal created during E2E testing')
      await page.selectOption('select[name="category"]', 'TREASURY')
      
      // Set end date (7 days from now)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      await page.fill('input[name="endDate"]', futureDate.toISOString().split('T')[0])
      
      // Submit the form
      await page.click('[data-testid="submit-proposal-btn"]')
      
      // Check for success message
      await expect(page.locator('text=Proposal created successfully')).toBeVisible()
      
      // Check if modal closes
      await expect(page.locator('[data-testid="proposal-modal"]')).not.toBeVisible()
    })

    test('should handle proposal creation errors', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: true, publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' } }
      })
      
      // Mock API error
      await page.route('**/api/governance/proposals', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid proposal data' })
        })
      })
      
      await page.click('[data-testid="create-proposal-btn"]')
      
      // Fill out the form
      await page.fill('input[name="title"]', 'Test Proposal')
      await page.fill('textarea[name="description"]', 'Test description')
      await page.selectOption('select[name="category"]', 'TREASURY')
      
      // Submit the form
      await page.click('[data-testid="submit-proposal-btn"]')
      
      // Check for error message
      await expect(page.locator('text=Invalid proposal data')).toBeVisible()
    })
  })

  test.describe('Proposal Voting', () => {
    test('should display proposal details', async ({ page }) => {
      // Mock proposal data
      await page.route('**/api/governance/proposals/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'proposal-1',
            title: 'Test Proposal',
            description: 'Test description',
            status: 'ACTIVE',
            votesFor: 150,
            votesAgainst: 50,
            totalVotes: 200,
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        })
      })
      
      // Click on a proposal to view details
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check if proposal details are displayed
      await expect(page.locator('[data-testid="proposal-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="proposal-description"]')).toBeVisible()
      await expect(page.locator('[data-testid="voting-stats"]')).toBeVisible()
      await expect(page.locator('[data-testid="vote-buttons"]')).toBeVisible()
    })

    test('should cast a vote on active proposal', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { 
          connected: true, 
          publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' },
          signTransaction: async () => ({ signature: 'mock-signature' })
        }
      })
      
      // Mock voting API
      await page.route('**/api/governance/votes', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'vote-123',
            voteType: 'FOR',
            weight: 100
          })
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Cast a vote for the proposal
      await page.click('[data-testid="vote-for-btn"]')
      
      // Check for confirmation dialog
      await expect(page.locator('[data-testid="vote-confirmation"]')).toBeVisible()
      await page.click('[data-testid="confirm-vote-btn"]')
      
      // Check for success message
      await expect(page.locator('text=Vote cast successfully')).toBeVisible()
      
      // Check if vote is reflected in the UI
      await expect(page.locator('[data-testid="user-vote-status"]')).toContainText('Voted: For')
    })

    test('should prevent voting on expired proposals', async ({ page }) => {
      // Mock expired proposal
      await page.route('**/api/governance/proposals/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'proposal-1',
            title: 'Expired Proposal',
            status: 'ACTIVE',
            endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
          })
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check if voting buttons are disabled
      await expect(page.locator('[data-testid="vote-for-btn"]')).toBeDisabled()
      await expect(page.locator('[data-testid="vote-against-btn"]')).toBeDisabled()
      
      // Check for expired message
      await expect(page.locator('text=Voting period has ended')).toBeVisible()
    })

    test('should display voting weight based on staked tokens', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: true, publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' } }
      })
      
      // Mock user staking data
      await page.route('**/api/governance/voting-weight/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ votingWeight: 1500 })
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check if voting weight is displayed
      await expect(page.locator('[data-testid="voting-weight"]')).toContainText('1,500')
    })
  })

  test.describe('Proposal Results', () => {
    test('should display real-time voting results', async ({ page }) => {
      // Mock proposal with votes
      await page.route('**/api/governance/proposals/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'proposal-1',
            title: 'Test Proposal',
            votesFor: 750,
            votesAgainst: 250,
            totalVotes: 1000,
            status: 'ACTIVE'
          })
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check voting progress bars
      await expect(page.locator('[data-testid="votes-for-bar"]')).toBeVisible()
      await expect(page.locator('[data-testid="votes-against-bar"]')).toBeVisible()
      
      // Check vote percentages
      await expect(page.locator('[data-testid="for-percentage"]')).toContainText('75%')
      await expect(page.locator('[data-testid="against-percentage"]')).toContainText('25%')
    })

    test('should show proposal outcome when voting ends', async ({ page }) => {
      // Mock passed proposal
      await page.route('**/api/governance/proposals/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'proposal-1',
            title: 'Passed Proposal',
            status: 'PASSED',
            votesFor: 600,
            votesAgainst: 400,
            totalVotes: 1000,
            endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          })
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check for passed status
      await expect(page.locator('[data-testid="proposal-status"]')).toContainText('Passed')
      await expect(page.locator('[data-testid="outcome-badge"]')).toHaveClass(/success/)
    })

    test('should display voter list for transparency', async ({ page }) => {
      // Mock proposal with voter details
      await page.route('**/api/governance/proposals/**/votes', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'vote-1',
              voteType: 'FOR',
              weight: 500,
              user: { username: 'voter1', walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' }
            },
            {
              id: 'vote-2',
              voteType: 'AGAINST',
              weight: 300,
              user: { username: 'voter2', walletAddress: 'AnotherWalletAddress123456789' }
            }
          ])
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      await page.click('[data-testid="view-votes-tab"]')
      
      // Check if voter list is displayed
      await expect(page.locator('[data-testid="voter-list"]')).toBeVisible()
      await expect(page.locator('[data-testid="voter-item"]')).toHaveCount(2)
      
      // Check voter details
      const firstVoter = page.locator('[data-testid="voter-item"]').first()
      await expect(firstVoter.locator('.voter-name')).toContainText('voter1')
      await expect(firstVoter.locator('.vote-type')).toContainText('For')
      await expect(firstVoter.locator('.vote-weight')).toContainText('500')
    })
  })

  test.describe('Governance Analytics', () => {
    test('should display participation metrics', async ({ page }) => {
      // Mock governance stats
      await page.route('**/api/governance/stats', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalProposals: 50,
            activeProposals: 5,
            participationRate: 65.5,
            passRate: 72.0
          })
        })
      })
      
      await page.click('[data-testid="analytics-tab"]')
      
      // Check if analytics are displayed
      await expect(page.locator('[data-testid="participation-rate"]')).toContainText('65.5%')
      await expect(page.locator('[data-testid="pass-rate"]')).toContainText('72.0%')
      await expect(page.locator('[data-testid="total-proposals"]')).toContainText('50')
    })

    test('should show voting history for connected user', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: true, publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' } }
      })
      
      // Mock user voting history
      await page.route('**/api/governance/users/*/votes', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'vote-1',
              voteType: 'FOR',
              weight: 100,
              timestamp: new Date().toISOString(),
              proposal: { id: 'prop-1', title: 'Treasury Allocation', status: 'PASSED' }
            }
          ])
        })
      })
      
      await page.click('[data-testid="my-votes-tab"]')
      
      // Check if voting history is displayed
      await expect(page.locator('[data-testid="vote-history"]')).toBeVisible()
      await expect(page.locator('[data-testid="vote-history-item"]')).toHaveCount(1)
      
      const voteItem = page.locator('[data-testid="vote-history-item"]').first()
      await expect(voteItem.locator('.proposal-title')).toContainText('Treasury Allocation')
      await expect(voteItem.locator('.vote-type')).toContainText('For')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/governance/**', async route => {
        await route.abort('failed')
      })
      
      await page.reload()
      
      // Check for error message
      await expect(page.locator('text=Failed to load governance data')).toBeVisible()
      await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible()
    })

    test('should require wallet connection for voting', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: false }
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check if connect wallet message is shown
      await expect(page.locator('text=Connect wallet to vote')).toBeVisible()
      await expect(page.locator('[data-testid="vote-for-btn"]')).toBeDisabled()
      await expect(page.locator('[data-testid="vote-against-btn"]')).toBeDisabled()
    })

    test('should handle insufficient voting power', async ({ page }) => {
      await page.addInitScript(() => {
        window.mockWallet = { connected: true, publicKey: { toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' } }
      })
      
      // Mock zero voting weight
      await page.route('**/api/governance/voting-weight/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ votingWeight: 0 })
        })
      })
      
      await page.click('[data-testid="proposal-item"]:first-child')
      
      // Check for insufficient voting power message
      await expect(page.locator('text=No voting power')).toBeVisible()
      await expect(page.locator('text=Stake tokens to participate')).toBeVisible()
    })
  })
}) 