export enum ComplaintTypes {
    'Public',
    'Private'
}

export const ComplaintTypeList = [
    ComplaintTypes.Public,
    ComplaintTypes.Private
];

export const ComplaintStatus = {
    submitted: 'Submitted',
    approved: 'Approved',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    rejected: 'Rejected'
}