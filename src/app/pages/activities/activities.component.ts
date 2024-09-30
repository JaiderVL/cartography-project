import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  activeDay!: Day; // Usamos '!' para indicar que será inicializado antes de su uso
  isAddEventActive = false;

  // Constantes para latitud y longitud fijas
  readonly FIXED_LAT = 4.347534119137196;
  readonly FIXED_LNG = -74.36888427121782;

  // Formulario reactivo
  eventForm: FormGroup;
  editingEventId: string | null = null;

  constructor(private eventService: EventService, private router: Router) {
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
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Cargar eventos desde Firebase
  loadEvents(): void {
    this.eventService.getEvents()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(events => {
        this.generateCalendar(this.month, this.year, events);
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
    this.loadEvents();
  }

  nextMonth(): void {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    this.loadEvents();
  }

  goToToday(): void {
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    this.loadEvents();
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

  addEvent(): void {
    if (this.eventForm.invalid) {
      alert('Por favor llena todos los campos obligatorios');
      return;
    }

    if (!this.activeDay) {
      alert('No hay un día activo seleccionado.');
      return;
    }

    const newEvent: Event = {
      ...this.eventForm.value,
      date: this.activeDay.date,
      month: this.activeDay.month,
      year: this.activeDay.year,
      lat: this.FIXED_LAT,
      lng: this.FIXED_LNG,
    };

    if (this.editingEventId) {
      // Actualizar evento existente
      this.eventService.updateEvent({ ...newEvent, id: this.editingEventId }).subscribe(() => {
        this.loadEvents();
        this.toggleAddEvent();
      });
    } else {
      // Agregar nuevo evento
      this.eventService.addEvent(newEvent).subscribe(() => {
        this.loadEvents();
        this.toggleAddEvent();
      });
    }
  }

  deleteEvent(event: Event): void {
    if (event.id) {
      const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el evento "${event.title}"?`);
      if (confirmDelete) {
        this.eventService.deleteEvent(event.id).subscribe(() => {
          this.loadEvents();
        });
      }
    } else {
      console.error('No se puede eliminar el evento porque el id es undefined');
    }
  }

  editEvent(event: Event): void {
    if (event.id) {
      this.isAddEventActive = true;
      this.eventForm.patchValue({
        title: event.title,
        description: event.description || '',
        timeFrom: event.timeFrom,
        timeTo: event.timeTo,
        park: event.park,
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
        this.loadEvents();
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

  loadMap(): void {
    this.router.navigate(['/map'], { queryParams: { lng: this.FIXED_LNG, lat: this.FIXED_LAT } });
  }
}
