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
    var color = "#ffffff"
    var empty = true

    tableDisplay.innerHTML = "\
    <tr>\
      <th style='padding-bottom:8px;padding-right:5px;padding-left:6px'>English</th>\
      <th style='padding-bottom:8px;padding-right:5px'>German</th>\
      <th style='padding-bottom:8px;padding-right:5px'>Gender</th>\
      <th style='padding-bottom:8px;padding-right:5px'>Accuracy</th>\
      <th style='padding-bottom:8px;padding-right:40px'>Definition</th>\
    </tr>"

    var gray = true
    for(let i = 0; i != this.sampleWords[0].length; i++)
    {
      if(this.sampleWords[0][this.displayOrder[i]].toLowerCase().includes(searchValue.value.toLowerCase()) ||
         this.sampleWords[1][this.displayOrder[i]].toLowerCase().includes(searchValue.value.toLowerCase()))
      {
        if(gray)
        {
          if(window.matchMedia('(prefers-color-scheme: dark)').matches)
          {
            color = "#141414"
          }
          else
          {
            color = "#ebebeb"
          }

          gray = false
        }
        else
        {
          if(window.matchMedia('(prefers-color-scheme: dark)').matches)
          {
            color = "#1e1e1e"
          }
          else
          {
            color = "#ffffff"
          }

          gray = true
        }

        tableDisplay.innerHTML = tableDisplay.innerHTML.concat("\
          <tr style='background-color: " + color + " '>\
            <td style='padding-top:10px;padding-bottom:10px;padding-right:5px;padding-left:6px'>"                            + this.sampleWords[0][this.displayOrder[i]] + "</td>\
            <td style='padding-top:10px;padding-bottom:10px;padding-right:5px;'>"                                            + this.sampleWords[1][this.displayOrder[i]] + "</td>\
            <td style='padding-top:10px;padding-bottom:10px;padding-right:5px;text-align:center;text-transform:uppercase'>"  + this.sampleWords[2][this.displayOrder[i]] + "</td>\
            <td style='padding-top:10px;padding-bottom:10px;padding-right:5px;text-align:center;'>"                          + this.accuracyValues[this.displayOrder[i]] + "</td>\
            <td style='padding-top:10px;padding-bottom:10px;padding-right:40px'>"                                                                                 + this.sampleWords[3][this.displayOrder[i]] + "</td>\
          </tr>")

        empty = false
      }
    }

    if(empty)
    {
      tableDisplay.innerHTML = "<h3><em>No Results Found.</em></h3>"
    }

    tableDisplay.innerHTML = tableDisplay.innerHTML.concat("<br><br>")
  }

  clearSearch()
  {
    window.location.reload()
  }
}
