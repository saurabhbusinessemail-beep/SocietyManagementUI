import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBEResponseFormat, IBuilding, IFlat, IPagedResponse, IParking, ISociety, IFlatMember, IUIDropdownOption } from '../interfaces';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SocietyService {

    private readonly baseUrl = `${environment.apiBaseUrl}/societies`;
    private readonly flatsBaseUrl = `${environment.apiBaseUrl}/flats`;

    constructor(private http: HttpClient) { }

    // Converter
    convertFlatMemberToDropdownOption(flatMember: IFlatMember, societyId?: string): IUIDropdownOption {
        const buildingNumber = flatMember.flatId
            && typeof flatMember.flatId !== 'string'
            && flatMember.flatId.buildingId
            && typeof flatMember.flatId.buildingId !== 'string'
            ? flatMember.flatId.buildingId.buildingNumber + ': '
            : '';

        const societyName = !societyId && flatMember.societyId && typeof flatMember.societyId !== 'string' ? '-' + flatMember.societyId.societyName : '';

        const flatNumber = typeof flatMember.flatId === 'string' ? 'No Flat Number' : (flatMember.flatId.flatNumber + ` (Floor: ${flatMember.flatId.floor})`);


        return {
            label: buildingNumber + flatNumber + societyName,
            value: typeof flatMember.flatId === 'string' ? '' : flatMember.flatId._id
        } as IUIDropdownOption
    }

    convertFlatToDropdownOption(flat: IFlat, societyId?: string): IUIDropdownOption {
        const buildingNumber = flat.buildingId && typeof flat.buildingId !== 'string' ? flat.buildingId.buildingNumber + ': ' : '';
        const societyName = !societyId && flat.societyId && typeof flat.societyId !== 'string' ? '-' + flat.societyId.societyName : '';
        const flatNumber = flat.flatNumber + ` (Floor: ${flat.floor})`;

        return {
            label: buildingNumber + flatNumber + societyName,
            value: flat._id
        } as IUIDropdownOption
    }


    /* SOCIETY */
    /* Create society */
    createSociety(payload: any): Observable<ISociety> {
        return this.http.post<ISociety>(this.baseUrl, payload);
    }

    /* Get all societies */
    getAllSocieties(): Observable<IPagedResponse<ISociety>> {
        return this.http.get<IPagedResponse<ISociety>>(this.baseUrl);
    }

    /* Get society by ID */
    getSociety(id: string): Observable<ISociety> {
        return this.http.get<ISociety>(`${this.baseUrl}/${id}`);
    }

    /* Update society */
    updateSociety(id: string, payload: any): Observable<ISociety> {
        return this.http.put<ISociety>(`${this.baseUrl}/${id}`, payload);
    }

    /* Delete society */
    deleteSociety(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /* Search societies */
    searchSocieties(
        query: string,
        page = 1,
        limit = 20
    ): Observable<IPagedResponse<ISociety>> {
        let params = new HttpParams()
            .set('q', query)
            .set('page', page)
            .set('limit', limit);

        return this.http.get<IPagedResponse<ISociety>>(
            `${this.baseUrl}/search`,
            { params }
        );
    }


    /* MANAGER */
    newManager(societyId: string, payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/managers`, payload);
    }

    deleteManager(societyId: string, managerId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/managers/${managerId}`);
    }


    /* BUILDINGS */
    // Get one building
    getBuilding(societyId: string, buildingId: string): Observable<IBuilding> {
        return this.http.get<IBuilding>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`);
    }

    // Get all buildings in society
    getBuildings(societyId: string): Observable<IPagedResponse<IBuilding>> {
        return this.http.get<IPagedResponse<IBuilding>>(`${this.baseUrl}/${societyId}/buildings`);
    }

    // Add new building
    newBuilding(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings`, payload);
    }

    // Update building
    updateBuilding(societyId: string, buildingId: string, payload: any) {
        return this.http.put<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`, payload);
    }

    // Delete building
    deleteBuilding(societyId: string, buildingId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`);
    }


    /* FLATS */
    // Get one Flat by Id
    getFlat(flatId: string): Observable<IFlat> {
        return this.http.get<IFlat>(`${this.flatsBaseUrl}/get/${flatId}`);
    }

    // Get all falts in a building or society
    getFlats(societyId: string, buildingId?: string) {
        if (!buildingId)
            return this.http.get<IPagedResponse<IFlat>>(`${this.baseUrl}/${societyId}/flats`);
        else
            return this.http.get<IPagedResponse<IFlat>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/flats`);
    }

    // Add One Flat
    newFlat(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/flats`, payload);
    }

    // Add Flats in bulk
    newFlats(societyId: string, payload: any[]) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/flats/bulk`, payload);
    }

    // Delete flat
    deleteFlat(societyId: string, flatId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/flats/${flatId}`);
    }

    // Get my flats as a owner/tenant/member
    myFlats(societyId?: string) {
        if (!societyId)
            return this.http.get<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/myFlats`);
        else
            return this.http.get<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/${societyId}/myFlats`);
    }

    // Get flat and its member details
    getFlatMemberDetails(flatMemberId: string) {
        return this.http.get<IFlatMember>(`${this.flatsBaseUrl}/myFlats/${flatMemberId}`);
    }

    // Get flat tenants
    myTenants(societyId?: string, flatId?: string): Observable<IPagedResponse<IFlatMember>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/myTenants`, payload);
    }

    // Get flat Members
    myFlatMembers(societyId?: string, flatId?: string): Observable<IPagedResponse<IFlatMember>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/myFlatMembers`, payload);
    }

    // Delete Flat Member
    deleteFlatMember(flatMemberId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.flatsBaseUrl}/deleteFlatMember/${flatMemberId}`);
    }

    updatedeleteFlatMemberLeaseEnd(flatMemberId: string, endDate: Date): Observable<IBEResponseFormat<IFlatMember>> {
        return this.http.patch<IBEResponseFormat<IFlatMember>>(`${this.flatsBaseUrl}/updatedeleteFlatMemberLeaseEnd/${flatMemberId}`, { endDate });
    }


    /* Parking */
    // Get all parking in a building or society
    getParkings(societyId: string, buildingId?: string) {
        if (!buildingId)
            return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/parkings`);
        else
            return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/parkings`);
    }

    // Add One Parking
    newParking(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings`, payload);
    }

    // Add Parkings in bulk
    newParkings(societyId: string, payload: any[]) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/bulk`, payload);
    }

    updateParking(societyId: string, parkingId: string, payload: any) {
        return this.http.put<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/${parkingId}`, payload);
    }

    // Delete Parkings
    deleteParking(societyId: string, parkingId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/${parkingId}`);
    }
}