import { Component, computed, effect, OnInit } from '@angular/core';
import { SidebarComponent } from './catalogoComponent/sidebar/sidebar.component';
import { DispayWindowComponent } from './catalogoComponent/dispay-window/dispay-window.component';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    SidebarComponent,
    DispayWindowComponent,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogoComponent implements OnInit {
  isDetailPage: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isDetailPage =
          this.activatedRoute.firstChild?.snapshot.url[0]?.path === 'details';
      });
  }
}
