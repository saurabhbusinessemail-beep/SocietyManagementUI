import { Directive } from "@angular/core";
import { Observable, forkJoin, take } from "rxjs";
import { DialogService } from "../services/dialog.service";

@Directive()
export abstract class ListBase {
    selectMode: boolean = false;
    selectedIds = new Set<string>();

    constructor(public dialogService: DialogService) { }

    toggleSelectionMode() {
        this.selectMode = !this.selectMode;
        if (!this.selectMode) this.selectedIds.clear();
    }

    onSelectionChange(id: string, selected: boolean): void {
        if (!this.selectMode) return;

        if (selected) {
            this.selectedIds.add(id);
        } else {
            this.selectedIds.delete(id);
        }
    }

    abstract deleteOneRecord(id: string): Observable<any> | undefined;
    abstract refreshList(): void;

    async deleteAllSelectedRecords() {

        if (!await this.dialogService.confirmDelete('Delete Selected', `Are you sure you want to delete selected records ?`)) return;

        const arrObs = [...this.selectedIds.values()].reduce((arr, id) => {
            const obs = this.deleteOneRecord(id);
            if (obs) arr.push(obs);
            return arr;

        }, [] as Observable<any>[]);
        if (arrObs.length === 0) return;

        forkJoin(arrObs)
            .pipe(take(1))
            .subscribe({
                next: arrResponse => {
                    this.toggleSelectionMode();
                    this.refreshList();
                }
            })
    }
}