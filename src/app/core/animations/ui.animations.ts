import { animate, style, transition, trigger } from '@angular/animations';

export const moderationQueueItemAnimation = trigger('queueItem', [
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-12px)' })),
  ]),
]);
