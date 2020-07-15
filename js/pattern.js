// var data = [{"salesperson":"Bob","sales":33},{"salesperson":"Robin","sales":12},{"salesperson":"Anne","sales":41},{"salesperson":"Mark","sales":16},{"salesperson":"Joe","sales":59},{"salesperson":"Eve","sales":38},{"salesperson":"Karen","sales":21},{"salesperson":"Kirsty","sales":25},{"salesperson":"Chris","sales":30},{"salesperson":"Lisa","sales":47},{"salesperson":"Tom","sales":5},{"salesperson":"Stacy","sales":20},{"salesperson":"Charles","sales":13},{"salesperson":"Mary","sales":29}];
let data = [{"name":"pinkCandle_inside_sign","counts":124},{"name":"blueSunglasses_inside_birdCall","counts":80},{"name":"eyeball_inside_birdCall","counts":69},{"name":"blueSunglasses_inside_pumpkinNotes","counts":54},{"name":"cloudSign_inside_birdCall","counts":53},{"name":"pinkCandle_inside_cloudSign","counts":50},{"name":"lavenderDie_inside_eyeball","counts":48},{"name":"pinkCandle_inside_birdCall","counts":47},{"name":"lavenderDie_inside_yellowBag","counts":45},{"name":"cloudSign_inside_pumpkinNotes","counts":45},{"name":"lavenderDie_inside_hairClip","counts":43},{"name":"eyeball_inside_pumpkinNotes","counts":40},{"name":"hairClip_inside_birdCall","counts":32},{"name":"pinkCandle_inside_pumpkinNotes","counts":31},{"name":"eyeball_inside_yellowBag","counts":30},{"name":"stickerBox_inside_pumpkinNotes","counts":27},{"name":"pinkCandle_inside_yellowBag","counts":26},{"name":"pinkCandle_inside_canadaPencil","counts":26},{"name":"pinkCandle_inside_metalKey","counts":25},{"name":"hairClip_inside_trophy","counts":25}]
// console.log(occlusion)

// let data = [{"name":"pumpkinNotes_yellowBag_yellowBalloon","counts":10},{"name":"birdCall_pumpkinNotes_trophy","counts":6},{"name":"canadaPencil_sign_silverStraw","counts":5},{"name":"birdCall_pumpkinNotes_yellowBag","counts":5},{"name":"birdCall_metalKey_partyFavor","counts":4},{"name":"birdCall_pumpkinNotes_stickerBox","counts":4},{"name":"cloudSign_eyeball_stickerBox","counts":3},{"name":"birdCall_pumpkinNotes_yellowBag_yellowBalloon","counts":3},{"name":"cloudSign_eyeball_hairClip","counts":3},{"name":"birdCall_cloudSign_partyFavor","counts":3},{"name":"cloudSign_hairClip_redWhistle","counts":3},{"name":"eyeball_hairClip_redWhistle","counts":3},{"name":"birdCall_cloudSign_hairClip_pumpkinNotes_redWhistle_trophy","counts":2},{"name":"canadaPencil_metalKey_silverStraw","counts":2},{"name":"birdCall_hairClip_redWhistle","counts":2},{"name":"eyeball_hairClip_redWhistle_trophy","counts":2},{"name":"cupcakePaper_pumpkinNotes_yellowBag","counts":2},{"name":"birdCall_hairClip_redWhistle_trophy","counts":2},{"name":"birdCall_cloudSign_pumpkinNotes_redWhistle_stickerBox","counts":2},{"name":"hairClip_pumpkinNotes_trophy","counts":2},{"name":"birdCall_pumpkinNotes_yellowBalloon","counts":2},{"name":"blueSunglasses_cloudSign_hairClip","counts":2},{"name":"cloudSign_eyeball_hairClip_redWhistle_stickerBox","counts":2},{"name":"cupcakePaper_paperPlate_pumpkinNotes_stickerBox_yellowBalloon","counts":2},{"name":"birdCall_hairClip_trophy","counts":2},{"name":"cloudSign_cupcakePaper_stickerBox","counts":2},{"name":"cupcakePaper_paperPlate_pumpkinNotes","counts":2}]

data = data.slice(0,12).reverse()
// set the dimensions and margins of the graph
var margin = {top: 20, right: 40, bottom: 30, left: 300},
    width = 1200 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// set the ranges
var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1);

var x = d3.scaleLinear()
    .range([0, width]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// format the data
// data.forEach(function(d) {
//     d.count = +d.count;
// });

// Scale the range of the data in the domains
x.domain([0, d3.max(data, function(d){ return d.counts; })])
y.domain(data.map(function(d) { return d.name; }));
//y.domain([0, d3.max(data, function(d) { return d.sales; })]);

var bars = svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")

// append the rectangles for the bar chart
bars.append("rect")
    .attr("class", "bar")
    // .attr("fill", "#0f5daa")
    .attr("fill", "#a86569")

    //.attr("x", function(d) { return x(d.sales); })
    .attr("width", function(d) {return x(d.counts); } )
    .attr("y", function(d) { return y(d.name) + 1; })
    .attr("height", y.bandwidth() - 1);

bars.append("text")
    .attr("class", "label")
    //y position of the label is halfway down the bar
    .attr("y", function (d) {
        return y(d.name) + y.bandwidth() / 2 + 4;
    })
    //x position is 3 pixels to the right of the bar
    .attr("x", function (d) {
        return x(d.counts) + 3;
    })
    .text(function (d) {
        return d.counts;
    })
    .style("font-size", "12px");
// add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// add the y Axis
svg.append("g")
    .call(d3.axisLeft(y));