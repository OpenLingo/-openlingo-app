import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import * as home  from '../../home/home.page';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-noun-match',
  templateUrl: './ex-noun-match.page.html',
  styleUrls: ['./ex-noun-match.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})

export class ExNounMatchPage implements OnInit {

  constructor(private httpInstance: HttpClient, private router: Router) {}

  ngOnInit()
  {
    if(this.serverStatus)
    {
      console.log("GETting Question Data...")
      this.httpInstance.get("http://127.0.0.1:5000/views/get_questions/noun", {responseType: "text"}).subscribe((response) => { this.serverData = response, console.log("...Success") })
    }

    if(this.router.getCurrentNavigation()!.extras!.state! != null)
    {
      this.loops = this.router.getCurrentNavigation()!.extras!.state!["loops"]

      this.startEx()
      document.getElementById("remainingEx")!.hidden = false
    }
  }

  //-------------------------------------------------------------------------------------------------------

  loops = -1

  finalScore = "Score: 0%"
  sampleWords: string[][] = home.getWords()

  serverData = "[]"
  serverStatus = Boolean(localStorage.getItem("serverStatus")! == "True")

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    home.handleReorder(ev)
  }

  //-------------------------------------------------------------------------------------------------------

  startEx(): void
  {
    if(localStorage.getItem("offlineData_noun") != null && !this.serverStatus)
    {
      this.serverData = localStorage.getItem("offlineData_noun")!
    }

    home.generateExercise(0, 1, JSON.parse(this.serverData), "noun")
  }

  //-------------------------------------------------------------------------------------------------------

  submitEx(): void
  {
    var scoreData: string[] = (home.calculateScore(0, 1, "noun"))
    scoreData.unshift("noun")

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
  }

  //-------------------------------------------------------------------------------------------------------

  nextEx(): void
  {
    this.router.navigate([home.pickExercise("ex-noun-match")], { state: { loops: this.loops - 1} }).then(() => {window.location.reload()})
  }

  finishEx(): void
  {
    this.router.navigate(["random-exercises"], { state: { finish: true } }).then(() => {window.location.reload()})
  }
}
