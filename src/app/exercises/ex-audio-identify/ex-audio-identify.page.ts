import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import * as home  from '../../home/home.page';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-audio-identify',
  templateUrl: './ex-audio-identify.page.html',
  styleUrls: ['./ex-audio-identify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})

export class ExAudioIdentifyPage implements OnInit {

  constructor(private httpInstance: HttpClient, private router: Router) {}

  ngOnInit()
  {
    var state = this.router.getCurrentNavigation()!.extras!.state!

    if(this.serverStatus)
    {
      console.log("GETting Question Data...")
      this.httpInstance.get("http://127.0.0.1:5000/views/get_questions/audio", {responseType: "text"}).subscribe((response) => { this.serverData = response, console.log("...Success") })
    }

    if(state != null)
    {
      this.loops = state["loops"]
      this.scores = state["scores"]

      this.startEx()
      document.getElementById("remainingEx")!.hidden = false
    }
  }

  //-------------------------------------------------------------------------------------------------------

  loops = -1
  scores: string[][] = []

  finalScore = "Score: 0%"
  serverData = "[]"
  serverStatus = Boolean(localStorage.getItem("serverStatus")! == "True")

  sampleWords: string[][] = home.getWords()
  chosenData: number[][] = []
  chosenWords: number[] = []
  chosenOptions: number[] = []

  //Controls what language of words are displayed for answers, 0 for English
  langCol = 1

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    home.handleReorder(ev)
  }

  playAudio(audioName: string): void
  {
    var audioElement = document.getElementById(audioName)! as HTMLAudioElement

    audioElement.play()
  }

  //-------------------------------------------------------------------------------------------------------

  startEx(): void
  {
    var langOption = document.getElementById("gerBox")! as HTMLInputElement

    if(localStorage.getItem("offlineData_audio") != null && !this.serverStatus)
    {
      this.serverData = localStorage.getItem("offlineData_audio")!
    }

    if(langOption.checked)
    {
      this.langCol = 0
    }

    this.chosenData = home.generateExercise(JSON.parse(this.serverData))
    this.chosenWords = this.chosenData[0]
    this.chosenOptions = this.chosenData[1]
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var langOption = document.getElementById("gerBox")! as HTMLInputElement

    if(!langOption.checked)
    {
      var scoreData: string[] = (home.calculateScore(0, 1, "audio"))
    }
    else
    {
      var scoreData: string[] = (home.calculateScore(0, 0, "audio"))
    }

    scoreData.unshift("audio")

    home.saveOfflineData(scoreData)

    if(this.serverStatus)
    {
      console.log("POSTing Answers...")
      this.httpInstance.post("http://127.0.0.1:5000/views/save_scores", JSON.parse(localStorage.getItem("offlineData")!), {responseType: "text"}).subscribe((response) => { console.log(response) })
    }

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
    this.router.navigate([home.pickExercise("ex-audio-identify")], { state: { loops: this.loops - 1, scores: this.scores} }).then(() => {window.location.reload()})
  }

  finishEx(): void
  {
    this.router.navigate(["random-exercises"], { state: { finish: true, scores: this.scores } }).then(() => {window.location.reload()})
  }
}
