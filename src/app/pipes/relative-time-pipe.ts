import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: Date | string | null): string {
    if (!value) {
      return 'Unknown date';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const differenceInMs = now.getTime() - date.getTime();

    const seconds = Math.floor(differenceInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} minute(s) ago`;
    }

    if (hours < 24) {
      return `${hours} hour(s) ago`;
    }

    if (days < 30) {
      return `${days} day(s) ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} month(s) ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year(s) ago`;
  }
}
