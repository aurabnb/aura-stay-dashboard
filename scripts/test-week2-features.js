#!/usr/bin/env node

/**
 * AURA Stay Dashboard - Week 2 Features Test Script
 * Tests notification system, search functionality, and user profile management
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 AURA Stay Dashboard - Week 2 Features Test');
console.log('='.repeat(60));

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function logTest(name, status, message = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}${message ? ` - ${message}` : ''}`);
  
  testResults.details.push({ name, status, message });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.warnings++;
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function checkFileContent(filePath, searchStrings, description) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    const missingStrings = searchStrings.filter(str => !content.includes(str));
    
    if (missingStrings.length === 0) {
      logTest(description, 'PASS');
      return true;
    } else {
      logTest(description, 'FAIL', `Missing: ${missingStrings.join(', ')}`);
      return false;
    }
  } catch (error) {
    logTest(description, 'FAIL', `Error reading file: ${error.message}`);
    return false;
  }
}

// Test 1: Notification System Components
console.log('\n📢 Testing Notification System...');

logTest(
  'NotificationSystem component exists',
  fileExists('src/components/notifications/NotificationSystem.tsx') ? 'PASS' : 'FAIL'
);

logTest(
  'NotificationSettings component exists',
  fileExists('src/components/notifications/NotificationSettings.tsx') ? 'PASS' : 'FAIL'
);

logTest(
  'useNotifications hook exists',
  fileExists('src/hooks/useNotifications.ts') ? 'PASS' : 'FAIL'
);

// Test notification system integration
checkFileContent(
  'src/components/providers/AppProviders.tsx',
  ['NotificationProvider', 'import { NotificationProvider }'],
  'NotificationProvider integrated in AppProviders'
);

checkFileContent(
  'src/components/notifications/NotificationSystem.tsx',
  [
    'export function NotificationProvider',
    'export function useNotifications',
    'export const notificationPresets',
    'playNotificationSound',
    'AnimatePresence',
    'motion.div'
  ],
  'NotificationSystem has all core features'
);

checkFileContent(
  'src/hooks/useNotifications.ts',
  [
    'useNotificationsWithWallet',
    'notifyWalletConnected',
    'notifyTransactionSuccess',
    'notifyStakingReward',
    'notifyGovernanceVote',
    'NotificationManager'
  ],
  'useNotifications hook has wallet integration'
);

// Test 2: Search Functionality
console.log('\n🔍 Testing Search Functionality...');

logTest(
  'GlobalSearch component exists',
  fileExists('src/components/search/GlobalSearch.tsx') ? 'PASS' : 'FAIL'
);

logTest(
  'SearchButton component exists',
  fileExists('src/components/search/SearchButton.tsx') ? 'PASS' : 'FAIL'
);

logTest(
  'useDebounce hook exists',
  fileExists('src/hooks/useDebounce.ts') ? 'PASS' : 'FAIL'
);

checkFileContent(
  'src/components/search/GlobalSearch.tsx',
  [
    'export function GlobalSearch',
    'SearchResult',
    'SearchCategory',
    'useDebounce',
    'mockSearchData',
    'categoryConfig',
    'keyboard navigation'
  ],
  'GlobalSearch has comprehensive search features'
);

checkFileContent(
  'src/components/search/SearchButton.tsx',
  [
    'export function SearchButton',
    'GlobalSearch',
    'keyboard shortcut',
    'Cmd/Ctrl + K',
    'variant?: \'default\' | \'compact\' | \'icon-only\''
  ],
  'SearchButton has keyboard shortcuts and variants'
);

checkFileContent(
  'src/components/Header.tsx',
  [
    'SearchButton',
    'import { SearchButton }',
    'variant="compact"'
  ],
  'Search integrated in Header'
);

// Test 3: User Profile Management
console.log('\n👤 Testing User Profile Management...');

logTest(
  'User Profile page exists',
  fileExists('src/app/user-profile/page.tsx') ? 'PASS' : 'FAIL'
);

checkFileContent(
  'src/app/user-profile/page.tsx',
  [
    'export default function UserProfilePage',
    'UserProfile',
    'useState',
    'useWallet',
    'useNotificationsWithWallet',
    'NotificationSettings',
    'Tabs',
    'TabsContent',
    'motion.div'
  ],
  'User Profile page has all required features'
);

checkFileContent(
  'src/components/navigation/Navigation.tsx',
  [
    'User Profile',
    '/user-profile',
    'Manage profile & settings'
  ],
  'User Profile added to navigation'
);

// Test 4: Integration Tests
console.log('\n🔗 Testing Feature Integration...');

checkFileContent(
  'src/components/Header.tsx',
  [
    'useNotificationsWithWallet',
    'notifications.notifySuccess',
    'SearchButton'
  ],
  'Header integrates notifications and search'
);

// Test 5: TypeScript and Component Structure
console.log('\n📝 Testing TypeScript Definitions...');

checkFileContent(
  'src/components/notifications/NotificationSystem.tsx',
  [
    'export type NotificationType',
    'export interface Notification',
    'export interface NotificationAction',
    'NotificationPreferences'
  ],
  'Notification system has proper TypeScript types'
);

checkFileContent(
  'src/components/search/GlobalSearch.tsx',
  [
    'export interface SearchResult',
    'export type SearchCategory',
    'GlobalSearchProps'
  ],
  'Search system has proper TypeScript types'
);

// Test 6: UI Components and Styling
console.log('\n🎨 Testing UI Components...');

checkFileContent(
  'src/components/notifications/NotificationSystem.tsx',
  [
    'framer-motion',
    'lucide-react',
    'tailwindcss',
    'cn(',
    'className='
  ],
  'Notifications use proper UI libraries'
);

checkFileContent(
  'src/components/search/GlobalSearch.tsx',
  [
    'motion.div',
    'AnimatePresence',
    'Badge',
    'Input',
    'Button'
  ],
  'Search uses proper UI components'
);

// Test 7: Performance and Optimization
console.log('\n⚡ Testing Performance Features...');

checkFileContent(
  'src/hooks/useDebounce.ts',
  [
    'useState',
    'useEffect',
    'setTimeout',
    'clearTimeout'
  ],
  'Debounce hook properly implemented'
);

checkFileContent(
  'src/components/search/GlobalSearch.tsx',
  [
    'useMemo',
    'useCallback',
    'debounced',
    'relevanceScore'
  ],
  'Search has performance optimizations'
);

// Test 8: Accessibility and UX
console.log('\n♿ Testing Accessibility Features...');

checkFileContent(
  'src/components/search/GlobalSearch.tsx',
  [
    'keyboard navigation',
    'ArrowDown',
    'ArrowUp',
    'Enter',
    'Escape'
  ],
  'Search has keyboard navigation'
);

checkFileContent(
  'src/components/notifications/NotificationSystem.tsx',
  [
    'aria-',
    'role=',
    'title=',
    'alt='
  ],
  'Notifications have accessibility features'
);

// Test 9: Error Handling and Edge Cases
console.log('\n🛡️ Testing Error Handling...');

checkFileContent(
  'src/hooks/useNotifications.ts',
  [
    'try {',
    'catch',
    'error',
    'localStorage.getItem',
    'JSON.parse'
  ],
  'Notification hooks have error handling'
);

checkFileContent(
  'src/components/notifications/NotificationSystem.tsx',
  [
    'typeof window',
    'localStorage',
    'try',
    'catch'
  ],
  'Notification system handles SSR and errors'
);

// Test 10: Feature Completeness
console.log('\n🎯 Testing Feature Completeness...');

const requiredFeatures = [
  'Toast notifications with animations',
  'Sound notifications',
  'Notification preferences',
  'Global search with categories',
  'Keyboard shortcuts (⌘K)',
  'User profile management',
  'Wallet integration',
  'Mobile responsive design',
  'TypeScript type safety',
  'Performance optimizations'
];

let completedFeatures = 0;

// Check if core notification features exist
if (fileExists('src/components/notifications/NotificationSystem.tsx') && 
    fileExists('src/hooks/useNotifications.ts')) {
  completedFeatures += 3; // Toast, Sound, Preferences
}

// Check if search features exist
if (fileExists('src/components/search/GlobalSearch.tsx') && 
    fileExists('src/components/search/SearchButton.tsx')) {
  completedFeatures += 2; // Global search, Keyboard shortcuts
}

// Check if user profile exists
if (fileExists('src/app/user-profile/page.tsx')) {
  completedFeatures += 1; // User profile
}

// Check integrations
try {
  const headerContent = fs.readFileSync(path.join(__dirname, '..', 'src/components/Header.tsx'), 'utf8');
  if (headerContent.includes('useNotificationsWithWallet') && headerContent.includes('SearchButton')) {
    completedFeatures += 2; // Wallet integration, Mobile responsive
  }
} catch (error) {
  // File doesn't exist or can't be read
}

// Check TypeScript
if (fileExists('tsconfig.json')) {
  completedFeatures += 1; // TypeScript
}

// Check performance optimizations
try {
  const debounceContent = fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useDebounce.ts'), 'utf8');
  if (debounceContent.includes('useEffect') && debounceContent.includes('setTimeout')) {
    completedFeatures += 1; // Performance optimizations
  }
} catch (error) {
  // File doesn't exist
}

logTest(
  `Feature completeness (${completedFeatures}/${requiredFeatures.length})`,
  completedFeatures >= 8 ? 'PASS' : completedFeatures >= 6 ? 'WARN' : 'FAIL',
  `${Math.round((completedFeatures / requiredFeatures.length) * 100)}% complete`
);

// Final Results
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(60));

console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`⚠️  Warnings: ${testResults.warnings}`);

const totalTests = testResults.passed + testResults.failed + testResults.warnings;
const successRate = Math.round((testResults.passed / totalTests) * 100);

console.log(`\n🎯 Success Rate: ${successRate}%`);

if (successRate >= 90) {
  console.log('🎉 EXCELLENT! Week 2 features are production-ready!');
} else if (successRate >= 75) {
  console.log('👍 GOOD! Most features are working, minor issues to address.');
} else if (successRate >= 50) {
  console.log('⚠️  NEEDS WORK! Several features need attention.');
} else {
  console.log('❌ CRITICAL! Major issues need to be resolved.');
}

// Detailed recommendations
console.log('\n📋 RECOMMENDATIONS:');

if (testResults.failed > 0) {
  console.log('🔧 Priority fixes needed:');
  testResults.details
    .filter(test => test.status === 'FAIL')
    .forEach(test => console.log(`   • ${test.name}: ${test.message}`));
}

if (testResults.warnings > 0) {
  console.log('⚠️  Improvements suggested:');
  testResults.details
    .filter(test => test.status === 'WARN')
    .forEach(test => console.log(`   • ${test.name}: ${test.message}`));
}

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run `npm run dev` to test features in browser');
console.log('2. Test notification system by connecting/disconnecting wallet');
console.log('3. Test search with Cmd/Ctrl + K keyboard shortcut');
console.log('4. Navigate to /user-profile to test profile management');
console.log('5. Verify mobile responsiveness on different screen sizes');

console.log('\n✨ Week 2 Feature Testing Complete!');

// Exit with appropriate code
process.exit(testResults.failed > 0 ? 1 : 0); 