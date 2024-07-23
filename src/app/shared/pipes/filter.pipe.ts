import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../core/models/user';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: User[], searchText: string): User[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(user => {
      return (
        user.name.toLowerCase().includes(searchText) ||
        user.lastname.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.zone.toLowerCase().includes(searchText) ||
        user.rol.toLowerCase().includes(searchText)
      );
    });
  }
}
