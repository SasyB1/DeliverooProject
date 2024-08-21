import { Component } from '@angular/core';
import { HeroComponent } from './homepageComponent/hero/hero.component';
import { CarouselComponent } from './homepageComponent/carousel/carousel.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [HeroComponent, CarouselComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {}
