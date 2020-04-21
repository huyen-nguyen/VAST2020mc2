main = "#main"

// set the dimensions and margins of the graph
let margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 2500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

let zoomPanelMargin = {top: 20, right: 20, bottom: 20, left: 20},
    zoomPanelWidth = 400 - zoomPanelMargin.left - zoomPanelMargin.right,
    zoomPanelHeight =  400 - zoomPanelMargin.top - zoomPanelMargin.bottom;

// append the svg object to the body of the page
var svg = d3.select(main)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "imageDist")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.csv("data/newData.csv", function (error, data) {
    if (error) throw error;

    console.log(data);
    let topic = "birdCall"

    console.log(data.filter(d => d.Label === topic))

    //    x-axis
    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width])

    svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(x))

    // set the parameters for histogram
    histogram = d3.histogram()
        .value(d => d.Score)
        .domain(x.domain())
        .thresholds(x.ticks(120))

    bins = histogram(data.filter(d => d.Label === topic).sort((a ,b) => parseFloat(b.Score) - parseFloat(a.Score)))

    // y-axis
    let y = d3.scaleLinear()
        .range([height, 0])

    y.domain([0, d3.max(bins, d => d.length)])

    let yAxisHandleForUpdate = svg.append("g")
        .call(d3.axisLeft(y))

    // append rectangles
    svg.selectAll(null)
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
        .attr("width", d => x(d.x1) > x (d.x0) ? x(d.x1) - x (d.x0) - 3 : 0)
        .attr("height", d => height - y(d.length))
        .style("fill", "#e4f2f7")

    // add sticky div
    d3.select(main).append("div")
        .attr("class", "sticky box")
        .attr("id", "zoomPanel")

    let zoomPanel = d3.select("#zoomPanel").append("svg")
        .attr("width", zoomPanelWidth + zoomPanelMargin.left + zoomPanelMargin.right)
        .attr("height", zoomPanelHeight + zoomPanelMargin.top + zoomPanelMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + zoomPanelMargin.left + "," + zoomPanelMargin.top + ")");

    let imageZoomed = zoomPanel.append('image')
        .attr("width", d => {
            return zoomPanelWidth
        })
        .attr("height", zoomPanelHeight)

    let groups = svg.selectAll(null)
        .data(bins)
        .enter()
        .append("g")
            .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
    ;


    let rects = groups.selectAll(".thumbnail")
        .data(d => d)
        .enter()
        .append('image')
        .attr("class", "thumbnail")
        .attr('xlink:href', (d,i) =>  {
            console.log(d)
            return "MC2-Image-Data/" + d.Person + "/" + d.Image + ".jpg"
        })
        .attr("x", 1)
        .attr("y", (d, i) => height - y(i))
        .attr("width", d => {
            return 20
        })
        .attr("height", 20)
        .on("click", function(d) {
            console.log("--------------------")
            console.log(d)
            imageZoomed.attr('xlink:href', "MC2-Image-Data/" + d.Person + "/" + d.Image + ".jpg")
            d3.select("#zoomPanel").classed("redBorder", true)
            d3.select(this).classed("imgBorder", true)

        })



    var updateBars = function (data) {
        // First update the y-axis domain to match data

        y.domain([0, d3.max(bins, d => d.length)])
        yAxisHandleForUpdate.call(d3.axisLeft(y))

        let bars = svg.selectAll(".bar").data(data)

        // // add bars for new data
        // bars.enter()
        //     .append("rect")
        //     .attr("class", "bar")
        //     .attr("x", 1)
        //     .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
        //     .attr("width", d => x(d.x1) > x (d.x0) ? x(d.x1) - x (d.x0) - 1: 0)
        //     .attr("height", d => height - y(d.length))
        //     .style("fill", "#1c6363")
        //
        // bars.transition().duration(400)
        //     .attr("height", d => height - y(d.length))
        //
        // bars.exit().remove();

    }

    // Handler for dropdown value change
    function dropdownChange() {
        let newTopic = d3.select(this).property('value')

        let newData = histogram(data.filter(d => d.Label === newTopic))
        console.log(newTopic)
        updateBars(newData)
    }

    let dropdown = d3.select(main)
        .insert("select", "svg")
        .style("display", "block")
        .style("float", "left")
        .on("change", dropdownChange)

    dropdown.selectAll("option")
        .data(classes)
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) {
            return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
        });

    updateBars(bins);


})