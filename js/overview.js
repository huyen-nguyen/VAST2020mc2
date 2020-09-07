// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 80, left: 40},
    width = 2200 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// // set the ranges
// var x = d3.scaleBand()
//     .range([0, width])
//     .padding(0.1);
//
// var y = d3.scaleLinear()
//     .range([height, 0]);

const columns3 = ["label", "predict", "truth"]

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
// x.domain(classesSorted.map(d => d));
// y.domain([0, maxValue]);

let maxValuePred = d3.max(overviewClasses, d => d.predict), maxValueTruth = d3.max(overviewClasses, d => d.truth)

let blues = d3.scaleSequential(d3.interpolateReds)
    .domain([-200, maxValuePred+20])

let reds = d3.scaleSequential(d3.interpolateGreens)
    .domain([-40, maxValueTruth+20])

blues = d3.scaleLinear()
    .range(["#ffffff", "#600"])
    .domain([-200, maxValuePred]);

reds = d3.scaleLinear()
    .range(["#ffffff", "#007000"])
    .domain([-40, maxValueTruth])

//  ------ new ------

// The scale spacing the groups:
var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

// The scale for spacing each group's bar:
var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var keys = columns3.slice(1);

x0.domain(overviewClasses.map(function(d) { return d.label; }));
x1.domain(keys).rangeRound([0, x0.bandwidth()]);
y.domain([0, d3.max(overviewClasses, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

// append the rectangles for the bar chart
// svg.selectAll(".bar")
//     .data(classesSorted)
//     .enter().append("rect")
//     .attr("class", "bar")
//     .attr("x", function (d) {
//         return x(d);
//     })
//     .attr("width", x.bandwidth())
//     .attr("y", function (d) {
//         return classesCount[d] ? y(classesCount[d]) : 0;
//     })
//     .attr("height", function (d) {
//         return height - (classesCount[d] ? y(classesCount[d]) : height);
//     })
//     .attr("fill", function (d) {
//         return classesCount[d] ? (blues(classesCount[d])) : "#000"
//     });

svg.append("g")
    .selectAll("g")
    .data(overviewClasses)
    .enter().append("g")
    .attr("class","bar")
    .attr("transform", function(d) { return "translate(" + x0(d.label) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
    .attr("x", function(d) { return x1(d.key); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x1.bandwidth())
    .attr("height", function(d) { return height - y(d.value); })
    .attr("fill", function(d) {
        return d.key === "predict" ? blues(d.value) : reds(d.value); });
        // return d.key === "predict" ? blues(400) : reds(100); });


// append text overbar
svg.selectAll(".count")
    .data(classesSorted)
    .enter()
    .append("text")
    .text(d => classesCount[d] ? (classesCount[d]) : "")
    .attr("class", "count")
    .attr("x", function (d) {
        return x0(d) + x0.bandwidth() / 4;
    })
    .attr("y", function (d) {
        return (classesCount[d] ? y(classesCount[d]) : 0) - 5;
    })
    .attr("fill", blues(400))
    .attr("font-size", "11px")
    .attr("text-anchor", "middle")

// append text overbar
svg.selectAll(".countRed")
    .data(classesSorted)
    .enter()
    .append("text")
    .text(d => classTruth[d] ? (classTruth[d]) : "")
    .attr("class", "countRed")
    .attr("x", function (d) {
        return x0(d) + 3 * x0.bandwidth() / 4;
    })
    .attr("y", function (d) {
        return (classTruth[d] ? y(classTruth[d]) : 0) - 5;
    })
    .attr("fill", "green")
    .attr("font-size", "11px")
    .attr("text-anchor", "middle")

// add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0))
    .selectAll("text")
    // .style("text-anchor", "end")
    .text((d,i) => (i + 1) + ". " + d)
    .attr("dx", "-0.4em")
    .attr("dy", "0.3em")
    .attr("transform", function (d) {
        return "rotate(-35)"
    })
    .attr("text-anchor", "end");
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

var legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(-20," + i * 20 + ")"; });

legend.append("rect")
    .attr("x", width - 17)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill",  d => d === "predict" ? blues(460) : reds(80))
    .attr("stroke", d => d === "predict" ? blues(460) : reds(80))
    .attr("stroke-width",2)
    // .on("click",function(d) { update(d) });

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .attr("font-size", "13px")
    .text(function(d) { return d === "predict" ? "original, 4491 total" : "corrected, 1370 total"; });
