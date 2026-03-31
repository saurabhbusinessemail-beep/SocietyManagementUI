export interface IUser {
    _id: string;
    name?: string;
    email?: string;
    phoneNumber: string;
    role: 'admin' | 'user',
    isSuperAdmin?: boolean;
    status: 'active' | 'inactive' | 'pending' | 'blocked';
    profilePicture?: string;
}