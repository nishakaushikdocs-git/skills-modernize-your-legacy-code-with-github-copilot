# Account Management System - Test Plan

## Overview
This test plan covers the business logic and functionality of the Account Management System COBOL application. The application manages account balances with the ability to view balance, credit account, and debit account.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Display main menu | Application is running | 1. Start the application | Menu with 4 options (View Balance, Credit Account, Debit Account, Exit) should be displayed | | | |
| TC-002 | Select valid choice 1 (View Balance) | Main menu is displayed | 1. Select option 1 from menu | Current balance should be displayed | | | |
| TC-003 | Select valid choice 2 (Credit Account) | Main menu is displayed | 1. Select option 2 from menu | System should prompt for credit amount | | | |
| TC-004 | Select valid choice 3 (Debit Account) | Main menu is displayed | 1. Select option 3 from menu | System should prompt for debit amount | | | |
| TC-005 | Select valid choice 4 (Exit) | Main menu is displayed | 1. Select option 4 from menu | Application should display exit message and terminate | | | |
| TC-006 | Select invalid choice (0) | Main menu is displayed | 1. Enter 0 as choice | Error message "Invalid choice, please select 1-4." should be displayed | | | |
| TC-007 | Select invalid choice (5) | Main menu is displayed | 1. Enter 5 as choice | Error message "Invalid choice, please select 1-4." should be displayed | | | |
| TC-008 | View balance with initial balance | Application starts with initial balance of 1000.00 | 1. Select option 1 (View Balance) | Display message "Current balance: 1000.00" | | | |
| TC-009 | Credit account with valid positive amount | Current balance is 1000.00, menu is displayed | 1. Select option 2 (Credit Account) 2. Enter amount 500.00 | Display message "Amount credited. New balance: 1500.00" | | | |
| TC-010 | Credit account with zero amount | Current balance is 1000.00, menu is displayed | 1. Select option 2 (Credit Account) 2. Enter amount 0 | Display message "Amount credited. New balance: 1000.00" | | | |
| TC-011 | Credit account with large amount | Current balance is 1000.00, menu is displayed | 1. Select option 2 (Credit Account) 2. Enter amount 999999.99 | Display message "Amount credited. New balance: 1000999.99" (or appropriate max value) | | | |
| TC-012 | Debit account with valid amount less than balance | Current balance is 1000.00, menu is displayed | 1. Select option 3 (Debit Account) 2. Enter amount 300.00 | Display message "Amount debited. New balance: 700.00" | | | |
| TC-013 | Debit account with amount equal to balance | Current balance is 1000.00, menu is displayed | 1. Select option 3 (Debit Account) 2. Enter amount 1000.00 | Display message "Amount debited. New balance: 0.00" | | | |
| TC-014 | Debit account with amount greater than balance | Current balance is 1000.00, menu is displayed | 1. Select option 3 (Debit Account) 2. Enter amount 1500.00 | Display message "Insufficient funds for this debit." and balance should remain 1000.00 | | | |
| TC-015 | Debit account with zero amount | Current balance is 1000.00, menu is displayed | 1. Select option 3 (Debit Account) 2. Enter amount 0 | Display message "Amount debited. New balance: 1000.00" | | | |
| TC-016 | Multiple credit operations consecutively | Current balance is 1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount 200.00 3. Select option 1 to verify 4. Select option 2 again 5. Enter amount 300.00 6. Select option 1 to verify | First credit: new balance 1200.00, Second credit: new balance 1500.00 | | | |
| TC-017 | Multiple debit operations consecutively | Current balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 200.00 3. Select option 1 to verify 4. Select option 3 again 5. Enter amount 300.00 6. Select option 1 to verify | First debit: new balance 800.00, Second debit: new balance 500.00 | | | |
| TC-018 | Credit followed by debit | Current balance is 1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount 500.00 3. Select option 1 to verify 4. Select option 3 (Debit Account) 5. Enter amount 700.00 6. Select option 1 to verify | After credit: 1500.00, After debit: 800.00 | | | |
| TC-019 | Debit followed by credit | Current balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 200.00 3. Select option 1 to verify 4. Select option 2 (Credit Account) 5. Enter amount 500.00 6. Select option 1 to verify | After debit: 800.00, After credit: 1300.00 | | | |
| TC-020 | Menu returns after completing operation | After any operation (credit, debit, or view balance) | 1. Complete any operation (not exit) | Main menu should be displayed again allowing user to select another action | | | |
| TC-021 | Balance persistence after operations | Perform credit operations and verify balance | 1. Select option 2 (Credit Account) 2. Enter amount 250.00 3. Select option 1 (View Balance) | Balance should reflect the credit and be consistent across operations | | | |
| TC-022 | System handles boundary value for debit (balance = amount) | Current balance is 500.00 | 1. Select option 3 (Debit Account) 2. Enter amount 500.00 | Display message "Amount debited. New balance: 0.00" and subsequent operations should work | | | |
| TC-023 | System handles boundary value for debit (balance > amount by 1 cent) | Current balance is 500.01 | 1. Select option 3 (Debit Account) 2. Enter amount 500.00 | Display message "Amount debited. New balance: 0.01" | | | |
| TC-024 | Continuous operation loop | Application is running | 1. Perform multiple operations (view, credit, debit) over 5+ menu iterations | Each operation completes successfully and menu reappears | | | |
| TC-025 | Exit functionality terminates correctly | Main menu is displayed after operations | 1. Select option 4 (Exit) | Display message "Exiting the program. Goodbye!" and application should terminate | | | |

---

## Test Coverage Summary

### Business Functions Covered:
- **Menu Navigation**: Test Cases TC-001 through TC-007
- **View Balance**: Test Cases TC-002, TC-008
- **Credit Account**: Test Cases TC-009 through TC-011, TC-016, TC-018, TC-019, TC-021
- **Debit Account**: Test Cases TC-012 through TC-015, TC-017, TC-018, TC-019, TC-022, TC-023
- **Input Validation**: Test Cases TC-006, TC-007
- **Data Persistence**: Test Cases TC-016 through TC-021
- **Application Flow**: Test Cases TC-020, TC-024, TC-025

### Key Scenarios Tested:
- ✅ Valid menu selections (1-4)
- ✅ Invalid menu selections
- ✅ View current balance
- ✅ Credit operations with various amounts
- ✅ Debit operations with sufficient funds
- ✅ Debit operations with insufficient funds
- ✅ Debit operations with amounts equal to balance
- ✅ Boundary conditions
- ✅ Sequential operations
- ✅ Balance persistence
- ✅ Program exit

---

## Notes for Node.js Implementation:
- Ensure API endpoints handle missing or invalid input gracefully
- Implement proper transaction logging
- Consider decimal precision for monetary values
- Validate all user inputs before processing
- Ensure balance calculations maintain consistency
- Implement error handling for all edge cases
