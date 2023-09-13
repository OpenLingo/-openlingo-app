import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ExerciseService } from "../../../services/exercise.service";
import { ServerDataService } from "../../../services/server-data.service";
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-gender-identify',
  templateUrl: './ex-gender-identify.page.html',
  styleUrls: ['./ex-gender-identify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule]
})

export class ExGenderIdentifyPage implements OnInit {

  constructor(private exerciseService: ExerciseService, private serverDataService: ServerDataService, private http: HttpClient, private router: Router) {}

  gameLength = 5
  exName = this.exerciseService.exercises[0][2]
  exTitle = this.exerciseService.exercises[1][2]

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

    this.sampleWords = JSON.parse(localStorage.getItem("offlineWordData")!)

    if(this.serverDataService.getServerStatus())
    {
      try
      {
        this.serverData = await this.serverDataService.getServerData(this.exName)
      }
      catch
      {
        this.serverData = []
      }
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
    if(localStorage.getItem("offlineData_" + this.exName) != null && this.serverDataService.getServerStatus())
    {
      this.serverData = JSON.parse(localStorage.getItem("offlineData_" + this.exName)!)
    }

    var chosenData = this.exerciseService.generateExercise(this.gameLength, this.exName, this.serverData, this.sampleWords)
    this.chosenWords = chosenData[0]
    this.chosenOptions = chosenData[1]
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var scoreData: string[] = (this.exerciseService.calculateScore(this.gameLength, this.exName, 1, 2, this.sampleWords))
    scoreData.unshift(this.exName)

    this.serverDataService.saveOfflineData(scoreData)
    this.serverDataService.postServerData(this.http)

    this.exerciseService.handleLoop(this.loops)

    this.scores.push([this.exName, document.getElementById("scoreDisplay")!.innerText])
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise(this.exTitle)], { state: { loops: this.loops - 1, scores: this.scores} }).then(() => {window.location.reload()})
  }

  finishEx(): void
  {
    this.router.navigate(["random-exercises"], { state: { finish: true, scores: this.scores } }).then(() => {window.location.reload()})
  }

  playAgain(): void
  {
    window.location.reload()
  }
}
