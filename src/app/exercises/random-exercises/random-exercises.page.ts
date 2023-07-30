import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import * as home  from '../../home/home.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-random-exercises',
  templateUrl: './random-exercises.page.html',
  styleUrls: ['./random-exercises.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RandomExercisesPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit()
  {
    if(this.router.getCurrentNavigation()!.extras!.state! != null)
    {
      document.getElementById("instructionsTitle")!.hidden = true
      document.getElementById("instructions")!.hidden = true
      document.getElementById("startBtn")!.hidden = true

      document.getElementById("resultsTitle")!.hidden = false
    }
  }

  startEx(): void
  {
    this.router.navigate([home.pickExercise("ex-random-excercises")], { state: { loops: 10 - 1} }).then(() => {window.location.reload()})
  }
}
