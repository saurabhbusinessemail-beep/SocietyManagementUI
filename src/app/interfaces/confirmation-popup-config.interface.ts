
export interface IConfirmationPopupDataConfig {
    icon?: string;
    message: string;
    actionButtons: {
        id: string;
        label: string;
        type: 'primary' | 'cancel' | 'error' | 'only-content',
        onClick: any;
    }[];
}