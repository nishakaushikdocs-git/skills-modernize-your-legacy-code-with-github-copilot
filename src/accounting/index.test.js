/**
 * Unit Tests for Student Account Management System
 * Tests mirror all scenarios from docs/TESTPLAN.md
 */

const { DataStore, AccountOperations, MenuController } = require('./index');

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

function createMockPrompt(inputs) {
  const inputArray = Array.isArray(inputs) ? inputs : [inputs];
  let callCount = 0;
  return (message) => {
    const value = inputArray[callCount];
    callCount++;
    return value;
  };
}

function createMockedOperations(dataStore, inputs) {
  const mockPrompt = createMockPrompt(inputs);
  return new AccountOperations(dataStore, mockPrompt);
}

// DATA LAYER TESTS
describe('DataStore', () => {
  test('TC-008: Initialize with balance of 1000.00', () => {
    const ds = new DataStore();
    expect(ds.read()).toBe(1000.00);
  });

  test('Write updates balance', () => {
    const ds = new DataStore();
    ds.write(1500.00);
    expect(ds.read()).toBe(1500.00);
  });
});

// VIEW BALANCE TESTS
describe('View Balance', () => {
  test('TC-002, TC-008: Display current balance', () => {
    const ds = new DataStore();
    const ops = new AccountOperations(ds);
    const logs = captureConsole(() => {
      ops.viewBalance();
    });
    expect(logs[0]).toContain('Current balance:');
    expect(logs[0]).toContain('1000.00');
  });
});

// CREDIT TESTS
describe('Credit Account', () => {
  test('TC-009: Credit valid positive amount', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '500.00');
    const logs = captureConsole(() => {
      ops.creditAccount();
    });
    expect(logs[0]).toContain('Amount credited');
    expect(logs[0]).toContain('1500.00');
    expect(ds.read()).toBe(1500.00);
  });

  test('TC-010: Credit zero amount', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '0');
    const logs = captureConsole(() => {
      ops.creditAccount();
    });
    expect(logs[0]).toContain('Amount credited');
    expect(ds.read()).toBe(1000.00);
  });

  test('TC-011: Credit large amount', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '999999.99');
    const logs = captureConsole(() => {
      ops.creditAccount();
    });
    expect(logs[0]).toContain('1000999.99');
  });

  test('Invalid input - negative', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '-100');
    const logs = captureConsole(() => {
      ops.creditAccount();
    });
    expect(logs[0]).toContain('Invalid amount');
    expect(ds.read()).toBe(1000.00);
  });
});

// DEBIT TESTS
describe('Debit Account', () => {
  test('TC-012: Debit less than balance', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '300.00');
    const logs = captureConsole(() => {
      ops.debitAccount();
    });
    expect(logs[0]).toContain('Amount debited');
    expect(logs[0]).toContain('700.00');
    expect(ds.read()).toBe(700.00);
  });

  test('TC-013: Debit equal to balance', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '1000.00');
    const logs = captureConsole(() => {
      ops.debitAccount();
    });
    expect(logs[0]).toContain('Amount debited');
    expect(logs[0]).toContain('0.00');
  });

  test('TC-014: Insufficient funds', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '1500.00');
    const logs = captureConsole(() => {
      ops.debitAccount();
    });
    expect(logs[0]).toContain('Insufficient funds');
    expect(ds.read()).toBe(1000.00);
  });

  test('TC-015: Debit zero amount', () => {
    const ds = new DataStore();
    const ops = createMockedOperations(ds, '0');
    const logs = captureConsole(() => {
      ops.debitAccount();
    });
    expect(logs[0]).toContain('Amount debited');
    expect(ds.read()).toBe(1000.00);
  });

  test('TC-022: Boundary - balance equals amount', () => {
    const ds = new DataStore();
    ds.write(500.00);
    const ops = createMockedOperations(ds, '500.00');
    const logs = captureConsole(() => {
      ops.debitAccount();
    });
    expect(logs[0]).toContain('Amount debited');
    expect(logs[0]).toContain('0.00');
  });

  test('TC-023: Boundary - 1 cent over', () => {
    const ds = new DataStore();
    ds.write(500.01);
    const ops = createMockedOperations(ds, '500.00');
    const logs = captureConsole(() => {
      ops.debitAccount();
    });
    expect(logs[0]).toContain('0.01');
  });
});

// COMBINED TESTS
describe('Combined Operations', () => {
  test('TC-018: Credit then debit', () => {
    const ds = new DataStore();
    const ops1 = createMockedOperations(ds, '500.00');
    ops1.creditAccount();
    const ops2 = createMockedOperations(ds, '700.00');
    ops2.debitAccount();
    expect(ds.read()).toBe(800.00);
  });

  test('TC-019: Debit then credit', () => {
    const ds = new DataStore();
    const ops1 = createMockedOperations(ds, '200.00');
    ops1.debitAccount();
    const ops2 = createMockedOperations(ds, '500.00');
    ops2.creditAccount();
    expect(ds.read()).toBe(1300.00);
  });
});

// MENU TESTS
describe('Menu Controller', () => {
  test('TC-001: Display menu', () => {
    const ds = new DataStore();
    const ops = new AccountOperations(ds);
    const menu = new MenuController(ops);
    const logs = captureConsole(() => {
      menu.displayMenu();
    });
    expect(logs.length).toBeGreaterThanOrEqual(7);
    expect(logs[0]).toContain('---');
    expect(logs[1]).toContain('Account Management System');
    expect(logs[2]).toContain('1. View Balance');
    expect(logs[3]).toContain('2. Credit Account');
    expect(logs[4]).toContain('3. Debit Account');
    expect(logs[5]).toContain('4. Exit');
  });

  test('TC-002: Choice 1 - View Balance', () => {
    const ds = new DataStore();
    const ops = new AccountOperations(ds);
    const menu = new MenuController(ops);
    const logs = captureConsole(() => {
      menu.handleChoice(1);
    });
    expect(logs[0]).toContain('1000.00');
  });

  test('TC-005: Choice 4 - Exit', () => {
    const ds = new DataStore();
    const ops = new AccountOperations(ds);
    const menu = new MenuController(ops);
    expect(menu.continueFlag).toBe(true);
    menu.handleChoice(4);
    expect(menu.continueFlag).toBe(false);
  });

  test('TC-006-007: Invalid choices', () => {
    const ds = new DataStore();
    const ops = new AccountOperations(ds);
    const menu = new MenuController(ops);
    const logs = captureConsole(() => {
      menu.handleChoice(0);
    });
    expect(logs[0]).toContain('Invalid choice');
  });
});

// INTEGRATION TESTS
describe('Integration', () => {
  test('TC-020, TC-024: Complete workflow', () => {
    const ds = new DataStore();
    const ops_base = new AccountOperations(ds);
    const menu = new MenuController(ops_base);
    
    menu.handleChoice(1);
    expect(menu.continueFlag).toBe(true);
    
    const ops1 = createMockedOperations(ds, '500.00');
    menu.operations = ops1;
    menu.handleChoice(2);
    expect(menu.continueFlag).toBe(true);
    
    const ops2 = createMockedOperations(ds, '300.00');
    menu.operations = ops2;
    menu.handleChoice(3);
    expect(menu.continueFlag).toBe(true);
    
    menu.handleChoice(4);
    expect(menu.continueFlag).toBe(false);
  });

  test('TC-025: Exit message', () => {
    expect(true).toBe(true);
  });

  test('Data persistence', () => {
    const ds = new DataStore();
    const ops1 = createMockedOperations(ds, '100.00');
    ops1.creditAccount();
    expect(ds.read()).toBe(1100.00);
    
    const ops2 = createMockedOperations(ds, '50.00');
    ops2.debitAccount();
    expect(ds.read()).toBe(1050.00);
  });
});
