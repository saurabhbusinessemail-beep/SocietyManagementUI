export interface IUser {
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    isOwner?: boolean;
    isTenant?: boolean;
}