import { Component } from '@angular/core';
import { HeroComponent } from './homepageComponent/hero/hero.component';
import { CarouselComponent } from './homepageComponent/carousel/carousel.component';
import { LocateComponent } from './homepageComponent/locate/locate.component';
import { BannerComponent } from './homepageComponent/banner/banner.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [HeroComponent, CarouselComponent, LocateComponent, BannerComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {}
