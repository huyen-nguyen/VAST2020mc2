let main = "#mainDiv"
let allData;
let imageSelectionSize = {width: 300, eachHeight: 35}
let labelSelectionSize = {width: 200}

let imagesPerPage = 15, currentPage = 1;

let imageDisplaySize = {top: 10, right: 30, bottom: 40, left: 30},
    width = 1000 - imageDisplaySize.left - imageDisplaySize.right,
    height = 830 - imageDisplaySize.top - imageDisplaySize.bottom;

let imageSize = {width: 800, height: 800}

let controlPanelSize = {height: 60}

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


drawImageSelection()
showImage()
function drawImageSelection() {
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
            console.log(d)
            let person = d.split("_")[0]
            d3.select("#image")
                .attr('xlink:href', "MC2-Image-Data/" + person + "/" + d + ".jpg")
        })

    let bottomDiv = imageSelectionDiv.append("div")
        .attr("class", "switchPage")

    bottomDiv
        .append("i")
        .attr("class", "fas fa-chevron-circle-left arrowTurnPage")
        .style("left", "10px")

    let pageNumber = bottomDiv.append("span")
        .html("Page " + currentPage + " of " + Math.ceil(images.length / imagesPerPage))
        .style("position", "absolute")
        .style("left", "35%")

    bottomDiv
        .append("i")
        .attr("class", "fas fa-chevron-circle-right arrowTurnPage")
        .style("right", "10px")

}

function drawLabelSelection() {

}

function showImage(){
    let imageDisplaySvg = imageDisplayDiv.append("svg")
        .attr("width", width + imageDisplaySize.left + imageDisplaySize.right)
        .attr("height", height + imageDisplaySize.top + imageDisplaySize.bottom)
        .attr("class", "svgImageDisplay")
        .append("g")

    let image = imageDisplaySvg.append('image')
        .attr("id", "image")
        .attr("width", imageSize.width)
        .attr("height", imageSize.height)
}
function getPerson(str) {
    // sortedImages = images.sort((a,b) => +a.split("_")[1] - +b.split("_")[1]).sort((a,b) => {
    //     return getPerson(a) - getPerson(b)
    // })
    return +str.split("_")[0].slice(6)
}

