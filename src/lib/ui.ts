export * as ui from "./ui";
import type { Commute } from "./commute";
import { getETA, type Arrival, type Route, type Stop } from "./oba";
import { getMinutesTil, getTime } from "./time";

export function renderError(message: string) {
  buildUI((widget) => {
    widget.addText(message);
  });
}

type RenderData = {
  commute: Commute;
  stop: Stop;
  route: Route;
  arrivals: Arrival[];
};

export function renderCommute({ commute, stop, route, arrivals }: RenderData) {
  buildUI((widget) => {
    widget.addText(commute.name);
    widget.addText(stop.name);
    widget.addText(route.shortName);
    widget.addText(route.color);
    widget.addText(route.textColor);
    arrivals.forEach((a) => {
      const eta = getETA(a);
      const tag = a.predicted ? "" : "*";
      const min = getMinutesTil(eta);
      widget.addText(`${getTime(eta)}${tag} ${min}min`);
    });
  });
}

function buildUI(build: (widget: ListWidget) => void) {
  const widget = new ListWidget();
  build(widget);

  Script.setWidget(widget);
  Script.complete();

  widget.presentSmall();
}
