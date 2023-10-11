import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ExerciseService } from "../../../services/exercise.service";
import { ServerDataService } from "../../../services/server-data.service";
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-audio-identify',
  templateUrl: './ex-audio-identify.page.html',
  styleUrls: ['./ex-audio-identify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule]
})

export class ExAudioIdentifyPage implements OnInit {

  constructor(private exerciseService: ExerciseService, private serverDataService: ServerDataService, private http: HttpClient, private router: Router) {}

  gameLength = 5
  exName = this.exerciseService.exercises[0][3]
  exTitle = this.exerciseService.exercises[1][3]

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

      document.getElementById("remainingEx")!.hidden = false
    }

    if(this.serverDataService.getDownloadStatus())
    {
      document.getElementById("audioWarning")!.hidden = false
    }

    this.startEx()
  }

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    this.exerciseService.handleReorder(ev)
  }

  playAudio(audioName: string): void
  {
    var audioElement = document.getElementById(audioName)! as HTMLAudioElement

    audioElement.play()
  }

  toggleDisplay(): void
  {
    var langOption = document.getElementById("gerBox")! as HTMLInputElement

    for(let i = 0; i != this.chosenWords.length; i++)
    {
      if(langOption.checked)
      {
        document.getElementById("option" + i)!.innerText = this.sampleWords[0][this.chosenOptions[i]]
      }
      else
      {
        document.getElementById("option" + i)!.innerText = this.sampleWords[1][this.chosenOptions[i]]
      }
    }
  }

  //-------------------------------------------------------------------------------------------------------

  startEx(): void
  {
    //document.getElementById("audioWarning")!.hidden = true
    document.getElementById("togglePrompt")!.hidden = false

    if(localStorage.getItem("offlineData_" + this.exName) != null && !this.serverDataService.getServerStatus())
    {
      this.serverData = JSON.parse(localStorage.getItem("offlineData_" + this.exName)!)
    }

    var chosenData = this.exerciseService.generateExercise(this.gameLength, this.exName, this.serverData, this.sampleWords)
    this.chosenWords = chosenData[0]
    this.chosenOptions = chosenData[1]

    console.log(this.sampleWords[0][this.chosenWords[0]])
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var langOption = document.getElementById("gerBox")! as HTMLInputElement

    if(!langOption.checked)
    {
      var scoreData: string[] = (this.exerciseService.calculateScore(this.gameLength, this.exName, 0, 1, this.sampleWords))
    }
    else
    {
      var scoreData: string[] = (this.exerciseService.calculateScore(this.gameLength, this.exName, 0, 0, this.sampleWords))
    }

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
