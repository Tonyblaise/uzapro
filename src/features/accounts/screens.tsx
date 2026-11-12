import type { ScreenMap } from "../types";
import { NewAccountAction, NewDepositAction, NewTransferAction, NewWithdrawalAction } from "./Actions";
import { BankAccountList } from "./BankAccountList";
import { DepositList, TransferList, WithdrawalList } from "./MoveLists";
import { TransactionsList } from "./TransactionsList";

/**
 * Tab slug → screen (feature 004, Accounts). Header actions follow the design's `headerActions`
 * for `fin`: "New account", "New deposit", "New withdrawal", "New transfer", none on Transactions.
 */
export const accountsScreens: ScreenMap = {
  "bank-accounts": { Body: BankAccountList, Actions: NewAccountAction },
  deposits: { Body: DepositList, Actions: NewDepositAction },
  withdrawals: { Body: WithdrawalList, Actions: NewWithdrawalAction },
  transfers: { Body: TransferList, Actions: NewTransferAction },
  transactions: { Body: TransactionsList },
};
