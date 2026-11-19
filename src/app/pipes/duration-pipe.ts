import { Pipe, PipeTransform } from '@angular/core';

// turns minutes into readable text
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (minutes == null) {
      return '';
    }
    const total = Math.round(minutes);
    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (hours === 0) {
      return this.plural(mins, 'min');
    }
    if (mins === 0) {
      return this.plural(hours, 'hr');
    }
    return this.plural(hours, 'hr') + ' ' + this.plural(mins, 'min');
  }

  private plural(count: number, word: string): string {
    return count + ' ' + word + (count === 1 ? '' : 's');
  }
}
