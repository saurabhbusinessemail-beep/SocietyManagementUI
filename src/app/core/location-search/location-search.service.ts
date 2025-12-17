import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationSearchService {

  private loader = new Loader({
    apiKey: environment.googleMapsAPIKey,
    libraries: ['places']
  });

  load(): Promise<typeof google> {
    return this.loader.load();
  }
}
