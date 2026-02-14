import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBEResponseFormat, IBuilding, IFlat, IPagedResponse, IParking, ISociety, IFlatMember, IUIDropdownOption } from '../interfaces';
import { Observable } from 'rxjs';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class SocietyService {

    private readonly baseUrl = `${environment.apiBaseUrl}/societies`;
    private readonly flatsBaseUrl = `${environment.apiBaseUrl}/flats`;

    constructor(private http: HttpClient) { }

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
    @InvalidateCache({
        methods: [
            'SocietyService.getAllSocieties*',
            'SocietyService.searchSocieties*'
        ],
        groups: ['societies']
    })
    createSociety(payload: any): Observable<ISociety> {
        return this.http.post<ISociety>(this.baseUrl, payload);
    }

    /* Get all societies */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        group: 'societies'
    })
    getAllSocieties(): Observable<IPagedResponse<ISociety>> {
        return this.http.get<IPagedResponse<ISociety>>(this.baseUrl);
    }

    /* Get society by ID */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'societies'
    })
    getSociety(id: string): Observable<ISociety> {
        return this.http.get<ISociety>(`${this.baseUrl}/${id}`);
    }

    /* Update society */
    @InvalidateCache({
        methods: [
            'SocietyService.getSociety',
            'SocietyService.getAllSocieties*',
            'SocietyService.searchSocieties*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['societies']
    })
    updateSociety(id: string, payload: any): Observable<ISociety> {
        return this.http.put<ISociety>(`${this.baseUrl}/${id}`, payload);
    }

    /* Delete society */
    @InvalidateCache({
        methods: [
            'SocietyService.getSociety',
            'SocietyService.getAllSocieties*',
            'SocietyService.searchSocieties*',
            'SocietyService.getBuildings*',
            'SocietyService.getFlats*',
            'SocietyService.getParkings*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['societies', 'buildings', 'flats', 'parkings']
    })
    deleteSociety(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /* Search societies */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2],
        paramKeys: {
            0: ['query'],
            1: ['page'],
            2: ['limit']
        },
        group: 'societies'
    })
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
    @InvalidateCache({
        methods: [
            'SocietyService.getSociety'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['societies']
    })
    newManager(societyId: string, payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/managers`, payload);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getSociety'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['societies']
    })
    deleteManager(societyId: string, managerId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/managers/${managerId}`);
    }


    /* BUILDINGS */
    // Get one building
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        group: 'buildings'
    })
    getBuilding(societyId: string, buildingId: string): Observable<IBuilding> {
        return this.http.get<IBuilding>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`);
    }

    // Get all buildings in society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'buildings'
    })
    getBuildings(societyId: string): Observable<IPagedResponse<IBuilding>> {
        return this.http.get<IPagedResponse<IBuilding>>(`${this.baseUrl}/${societyId}/buildings`);
    }

    // Add new building
    @InvalidateCache({
        methods: [
            'SocietyService.getBuildings*',
            'SocietyService.getFlats*'
        ],
        groups: ['buildings', 'flats']
    })
    newBuilding(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings`, payload);
    }

    // Update building
    @InvalidateCache({
        methods: [
            'SocietyService.getBuilding',
            'SocietyService.getBuildings*',
            'SocietyService.getFlats*'
        ],
        matchParams: true,
        paramIndices: [0, 1],
        groups: ['buildings', 'flats']
    })
    updateBuilding(societyId: string, buildingId: string, payload: any) {
        return this.http.put<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`, payload);
    }

    // Delete building
    @InvalidateCache({
        methods: [
            'SocietyService.getBuilding',
            'SocietyService.getBuildings*',
            'SocietyService.getFlats*',
            'SocietyService.getParkings*'
        ],
        matchParams: true,
        paramIndices: [0, 1],
        groups: ['buildings', 'flats', 'parkings']
    })
    deleteBuilding(societyId: string, buildingId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`);
    }


    /* FLATS */
    // Get one Flat by Id
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'flats'
    })
    getFlat(flatId: string): Observable<IFlat> {
        return this.http.get<IFlat>(`${this.flatsBaseUrl}/get/${flatId}`);
    }

    // Get all flats in a building or society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        group: 'flats',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, buildingId] = args;
            return `${methodName}_${societyId}_${buildingId || 'all'}`;
        }
    })
    getFlats(societyId: string, buildingId?: string) {
        if (!buildingId)
            return this.http.get<IPagedResponse<IFlat>>(`${this.baseUrl}/${societyId}/flats`);
        else
            return this.http.get<IPagedResponse<IFlat>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/flats`);
    }

    // Add One Flat
    @InvalidateCache({
        methods: [
            'SocietyService.getFlats*',
            'SocietyService.myFlats*',
            'SocietyService.myFlatMembers*',
            'SocietyService.myTenants*'
        ],
        groups: ['flats', 'flatMembers']
    })
    newFlat(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/flats`, payload);
    }

    // Add Flats in bulk
    @InvalidateCache({
        methods: [
            'SocietyService.getFlats*',
            'SocietyService.myFlats*',
            'SocietyService.myFlatMembers*',
            'SocietyService.myTenants*'
        ],
        groups: ['flats', 'flatMembers']
    })
    newFlats(societyId: string, payload: any[]) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/flats/bulk`, payload);
    }

    // Delete flat
    @InvalidateCache({
        methods: [
            'SocietyService.getFlat',
            'SocietyService.getFlats*',
            'SocietyService.myFlats*',
            'SocietyService.myFlatMembers*',
            'SocietyService.myTenants*',
            'SocietyService.getFlatMemberDetails*'
        ],
        matchParams: true,
        paramIndices: [0, 1],
        groups: ['flats', 'flatMembers']
    })
    deleteFlat(societyId: string, flatId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/flats/${flatId}`);
    }

    // Get my flats as a owner/tenant/member
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'flatMembers',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId] = args;
            return `${methodName}_${societyId || 'all'}`;
        }
    })
    myFlats(societyId?: string) {
        if (!societyId)
            return this.http.get<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/myFlats`);
        else
            return this.http.get<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/${societyId}/myFlats`);
    }

    // Get flat and its member details
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'flatMembers'
    })
    getFlatMemberDetails(flatMemberId: string) {
        return this.http.get<IFlatMember>(`${this.flatsBaseUrl}/myFlats/${flatMemberId}`);
    }

    // Get flat tenants
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        paramKeys: {
            0: ['societyId'],
            1: ['flatId']
        },
        group: 'flatMembers',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId] = args;
            const filters: any = {};
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    myTenants(societyId?: string, flatId?: string): Observable<IPagedResponse<IFlatMember>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/myTenants`, payload);
    }

    // Get flat Members
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        paramKeys: {
            0: ['societyId'],
            1: ['flatId']
        },
        group: 'flatMembers',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId] = args;
            const filters: any = {};
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    myFlatMembers(societyId?: string, flatId?: string): Observable<IPagedResponse<IFlatMember>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IFlatMember>>(`${this.flatsBaseUrl}/myFlatMembers`, payload);
    }

    // Delete Flat Member
    @InvalidateCache({
        methods: [
            'SocietyService.myFlats*',
            'SocietyService.myFlatMembers*',
            'SocietyService.myTenants*',
            'SocietyService.getFlatMemberDetails*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['flatMembers']
    })
    deleteFlatMember(flatMemberId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.flatsBaseUrl}/deleteFlatMember/${flatMemberId}`);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getFlatMemberDetails',
            'SocietyService.myFlatMembers*',
            'SocietyService.myTenants*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['flatMembers']
    })
    updatedeleteFlatMemberLeaseEnd(flatMemberId: string, endDate: Date): Observable<IBEResponseFormat<IFlatMember>> {
        return this.http.patch<IBEResponseFormat<IFlatMember>>(`${this.flatsBaseUrl}/updatedeleteFlatMemberLeaseEnd/${flatMemberId}`, { endDate });
    }


    /* Parking */
    // Get all parking in a building or society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        group: 'parkings',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, buildingId] = args;
            return `${methodName}_${societyId}_${buildingId || 'all'}`;
        }
    })
    getParkings(societyId: string, buildingId?: string) {
        if (!buildingId)
            return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/parkings`);
        else
            return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/parkings`);
    }

    // Add One Parking
    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*'
        ],
        groups: ['parkings']
    })
    newParking(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings`, payload);
    }

    // Add Parkings in bulk
    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*'
        ],
        groups: ['parkings']
    })
    newParkings(societyId: string, payload: any[]) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/bulk`, payload);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*'
        ],
        matchParams: true,
        paramIndices: [0, 1],
        groups: ['parkings']
    })
    updateParking(societyId: string, parkingId: string, payload: any) {
        return this.http.put<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/${parkingId}`, payload);
    }

    // Delete Parkings
    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*'
        ],
        matchParams: true,
        paramIndices: [0, 1],
        groups: ['parkings']
    })
    deleteParking(societyId: string, parkingId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/${parkingId}`);
    }
}