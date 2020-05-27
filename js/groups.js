var svg2 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "svg2");

d3.csv("data/newData2.csv", function (error, data_) {
    if (error) throw error;
    let imageData = d3.nest().key(d => d.Image).entries(data_)

    console.log(imageData)
})

