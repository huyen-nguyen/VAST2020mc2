main = "#main"

let thumbImgWidth = 20, thumbImgHeight = 20
let biggerImgWidth = 450, biggerImgHeight = 360

// set the dimensions and margins of the graph
let margin = {top: 10, right: 30, bottom: 30, left: 320},
    width = 1860 - margin.left - margin.right,
    height = 830 - margin.top - margin.bottom;

let zoomPanelMargin = {top: 20, right: 20, bottom: 20, left: 20},
    zoomPanelWidth = 350 - zoomPanelMargin.left - zoomPanelMargin.right,
    zoomPanelHeight = 350 - zoomPanelMargin.top - zoomPanelMargin.bottom;

const ticks = 100
const maxBin = 43
//    x-axis
let x = d3.scaleLinear()
    .domain([0.25, 1])
    .range([0, width])

// y-axis
let y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 43]) // getMaxBin() here

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


// add div
let zoomPanelDiv = d3.select(main).append("div")
    .attr("class", "box")
    .attr("id", "zoomPanel")


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

// add div
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


// draw x and y axis
svg.append("g")
    .attr("transform", "translate(0, " + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width/2 - 200)
    .attr("y", margin.bottom * 0.9)
    .attr("dx", "0.32em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-size", "13px")
    .text("Confidence Score");

svg.append("g")
    .call(d3.axisLeft(y))


let g = svg.append("g")

let rects, bins
d3.csv("data/newData2.csv", function (error, data) {
    if (error) throw error;

    // data = data.filter(d => d.Score >= 0.5)

    function updateCharts(topic) {

        bins = generateBins(topic, data)
        bins.forEach((d,i) => d.id = topic + i)

        console.log(data);
        console.log(getMaxBin(data))

        let barWidth = x(bins[1].x1) - x(bins[1].x0) - 3
        // // append rectangles
        // svg.selectAll(null)
        //     .data(bins)
        //     .enter()
        //     .append("rect")
        //     .attr("x", 1)
        //     .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
        //     .attr("width", d => x(d.x1) > x(d.x0) ? x(d.x1) - x(d.x0) - 3 : 0)
        //     .attr("height", d => height - y(d.length))
        //     .style("fill", "#cdeee4")
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
            .selectAll(".thumbnail")
            .data(d => d)
            .enter()
            .append('image')
            .attr("opacity", 0)

            rects
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

            rects.on("mouseover", mouseoverImage)
                .on("click", pinImage)
        
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
            rects.on("mouseover", () => "")
        //    pin the image
            pin.attr("opacity", 1)
        }
        
        function unpin() {
            rects.on("mouseover", mouseoverImage)
            pin.attr("opacity", 0)
        }
    }

    // Handler for dropdown value change
    function dropdownChange() {
        let newTopic = d3.select(this).property('value')
        console.log(newTopic)

        updateCharts(newTopic)

        setTimeout(addImage, 1000);

    }


    let dropdown = d3.select(main)
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
            return d[0].toUpperCase() + d.slice(1, d.length) + (classesCount[d] ? " (" + classesCount[d] : " (0" ) + ")";
        })

    new SlimSelect({
        select: '#single',
    });

    addImage()
    updateCharts("eyeball")
})


function generateBins(topic, data) {
    // set the parameters for histogram
    let histogram = d3.histogram()
        .value(d => d.Score)
        .domain(x.domain())
        .thresholds(x.ticks(ticks))

    return histogram(data.filter(d => d.Label === topic).sort((a, b) => parseFloat(b.Score) - parseFloat(a.Score)))

}

function getMaxBin(data) {
    let temp2 = d3.nest().key(d => d.Label).entries(data)
    let bins = temp2.map(d => generateBins(d.key, data))

    let max = 0
    bins.forEach(d => {
        d.forEach(e => {
            if (e.length > max) {
                max = e.length
            }
        })
    })

    return max
}

function addImage() {
    d3.selectAll(".ss-option")
        .html(function () {
            let tp = this.innerText.split(" ")[0];
            let topic = tp[0].toLowerCase() + tp.slice(1, tp.length)
            console.log(this)
            let src = "MC2-Image-Data/TrainingImages/" + topic + "/" + topic + "_3.jpg"
            return '<div class="text-option">' + this.innerText + '</div>' + '<img style="width: 267px" src=' + src + '>'

        });

}