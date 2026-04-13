// src/app/app-routing.module.ts
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadChildren: () =>
      import("./pages/home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: "players",
    loadChildren: () =>
      import("./pages/players/players.module").then((m) => m.PlayersPageModule),
  },
  {
    path: "role-reveal",
    loadChildren: () =>
      import("./pages/role-reveal/role-reveal.module").then(
        (m) => m.RoleRevealPageModule,
      ),
  },
  {
    path: "discussion",
    loadChildren: () =>
      import("./pages/discussion/discussion.module").then(
        (m) => m.DiscussionPageModule,
      ),
  },
  {
    path: "voting",
    loadChildren: () =>
      import("./pages/voting/voting.module").then((m) => m.VotingPageModule),
  },
  {
    path: "result",
    loadChildren: () =>
      import("./pages/result/result.module").then((m) => m.ResultPageModule),
  },
  {
    path: "**",
    redirectTo: "home",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
