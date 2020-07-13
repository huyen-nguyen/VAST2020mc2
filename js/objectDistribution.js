const main = "#main"
let maxBin
let topic = "eyeball"

let thresholdValue = 0.2
let histogramThreshold = d3.scaleThreshold().domain([0.3, 0.4, 0.5, 0.6, 0.7]).range([30, 25, 20, 20, 15, 10])
let filteredData, allData;
let rects, bins, rectDrawn
let xStep, barWidth, yStep
let positive

let markedImg = []

const titles = ["ID", "Score", "Classified", "Precision", "Recall"]
let tableInit;

const biggerImgWidth = 450, biggerImgHeight = 360

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 40, left: 350},
    width = 1660 - margin.left - margin.right,
    height = 830 - margin.top - margin.bottom;

const zoomPanelMargin = {top: 20, right: 20, bottom: 20, left: 20},
    zoomPanelWidth = 350 - zoomPanelMargin.left - zoomPanelMargin.right,
    zoomPanelHeight = 350 - zoomPanelMargin.top - zoomPanelMargin.bottom;

const scmargin = {top: 10, right: 10, bottom: 10, left: 40},
    scwidth = 310 - scmargin.left - scmargin.right,
    scheight = 200 - scmargin.top - scmargin.bottom;

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

// apply control panel
let curveSpec = d3.select(main)
    .append("div")
    .attr("id", "curveSpec")

let svg = mainSVG
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

let scatChart = mainSVG
    .append("g")
    .attr("transform",
        "translate(10,600)")
;

let scat = scatChart.append("g").attr("transform", "translate(" + scmargin.left + "," + scmargin.top + ")");

scat.append("g")
    .attr("class", "x axis");

scat.append("g")
    .attr("class", "y axis");

scat
    .append("text")
    .attr("x", 10)
    .attr("y", -10)
    .attr("dx", "3.32em")
    // .attr("dy", "0.3em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-size", "13px")
    .text("Precision - Recall curve")
    .attr("font-weight", "bold");

scat
    .append("text")
    .attr("x", scwidth / 2 - 80)
    .attr("y", scheight + scmargin.bottom + 20)
    .attr("dx", "3.32em")
    // .attr("dy", "0.3em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-size", "13px")
    .attr("id", "recalltext")
    .text("Recall");

scat
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - scmargin.left)
    .attr("x", 0 - (scheight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("id", "pretext")
    .text("Precision");

scat.append("path")
    .attr("id", "prcurve")

scat.append("path")
    .attr("id", "interpolatedPRcurve")

curveSpec.selectAll("label")
    .data(["precision", "interpolation"])
    .enter()
    .append("label")
    .attr("class", "curveLabel")
    .insert("input")
    .attr("id", (d, i) => i ? "interBox" : "precisionBox")
    .attr("type", "checkbox")
    .attr("checked", true)
    .on("change", function(d,i){
        d3.select("#prcurve")
            .style("visibility", document.getElementById("precisionBox").checked? "visible" : "hidden")
        d3.select("#interpolatedPRcurve")
            .style("visibility", document.getElementById("interBox").checked? "visible" : "hidden")
    })

curveSpec.selectAll("label")
    .append("span")
    .html((d,i) => i ? " " + d + "<span style='color: red'> - - -</span>" : " " + d + "<span style='color: blue;'>" +
        " ───</span>")

curveSpec.append("div")
    .style("font-size", "13px")
    .text("AP: ")
    .append("span")
    .attr("id", "ap")

let scx = d3.scaleLinear()
    .range([0, scwidth]);

let scy = d3.scaleLinear()
    .range([scheight, 0]);


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
let mainGroup = svg.append("g")
    .attr("id", "mainG")

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
    .attr("min", "0.2")
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
    .html(function (d) {
        return '<span style="padding-left: 20px">' + d
    })
    .insert("input")
    .attr("type", "radio")
    .attr("class", "shape")
    .attr("name", "mode")
    .attr("value", (d, i) => i)
    .on("change", (d, i) => {
        positive = !i
        mainSVG.on("mousedown", function () {
            var m = d3.mouse(this);

            rectDrawn = mainSVG.append("rect")
                .attr("id", "temp")
                .attr("x", m[0])
                .attr("y", m[1])
                .attr("height", 0)
                .attr("width", 0)
                .attr("fill", d.split(" ")[0].toLowerCase())
                .attr("opacity", 0.4)

            mainSVG.on("mousemove", mousemove);
        })
            .on("mouseup", mouseup)

    })

// ------- categories on left panel ----------

leftPanel.append("text")
    .text("Categories:")
    .attr("class", "panelSelection")

// ----------------- Table on left panel -----------------
let tablePanel = d3.select(main)
    .append("div")
    .attr("id", "table-wrapper")
    .append("table")

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


d3.csv("data/newData2.csv", function (error, data_) {
    if (error) throw error;

    allData = data_;

    d3.selectAll(".floating").call(d3.drag()
        .on("start", boxDragStarted)
        .on("drag", boxDragged)
        .on("end", boxDragEnded));

    addImage()
    updateCharts()
})

function updateCharts() {
    filteredData = allData.filter(d => parseFloat(d.Score) >= thresholdValue).filter(d => d.Label === topic)
    markedImg = JSON.parse(JSON.stringify(filteredData)).map((d) => {
        return {
            ID: d.ID,
            Score: d.Score,
            Image: d.Image
        }
    })

    d3.select("table").selectAll("*").remove()
    scat.selectAll(".point").remove("*")
    scat.style("visibility", "hidden")
    curveSpec.style("visibility", "hidden")
    tableInit = false;
    bins = generateBins(filteredData)
    bins.forEach((d, i) => d.id = topic + (thresholdValue * 100) + i)
    maxBin = d3.max(bins.map(d => d.length))
    maxBin = maxBin < 3 ? 3 : maxBin;

    y.domain([0, maxBin])
    x.domain([thresholdValue, 1])

    // console.log("bins: ", bins)
    // console.log("maxbin: ", maxBin);

    yStep = height / maxBin;

    xAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(20))

    yAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).ticks(3))
    ;

    xStep = x(bins[1].x1) - x(bins[1].x0)
    barWidth = xStep - 12

    let prevOver
    let groups = mainGroup.selectAll("g.imgGroup")
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
        .attr("id", (d, i, a) => {
            // console.log(d, i, a)
            return "group_" + (i + 1)
        })
        .attr("transform", d => {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")"
        })

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
        .attr("count", function (d, i, a) {
            // let parentNode = (document.getElementById(d.ID).parentNode.id) // should not use this as this is not updated
            let parentID = this.parentNode.getAttribute("id")
            return "image_" + parentID.split("_")[1] + "_" + (maxBin - a.length + i + 1)
        })


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


    function mouseoverImage(d, i, a) {
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
    markedImg.find(d => d.ID === clickID).Classified = status ? "TrueP" : "FalseP"
    outClassified()
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

function shrinkBoundary(x, y, width, height) {
    if (width < xStep) {
        return
    } else {
        let xFirstOrder = Math.ceil(x / xStep) + 1
        let xSecOrder = d3.max([xFirstOrder, (Math.floor((x + width) / xStep))])
        let yFirstOrder = Math.ceil(y / yStep) + 1
        let ySecOrder = d3.max([yFirstOrder, (Math.floor((y + height) / yStep))])

        console.log(xFirstOrder, xSecOrder, yFirstOrder, ySecOrder)
        for (let i = xFirstOrder; i <= xSecOrder; i++) {
            for (let j = yFirstOrder; j <= ySecOrder; j++) {
                d3.selectAll("rect[count='image_" + i + "_" + j + "']")
                    .attr("fill", (d) => {
                        markedImg.find(e => e.ID === d.ID).Classified = positive ? "TrueP" : "FalseP"
                        return positive ? "#28A745" : "#DC3545"
                    })
                    .attr("opacity", 0.4)
            }
        }
        outClassified();
    }
}

function outClassified() {
    let data = markedImg.filter(d => d.Classified).sort((a, b) => +b.Score - +a.Score)
    let chartData = []
    console.log(data)

    let table = d3.select("table")

    if (!tableInit) {

        table.append('thead').append('tr')
            .selectAll('th')
            .data(titles).enter()
            .append('th')
            .attr("class", "th-data")
            .text(d => d === "ID" ? "Associated Image" : d);

        table.append('tbody').attr("id", "tb");

        tableInit = true;
    }
    d3.select("tbody").selectAll("td").remove("*")
    data.forEach(function (row) {
        console.log(row)
        let len = data.filter(d => +d.Score >= +row.Score).length;
        let TP = data.filter(d => +d.Score >= +row.Score).filter(d => d.Classified === "TrueP").length

        chartData.push({
            precision: (TP / len),
            recall: (TP / classTruth[topic])
        })

        return $("#tb").append('<tr>' +
            '<td>' + row.Image + '</td>' +
            '<td class="number">' + (+row.Score).toFixed(3) + '</td>' +
            // '<td style="text-align: center; vertical-align: middle;" >' + personal_photo  + '</td>' +
            // '<td style="text-align: center; vertical-align: middle;" >' + screenshot_photo  + '</td>' +
            '<td >' + row.Classified + '</td>' +
            '<td class="number">' + (TP / len).toFixed(3) + '</td>' +
            '<td class="number">' + (TP / classTruth[topic]).toFixed(3) + '</td>' +
            '</tr>');
    });

    console.log(chartData)

    updateScat(chartData)

}

function updateScat(myData) {
    scx.domain([0, 1]);
    scy.domain([0, 1]);

    let points = scat.selectAll(".point")
        .data(myData); //update

    console.log(myData)
    let pointsEnter = points
        .enter()
        .append("circle")
        .attr("class", "point");

    points.merge(pointsEnter) //Enter + Update
        .attr("cx", d => scx(d.recall))
        .attr("cy", d => scy(d.precision))
        .attr("r", 3)
        .attr("stroke", "#878787")
        .attr("fill", "yellow");

    points.exit()
        .remove();

    scat.select(".x.axis")
        .call(d3.axisBottom(scx))
        .attr("transform",
            "translate(0, " + scheight + ")");

    scat.select(".y.axis")
        .call(d3.axisLeft(scy));


    d3.select("#prcurve")
        .datum(myData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return scx(d.recall) })
            .y(function(d) { return scy(d.precision) })
        )
        .raise()

    let interpolated = interpolate(myData)

    d3.select("#interpolatedPRcurve")
        .datum(interpolated)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return scx(d.recall) })
            .y(function(d) { return scy(d.precision) })
        )
        .style("stroke-dasharray", ("3, 3"))
        .raise()

    scat.style("visibility", "visible")
    curveSpec.style("visibility", "visible")


    d3.select("#ap").text((getArea(interpolated)*100).toFixed(2) + "%")
    console.log(getArea(interpolated))
}

function interpolate(array){
    let interpolateArray = [];
    let currentRecall, currentPrecision;

    let sortedByRecall = array.sort((a,b) => +b.recall - +a.recall);

    interpolateArray.push(sortedByRecall[0])
    currentRecall = sortedByRecall[0].recall;
    currentPrecision = sortedByRecall[0].precision;

    for (let i = 0; i < sortedByRecall.length; i++) {
        let thisPoint = sortedByRecall[i];
        if (thisPoint.precision > currentPrecision) {
            // push the intersection
            interpolateArray.push({
                recall: thisPoint.recall,
                precision: currentPrecision,
            })

            // assign new recall and precision
            currentPrecision = thisPoint.precision;

            // push new point
            interpolateArray.push(thisPoint)
        }
    }

    // push last point
    interpolateArray.push({
        recall: 0,
        precision: currentPrecision
    })

    return interpolateArray;
}

function getArea(array){
    let area;
    let points = array.map(d => {
        return [d.recall, d.precision]
    });

    // add 2 more points at end of highest recall and (0,0)
    points.push([0,0])
    points.push([points[0][0], 0]);

    return geometric.polygonArea(points)
}