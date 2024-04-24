export * as ui from "./ui";

import { isEqual } from "./async";
import type { Commute } from "./commute";
import type { Arrival, Route, Stop } from "./oba";
import { getETA } from "./oba";
import { getMinutesTil, getTime } from "./time";

type RenderData = {
  commute: Commute;
  trip: Commute["trip"];
  stop: Stop;
  route: Route;
  arrivals: Arrival[];
  lastUpdate: number;
};

export function renderCommute({
  commute,
  trip,
  stop,
  route,
  arrivals,
  lastUpdate,
}: RenderData) {
  buildUI((widget) => {
    const mainStack = widget;

    const headerStack = mainStack.addStack();
    headerStack.centerAlignContent();
    headerStack.layoutHorizontally();

    sb(headerStack, getName(commute, trip), 14).textOpacity = 0.5;
    headerStack.addSpacer();
    rg(headerStack, getTime(lastUpdate), 14).textOpacity = 0.25;

    const routeStack = mainStack.addStack();
    routeStack.centerAlignContent();
    routeStack.layoutHorizontally();

    bd(routeStack, route.shortName, 20);
    routeStack.addSpacer();
    mono(routeStack, getProgress(stop.id, trip), 10).textOpacity = 0.25;

    mainStack.addSpacer();

    const arrivalStack = mainStack.addStack();
    arrivalStack.spacing = 4;
    arrivalStack.layoutVertically();

    let opacity = 1.35;
    arrivals.forEach((a) => {
      const stack = arrivalStack.addStack();
      stack.setPadding(4, 6, 4, 6);
      stack.cornerRadius = 4;
      stack.backgroundColor = Color.dynamic(
        new Color("f2f2f7"),
        new Color("2c2c2e"),
      );

      const eta = getETA(a);
      const tag = a.predicted ? "" : "*";
      const text = `${getTime(eta)}${tag}`;

      monoMD(stack, text, 14).textOpacity = opacity -= 0.35;
      stack.addSpacer();
      mono(stack, getMinutesTil(eta).toString(), 14).textOpacity = opacity / 2;
    });
  });
}

function getName(commute: Commute, trip: Commute["trip"]): string {
  const to = isEqual(trip, commute.trip) ? true : false;
  const prefix = to ? "→ " : "← ";
  return prefix + commute.name.toUpperCase();
}

function getProgress(stopID: string, trip: Commute["trip"]): string {
  const index = trip.findIndex((trip) => trip.stopID === stopID);
  return trip.map((_trip, i) => (i <= index ? "◆" : "◇")).join("─");
}

//

export function renderError(message: string) {
  buildUI((widget) => {
    md(widget, message, 14).centerAlignText();
  });
}

//

function buildUI(build: (widget: ListWidget) => void) {
  const widget = new ListWidget();
  build(widget);

  Script.setWidget(widget);
  Script.complete();

  widget.presentSmall();
}

//

function rg(ctx: ListWidget | WidgetStack, text: string, size: number) {
  const _text = ctx.addText(text);
  _text.font = Font.regularSystemFont(size);
  return _text;
}

function sb(ctx: ListWidget | WidgetStack, text: string, size: number) {
  const _text = ctx.addText(text);
  _text.font = Font.semiboldSystemFont(size);
  return _text;
}

function md(ctx: ListWidget | WidgetStack, text: string, size: number) {
  const _text = ctx.addText(text);
  _text.font = Font.mediumSystemFont(size);
  return _text;
}

function bd(ctx: ListWidget | WidgetStack, text: string, size: number) {
  const _text = ctx.addText(text);
  _text.font = Font.boldSystemFont(size);
  return _text;
}

function mono(ctx: ListWidget | WidgetStack, text: string, size: number) {
  const _text = ctx.addText(text);
  _text.font = Font.regularMonospacedSystemFont(size);
  return _text;
}

function monoMD(ctx: ListWidget | WidgetStack, text: string, size: number) {
  const _text = ctx.addText(text);
  _text.font = Font.mediumMonospacedSystemFont(size);
  return _text;
}
