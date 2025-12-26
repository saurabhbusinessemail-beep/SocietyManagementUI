import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-flat-list',
  templateUrl: './flat-list.component.html',
  styleUrl: './flat-list.component.scss'
})
export class FlatListComponent implements OnInit {
  societyId?: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFlats(id);
    }
  }

  loadFlats(societyId: string) {

  }
}
