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

    if(this.serverDataService.getServerStatus())
    {
      this.serverData = await this.serverDataService.getServerData("gender")
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
    if(localStorage.getItem("offlineData_gender") != null && this.serverDataService.getServerStatus())
    {
      this.serverData = JSON.parse(localStorage.getItem("offlineData_gender")!)
    }

    var chosenData = this.exerciseService.generateExercise(this.serverData, this.sampleWords)
    this.chosenWords = chosenData[0]
    this.chosenOptions = chosenData[1]
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var scoreData: string[] = (this.exerciseService.calculateScore(1, 2, "gender", this.sampleWords))
    scoreData.unshift("gender")

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

    this.scores.push(["gender", document.getElementById("scoreDisplay")!.innerText])
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise("ex-gender-identify")], { state: { loops: this.loops - 1, scores: this.scores} }).then(() => {window.location.reload()})
  }

  finishEx(): void
  {
    this.router.navigate(["random-exercises"], { state: { finish: true, scores: this.scores } }).then(() => {window.location.reload()})
  }
}
