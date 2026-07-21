import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FoodComponent } from './components/form/form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FoodComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'your-project-name';
}
