
    export type RemoteKeys = 'mfe_transactions/TransactionsPage';
    type PackageType<T> = T extends 'mfe_transactions/TransactionsPage' ? typeof import('mfe_transactions/TransactionsPage') :any;