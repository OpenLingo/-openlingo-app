import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ExerciseService } from "../../../services/exercise.service";
import { ServerDataService } from "../../../services/server-data.service";
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-noun-match',
  templateUrl: './ex-noun-match.page.html',
  styleUrls: ['./ex-noun-match.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule]
})

export class ExNounMatchPage implements OnInit {

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
      this.serverData = await this.serverDataService.getServerData("noun")
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
    if(localStorage.getItem("offlineData_noun") != null && !this.serverDataService.getServerStatus())
    {
      this.serverData = JSON.parse(localStorage.getItem("offlineData_noun")!)
    }

    var chosenData = this.exerciseService.generateExercise(this.serverData, this.sampleWords)
    this.chosenWords = chosenData[0]
    this.chosenOptions = chosenData[1]
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var scoreData: string[] = (this.exerciseService.calculateScore(0, 1, "noun", this.sampleWords))
    scoreData.unshift("noun")

    this.serverDataService.saveOfflineData(scoreData)
    this.serverDataService.postServerData(this.http)

    this.exerciseService.handleLoop(this.loops)

    this.scores.push(["noun", document.getElementById("scoreDisplay")!.innerText])
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise("ex-noun-match")], { state: { loops: this.loops - 1, scores: this.scores } }).then(() => {window.location.reload()})
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
