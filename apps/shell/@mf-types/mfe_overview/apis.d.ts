
    export type RemoteKeys = 'mfe_overview/OverviewPage';
    type PackageType<T> = T extends 'mfe_overview/OverviewPage' ? typeof import('mfe_overview/OverviewPage') :any;