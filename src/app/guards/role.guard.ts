import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const roleGuard: CanActivateChildFn = (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUserSignal()();
  const ruolo = user?.ruolo;

  if (ruolo === 2) {
    router.navigate(['/account/restaurant']);
    return false;
  }

  return true;
};
