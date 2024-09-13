import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendar!: ElementRef;
  @ViewChild('date') date!: ElementRef;
  @ViewChild('days') daysContainer!: ElementRef;
  @ViewChild('prev') prev!: ElementRef;
  @ViewChild('next') next!: ElementRef;
  @ViewChild('todayBtn') todayBtn!: ElementRef;
  @ViewChild('gotoBtn') gotoBtn!: ElementRef;
  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('eventDay') eventDay!: ElementRef;
  @ViewChild('eventDate') eventDate!: ElementRef;
  @ViewChild('eventsContainer') eventsContainer!: ElementRef;
  @ViewChild('addEventBtn') addEventBtn!: ElementRef;
  @ViewChild('addEventWrapper') addEventWrapper!: ElementRef;
  @ViewChild('addEventCloseBtn') addEventCloseBtn!: ElementRef;
  @ViewChild('addEventTitle') addEventTitle!: ElementRef;
  @ViewChild('addEventFrom') addEventFrom!: ElementRef;
  @ViewChild('addEventTo') addEventTo!: ElementRef;
  @ViewChild('addEventSubmit') addEventSubmit!: ElementRef;
  @ViewChild('addEventPark') addEventPark!: ElementRef;

  today: Date = new Date();
  activeDay!: number;
  month: number = this.today.getMonth();
  year: number = this.today.getFullYear();
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  eventsArr: any[] = [];

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getEvents();
  }

  ngAfterViewInit(): void {
    this.initCalendar();

    this.prev.nativeElement.addEventListener('click', () => this.prevMonth());
    this.next.nativeElement.addEventListener('click', () => this.nextMonth());

    this.todayBtn.nativeElement.addEventListener('click', () => {
      this.today = new Date();
      this.month = this.today.getMonth();
      this.year = this.today.getFullYear();
      this.initCalendar();
    });

    this.gotoBtn.nativeElement.addEventListener('click', () => this.gotoDate());

    this.addEventBtn.nativeElement.addEventListener('click', () => {
      this.addEventWrapper.nativeElement.classList.toggle('active');
    });

    this.addEventCloseBtn.nativeElement.addEventListener('click', () => {
      this.addEventWrapper.nativeElement.classList.remove('active');
    });

    this.addEventSubmit.nativeElement.addEventListener('click', () =>
      this.addEvent()
    );
  }

  initCalendar(): void {
    const firstDay = new Date(this.year, this.month, 1);
    const lastDay = new Date(this.year, this.month + 1, 0);
    const prevLastDay = new Date(this.year, this.month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() - 1;

    this.renderer.setProperty(this.date.nativeElement, 'innerHTML', `${this.months[this.month]} ${this.year}`);

    // Limpiar días anteriores
    this.renderer.setProperty(this.daysContainer.nativeElement, 'innerHTML', '');

    // Días del mes anterior
    for (let x = day; x > 0; x--) {
      const dayElement = this.renderer.createElement('div');
      this.renderer.addClass(dayElement, 'day');
      this.renderer.addClass(dayElement, 'prev-date');
      const text = this.renderer.createText(`${prevDays - x + 1}`);
      this.renderer.appendChild(dayElement, text);
      this.renderer.appendChild(this.daysContainer.nativeElement, dayElement);
    }

    // Días del mes actual
    for (let i = 1; i <= lastDate; i++) {
      const dayElement = this.renderer.createElement('div');
      this.renderer.addClass(dayElement, 'day');

      // Verificar si el día tiene eventos
      const hasEvent = this.eventsArr.some(
        (eventObj) => eventObj.day === i && eventObj.month === this.month + 1 && eventObj.year === this.year
      );
      if (hasEvent) {
        this.renderer.addClass(dayElement, 'event');
      }

      if (i === this.today.getDate() && this.month === this.today.getMonth() && this.year === this.today.getFullYear()) {
        this.renderer.addClass(dayElement, 'today');
        this.renderer.addClass(dayElement, 'active');
      }

      const text = this.renderer.createText(`${i}`);
      this.renderer.appendChild(dayElement, text);
      this.renderer.appendChild(this.daysContainer.nativeElement, dayElement);
    }

    // Días del mes siguiente
    for (let j = 1; j <= nextDays; j++) {
      const dayElement = this.renderer.createElement('div');
      this.renderer.addClass(dayElement, 'day');
      this.renderer.addClass(dayElement, 'next-date');
      const text = this.renderer.createText(`${j}`);
      this.renderer.appendChild(dayElement, text);
      this.renderer.appendChild(this.daysContainer.nativeElement, dayElement);
    }

    // Forzar la detección de cambios
    this.cdr.detectChanges();

    // Añadir listeners a los días generados
    this.addListner();
  }

  prevMonth(): void {
    this.month--;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    }
    this.initCalendar();
  }

  nextMonth(): void {
    this.month++;
    if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.initCalendar();
  }

  addListner(): void {
    const days = this.daysContainer.nativeElement.querySelectorAll('.day');
    days.forEach((day: HTMLElement) => {
      day.addEventListener('click', (e: any) => {
        const dayNumber = Number(e.target.innerHTML);

        if (e.target.classList.contains('next-date')) {
          // Cambia al siguiente mes si se hace clic en un día del mes siguiente
          this.nextMonth();
          setTimeout(() => {
            this.getActiveDay(1); // Seleccionar el primer día del siguiente mes
            this.updateEvents(1); // Actualizar los eventos para el primer día del siguiente mes
          }, 0);
        } else if (e.target.classList.contains('prev-date')) {
          // Cambia al mes anterior si se hace clic en un día del mes anterior
          this.prevMonth();
          setTimeout(() => {
            const lastDayOfPrevMonth = new Date(this.year, this.month + 1, 0).getDate(); // Último día del mes anterior
            this.getActiveDay(lastDayOfPrevMonth); // Seleccionar el último día del mes anterior
            this.updateEvents(lastDayOfPrevMonth); // Actualizar los eventos para el último día del mes anterior
          }, 0);
        } else {
          // Si es un día normal del mes actual, marcarlo como activo
          this.getActiveDay(dayNumber);
          this.updateEvents(dayNumber);
          this.activeDay = dayNumber;
          days.forEach((d: HTMLElement) => d.classList.remove('active'));
          e.target.classList.add('active');
        }
      });
    });
  }

  gotoDate(): void {
    const dateArr = this.dateInput.nativeElement.value.split('/');
    if (dateArr.length === 2) {
      const [month, year] = dateArr.map(Number);
      if (month > 0 && month < 13 && year.toString().length === 4) {
        this.month = month - 1;
        this.year = year;
        this.initCalendar();
        return;
      }
    }
    alert('Fecha no válida');
  }

  getActiveDay(day: number): void {
    const activeDate = new Date(this.year, this.month, day);
    
    // Definir los días de la semana en español
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Obtener el nombre del día en español usando getDay()
    const dayName = daysOfWeek[activeDate.getDay()];
    
    this.renderer.setProperty(this.eventDay.nativeElement, 'innerHTML', dayName);
    this.renderer.setProperty(this.eventDate.nativeElement, 'innerHTML', `${day} ${this.months[this.month]} ${this.year}`);
  }

  updateEvents(day: number): void {
    // Limpiar el contenedor de eventos antes de agregar nuevos elementos
    this.renderer.setProperty(this.eventsContainer.nativeElement, 'innerHTML', '');

    const eventsForDay = this.eventsArr.filter(
      (event) =>
        event.day === day &&
        event.month === this.month + 1 &&
        event.year === this.year
    );

    if (eventsForDay.length === 0) {
      // Crear dinámicamente el elemento "No Events"
      const noEventElement = this.renderer.createElement('div');
      this.renderer.addClass(noEventElement, 'no-event');
      
      const h3Element = this.renderer.createElement('h3');
      const text = this.renderer.createText('No Events');
      
      this.renderer.appendChild(h3Element, text);
      this.renderer.appendChild(noEventElement, h3Element);
      this.renderer.appendChild(this.eventsContainer.nativeElement, noEventElement);
    } else {
      // Crear los eventos si los hay
      eventsForDay.forEach((eventObj) => {
        eventObj.events.forEach((event: any) => {
          const eventElement = this.renderer.createElement('div');
          this.renderer.addClass(eventElement, 'event');

          const titleElement = this.renderer.createElement('div');
          this.renderer.addClass(titleElement, 'title');

          const h3Element = this.renderer.createElement('h3');
          const titleText = this.renderer.createText(event.title);

          this.renderer.appendChild(h3Element, titleText);
          this.renderer.appendChild(titleElement, h3Element);
          this.renderer.appendChild(eventElement, titleElement);

          const timeElement = this.renderer.createElement('div');
          this.renderer.addClass(timeElement, 'time');
          const timeText = this.renderer.createText(event.time);
          this.renderer.appendChild(timeElement, timeText);
          this.renderer.appendChild(eventElement, timeElement);

          const parkElement = this.renderer.createElement('div');
          this.renderer.addClass(parkElement, 'park');
          const parkText = this.renderer.createText(`Park: ${event.park}`);
          this.renderer.appendChild(parkElement, parkText);
          this.renderer.appendChild(eventElement, parkElement);

          this.renderer.appendChild(this.eventsContainer.nativeElement, eventElement);
        });
      });
    }

    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }

  addEvent(): void {
    const title = this.addEventTitle.nativeElement.value;
    const timeFrom = this.addEventFrom.nativeElement.value;
    const timeTo = this.addEventTo.nativeElement.value;
    const park = this.addEventPark.nativeElement.value;

    if (!title || !timeFrom || !timeTo) {
      alert('Por favor llena todos los campos');
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(timeFrom) || !timePattern.test(timeTo)) {
      alert('Formato de hora inválido');
      return;
    }

    const newEvent = {
      title,
      time: `${this.convertTime(timeFrom)} - ${this.convertTime(timeTo)}`,
      park,
    };

    this.eventsArr.push({
      day: this.activeDay,
      month: this.month + 1,
      year: this.year,
      events: [newEvent],
    });

    this.saveEvents();
    this.updateEvents(this.activeDay);
  }

  saveEvents(): void {
    localStorage.setItem('events', JSON.stringify(this.eventsArr));
  }

  getEvents(): void {
    const events = localStorage.getItem('events');
    if (events) {
      this.eventsArr = JSON.parse(events);
    }
  }

  convertTime(time: string): string {
    let [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute < 10 ? '0' + minute : minute} ${period}`;
  }
}
