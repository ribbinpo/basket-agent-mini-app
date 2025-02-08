import type { ComponentType, JSX } from "react";

import { IndexPage } from "@/pages/TestPage/IndexPage";
import { InitDataPage } from "@/pages/TestPage/InitDataPage";
import { LaunchParamsPage } from "@/pages/TestPage/LaunchParamsPage";
import { ThemeParamsPage } from "@/pages/TestPage/ThemeParamsPage";
import MainPage from "@/pages/MainPage";
import CreatePage from "@/pages/CreatePage";
import ManagePage from "@/pages/ManagePage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: MainPage },
  { path: "/create", Component: CreatePage },
  { path: "/manage", Component: ManagePage },
  { path: "/test/index", Component: IndexPage },
  { path: "/test/init-data", Component: InitDataPage, title: "Init Data" },
  {
    path: "/test/theme-params",
    Component: ThemeParamsPage,
    title: "Theme Params",
  },
  {
    path: "/test/launch-params",
    Component: LaunchParamsPage,
    title: "Launch Params",
  },
];
