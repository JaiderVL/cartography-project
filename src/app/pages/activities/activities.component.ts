import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { MarkerService } from '../../core/services/marker.service';
import { Marker } from '../../core/models/marker.model';
import { AuthService } from '../../core/services/auth.service'; // Importamos AuthService

interface Day {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
  events: Event[];
}

@Component({
  selector: 'activities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  today: Date = new Date();
  month: number = this.today.getMonth();
  year: number = this.today.getFullYear();
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  days: Day[] = [];
  activeDay!: Day;
  isAddEventActive = false;

  // Formulario reactivo
  eventForm: FormGroup;
  editingEventId: string | null = null;

  // Lista de parques
  markers: Marker[] = [];

  public userRole: string | null = null; // Variable para almacenar el rol del usuario

  constructor(
    private eventService: EventService,
    private router: Router,
    private markerService: MarkerService,
    private authService: AuthService // Inyectamos AuthService para acceder al rol del usuario

  ) {
    // Inicializa el formulario reactivo
    this.eventForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      timeFrom: new FormControl('', Validators.required),
      timeTo: new FormControl('', Validators.required),
      park: new FormControl('', Validators.required),
    });
  }
  
  ngOnInit(): void {
    // Intentamos cargar los eventos desde localStorage
    this.loadEventsFromLocalStorage();

    // Cargamos los eventos desde Firebase
    this.loadEventsFromFirebase();
    this.loadMarkers(); // Cargamos los parques al inicializar

      // Suscribirse al rol del usuario
      this.authService.userRole$.subscribe(role => {
        this.userRole = role; // Guardamos el rol actual del usuario
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Cargar eventos desde localStorage
  loadEventsFromLocalStorage(): void {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const events: Event[] = JSON.parse(storedEvents);
      this.generateCalendar(this.month, this.year, events);
    }
  }

  // Cargar eventos desde Firebase
  loadEventsFromFirebase(): void {
    this.eventService.getEvents()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(events => {
        // Actualizamos el calendario con los eventos de Firebase
        this.generateCalendar(this.month, this.year, events);
        // Actualizamos localStorage con los eventos más recientes
        localStorage.setItem('events', JSON.stringify(events));
      });
  }

  // Cargar parques desde Firebase
  loadMarkers(): void {
    this.markerService.getMarkersRealtime()
      .pipe(
        takeUntil(this.unsubscribe$),
        map(markers => markers.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .subscribe(markers => {
        this.markers = markers;
      });
  }

  generateCalendar(month: number, year: number, events: Event[] = []): void {
    this.days = [];

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    // Días del mes anterior
    for (let i = startDayOfWeek; i > 0; i--) {
      const prevMonth = month - 1 < 0 ? 11 : month - 1;
      const prevYear = month - 1 < 0 ? year - 1 : year;
      const date = lastDayOfPrevMonth - i + 1;
      const dayEvents = events.filter(event => event.date === date && event.month === prevMonth && event.year === prevYear);

      this.days.push({
        date,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isToday: this.isToday(date, prevMonth, prevYear),
        hasEvent: dayEvents.length > 0,
        events: dayEvents,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday = this.isToday(i, month, year);
      const dayEvents = events.filter(event => event.date === i && event.month === month && event.year === year);

      const day: Day = {
        date: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        isToday: isToday,
        hasEvent: dayEvents.length > 0,
        events: dayEvents,
      };

      this.days.push(day);

      if (isToday) {
        this.activeDay = day;
      }
    }

    // Días del mes siguiente
    const totalDays = this.days.length;
    const nextDays = totalDays < 42 ? 42 - totalDays : 0;

    for (let i = 1; i <= nextDays; i++) {
      const nextMonth = month + 1 > 11 ? 0 : month + 1;
      const nextYear = month + 1 > 11 ? year + 1 : year;
      const dayEvents = events.filter(event => event.date === i && event.month === nextMonth && event.year === nextYear);

      this.days.push({
        date: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: this.isToday(i, nextMonth, nextYear),
        hasEvent: dayEvents.length > 0,
        events: dayEvents,
      });
    }

    // Si no se encontró el día actual, establecer el primer día del mes
    if (!this.activeDay) {
      this.activeDay = this.days.find(day => day.isCurrentMonth && day.date === 1) as Day;
    }
  }

  prevMonth(): void {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }
    // Cargamos los eventos desde localStorage para el mes cambiado
    this.loadEventsFromLocalStorage();
  }

  nextMonth(): void {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    // Cargamos los eventos desde localStorage para el mes cambiado
    this.loadEventsFromLocalStorage();
  }

  goToToday(): void {
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    // Cargamos los eventos desde localStorage para el mes actual
    this.loadEventsFromLocalStorage();
    this.activeDay = this.days.find(day => day.isToday) as Day;
  }

  async onDayClick(day: Day): Promise<void> {
    if (!day.isCurrentMonth) {
      if (day.month < this.month || (day.month === 11 && this.month === 0)) {
        this.prevMonth();
      } else {
        this.nextMonth();
      }
      // Esperar a que los eventos se carguen
      await new Promise(resolve => setTimeout(resolve, 0));
      this.activeDay = this.days.find(
        d => d.date === day.date && d.month === day.month && d.year === day.year
      ) as Day;
    } else {
      this.activeDay = day;
    }
  }

  toggleAddEvent(): void {
    this.isAddEventActive = !this.isAddEventActive;
    // Limpiar formulario al cerrar
    if (!this.isAddEventActive) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.eventForm.reset();
    this.editingEventId = null;
  }

  // Agregar un evento al localStorage
  addLocalStorageEvent(event: Event): void {
    const storedEvents = localStorage.getItem('events');
    const events: Event[] = storedEvents ? JSON.parse(storedEvents) : [];
    event.id = event.id || Date.now().toString();
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
  }

  // Actualizar un evento en localStorage
  updateLocalStorageEvent(updatedEvent: Event): void {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const events: Event[] = JSON.parse(storedEvents);
      const index = events.findIndex(event => event.id === updatedEvent.id);
      if (index !== -1) {
        events[index] = updatedEvent;
        localStorage.setItem('events', JSON.stringify(events));
      }
    }
  }

  // Eliminar un evento de localStorage
  deleteLocalStorageEvent(eventId: string): void {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      let events: Event[] = JSON.parse(storedEvents);
      events = events.filter(event => event.id !== eventId);
      localStorage.setItem('events', JSON.stringify(events));
    }
  }

  addEvent(): void {
    if (this.eventForm.invalid) {
      alert('Por favor llena todos los campos obligatorios');
      return;
    }

    if (!this.activeDay) {
      alert('No hay un día activo seleccionado.');
      return;
    }

    // Obtenemos el parque seleccionado
    const selectedParkId = this.eventForm.get('park')?.value;
    const selectedPark = this.markers.find(marker => marker.firebaseId === selectedParkId);

    if (!selectedPark) {
      alert('Parque seleccionado no válido.');
      return;
    }

    const newEvent: Event = {
      ...this.eventForm.value,
      date: this.activeDay.date,
      month: this.activeDay.month,
      year: this.activeDay.year,
      lat: selectedPark.lat,
      lng: selectedPark.lng,
      park: selectedPark.name,
      markerId: selectedPark.firebaseId, // Almacena el ID del marcador
    };

    if (this.editingEventId) {
      // Actualizar evento existente en Firebase
      this.eventService.updateEvent({ ...newEvent, id: this.editingEventId}).subscribe(() => {
        // Actualizamos localStorage
        this.updateLocalStorageEvent({ ...newEvent, id: this.editingEventId ?? undefined });
        this.loadEventsFromLocalStorage();
        this.toggleAddEvent();
      });
    } else {
      // Agregar nuevo evento a Firebase
      this.eventService.addEvent(newEvent).subscribe(() => {
        // Agregamos el evento al localStorage
        this.addLocalStorageEvent(newEvent);
        this.loadEventsFromLocalStorage();
        this.toggleAddEvent();
      });
    }
  }

  deleteEvent(event: Event): void {
    if (event.id) {
      const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el evento "${event.title}"?`);
      if (confirmDelete) {
        this.eventService.deleteEvent(event.id).subscribe(() => {
          // Eliminamos el evento de localStorage
          this.deleteLocalStorageEvent(event.id!);
          this.loadEventsFromLocalStorage();
        });
      }
    } else {
      console.error('No se puede eliminar el evento porque el id es undefined');
    }
  }

  editEvent(event: Event): void {
    if (event.id) {
      this.isAddEventActive = true;

      // Buscamos el parque correspondiente en la lista de markers
      const selectedPark = this.markers.find(marker => marker.name === event.park);

      this.eventForm.patchValue({
        title: event.title,
        description: event.description || '',
        timeFrom: event.timeFrom,
        timeTo: event.timeTo,
        park: selectedPark ? selectedPark.firebaseId : '',
      });
      this.editingEventId = event.id;
    } else {
      console.error('No se puede editar el evento porque el id es undefined');
    }
  }

  gotoDate(inputDate: string): void {
    const dateArr = inputDate.split('/');
    if (dateArr.length === 2) {
      const [monthInput, yearInput] = dateArr.map(Number);
      if (monthInput > 0 && monthInput < 13 && yearInput.toString().length === 4) {
        this.month = monthInput - 1;
        this.year = yearInput;
        // Cargamos los eventos desde localStorage para la fecha seleccionada
        this.loadEventsFromLocalStorage();
        return;
      }
    }
    alert('Fecha no válida');
  }

  isToday(date: number, month: number, year: number): boolean {
    return (
      date === this.today.getDate() &&
      month === this.today.getMonth() &&
      year === this.today.getFullYear()
    );
  }

  formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);

    return new Intl.DateTimeFormat('es-ES', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  }

  get activeDayName(): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (this.activeDay) {
      const date = new Date(this.activeDay.year, this.activeDay.month, this.activeDay.date);
      return daysOfWeek[date.getDay()];
    }
    return '';
  }

  loadMap(event: Event): void {
    if (event.markerId) {
      this.router.navigate(['/home/map'], { queryParams: { markerId: event.markerId } });
    } else {
      alert('Este evento no tiene un marcador asociado.');
    }
  }  
}