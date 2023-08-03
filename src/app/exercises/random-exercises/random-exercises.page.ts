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
    var state = this.router.getCurrentNavigation()!.extras!.state!

    if(state != null)
    {
      var totalQuestions = 0
      var totalCorrect = 0

      document.getElementById("instructionsTitle")!.hidden = true
      document.getElementById("instructions")!.hidden = true
      document.getElementById("startBtn")!.hidden = true

      document.getElementById("resultsTitle")!.hidden = false
      document.getElementById("resultsTables")!.hidden = false
      document.getElementById("scoreDisplay")!.hidden = false

      for(let i = 0; i != state["scores"].length; i++)
      {
        var scoreTable = document.getElementById(state["scores"][i][0] + "Scores")!

        scoreTable.hidden = false
        scoreTable.innerHTML = scoreTable.innerHTML.concat("<tr><td>" + state["scores"][i][1] + "</td></tr>")

        totalQuestions += +state["scores"][i][1][9]
        totalCorrect += +state["scores"][i][1][7]

        document.getElementById("scoreDisplay")!.innerText =  "Total: " + totalCorrect + "/" + totalQuestions + " (" + (Math.round((totalCorrect / totalQuestions) * 100)).toFixed(0) + "%)";
      }
    }
  }

  startEx(): void
  {
    this.router.navigate([home.pickExercise("ex-random-excercises")], { state: { loops: 10 - 1, scores: [] } }).then(() => {window.location.reload()})
  }
}
