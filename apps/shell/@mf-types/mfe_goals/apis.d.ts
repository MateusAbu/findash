
    export type RemoteKeys = 'mfe_goals/GoalsPage';
    type PackageType<T> = T extends 'mfe_goals/GoalsPage' ? typeof import('mfe_goals/GoalsPage') :any;