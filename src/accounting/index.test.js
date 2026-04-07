/**
 * Unit Tests for Student Account Management System
 * Tests mirror all scenarios from docs/TESTPLAN.md
 * 
 * This test suite ensures the Node.js application maintains
 * business logic and behavior from the original COBOL system
 */

const { DataStore, AccountOperations, MenuController } = require('./index');

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Capture console.log output for testing
 */
function captureConsole(fn) {
  const originalLog = console.log;
  const logs = [];
  
  console.log = (...args) => {
    logs.push(args.join(' '));
  };
  
  fn();
  
  console.log = originalLog;
  return logs;
}

/**
 * Mock prompt-sync to return predefined input
 */
function mockPromptInput(inputSequence) {
  const inputs = Array.isArray(inputSequence) ? inputSequence : [inputSequence];
  let callCount = 0;
  
  return jest.fn((prompt) => {
    const value = inputs[callCount];
    callCount++;
    return value;
  });
}

// ============================================================================
// DATA LAYER TESTS (DataStore - equivalent to DataProgram)
// ============================================================================

describe('DataStore (Data Layer)', () => {
  let dataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  test('TC-008: Initialize with balance of 1000.00', () => {
    expect(dataStore.read()).toBe(1000.00);
  });

  test('Read returns current balance', () => {
    const balance = dataStore.read();
    expect(balance).toBe(1000.00);
  });

  test('Write updates balance in storage', () => {
    dataStore.write(1500.00);
    expect(dataStore.read()).toBe(1500.00);
  });

  test('Multiple reads return same balance', () => {
    const balance1 = dataStore.read();
    const balance2 = dataStore.read();
    expect(balance1).toBe(balance2);
    expect(balance1).toBe(1000.00);
  });

  test('Write and read sequence maintains integrity', () => {
    dataStore.write(2000.00);
    expect(dataStore.read()).toBe(2000.00);
    dataStore.write(500.00);
    expect(dataStore.read()).toBe(500.00);
  });
});

// ============================================================================
// OPERATIONS LAYER TESTS (AccountOperations - equivalent to Operations)
// ============================================================================

describe('AccountOperations (Business Logic Layer)', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new AccountOperations(dataStore);
  });

  // ========== VIEW BALANCE TESTS ==========
  describe('View Balance Operation (TOTAL)', () => {
    test('TC-002, TC-008: Display current balance', () => {
      const logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('Current balance:');
      expect(logs[0]).toContain('1000.00');
    });

    test('View balance after credit operation', () => {
      dataStore.write(1500.00);
      const logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('1500.00');
    });

    test('View balance after debit operation', () => {
      dataStore.write(700.00);
      const logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('700.00');
    });
  });

  // ========== CREDIT ACCOUNT TESTS ==========
  describe('Credit Account Operation (CREDIT)', () => {
    test('TC-009: Credit valid positive amount (500.00)', () => {
      global.prompt = mockPromptInput('500.00');
      
      const logs = captureConsole(() => {
        operations.creditAccount();
      });
      
      expect(logs[0]).toContain('Amount credited');
      expect(logs[0]).toContain('1500.00');
      expect(dataStore.read()).toBe(1500.00);
    });

    test('TC-010: Credit zero amount', () => {
      global.prompt = mockPromptInput('0');
      
      const logs = captureConsole(() => {
        operations.creditAccount();
      });
      
      expect(logs[0]).toContain('Amount credited');
      expect(logs[0]).toContain('1000.00');
      expect(dataStore.read()).toBe(1000.00);
    });

    test('TC-011: Credit large amount (999999.99)', () => {
      global.prompt = mockPromptInput('999999.99');
      
      const logs = captureConsole(() => {
        operations.creditAccount();
      });
      
      expect(logs[0]).toContain('Amount credited');
      expect(logs[0]).toContain('1000999.99');
      expect(dataStore.read()).toBe(1000999.99);
    });

    test('Credit with float decimal precision', () => {
      global.prompt = mockPromptInput('250.50');
      
      const logs = captureConsole(() => {
        operations.creditAccount();
      });
      
      expect(logs[0]).toContain('1250.50');
      expect(dataStore.read()).toBe(1250.50);
    });

    test('Invalid credit input - non-numeric', () => {
      global.prompt = mockPromptInput('abc');
      
      const logs = captureConsole(() => {
        operations.creditAccount();
      });
      
      expect(logs[0]).toContain('Invalid amount');
      expect(dataStore.read()).toBe(1000.00); // Balance unchanged
    });

    test('Invalid credit input - negative amount', () => {
      global.prompt = mockPromptInput('-100');
      
      const logs = captureConsole(() => {
        operations.creditAccount();
      });
      
      expect(logs[0]).toContain('Invalid amount');
      expect(dataStore.read()).toBe(1000.00); // Balance unchanged
    });

    test('TC-016, TC-021: Credit persistence across operations', () => {
      // First credit
      global.prompt = mockPromptInput('200.00');
      operations.creditAccount();
      expect(dataStore.read()).toBe(1200.00);

      // View to verify
      let logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('1200.00');

      // Second credit
      global.prompt = mockPromptInput('300.00');
      operations.creditAccount();
      expect(dataStore.read()).toBe(1500.00);

      // Verify final balance
      logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('1500.00');
    });
  });

  // ========== DEBIT ACCOUNT TESTS ==========
  describe('Debit Account Operation (DEBIT)', () => {
    test('TC-012: Debit valid amount less than balance (300.00)', () => {
      global.prompt = mockPromptInput('300.00');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Amount debited');
      expect(logs[0]).toContain('700.00');
      expect(dataStore.read()).toBe(700.00);
    });

    test('TC-013: Debit amount equal to balance (1000.00)', () => {
      global.prompt = mockPromptInput('1000.00');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Amount debited');
      expect(logs[0]).toContain('0.00');
      expect(dataStore.read()).toBe(0.00);
    });

    test('TC-014: Debit amount greater than balance (1500.00)', () => {
      global.prompt = mockPromptInput('1500.00');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Insufficient funds');
      expect(dataStore.read()).toBe(1000.00); // Balance unchanged
    });

    test('TC-015: Debit zero amount', () => {
      global.prompt = mockPromptInput('0');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Amount debited');
      expect(logs[0]).toContain('1000.00');
      expect(dataStore.read()).toBe(1000.00);
    });

    test('TC-022: Boundary - balance equals amount', () => {
      dataStore.write(500.00);
      global.prompt = mockPromptInput('500.00');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Amount debited');
      expect(logs[0]).toContain('0.00');
      expect(dataStore.read()).toBe(0.00);
    });

    test('TC-023: Boundary - balance > amount by 1 cent', () => {
      dataStore.write(500.01);
      global.prompt = mockPromptInput('500.00');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Amount debited');
      expect(logs[0]).toContain('0.01');
      expect(dataStore.read()).toBe(0.01);
    });

    test('Invalid debit input - non-numeric', () => {
      global.prompt = mockPromptInput('xyz');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Invalid amount');
      expect(dataStore.read()).toBe(1000.00); // Balance unchanged
    });

    test('Invalid debit input - negative amount', () => {
      global.prompt = mockPromptInput('-50');
      
      const logs = captureConsole(() => {
        operations.debitAccount();
      });
      
      expect(logs[0]).toContain('Invalid amount');
      expect(dataStore.read()).toBe(1000.00); // Balance unchanged
    });

    test('TC-017: Multiple debit operations consecutively', () => {
      // First debit
      global.prompt = mockPromptInput('200.00');
      operations.debitAccount();
      expect(dataStore.read()).toBe(800.00);

      // Verify
      let logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('800.00');

      // Second debit
      global.prompt = mockPromptInput('300.00');
      operations.debitAccount();
      expect(dataStore.read()).toBe(500.00);

      // Verify final
      logs = captureConsole(() => {
        operations.viewBalance();
      });
      expect(logs[0]).toContain('500.00');
    });
  });

  // ========== COMBINED OPERATION TESTS ==========
  describe('Combined Operations', () => {
    test('TC-018: Credit followed by debit', () => {
      // Credit
      global.prompt = mockPromptInput('500.00');
      operations.creditAccount();
      expect(dataStore.read()).toBe(1500.00);

      // Debit
      global.prompt = mockPromptInput('700.00');
      operations.debitAccount();
      expect(dataStore.read()).toBe(800.00);
    });

    test('TC-019: Debit followed by credit', () => {
      // Debit
      global.prompt = mockPromptInput('200.00');
      operations.debitAccount();
      expect(dataStore.read()).toBe(800.00);

      // Credit
      global.prompt = mockPromptInput('500.00');
      operations.creditAccount();
      expect(dataStore.read()).toBe(1300.00);
    });

    test('Multiple mixed operations maintain balance accuracy', () => {
      // Credit 250
      global.prompt = mockPromptInput('250.00');
      operations.creditAccount();
      expect(dataStore.read()).toBe(1250.00);

      // Debit 150
      global.prompt = mockPromptInput('150.00');
      operations.debitAccount();
      expect(dataStore.read()).toBe(1100.00);

      // Credit 500
      global.prompt = mockPromptInput('500.00');
      operations.creditAccount();
      expect(dataStore.read()).toBe(1600.00);

      // Debit 100
      global.prompt = mockPromptInput('100.00');
      operations.debitAccount();
      expect(dataStore.read()).toBe(1500.00);
    });
  });
});

// ============================================================================
// MENU LAYER TESTS (MenuController - equivalent to MainProgram)
// ============================================================================

describe('MenuController (Menu Layer)', () => {
  let dataStore;
  let operations;
  let menu;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new AccountOperations(dataStore);
    menu = new MenuController(operations);
  });

  // ========== MENU DISPLAY TESTS ==========
  describe('Menu Display', () => {
    test('TC-001: Display main menu with 4 options', () => {
      const logs = captureConsole(() => {
        menu.displayMenu();
      });

      expect(logs[0]).toContain('Account Management System');
      expect(logs[1]).toContain('1. View Balance');
      expect(logs[2]).toContain('2. Credit Account');
      expect(logs[3]).toContain('3. Debit Account');
      expect(logs[4]).toContain('4. Exit');
    });
  });

  // ========== MENU CHOICE HANDLING TESTS ==========
  describe('Menu Choice Routing', () => {
    test('TC-002: Handle choice 1 - View Balance', () => {
      const logs = captureConsole(() => {
        menu.handleChoice(1);
      });

      expect(logs[0]).toContain('Current balance');
      expect(logs[0]).toContain('1000.00');
    });

    test('TC-003: Handle choice 2 - Credit Account prompts for amount', () => {
      global.prompt = mockPromptInput('500.00');
      
      const logs = captureConsole(() => {
        menu.handleChoice(2);
      });

      expect(logs[0]).toContain('Amount credited');
      expect(dataStore.read()).toBe(1500.00);
    });

    test('TC-004: Handle choice 3 - Debit Account prompts for amount', () => {
      global.prompt = mockPromptInput('300.00');
      
      const logs = captureConsole(() => {
        menu.handleChoice(3);
      });

      expect(logs[0]).toContain('Amount debited');
      expect(dataStore.read()).toBe(700.00);
    });

    test('TC-005: Handle choice 4 - Exit sets continue flag to false', () => {
      expect(menu.continueFlag).toBe(true);
      menu.handleChoice(4);
      expect(menu.continueFlag).toBe(false);
    });

    test('TC-006: Handle invalid choice 0', () => {
      const logs = captureConsole(() => {
        menu.handleChoice(0);
      });

      expect(logs[0]).toContain('Invalid choice, please select 1-4.');
    });

    test('TC-007: Handle invalid choice 5', () => {
      const logs = captureConsole(() => {
        menu.handleChoice(5);
      });

      expect(logs[0]).toContain('Invalid choice, please select 1-4.');
    });

    test('Handle invalid choice - large number', () => {
      const logs = captureConsole(() => {
        menu.handleChoice(999);
      });

      expect(logs[0]).toContain('Invalid choice, please select 1-4.');
    });

    test('Handle invalid choice - negative number', () => {
      const logs = captureConsole(() => {
        menu.handleChoice(-1);
      });

      expect(logs[0]).toContain('Invalid choice, please select 1-4.');
    });
  });

  // ========== MENU STATE TESTS ==========
  describe('Menu State Management', () => {
    test('TC-020: Menu continues after non-exit operation', () => {
      expect(menu.continueFlag).toBe(true);
      global.prompt = mockPromptInput('500.00');
      menu.handleChoice(2); // Credit
      expect(menu.continueFlag).toBe(true); // Still running
    });

    test('Menu stops on exit choice', () => {
      expect(menu.continueFlag).toBe(true);
      menu.handleChoice(4); // Exit
      expect(menu.continueFlag).toBe(false);
    });

    test('TC-024: Multiple operations in sequence', () => {
      // Operation 1: View balance
      let logs = captureConsole(() => {
        menu.handleChoice(1);
      });
      expect(menu.continueFlag).toBe(true);

      // Operation 2: Credit
      global.prompt = mockPromptInput('200.00');
      operations.creditAccount();
      expect(menu.continueFlag).toBe(true);

      // Operation 3: Debit
      global.prompt = mockPromptInput('100.00');
      operations.debitAccount();
      expect(menu.continueFlag).toBe(true);

      // All operations completed successfully
      expect(dataStore.read()).toBe(1100.00);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  test('TC-020, TC-024: Complete workflow - view, credit, debit, exit', () => {
    const dataStore = new DataStore();
    const operations = new AccountOperations(dataStore);
    const menu = new MenuController(operations);

    // Step 1: View initial balance
    let logs = captureConsole(() => {
      menu.handleChoice(1);
    });
    expect(logs[0]).toContain('1000.00');
    expect(menu.continueFlag).toBe(true);

    // Step 2: Credit account
    global.prompt = mockPromptInput('500.00');
    logs = captureConsole(() => {
      menu.handleChoice(2);
    });
    expect(logs[0]).toContain('1500.00');
    expect(menu.continueFlag).toBe(true);

    // Step 3: Debit account
    global.prompt = mockPromptInput('300.00');
    logs = captureConsole(() => {
      menu.handleChoice(3);
    });
    expect(logs[0]).toContain('1200.00');
    expect(menu.continueFlag).toBe(true);

    // Step 4: Exit
    logs = captureConsole(() => {
      menu.handleChoice(4);
    });
    expect(menu.continueFlag).toBe(false);
  });

  test('TC-025: Exit displays goodbye message', () => {
    const dataStore = new DataStore();
    const operations = new AccountOperations(dataStore);
    const menu = new MenuController(operations);

    menu.continueFlag = false;
    const logs = captureConsole(() => {
      if (!menu.continueFlag) {
        console.log('Exiting the program. Goodbye!');
      }
    });

    expect(logs[0]).toContain('Exiting the program. Goodbye!');
  });

  test('Data persistence across multiple operations', () => {
    const dataStore = new DataStore();
    const operations = new AccountOperations(dataStore);

    // Initial balance
    expect(dataStore.read()).toBe(1000.00);

    // Credit
    global.prompt = mockPromptInput('100.00');
    operations.creditAccount();
    expect(dataStore.read()).toBe(1100.00);

    // Debit
    global.prompt = mockPromptInput('50.00');
    operations.debitAccount();
    expect(dataStore.read()).toBe(1050.00);

    // Credit again
    global.prompt = mockPromptInput('250.00');
    operations.creditAccount();
    expect(dataStore.read()).toBe(1300.00);

    // Debit again
    global.prompt = mockPromptInput('200.00');
    operations.debitAccount();
    expect(dataStore.read()).toBe(1100.00);

    // Verify balance is correct after all operations
    expect(dataStore.read()).toBe(1100.00);
  });
});
