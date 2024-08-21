import { Component } from '@angular/core';
import { HeroComponent } from './homepageComponent/hero/hero.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [HeroComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {}
