import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const role1Guard: CanActivateChildFn = (childRoute, state) => {
  console.log('role1Guard eseguita');
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUserSignal()();
  const ruolo = user?.ruolo;

  if (ruolo === 0) {
    router.navigate(['/homepage']);
    return false;
  }

  return true;
};
