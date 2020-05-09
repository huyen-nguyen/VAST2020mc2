const main = "#main"
let maxBin
let topic = "eyeball"

let thresholdValue = 0.4
let histogramThreshold = d3.scaleThreshold().domain([0.3, 0.4, 0.5, 0.6, 0.7]).range([30, 25, 20, 20, 15, 10])
let filteredData, allData;
let rects, bins

const biggerImgWidth = 450, biggerImgHeight = 360

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 40, left: 340},
    width = 1660 - margin.left - margin.right,
    height = 830 - margin.top - margin.bottom;

const zoomPanelMargin = {top: 20, right: 20, bottom: 20, left: 20},
    zoomPanelWidth = 350 - zoomPanelMargin.left - zoomPanelMargin.right,
    zoomPanelHeight = 350 - zoomPanelMargin.top - zoomPanelMargin.bottom;

//    x-axis
let x = d3.scaleLinear()
    .range([0, width])

// y-axis
let y = d3.scaleLinear()
    .range([height, 0])

// apply control panel
let leftPanel = d3.select(main)
    .append("div")
    .attr("id", "leftPanel")
    .attr("class", "box")

// append the svg object to the body of the page
let mainSVG = d3.select(main)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "imageDist")


let svg = mainSVG
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// Zoom panel --------------
let zoomPanelDiv = d3.select(main).append("div")
    .attr("class", "box")
    .attr("id", "zoomPanel")
    .attr("class", "box floating")


let zoomPanel = zoomPanelDiv.append("svg")
    .attr("width", zoomPanelWidth + zoomPanelMargin.left + zoomPanelMargin.right)
    .attr("height", zoomPanelHeight + zoomPanelMargin.top + zoomPanelMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + zoomPanelMargin.left + "," + zoomPanelMargin.top + ")");

let imageZoomed = zoomPanel.append('image')
    .attr("width", zoomPanelWidth)
    .attr("height", zoomPanelHeight)

let pin = zoomPanel.append('image')
    .attr('xlink:href', "images/pin.png")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", -25)
    .attr("y", 285)


let textZoomed = zoomPanelDiv
    .append("div")
    .style("font-size", "15px")

// Whole image ---------
d3.select(main).append("div")
    .attr("id", "detailPanel")

// whole Image
let wholeImagePanel = d3.select("#detailPanel").append("svg")
    .attr("width", biggerImgWidth + zoomPanelMargin.left + zoomPanelMargin.right)
    .attr("height", biggerImgHeight + zoomPanelMargin.top + zoomPanelMargin.bottom)
    .append("g")


let biggerImage = wholeImagePanel.append('image')
    .attr("width", biggerImgWidth)
    .attr("height", biggerImgHeight)


// X and Y axis ---------------

xAxisGroup = svg.append("g")

xAxisGroup
    .attr("transform", "translate(0, " + height + ")")
    .append("text")
    .attr("x", width / 2 - 100)
    .attr("y", margin.bottom * 0.9)
    .attr("dx", "3.32em")
    // .attr("dy", "0.3em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-size", "13px")
    .text("Confidence Score");

yAxisGroup = svg.append("g")
let g = svg.append("g")

// ----------- buttons for scoring ------------
let scoring
let clickID

let scoringDiv = d3.select("body").append("div")
    .style("position", "absolute")
    .style("visibility", "hidden");

scoringDiv.append("button").style("display", "inline")
    .attr("type", "button")
    .attr("class", "btn btn-success")
    .html("TP")
    .on("click", () => btnOnClick(true))

scoringDiv.append("button").style("display", "inline")
    .attr("type", "button")
    .attr("class", "btn btn-danger")
    .html("FP")
    .on("click", () => btnOnClick(false))

d3.csv("data/newData2.csv", function (error, data_) {
    if (error) throw error;

    allData = data_;

    d3.selectAll(".floating").call(d3.drag()
        .on("start", boxDragStarted)
        .on("drag", boxDragged)
        .on("end", boxDragEnded));

    // ------- threshold on left panel ----------
    let thresholdDiv = leftPanel.append("div")
        .attr("class", "panelSelection")

    thresholdDiv.append("text")
        .text("Threshold: ")

    thresholdDiv.append("input")
        .style("width", "50px")
        .attr("id", "thresholdValue")
        .attr("type", "number")
        .attr("value", thresholdValue)
        .attr("step", "0.1")
        .attr("min", "0.3")
        .attr("max", "1")
    // .on("change", thresholdChange);

    d3.select("#thresholdValue").on("input", function () {
        thresholdValue = (+this.value)
        console.log(thresholdValue)
        updateCharts()
    });

    // ------- draw red or green ---------
    let boundaryDiv = leftPanel.append('div')
        .attr("class", "panelSelection")

    boundaryDiv.append("text")
        .text("Boundary color: ")

    var shapeData = ["Green (TP)", "Red (FP)"];

    // Create the shape selectors
    var form = boundaryDiv.append("form");

    form.selectAll("label")
        .data(shapeData)
        .enter()
        .append("label")
        .html(function(d) {return '<span style="padding-left: 20px">' + d})
        .insert("input")
        .attr("type", "radio")
        .attr("class", "shape")
        .attr("name", "mode")
        .attr("value", (d, i) => i)
        .on("change", (d, i) => {
            console.log(d)
        })

    // ------- categories on left panel ----------

    leftPanel.append("text")
        .text("Categories:")
        .attr("class", "panelSelection")

    // Handler for dropdown value change
    function dropdownChange() {
        topic = d3.select(this).property('value')
        console.log(topic)
        updateCharts()
        setTimeout(addImage, 1000);
    }

    let dropdown = leftPanel
        .insert("select", "svg")
        .attr("id", "single")
        .style("display", "block")
        .style("float", "left")
        .on("change", dropdownChange)

    dropdown.selectAll("option")
        .data(classesSorted)
        .enter()
        .append("option")
        .attr("class", "option")
        .attr("value", d => d)
        .html(function (d) {
            return d[0].toUpperCase() + d.slice(1, d.length) + (classesCount[d] ? " (" + classesCount[d] : " (0") + ")";
        })

    new SlimSelect({
        select: '#single',
    });

    addImage()
    updateCharts()
})

function updateCharts() {
    filteredData = allData.filter(d => parseFloat(d.Score) >= thresholdValue).filter(d => d.Label === topic)

    bins = generateBins(filteredData)
    bins.forEach((d, i) => d.id = topic + (thresholdValue * 100) + i)
    maxBin = d3.max(bins.map(d => d.length))

    y.domain([0, maxBin < 3 ? 3 : maxBin])
    x.domain([thresholdValue, 1])

    console.log("bins: ", bins)
    console.log(thresholdValue, topic, filteredData.length);

    xAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(20))

    yAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).ticks(3))
    ;

    let barWidth = x(bins[1].x1) - x(bins[1].x0) - 12

    let prevOver
    let groups = g.selectAll("g.imgGroup")
        .data(bins, d => d.id)

    groups.exit()
        .attr("opacity", 1)
        .transition()
        .duration(200)
        .attr("opacity", 0)
        .remove()

    rects = groups
        .enter()
        .append("g")
        .attr("class", "imgGroup")
        .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")

    let imgs = rects
        .selectAll(".thumbnail")
        .data(d => d)
        .enter()
        .append('image')
        .attr("opacity", 1)
        .attr("class", "thumbnail")
        .attr('xlink:href', (d) => {
            return "MC2-Image-Data/" + d.Person + "/" + d.ID + ".jpg"
        })
        .attr("x", 1)
        .attr("y", (d, i) => height - y(i))
        .attr("width", barWidth)
        .attr("height", barWidth)
        .attr("opacity", d => (parseInt(d.x) < 0 ? 0.3 : 1))

    let overlayRect = rects
        .selectAll(".overlayRect")
        .data(d => d)
        .enter()
        .append('rect')
        .attr("class", "overlayRect")
        .attr('id', d => d.ID)
        .attr("x", 1)
        .attr("y", (d, i) => height - y(i))
        .attr("width", barWidth)
        .attr("height", barWidth)
        .attr("fill", "black")
        .attr("opacity", 0)

    overlayRect.on("mouseover", mouseoverImage)
        .on("click", pinImage)
        .on('contextmenu', function (d) {
            d3.event.preventDefault();
            clickID = d.ID;
            console.log(clickID)
            scoringDiv.transition()
                .duration(100)
                .style("visibility", "visible");

            scoringDiv
                .style("left", (d3.event.pageX - 46) + "px")
                .style("top", (d3.event.pageY - 50) + "px")
        });

    pin.on("click", unpin)
    biggerImage.attr("opacity", 0)
    zoomPanelDiv.style("opacity", 0)
    pin.attr("opacity", 0)


    function mouseoverImage(d) {
        imageZoomed.attr('xlink:href', "MC2-Image-Data/" + d.Person + "/" + d.ID + ".jpg")

        zoomPanelDiv
            .style("opacity", 1)
            .classed("redBorder", true)

        biggerImage.attr('xlink:href', "MC2-Image-Data/" + d.Person + "/" + d.Image + "bbox.jpg")
            .attr("opacity", 1)

        textZoomed.html("<br>" + "Score: " + d.Score + "<br>" + " Label: " + d.Label + "<br>" + " Owner: " + d.Person + "<br>" + "Image: " + d.Image
            + (parseInt(d.x) < 0 ? "<br><span style='color: red'> Cannot locate bounding box for this" +
                " object!</span>" : "")
        );

        d3.select(this).classed("imgBorder", true)
        d3.select(prevOver).classed("imgBorder", false)
        prevOver = this;
    }

    function pinImage() {
        overlayRect.on("mouseover", () => "")
        //    pin the image
        pin.attr("opacity", 1)
    }

    function unpin() {
        overlayRect.on("mouseover", mouseoverImage)
        pin.attr("opacity", 0)
    }
}

function btnOnClick(status) {
    d3.select("rect#" + clickID)
        .attr("fill", status ? "#28A745" : "#DC3545")
        .attr("opacity", 0.4)
    scoringDiv.style("visibility", "hidden");
}

function generateBins(data) {
    // set the parameters for histogram
    const histogram = d3.histogram()
        .value(d => parseFloat(d.Score))
        .domain([thresholdValue, 1])
        .thresholds(histogramThreshold(thresholdValue))

    return histogram(data.sort((a, b) => parseFloat(b.Score) - parseFloat(a.Score)))

}

function addImage() {
    d3.selectAll(".ss-option")
        .html(function () {
            let tp = this.innerText.split(" ")[0];
            let topic = tp[0].toLowerCase() + tp.slice(1, tp.length)
            let src = "MC2-Image-Data/TrainingImages/" + topic + "/" + topic + "_3.jpg"
            return '<div class="text-option">' + this.innerText + '</div>' + '<img style="width: 267px" src=' + src + '>'

        });

}