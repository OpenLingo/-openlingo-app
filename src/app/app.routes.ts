import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage)
  },
  {
    path: 'ex-noun-match',
    loadComponent: () => import('./pages/exercises/ex-noun-match/ex-noun-match.page').then( m => m.ExNounMatchPage)
  },
  {
    path: 'ex-definition-match',
    loadComponent: () => import('./pages/exercises/ex-definition-match/ex-definition-match.page').then( m => m.ExDefinitionMatchPage)
  },
  {
    path: 'ex-gender-identify',
    loadComponent: () => import('./pages/exercises/ex-gender-identify/ex-gender-identify.page').then( m => m.ExGenderIdentifyPage)
  },
  {
    path: 'ex-audio-identify',
    loadComponent: () => import('./pages/exercises/ex-audio-identify/ex-audio-identify.page').then( m => m.ExAudioIdentifyPage)
  },
  {
    path: 'random-exercises',
    loadComponent: () => import('./pages/exercises/random-exercises/random-exercises.page').then( m => m.RandomExercisesPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
