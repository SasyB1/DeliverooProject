import { Component, OnInit } from '@angular/core';
import Splide from '@splidejs/splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements OnInit {
  ngOnInit(): void {
    new Splide('.splide', {
      type: 'loop',
      drag: 'free',
      focus: 'center',
      arrows: false,
      pagination: false,
      perPage: 8,
      gap: '5px',
      autoScroll: {
        speed: 0.2,
        pauseOnHover: false,
      },
      extensions: { AutoScroll },
      breakpoints: {
        1920: {
          perPage: 12,
        },
        1800: {
          perPage: 10,
        },
        1600: {
          perPage: 9,
        },
        1400: {
          perPage: 9,
        },
        1200: {
          perPage: 7,
        },
        992: {
          perPage: 6,
        },
        768: {
          perPage: 5,
        },
        576: {
          perPage: 4,
        },
        530: {
          perPage: 3,
        },
      },
    }).mount({ AutoScroll });

    new Splide('.splide:nth-of-type(2)', {
      type: 'loop',
      drag: 'free',
      focus: 'center',
      arrows: false,
      pagination: false,
      perPage: 8,
      gap: '5px',
      autoScroll: {
        speed: 0.2,
        pauseOnHover: false,
      },
      extensions: { AutoScroll },
      breakpoints: {
        1920: {
          perPage: 12,
        },
        1800: {
          perPage: 10,
        },
        1600: {
          perPage: 9,
        },
        1400: {
          perPage: 9,
        },
        1200: {
          perPage: 7,
        },
        992: {
          perPage: 6,
        },
        768: {
          perPage: 5,
        },
        576: {
          perPage: 4,
        },
        530: {
          perPage: 3,
        },
      },
    }).mount({ AutoScroll });
  }
}
