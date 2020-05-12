let xOffset = 0;
let yOffset = 0;

function boxDragStarted() {
    let obj = d3.select(this);
    xOffset = d3.event.x - obj.node().getBoundingClientRect().x;
    yOffset = d3.event.y - obj.node().getBoundingClientRect().y;

}

function boxDragged() {
    d3.event.sourceEvent.stopPropagation();
    let obj = d3.select(this);
    let xCoord = d3.event.x - xOffset;
    let yCoord = d3.event.y - yOffset;
    obj.style("left", xCoord + "px");
    obj.style("top", yCoord + "px");

}

function boxDragEnded() {
    d3.event.sourceEvent.stopPropagation();
}

function mousemove() {
    var m = d3.mouse(this);

    rectDrawn.attr("width", Math.max(0, m[0] - +rectDrawn.attr("x")))
        .attr("height", Math.max(0, m[1] - +rectDrawn.attr("y")));
}

function mouseup() {
    shrinkBoundary(+rectDrawn.attr("x") - 340, +rectDrawn.attr("y"), +rectDrawn.attr("width"), +rectDrawn.attr("height"))
    rectDrawn.transition().duration(200).attr("opacity", 0).remove()

    mainSVG.on("mousemove", null);
}