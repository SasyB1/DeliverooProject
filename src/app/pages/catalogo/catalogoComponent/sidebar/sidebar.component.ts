import { Component, effect, OnInit, signal } from '@angular/core';
import { RestaurantService } from '../../../../Services/Restaurant.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  cityName: string = '';
  selectedCategories = this.ristoranteService.selectedCategories;

  constructor(private ristoranteService: RestaurantService) {
    effect(() => {
      this.cityName = this.ristoranteService.cityName();
    });
  }

  ngOnInit(): void {
    this.selectedCategories = this.ristoranteService.selectedCategories;
  }

  onCategoryChange(event: any): void {
    const categoryId = Number(event.target.value);
    if (event.target.checked) {
      this.selectedCategories.update((categories) => [
        ...categories,
        categoryId,
      ]);
    } else {
      this.selectedCategories.update((categories) =>
        categories.filter((id) => id !== categoryId)
      );
    }
    this.ristoranteService.updateSelectedCategories(this.selectedCategories());
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories().includes(categoryId);
  }
}
