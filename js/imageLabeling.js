let main = "#mainDiv"
let allData;
let imageSelectionSize = {width: 300, eachHeight: 35}
let labelSelectionSize = {width: 200}

let imagesPerPage = 15, currentPage = 1;

const imageDisplaySize = {top: 10, right: 10, bottom: 10, left: 10},
    width = 740 - imageDisplaySize.left - imageDisplaySize.right,
    height = 740 - imageDisplaySize.top - imageDisplaySize.bottom;

let imageCPsize = {height: 60}

let imageSize = {width: 720, height: 720}

let controlPanelSize = {height: 60}

let image, thisImage, bbox = false;

const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));

// let controlPanel = d3.select(main).append('div')
//     .style("height", controlPanelSize.height + "px")
let imageSelectionDiv = d3.select(main).append('div')
    .attr("id", "imageSelection")
    .attr("class", "boxBlock")
    .style("width", imageSelectionSize.width + "px")
// .style("height", "800px")

let labelSelectionDiv = d3.select(main).append("div")
    .attr("id", "labelSelection")
    .attr("class", "boxBlock labelSelection")
    .style("width", labelSelectionSize.width + "px")

let imageDisplayDiv = d3.select(main).append('div')
    .attr("class", "imageDisplay")

imageDisplayDiv.append("div")
    .attr("id", "imageSpecified")
    .attr("class", "boxBlock imageSpecified")
    .style("width", width + "px")
    .style("height", imageCPsize.height + "px")

let imageFrame = imageDisplayDiv.append("div")
    .attr("class", "imageFrame")

init()

function init() {
    drawImageSelection()
    showImage()
}

function drawImageSelection() {
    let prevDiv;

    let chunks = array_chunks(images, imagesPerPage)

    imageSelectionDiv.selectAll(".image-selection")
        .data(chunks[currentPage - 1])
        .enter()
        .append("div")
        // .style("height", imageSelectionSize.eachHeight + "px")
        .attr("class", "image-selection")
        .style("height", imageSelectionSize.eachHeight + "px")
        .style("line-height", imageSelectionSize.eachHeight + "px")
        .text(d => d + ".jpg")
        .on("click", function (d) {
            // update image
            thisImage = d
            updateImage(bbox, d)

            //default rotation
            image.attr("transform", "rotate(0" + "," + (width/2) + ", " + (height/2) +")")

            d3.select(this).classed("selected", true)
            d3.select(prevDiv).classed("selected", false)
            prevDiv = this;
        })

    let bottomDiv = imageSelectionDiv.append("div")
        .attr("class", "switchPage")

    bottomDiv
        .append("i")
        .attr("class", "fas fa-chevron-circle-left fasIcon")
        .style("left", "10px")


    let pageNumber = bottomDiv.append("span")
        .html("Page " + currentPage + " of " + Math.ceil(images.length / imagesPerPage))
        .style("position", "absolute")
        .style("left", "35%")

    bottomDiv
        .append("i")
        .attr("class", "fas fa-chevron-circle-right fasIcon")
        .style("right", "10px")
}

function drawLabelSelection() {

}

function showImage() {
    let imageDisplaySvg = imageFrame.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svgImageDisplay")
        .append("g")

    image = imageDisplaySvg.append('image')
        .attr("id", "image")
        .attr("width", imageSize.width)
        .attr("height", imageSize.height)
        .attr("transform", "rotate(0, "+ (width/2) + ", " + (height/2) +" )")


//    buttons for specify

    d3.select("#imageSpecified")
        .append("div")
        .attr("class", "btnDiv")
        .selectAll(".specifiyBtn")
        .data(["Original", "Annotated"])
        .enter()
        .append("button")
        .style("display", "inline")
        .attr("type", "button")
        .attr("id", d => "btn" + d)
        .attr('class', (d, i) => i ? "btn btn-sm specifiyBtn btn-light" : "btn btn-sm specifiyBtn btn-primary")
        .html(d => d)
        .on("click", function (d, i) {
            let thisBtn = d3.select(this)
            d3.selectAll(".specifiyBtn")
                .classed("btn-light", true)
                .classed("btn-primary", false)
            thisBtn.classed("btn-primary", true)
                .classed("btn-light", false)
            bbox = !!i
            console.log(bbox)

            if (thisImage) {
                updateImage(bbox, thisImage)
            }

        })

    let countClick = 0
    d3.select("#imageSpecified")
        .append("i")
        .attr("class", "fas fa-sync-alt fasIcon rotateBtn")
        .on("click", () => {
            countClick += 90
            image.attr("transform", "rotate("+ countClick + "," + (width/2) + ", " + (height/2) +")")
        })
}

function updateImage(bbox, d) {
    let person = d.split("_")[0]

    d3.select("#image")
        .attr('xlink:href', bbox ? "MC2-Image-Data/" + person + "/" + d + "bbox.jpg" : "MC2-Image-Data/" + person + "/" + d + ".jpg")
    // .attr("opacity", 0)
    // .transition()
    // .duration(100)
    // .attr("opacity", 1)
}

function getPerson(str) {
    // sortedImages = images.sort((a,b) => +a.split("_")[1] - +b.split("_")[1]).sort((a,b) => {
    //     return getPerson(a) - getPerson(b)
    // })
    return +str.split("_")[0].slice(6)
}

