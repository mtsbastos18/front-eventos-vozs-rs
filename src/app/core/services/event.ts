import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventModel } from '../../shared/models/event';
import { Participant } from '../../shared/models/participant';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPublicEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.apiUrl}/events`);
  }

  getPublicEventById(id: number): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.apiUrl}/events/${id}`);
  }

  registerParticipant(data: Participant): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/register`, data);
  }

  verifyParticipant(data: { email: string; event_id: number; code: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/register/verify`, data);
  }

  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/events/dashboard`);
  }

  getAdminEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.apiUrl}/admin/events`);
  }

  getEventById(id: number): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.apiUrl}/admin/events/${id}`);
  }

  createEvent(event: EventModel): Observable<EventModel> {
    return this.http.post<EventModel>(`${this.apiUrl}/admin/events`, event);
  }

  updateEvent(id: number, event: EventModel): Observable<EventModel> {
    return this.http.put<EventModel>(`${this.apiUrl}/admin/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/events/${id}`);
  }

  getEventParticipants(id: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.apiUrl}/admin/events/${id}/participants`);
  }
}
