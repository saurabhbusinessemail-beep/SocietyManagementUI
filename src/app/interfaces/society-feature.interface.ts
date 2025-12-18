import { IDefaultFields } from "./";

export interface ISocietyFeature extends IDefaultFields {
    _id: string;
    societyId: string;
    featureKey: string;
}