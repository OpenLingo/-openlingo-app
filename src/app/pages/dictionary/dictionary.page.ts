import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.page.html',
  styleUrls: ['./dictionary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DictionaryPage implements OnInit {

  constructor() { }

  sampleWords: string[][] = []
  accuracyValues: string[] = []

  displayOrder: number[] = []

  ngOnInit()
  {
    var accuracyPop: number[] = []

    this.sampleWords = JSON.parse(localStorage.getItem("offlineWordData")!)
    this.accuracyValues = JSON.parse(localStorage.getItem("accuracyValues")!)

    for(let i = 0; i != this.sampleWords[0].length; i++)
    {
      accuracyPop.push(+this.accuracyValues[i])
    }

    for(let i = 0; i != this.sampleWords[0].length; i++)
    {
      var max = Math.max(...accuracyPop)

      if(max == -1)
      {
        this.displayOrder.push(accuracyPop.indexOf(max))
      }
      else
      {
        this.displayOrder.unshift(accuracyPop.indexOf(max))
      }

      accuracyPop[accuracyPop.indexOf(max)] = -1 - 1
    }

    for(let i = 0; i!= this.sampleWords[0].length; i++)
    {
      if(+this.accuracyValues[i] != -1)
      {
        this.accuracyValues[i] += "%"
      }
      else
      {
        this.accuracyValues[i] = "-"
      }
    }
  }

  getSearch()
  {
    var searchValue = document.getElementById("searchValue")! as HTMLInputElement
    var tableDisplay = document.getElementById("tableDisplay")!

    tableDisplay.innerHTML = "\
    <tr>\
      <th style='padding:18px'>English</th>\
      <th style='padding:18px'>German</th>\
      <th style='padding:18px'>Definition</th>\
      <th style='padding:18px'>Gender</th>\
      <th style='padding:18px'>Accuracy</th>\
    </tr>"

    var gray = true
    for(let i = 0; i != this.sampleWords[0].length; i++)
    {
      if(this.sampleWords[0][this.displayOrder[i]].toLowerCase().includes(searchValue.value.toLowerCase()) ||
         this.sampleWords[1][this.displayOrder[i]].toLowerCase().includes(searchValue.value.toLowerCase()))
      {
        if(gray)
        {
          tableDisplay.innerHTML = tableDisplay.innerHTML.concat("\
          <tr style='background-color: #ebebeb'>\
            <td style='padding:18px'>" + this.sampleWords[0][this.displayOrder[i]] + "</td>\
            <td style='padding:18px'>" + this.sampleWords[1][this.displayOrder[i]] + "</td>\
            <td style='padding:18px'>" + this.sampleWords[3][this.displayOrder[i]] + "</td>\
            <td style='padding:18px;text-align:center;text-transform:uppercase'>" + this.sampleWords[2][this.displayOrder[i]] + "</td>\
            <td style='padding:18px;text-align:center'>" + this.accuracyValues[this.displayOrder[i]] + "</td>\
          </tr>"
          )
          gray = false
        }
        else
        {
          tableDisplay.innerHTML = tableDisplay.innerHTML.concat("\
          <tr>\
            <td style='padding:18px'>" + this.sampleWords[0][this.displayOrder[i]] + "</td>\
            <td style='padding:18px'>" + this.sampleWords[1][this.displayOrder[i]] + "</td>\
            <td style='padding:18px'>" + this.sampleWords[3][this.displayOrder[i]] + "</td>\
            <td style='padding:18px;text-align:center;text-transform:uppercase'>" + this.sampleWords[2][this.displayOrder[i]] + "</td>\
            <td style='padding:18px;text-align:center'>" + this.accuracyValues[this.displayOrder[i]] + "</td>\
          </tr>"
          )
          gray = true
        }
      }
    }

    tableDisplay.innerHTML = tableDisplay.innerHTML.concat("<br><br>")
  }

  clearSearch()
  {
    window.location.reload();
  }
}
