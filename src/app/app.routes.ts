import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage)
  },
  {
    path: 'ex-noun-match',
    loadComponent: () => import('./exercises/ex-noun-match/ex-noun-match.page').then( m => m.ExNounMatchPage)
  },
  {
    path: 'ex-gender-identify',
    loadComponent: () => import('./exercises/ex-gender-identify/ex-gender-identify.page').then( m => m.ExGenderIdentifyPage)
  },
  {
    path: 'ex-audio-identify',
    loadComponent: () => import('./exercises/ex-audio-identify/ex-audio-identify.page').then( m => m.ExAudioIdentifyPage)
  },
  {
    path: 'random-exercises',
    loadComponent: () => import('./exercises/random-exercises/random-exercises.page').then( m => m.RandomExercisesPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
