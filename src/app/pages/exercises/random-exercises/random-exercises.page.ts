import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExerciseService } from "../../../services/exercise.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-random-exercises',
  templateUrl: './random-exercises.page.html',
  styleUrls: ['./random-exercises.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RandomExercisesPage implements OnInit {

  constructor(private exerciseService: ExerciseService, private router: Router) { }

  categories: string[] = this.exerciseService.exercises[0]

  ngOnInit()
  {
    var state = this.router.getCurrentNavigation()!.extras!.state!

    if(state != null)
    {
      var questionTotals: number[][] = [[0,0],[0,0],[0,0],[0,0],[0,0]]
      var exercises = this.exerciseService.exercises[0]

      document.getElementById("resultsTitle")!.hidden = false

      document.getElementById("scoreDisplay")!.hidden = false

      this.exerciseService.handleLoop(-1)

      for(let i = 0; i != state["scores"].length; i++)
      {
        var index = exercises.indexOf(state["scores"][i][0])

        questionTotals[index][0] += +state["scores"][i][1][7]
        questionTotals[index][1] += +state["scores"][i][1][9]

        questionTotals[4][0] += +state["scores"][i][1][7]
        questionTotals[4][1] += +state["scores"][i][1][9]

        document.getElementById(state["scores"][i][0] + "Scores")!.hidden = false

        var cardText = document.getElementById(state["scores"][i][0] + "Text")!

        cardText.innerHTML = this.getScoreDisplay(questionTotals[index][0], questionTotals[index][1])
        cardText.innerHTML = cardText.innerHTML.slice(0, cardText.innerHTML.indexOf(" ")) + "<br>" + cardText.innerHTML.slice(cardText.innerHTML.indexOf(" "));

        document.getElementById("scoreDisplay")!.innerText =  "Total: " + this.getScoreDisplay(questionTotals[4][0], questionTotals[4][1])
      }
    }
    else
    {
      this.startEx()
    }
  }

  startEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise("ex-random-excercises")], { state: { loops: 20 - 1, scores: [] } }).then(() => {window.location.reload()})
  }

  playAgain(): void
  {
    this.startEx();
  }

  getScoreDisplay(correct: number, total: number): string
  {
    return correct + "/" + total + " (" + (Math.round((correct / total) * 100)).toFixed(0) + "%)"
  }
}
