export function buildUI() {
  let widget = new ListWidget();

  let text = widget.addText("Hello World!");

  Script.setWidget(w);
  Script.complete();

  widget.presentSmall();

  return widget;
}
