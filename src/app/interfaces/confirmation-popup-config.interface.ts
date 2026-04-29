
export interface IConfirmationPopupDataConfig {
    icon?: string;
    message: string;
    showInput?: boolean;
    inputPlaceholder?: string;
    actionButtons: {
        id?: string;
        label: string;
        type?: 'primary' | 'cancel' | 'error' | 'only-content';
        class?: string;
        result?: any;
        onClick?: any;
    }[];
}