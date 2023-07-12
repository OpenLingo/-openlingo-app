import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { getWords } from '../../home/home.page';
import { generateExcercise } from '../../home/home.page';
import { calculateScore } from '../../home/home.page';
import { handleReorder } from '../../home/home.page';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-ex-gender-identify',
  templateUrl: './ex-gender-identify.page.html',
  styleUrls: ['./ex-gender-identify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class ExGenderIdentifyPage implements OnInit {

  constructor(private httpInstance: HttpClient) {}

  ngOnInit()
  {
    console.log("GETting Question Data...")
    this.httpInstance.get("http://127.0.0.1:5000/getQuestions", {responseType: "text"}).subscribe((response) => { this.questionData = response, console.log("...Success") })
  }

  finalScore = "Score: 0%"
  sampleWords: string[][] = getWords()

  questionData = "{}"

  getHandleReorder(ev: CustomEvent<ItemReorderEventDetail>)
  {
    handleReorder(ev)
  }

  startEx(): void
  {
    generateExcercise(1, 2, false, this.questionData, "gender")
  }

  finishEx(): void
  {
    var scoreData: string[] = (calculateScore(1, 2, false))
    scoreData.unshift("gender")

    console.log("POSTing Answers...")
    this.httpInstance.post("http://127.0.0.1:5000/saveScores", scoreData, {responseType: "text"}).subscribe((response) => { console.log(response) })
  }
}
