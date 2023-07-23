import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import * as home  from '../../home/home.page';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex-gender-identify',
  templateUrl: './ex-gender-identify.page.html',
  styleUrls: ['./ex-gender-identify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class ExGenderIdentifyPage implements OnInit {

  constructor(private httpInstance: HttpClient, private router: Router) {}

  ngOnInit()
  {
    console.log("GETting Question Data...")
    this.httpInstance.get("http://127.0.0.1:5000/views/get_questions", {responseType: "text"}).subscribe((response) => { this.serverData = response, this.serverRunning = true, console.log("...Success") })

    if(this.router.getCurrentNavigation()!.extras!.state! != null)
    {
      this.loops = this.router.getCurrentNavigation()!.extras!.state!["loops"]

      document.getElementById("instructions")!.innerHTML = document.getElementById("instructions")!.innerHTML.concat("<br>Exercises Remaining: " + (this.loops + 1))
    }
  }

  loops = 0

  finalScore = "Score: 0%"
  sampleWords: string[][] = home.getWords()

  serverData = "[]"
  serverRunning = false

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    home.handleReorder(ev)
  }

  startEx(): void
  {
    if(localStorage.getItem("offlineData") != null && !this.serverRunning)
    {
      this.serverData = localStorage.getItem("offlineData")!
    }

    home.generateExercise(1, 2, JSON.parse(this.serverData), "gender")
  }

  finishEx(): void
  {
    var scoreData: string[] = (home.calculateScore(1, 2, "gender"))
    scoreData.unshift("gender")

    home.saveOfflineData(scoreData)

    console.log("POSTing Answers...")
    this.httpInstance.post("http://127.0.0.1:5000/views/save_scores", JSON.parse(localStorage.getItem("offlineData")!), {responseType: "text"}).subscribe((response) => { console.log(response) })

    if(this.loops != 0)
    {
      document.getElementById("nextBtn")!.hidden = false;
    }
  }

  nextExercise(): void
  {
    this.router.navigate([home.pickExercise("ex-gender-identify")], { state: { loops: this.loops - 1} }).then(() => {window.location.reload()})
  }
}
