// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 60, left: 40},
    width = 1800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
var y = d3.scaleLinear()
    .range([height, 0]);


// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// Scale the range of the data in the domains
x.domain(classesSorted.map(d => d));
let maxValue = d3.max(Object.entries(classesCount), d => d[1])
y.domain([0, maxValue]);

let blues = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, maxValue])

// append the rectangles for the bar chart
svg.selectAll(".bar")
    .data(classesSorted)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
        return x(d);
    })
    .attr("width", x.bandwidth())
    .attr("y", function (d) {
        return classesCount[d] ? y(classesCount[d]) : 0;
    })
    .attr("height", function (d) {
        return height - (classesCount[d] ? y(classesCount[d]) : height);
    })
    .attr("fill", function (d) {
        return classesCount[d] ? (blues(classesCount[d])) : "#000"
    });

svg.selectAll(".count")
    .data(classesSorted)
    .enter()
    .append("text")
    .text(d => classesCount[d] ? (classesCount[d]) : "")
    .attr("class", "count")
    .attr("x", function (d) {
        return x(d) + x.bandwidth() / 2;
    })
    .attr("y", function (d) {
        return (classesCount[d] ? y(classesCount[d]) : 0) - 5;
    })
    .attr("fill", "black")
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")


// add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    // .style("text-anchor", "end")
    .text((d,i) => (i + 1) + ". " + d)
    .attr("dx", "-1.3em")
    .attr("dy", "1.7em")
    .attr("transform", function (d) {
        return "rotate(-35)"
    });
;

// add the y Axis
svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", -40)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("fill", "black")
    .text("Objects detected");

d3.csv("data/newData2.csv", function (error, data_) {
    if (error) throw error;

    let data = data_.filter(d => d.Score >= 0.5)

    dataF = d3.nest().key(d => d.Label).entries(data)
    console.log(dataF)
})