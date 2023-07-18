import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import * as home  from '../../home/home.page';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ex-noun-match',
  templateUrl: './ex-noun-match.page.html',
  styleUrls: ['./ex-noun-match.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class ExNounMatchPage implements OnInit {

  constructor(private httpInstance: HttpClient) {}

  ngOnInit()
  {
    console.log("GETting Question Data...")
    this.httpInstance.get("http://127.0.0.1:5000/getQuestions", {responseType: "text"}).subscribe((response) => { this.serverData = response, this.serverRunning = true, console.log("...Success") })
  }

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

    home.generateExcercise(0, 1, false, JSON.parse(this.serverData), "noun")
  }

  finishEx(): void
  {
    var scoreData: string[] = (home.calculateScore(0, 1, false))
    scoreData.unshift("noun")

    home.saveOfflineData(scoreData)

    console.log("POSTing Answers...")
    this.httpInstance.post("http://127.0.0.1:5000/saveScores", JSON.parse(localStorage.getItem("offlineData")!), {responseType: "text"}).subscribe((response) => { console.log(response) })
  }
}
