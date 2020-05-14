let main = "#mainDiv"
let allData;
let imageSelection = {width: 300, eachHeight: 40}
let labelSelection = {width: 200}

let imagesPerPage = 15, currentPage = 1;

let imageSelectionDiv = d3.select(main).append('div')
    .attr("id", "imageSelection")
    .attr("class", "boxBlock")
    .style("width", imageSelection.width + "px")

let labelSelectionDiv = d3.select(main).append("div")
    .attr("id", "labelSelection")
    .attr("class", "boxBlock")
    .style("width", labelSelection.width + "px")

d3.csv("data/newData2.csv", function (error, data_) {
    if (error) throw error;
    allData = data_;
    console.log(allData)

    let chunks = array_chunks(images, imagesPerPage)
    imageSelectionDiv.selectAll(".image-selection")
        .data(chunks[currentPage-1])
        .enter()
        .append("div")
        .attr("class", "image-selection")
        .text(d => d + "jpg")

})


function getPerson(str){
    // sortedImages = images.sort((a,b) => +a.split("_")[1] - +b.split("_")[1]).sort((a,b) => {
    //     return getPerson(a) - getPerson(b)
    // })
    return +str.split("_")[0].slice(6)
}

const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));