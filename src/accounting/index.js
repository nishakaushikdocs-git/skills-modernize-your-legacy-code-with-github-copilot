#!/usr/bin/env node

/**
 * Student Account Management System
 * Modernized from Legacy COBOL to Node.js
 * 
 * This application preserves the original business logic:
 * - Data persistence layer (DataProgram)
 * - Business logic operations (Operations)
 * - Menu-driven interface (MainProgram)
 */

const prompt = require('prompt-sync')();

// ============================================================================
// DATA LAYER (Equivalent to DataProgram)
// ============================================================================
// Manages persistent storage of account balance
// Initial balance: 1000.00
class DataStore {
  constructor() {
    this.storageBalance = 1000.00;
  }

  /**
   * Read the current balance from storage
   * @returns {number} Current balance
   */
  read() {
    return this.storageBalance;
  }

  /**
   * Write balance to storage (persist)
   * @param {number} balance - The balance to store
   */
  write(balance) {
    this.storageBalance = balance;
  }
}

// ============================================================================
// OPERATIONS LAYER (Equivalent to Operations)
// ============================================================================
// Implements business logic for account operations
class AccountOperations {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  /**
   * TOTAL Operation: View current balance
   * Maps to COBOL 'TOTAL ' operation
   */
  viewBalance() {
    const balance = this.dataStore.read();
    console.log(`Current balance: ${balance.toFixed(2)}`);
  }

  /**
   * CREDIT Operation: Add funds to account
   * Maps to COBOL 'CREDIT' operation
   */
  creditAccount() {
    const amountInput = prompt('Enter credit amount: ');
    const amount = parseFloat(amountInput);

    // Validate input
    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount. Please enter a valid number.');
      return;
    }

    const currentBalance = this.dataStore.read();
    const newBalance = currentBalance + amount;
    this.dataStore.write(newBalance);
    console.log(`Amount credited. New balance: ${newBalance.toFixed(2)}`);
  }

  /**
   * DEBIT Operation: Withdraw funds from account
   * Maps to COBOL 'DEBIT ' operation
   * Includes validation for insufficient funds
   */
  debitAccount() {
    const amountInput = prompt('Enter debit amount: ');
    const amount = parseFloat(amountInput);

    // Validate input
    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount. Please enter a valid number.');
      return;
    }

    const currentBalance = this.dataStore.read();

    // Check if sufficient funds
    if (currentBalance >= amount) {
      const newBalance = currentBalance - amount;
      this.dataStore.write(newBalance);
      console.log(`Amount debited. New balance: ${newBalance.toFixed(2)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }
}

// ============================================================================
// MENU LAYER (Equivalent to MainProgram)
// ============================================================================
// Provides menu-driven interface and session management
class MenuController {
  constructor(operations) {
    this.operations = operations;
    this.continueFlag = true;
  }

  /**
   * Display the main menu
   */
  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Get user choice from menu
   * @returns {number} User selection (1-4)
   */
  getUserChoice() {
    const choice = prompt('Enter your choice (1-4): ');
    return parseInt(choice);
  }

  /**
   * Route user choice to appropriate operation
   * Maps to COBOL EVALUATE statement
   */
  handleChoice(choice) {
    switch (choice) {
      case 1:
        this.operations.viewBalance();
        break;
      case 2:
        this.operations.creditAccount();
        break;
      case 3:
        this.operations.debitAccount();
        break;
      case 4:
        this.continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  /**
   * Run the main menu loop
   * Maps to COBOL PERFORM UNTIL CONTINUE-FLAG = 'NO'
   */
  run() {
    while (this.continueFlag) {
      this.displayMenu();
      const choice = this.getUserChoice();
      this.handleChoice(choice);
    }
    console.log('Exiting the program. Goodbye!');
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================
// Instantiate and run the application
function main() {
  const dataStore = new DataStore();
  const operations = new AccountOperations(dataStore);
  const menu = new MenuController(operations);
  menu.run();
}

// Start the application
if (require.main === module) {
  main();
}

module.exports = { DataStore, AccountOperations, MenuController };
