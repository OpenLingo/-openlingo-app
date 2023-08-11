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

    if(this.serverDataService.getServerStatus())
    {
      this.serverData = await this.serverDataService.getServerData("audio")
    }

    this.sampleWords = await this.serverDataService.getWords()

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
    document.getElementById("togglePrompt")!.hidden = false

    if(localStorage.getItem("offlineData_audio") != null && !this.serverDataService.getServerStatus())
    {
      this.serverData = JSON.parse(localStorage.getItem("offlineData_audio")!)
    }

    var chosenData = this.exerciseService.generateExercise(this.serverData, this.sampleWords)
    this.chosenWords = chosenData[0]
    this.chosenOptions = chosenData[1]
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var langOption = document.getElementById("gerBox")! as HTMLInputElement

    if(!langOption.checked)
    {
      var scoreData: string[] = (this.exerciseService.calculateScore(0, 1, "audio", this.sampleWords))
    }
    else
    {
      var scoreData: string[] = (this.exerciseService.calculateScore(0, 0, "audio", this.sampleWords))
    }

    scoreData.unshift("audio")

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

    this.scores.push(["audio", document.getElementById("scoreDisplay")!.innerText])
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([this.exerciseService.pickExercise("ex-audio-identify")], { state: { loops: this.loops - 1, scores: this.scores} }).then(() => {window.location.reload()})
  }

  finishEx(): void
  {
    this.router.navigate(["random-exercises"], { state: { finish: true, scores: this.scores } }).then(() => {window.location.reload()})
  }
}
