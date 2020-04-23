main = "#main"

let thumbImgWidth = 20, thumbImgHeight = 20
let biggerImgWidth = 450, biggerImgHeight = 360



d3.csv("data/newData2.csv", function (error, data) {
    if (error) throw error;

    console.log(data);
    let topic = "eyeball"

    console.log(data.filter(d => d.Label === topic))

    // set the dimensions and margins of the graph
    let margin = {top: 10, right: 30, bottom: 30, left: 160},
        width = 1650 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    let zoomPanelMargin = {top: 20, right: 20, bottom: 20, left: 20},
        zoomPanelWidth = 350 - zoomPanelMargin.left - zoomPanelMargin.right,
        zoomPanelHeight =  350 - zoomPanelMargin.top - zoomPanelMargin.bottom;


    // append the svg object to the body of the page
    var svg = d3.select(main)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "imageDist")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //    x-axis
    let x = d3.scaleLinear()
        .domain([0.25, 1])


    // set the parameters for histogram
    histogram = d3.histogram()
        .value(d => d.Score)
        .domain(x.domain())
        .thresholds(x.ticks(100))

    bins = histogram(data.filter(d => d.Label === topic).sort((a ,b) => parseFloat(b.Score) - parseFloat(a.Score)))

    x.range([0, width])

    svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(x))

    // y-axis
    let y = d3.scaleLinear()
        .range([height, 0])

    y.domain([0, d3.max(bins, d => d.length)])

    svg.append("g")
        .call(d3.axisLeft(y))

    let barWidth = x(bins[1].x1) - x(bins[1].x0) -3
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

    // add div
    d3.select(main).append("div")
        .attr("class", "box")
        .attr("id", "zoomPanel")
        .style("opacity", 0)


    let zoomPanel = d3.select("#zoomPanel").append("svg")
        .attr("width", zoomPanelWidth + zoomPanelMargin.left + zoomPanelMargin.right)
        .attr("height", zoomPanelHeight + zoomPanelMargin.top + zoomPanelMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + zoomPanelMargin.left + "," + zoomPanelMargin.top + ")");

    let imageZoomed = zoomPanel.append('image')
        .attr("width", zoomPanelWidth)
        .attr("height", zoomPanelHeight)

    let textZoomed = d3.select("#zoomPanel")
        .append("div")
        // .style("margin-top", "20px")


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
        // .attr("y", "0px")

    let groups = svg.selectAll(null)
        .data(bins)
        .enter()
        .append("g")
            .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
    ;

    let prevClick
    let rects = groups.selectAll(".thumbnail")
        .data(d => d)
        .enter()
        .append('image')
        .attr("class", "thumbnail")
        .attr('xlink:href', (d) =>  {
            return "MC2-Image-Data/" + d.Person + "/" + d.ID + ".jpg"
        })
        .attr("x", 1)
        .attr("y", (d, i) => height - y(i))
        .attr("width", barWidth)
        .attr("height", barWidth)
        .on("mouseover", function(d) {
            console.log("--------------------")
            console.log(d)

            imageZoomed.attr('xlink:href', "MC2-Image-Data/" + d.Person + "/" + d.ID + ".jpg")

            d3.select("#zoomPanel")
                .style("opacity", 1)
                .classed("redBorder", true)

            biggerImage.attr('xlink:href', "MC2-Image-Data/" + d.Person + "/" + d.Image + "bbox.jpg")

            textZoomed.html("<br>" + "Score: " + d.Score + "<br>" + " Label: " + d.Label +  "<br>" + " Owner: " + d.Person
                + (parseInt(d.x) < 0 ? "<br><span style='color: red'> Cannot locate bounding box for this" +
                    " object!</span>" : "")
            )

            d3.select(this).classed("imgBorder", true)
            d3.select(prevClick).classed("imgBorder", false)
            prevClick = this;

        })

    // Handler for dropdown value change
    function dropdownChange() {
        let newTopic = d3.select(this).property('value')
        console.log(newTopic)

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

})