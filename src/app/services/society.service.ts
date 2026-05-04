import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBEResponseFormat, IBuilding, IFlat, IPagedResponse, IParking, ISociety, IFlatMember, IUIDropdownOption, IPagination, IMyFlatResponse, ISecurity, IFlatMemberWithResidency } from '../interfaces';
import { BehaviorSubject, Observable, share, take, tap } from 'rxjs';
import { Cacheable, InvalidateCache } from '../decorators';
import { PaginationService } from './pagination.service';
import { DropDownControl, SocietyRoles } from '../types';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { ownerMemberTenanRoles, securityRoles } from '../constants';
import { MatDialog } from '@angular/material/dialog';
import { SelectionListPopupComponent } from '../core/selection-list-popup/selection-list-popup.component';

@Injectable({
    providedIn: 'root'
})
export class SocietyService {

    private _selectedSocietyFilter = new BehaviorSubject<DropDownControl>(undefined);
    selectedSocietyFilter = this._selectedSocietyFilter.asObservable();
    private _societyPlanLoading = false;

    private _socities = new BehaviorSubject<ISociety[]>([]);
    socities = this._socities.asObservable();

    private readonly baseUrl = `${environment.apiBaseUrl}/societies`;
    private readonly flatsBaseUrl = `${environment.apiBaseUrl}/flats`;

    get selectedSocietyFilterValue(): DropDownControl {
        return this._selectedSocietyFilter.value;
    }

    get societyPlanLoading() {
        return this._societyPlanLoading;
    }

    set societyPlanLoading(val: boolean) {
        this._societyPlanLoading = val;
    }

    get isManagerOrAdmin(): boolean {
        const profile = this.loginService.getProfileFromStorage();
        if (!profile) return false;
        if (profile.user.role === 'admin') return true;

        const selectedSocietyId = this.selectedSocietyFilterValue?.value;
        if (!selectedSocietyId) return false;

        const societyRoles = profile.socities.find(s => s.societyId === selectedSocietyId)?.societyRoles;
        if (!societyRoles) return false;

        return societyRoles.some(sr => sr.name === SocietyRoles.societyadmin || sr.name === SocietyRoles.manager);
    }

    constructor(
        private http: HttpClient,
        private router: Router,
        private paginationService: PaginationService,
        private loginService: LoginService,
        private dialog: MatDialog
    ) { }

    setSocities(socities: ISociety[]) {
        this._socities.next(socities);
    }

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
            label: buildingNumber + flatNumber, // + societyName,
            value: typeof flatMember.flatId === 'string' ? '' : flatMember.flatId._id
        } as IUIDropdownOption
    }

    convertFlatToDropdownOption(flat: IFlat, societyId?: string): IUIDropdownOption {
        const buildingNumber = flat.buildingId && typeof flat.buildingId !== 'string' ? flat.buildingId.buildingNumber + ': ' : '';
        // const societyName = !societyId && flat.societyId && typeof flat.societyId !== 'string' ? '-' + flat.societyId.societyName : '';
        const flatNumber = flat.flatNumber//+ ` (Floor: ${flat.floor})`;

        return {
            label: buildingNumber + flatNumber, // + societyName,
            value: flat._id
        } as IUIDropdownOption
    }

    selectSocietyFilter(option: DropDownControl) {
        this._selectedSocietyFilter.next(option);
    }

    // clearSocietyFilter() {
    //     this._selectedSocietyFilter.next(undefined);
    // }

    handleSocietyClick(society: ISociety) {
        const profile = this.loginService.getProfileFromStorage();
        if (!profile) return;

        if (profile.user.role === 'admin') {
            this.router.navigate(['/society', society._id, 'details']);
            this.selectSocietyFilter({ label: society.societyName, value: society._id } as IUIDropdownOption)
            return;
        }

        const societyRoles = profile.socities.find(s => s.societyId === society._id)?.societyRoles
        if (!societyRoles) return;

        const hasManagerialRole = societyRoles.some(sr => sr.name === SocietyRoles.societyadmin || sr.name === SocietyRoles.manager);
        const hasNonManagerialRole = societyRoles.some(sr => ownerMemberTenanRoles.includes(sr.name));
        const hasSecurityRole = societyRoles.some(sr => securityRoles.includes(sr.name));

        const options: IUIDropdownOption<string>[] = [];

        if (hasManagerialRole) {
            options.push({
                label: 'Society Details',
                value: `/society/${society._id}/details`
            });
            // this.router.navigate(['/society', society._id, 'details']);

        }
        if (hasNonManagerialRole) {
            options.push({
                label: `Flats from ${society.societyName}`,
                value: `/myflats/${society._id}/list`
            });
            // this.router.navigate(['/myflats', society._id, 'list']);

        }
        if (hasSecurityRole) {
            options.push({
                label: `Gate entry for ${society.societyName}`,
                value: `/gateentry/dashboard/${society._id}`
            });
            // this.router.navigate(['gateentry/dashboard', society._id]);

        }

        if (options.length === 0) return;

        if (options.length === 1) {
            this.router.navigateByUrl(options[0].value);
            this.selectSocietyFilter({ label: society.societyName, value: society._id } as IUIDropdownOption)
            return;
        }

        const ref = this.dialog.open(SelectionListPopupComponent, {
            data: options
        })
        ref.afterClosed().pipe(take(1))
            .subscribe((route: string) => {
                if (route) {
                    this.router.navigateByUrl(route);
                    this.selectSocietyFilter({ label: society.societyName, value: society._id } as IUIDropdownOption)
                }
            })
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

    /* Create society For Approval */
    @InvalidateCache({
        methods: [
            'SocietyService.getAllSocieties*',
            'SocietyService.searchSocieties*'
        ],
        groups: ['societies']
    })
    createSocietyForApproval(payload: any): Observable<ISociety> {
        return this.http.post<ISociety>(`${this.baseUrl}/sentForApproval`, payload);
    }

    /* Get all societies */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        group: 'societies'
    })
    getAllSocieties(): Observable<IPagedResponse<ISociety>> {
        return this.http.get<IPagedResponse<ISociety>>(this.baseUrl).pipe(tap(response => {
            if (response.success && response.data)
                this.setSocities(response.data);
        }));
    }

    @Cacheable({
        // ttl: 120000, // 2 minutes
        paramIndices: [0, 1, 2],
        paramKeys: {
            0: ['page'],
            1: ['limit'],
            2: ['searchString']
        },
        group: 'societies',
        keyGenerator: (methodName: string, args: any[]) => {
            const [page = 1, limit = 10, searchString = ''] = args;
            return `${methodName}_page${page}_limit${limit}_search${searchString}`;
        }
    })
    getAllUnApprovedSocieties(status: string | undefined = undefined, page: number, limit: number, searchString: string = '') {
        return this.http.post<IPagedResponse<ISociety>>(`${this.baseUrl}/unApproved`,
            { searchString, status },
            {
                params: {
                    page: page.toString(),
                    limit: limit.toString()
                }
            }
        );
    }

    @Cacheable({
        // ttl: 120000, // 2 minutes
        paramIndices: [0, 1, 2],
        paramKeys: {
            0: ['page'],
            1: ['limit'],
            2: ['searchString']
        },
        group: 'societies',
        keyGenerator: (methodName: string, args: any[]) => {
            const [page = 1, limit = 10, searchString = ''] = args;
            return `${methodName}_page${page}_limit${limit}_search${searchString}`;
        }
    })

    getMySocietiesForApproval(status: string | undefined = undefined, page: number, limit: number, searchString: string = '') {
        return this.http.post<IPagedResponse<ISociety>>(`${this.baseUrl}/mySocietiesForApproval`,
            { searchString, status },
            {
                params: {
                    page: page.toString(),
                    limit: limit.toString()
                }
            }
        );
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getAllSocieties*',
            'SocietyService.getAllUnApprovedSocieties*',
            'SocietyService.getMySocietiesForApproval*',
            'SocietyService.searchSocieties*'
        ],
        matchParams: false, // Don't match params as approval affects multiple lists
        groups: ['societies']
    })
    approveSociety(id: string) {
        const payload = { approved: true };
        return this.http.patch<IPagedResponse<ISociety>>(`${this.baseUrl}/${id}`, payload);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getAllSocieties*',
            'SocietyService.getAllUnApprovedSocieties*',
            'SocietyService.getMySocietiesForApproval*',
            'SocietyService.searchSocieties*'
        ],
        matchParams: false, // Don't match params as rejection affects multiple lists
        groups: ['societies']
    })
    rejectSociety(id: string) {
        const payload = { approved: false };
        return this.http.patch<IPagedResponse<ISociety>>(`${this.baseUrl}/${id}`, payload);
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
            'SocietyService.getBuildingsCount*',
            'SocietyService.getFlats*',
            'SocietyService.getFlatsCount*',
            'SocietyService.getParkings*',
            'SocietyService.getParkingsByFlat*'
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


    /* Society Admins */
    @InvalidateCache({
        methods: [
            'SocietyService.getSociety'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['societies']
    })
    newSocietyAdmin(societyId: string, payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/adminContacts`, payload);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getSociety'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['societies']
    })
    deleteSocietyAdmin(societyId: string, adminId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/adminContacts/${adminId}`);
    }


    /* Society Securities */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
    })
    getSocietySecurities(societyId: string): Observable<IPagedResponse<ISecurity>> {
        return this.http.get<IPagedResponse<ISecurity>>(`${this.baseUrl}/${societyId}/securities`);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getSocietySecurities'
        ]
    })
    deleteSocietySecurity(societyId: string, securityId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/securities/${securityId}`);
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

    // Get all buildings in society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'buildings'
    })
    getBuildingsCount(societyId: string): Observable<IBEResponseFormat<number>> {
        return this.http.get<IBEResponseFormat<number>>(`${this.baseUrl}/${societyId}/buildingsCount`).pipe(share({ resetOnComplete: true }));
    }

    // Add new building
    @InvalidateCache({
        methods: [
            'SocietyService.getBuildings*',
            'SocietyService.getBuildingsCount*',
            'SocietyService.getFlats*',
            'SocietyService.getFlatsCount*',
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
            'SocietyService.getBuildingsCount*',
            'SocietyService.getFlats*',
            'SocietyService.getFlatsCount*',
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
            'SocietyService.getBuildingsCount*',
            'SocietyService.getFlats*',
            'SocietyService.getFlatsCount*',
            'SocietyService.getParkings*',
            'SocietyService.getParkingsByFlat*'
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
    getFlats(societyId: string, buildingId?: string, options: IPagination = {}) {
        let params = this.paginationService.createPaginationParams(options);

        if (!buildingId)
            return this.http.get<IPagedResponse<IFlat>>(`${this.baseUrl}/${societyId}/flats`, { params });
        else
            return this.http.get<IPagedResponse<IFlat>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/flats`, { params });
    }

    // Get all flats count in a building or society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        group: 'flats',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, buildingId] = args;
            return `${methodName}_${societyId}_${buildingId || 'all'}`;
        }
    })
    getFlatsCount(societyId: string, buildingId?: string, options: IPagination = {}) {
        let params = this.paginationService.createPaginationParams(options);

        if (!buildingId)
            return this.http.get<IBEResponseFormat<number>>(`${this.baseUrl}/${societyId}/flatsCount`, { params });
        else
            return this.http.get<IBEResponseFormat<number>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/flatsCount`, { params });
    }

    // Add One Flat
    @InvalidateCache({
        methods: [
            'SocietyService.getFlats*',
            'SocietyService.getFlatsCount*',
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
            'SocietyService.getFlatsCount*',
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
            'SocietyService.getFlatsCount*',
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

    // Update flat
    @InvalidateCache({
        methods: [
            'SocietyService.getFlat',
            'SocietyService.getFlats*',
            'SocietyService.getFlatsCount*',
            'SocietyService.myFlats*',
            'SocietyService.myFlatMembers*',
            'SocietyService.myTenants*',
            'SocietyService.getFlatMemberDetails*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['flats', 'flatMembers']
    })
    updateFlat(flatId: string, payload: any): Observable<IBEResponseFormat<IFlat>> {
        return this.http.patch<IBEResponseFormat<IFlat>>(`${this.flatsBaseUrl}/update/${flatId}`, payload);
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
            return this.http.get<IPagedResponse<IMyFlatResponse>>(`${this.flatsBaseUrl}/myFlats`);
        else
            return this.http.get<IPagedResponse<IMyFlatResponse>>(`${this.flatsBaseUrl}/${societyId}/myFlats`);
    }

    // Get flat and its member details
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'flatMembers'
    })
    getFlatMemberDetails(flatMemberId: string) {
        return this.http.get<IFlatMemberWithResidency>(`${this.flatsBaseUrl}/myFlats/${flatMemberId}`);
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
    myTenants(societyId?: string, flatId?: string): Observable<IPagedResponse<IFlatMemberWithResidency>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IFlatMemberWithResidency>>(`${this.flatsBaseUrl}/myTenants`, payload);
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
    myFlatMembers(societyId?: string, flatId?: string): Observable<IPagedResponse<IFlatMemberWithResidency>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IFlatMemberWithResidency>>(`${this.flatsBaseUrl}/myFlatMembers`, payload);
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
    moveOutTenant(flatMemberId: string, endDate?: Date): Observable<IBEResponseFormat<IFlatMemberWithResidency>> {
        return this.http.patch<IBEResponseFormat<IFlatMemberWithResidency>>(`${this.flatsBaseUrl}/moveOutTenant/${flatMemberId}`, { endDate });
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
    moveInTenant(flatMemberId: string, endDate?: Date): Observable<IBEResponseFormat<IFlatMemberWithResidency>> {
        return this.http.patch<IBEResponseFormat<IFlatMemberWithResidency>>(`${this.flatsBaseUrl}/moveInTenant/${flatMemberId}`, { endDate });
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
    moveOutOwner(flatMemberId: string): Observable<IBEResponseFormat<IFlatMemberWithResidency>> {
        return this.http.patch<IBEResponseFormat<IFlatMemberWithResidency>>(`${this.flatsBaseUrl}/moveOutOwner/${flatMemberId}`, {});
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
    moveInSelf(flatMemberId: string): Observable<IBEResponseFormat<IFlatMemberWithResidency>> {
        return this.http.patch<IBEResponseFormat<IFlatMemberWithResidency>>(`${this.flatsBaseUrl}/moveInSelf/${flatMemberId}`, {});
    }


    /* Parking */
    // Get all parking in a building or society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2],
        group: 'parkings',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, buildingId, options] = args;
            // Create a deterministic key based on all parameters including pagination
            const cacheKey = `${methodName}_${societyId}_${buildingId || 'all'}_page${options?.page || 1}_limit${options?.limit || 20}`;
            return cacheKey;
        }
    })
    getParkings(societyId: string, buildingId?: string, options: IPagination = {}) {
        let params = this.paginationService.createPaginationParams(options);

        if (!buildingId)
            return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/parkings`, { params });
        else
            return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/buildings/${buildingId}/parkings`, { params });
    }

    // Get all parking in a flat and society
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2],
        group: 'parkings',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, buildingId, options] = args;
            // Create a deterministic key based on all parameters including pagination
            const cacheKey = `${methodName}_${societyId}_${buildingId || 'all'}_page${options?.page || 1}_limit${options?.limit || 20}`;
            return cacheKey;
        }
    })
    getParkingsByFlat(societyId: string, flatId?: string, options: IPagination = {}) {
        let params = this.paginationService.createPaginationParams(options);

        return this.http.get<IPagedResponse<IParking>>(`${this.baseUrl}/${societyId}/flats/${flatId}/parkings`, { params });
    }

    // Add One Parking
    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*',
            'SocietyService.getParkingsByFlat*'
        ],
        matchParams: true,
        paramIndices: [0], // Only match societyId parameter
        groups: ['parkings']
    })
    newParking(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings`, payload);
    }

    // Add Parkings in bulk
    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*',
            'SocietyService.getParkingsByFlat*'
        ],
        matchParams: true,
        paramIndices: [0], // Only match societyId parameter
        groups: ['parkings']
    })
    newParkings(societyId: string, payload: any[]) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/bulk`, payload);
    }

    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*',
            'SocietyService.getParkingsByFlat*'
        ],
        matchParams: true,
        paramIndices: [0], // Only match societyId parameter
        groups: ['parkings']
    })
    updateParking(societyId: string, parkingId: string, payload: any) {
        return this.http.put<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/${parkingId}`, payload);
    }

    // Delete Parkings
    @InvalidateCache({
        methods: [
            'SocietyService.getParkings*',
            'SocietyService.getParkingsByFlat*'
        ],
        matchParams: true,
        paramIndices: [0], // Only match societyId parameter
        groups: ['parkings']
    })
    deleteParking(societyId: string, parkingId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/parkings/${parkingId}`);
    }
}