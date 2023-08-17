import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ExerciseService } from "../../../services/exercise.service";
import { ServerDataService } from "../../../services/server-data.service";
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-definition-match',
  templateUrl: './ex-definition-match.page.html',
  styleUrls: ['./ex-definition-match.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule]
})

export class ExDefinitionMatchPage implements OnInit {

  constructor(private exerciseService: ExerciseService, private serverDataService: ServerDataService, private http: HttpClient, private router: Router) {}

  loops = -1
  finalScore = "Score: 0%"

  scores: string[][] = []
  serverData: string[][] = []

  sampleWords: string[][] = []

  chosenWords: number[] = []
  chosenOptions: number[] = []

  //-------------------------------------------------------------------------------------------------------

  async ngOnInit()
  {
    var state = this.router.getCurrentNavigation()!.extras!.state!

    this.sampleWords = await this.serverDataService.getWords()

    if(await this.serverDataService.getServerStatus())
    {
      this.serverData = await this.serverDataService.getServerData("definition")
    }

    if(state != null)
    {
      this.loops = state["loops"]
      this.scores = state["scores"]

      this.startEx()
      document.getElementById("remainingEx")!.hidden = false
    }
  }

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    this.exerciseService.handleReorder(ev)
  }

  //-------------------------------------------------------------------------------------------------------

  startEx(): void
  {
    if(localStorage.getItem("offlineData_definition") != null && this.serverDataService.getServerStatus())
    {
      this.serverData = JSON.parse(localStorage.getItem("offlineData_definition")!)
    }

    var chosenData = this.exerciseService.generateExercise(this.serverData, this.sampleWords)
    this.chosenWords = chosenData[0]
    this.chosenOptions = chosenData[1]
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var scoreData: string[] = (this.exerciseService.calculateScore(1, 3, "definition", this.sampleWords))
    scoreData.unshift("definition")

    this.serverDataService.saveOfflineData(scoreData)
    this.serverDataService.postServerData(this.http)

    //Used for chaining exercises
    if(this.loops > 0)
    {
      document.getElementById("nextBtn")!.hidden = false
      document.getElementById("remainingEx")!.innerHTML = ("Exercises Remaining: " + this.loops)
    }
    else if(this.loops == 0)
    {
      document.getElementById("finishBtn")!.hidden = false
      document.getElementById("remainingEx")!.innerHTML = ("Exercises Remaining: " + this.loops)
    }

    this.scores.push(["definition", document.getElementById("scoreDisplay")!.innerText])
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise("ex-definition-match")], { state: { loops: this.loops - 1, scores: this.scores } }).then(() => {window.location.reload()})
  }

  finishEx(): void
  {
    this.router.navigate(["random-exercises"], { state: { finish: true, scores: this.scores } }).then(() => {window.location.reload()})
  }
}
