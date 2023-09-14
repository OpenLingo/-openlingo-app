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

  gameLength = 5
  exName = this.exerciseService.exercises[0][1]
  exTitle = this.exerciseService.exercises[1][1]

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

    if(await this.serverDataService.getServerStatus())
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

      //this.startEx()
      document.getElementById("remainingEx")!.hidden = false
    }

    if(this.serverDataService.getDownloadStatus())
    {
      for(var definition of this.sampleWords[3])
      {
        if(definition == "-")
        {
          document.getElementById("definitionWarning")!.hidden = false
          this.gameLength = 1
        }
      }
    }

    this.startEx()
  }

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    this.exerciseService.handleReorder(ev)
  }

  //-------------------------------------------------------------------------------------------------------

  startEx(): void
  {
    //document.getElementById("definitionWarning")!.hidden = true

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
    var scoreData: string[] = (this.exerciseService.calculateScore(this.gameLength, this.exName, 1, 3, this.sampleWords))
    scoreData.unshift(this.exName)

    this.serverDataService.saveOfflineData(scoreData)
    this.serverDataService.postServerData(this.http)

    this.exerciseService.handleLoop(this.loops)

    this.scores.push([this.exName, document.getElementById("scoreDisplay")!.innerText])
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise(this.exTitle)], { state: { loops: this.loops - 1, scores: this.scores } }).then(() => {window.location.reload()})
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
