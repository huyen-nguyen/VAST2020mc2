let groups = [], pairsObj = {}, pairsArr = [], occlusionObj = {}, occlusionArr = []

const iouThreshold = 0.4, secondaryThreshold = 0.4

var svg2 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "svg2");

// d3.csv("MC2-Image-Data/Person1/Person1_1.csv", function (error, data) {
//     if (error) throw error;
//     console.log(data)
//
// })

function pairToGroup(pairs, data) {

}

function iou(boxA, boxB) {
    // determine the (x, y)-coordinates of the intersection rectangle
    let xA = d3.max([+boxA.x, +boxB.x]),
        yA = d3.max([+boxA.y, +boxB.y]),
        xB = d3.min([+boxA.x + +boxA.Width, +boxB.x + +boxB.Width]),
        yB = d3.min([+boxA.y + +boxA.Height, +boxB.y + +boxB.Height])

    // compute the area of intersection rectangle
    let interArea = d3.max([0, xB - xA + 1]) * d3.max([0, yB - yA + 1])

    //  compute the area of both the prediction and ground-truth
    let boxAArea = (+boxA.Width) * (+boxA.Height),
        boxBArea = (+boxB.Width) * (+boxB.Height)

    // compute the intersection over union by taking the intersection
    // area and dividing it by the sum of prediction + ground-truth areas - the interesection area

    let iou = interArea / (boxAArea + boxBArea - interArea)

    return {
        boxA: boxA,
        boxB: boxB,
        label: boxA.Label + "_" + boxB.Label,
        iou: +iou.toFixed(5),
    }
}

function boxWithin(boxA, boxB) {
    let interBox = {}

    interBox.x = d3.max([+boxA.x, +boxB.x]);
    interBox.y = d3.max([+boxA.y, +boxB.y]);
    interBox.Width = d3.min([+boxA.x + +boxA.Width, +boxB.x + +boxB.Width]) - interBox.x;
    interBox.Height = d3.min([+boxA.y + +boxA.Height, +boxB.y + +boxB.Height]) - interBox.y

    return {
        bool: !!(compare(boxA, interBox) || compare(boxB, interBox)),
        order: compare(boxA, interBox) ? boxA.Label + "_inside_" + boxB.Label : boxB.Label + "_inside_" + boxA.Label,
    }

    function compare(box1, box2) {
        return (box1.x == box2.x) && (box1.y == box2.y) && (box1.Width == box2.Width) && (box1.Height == box2.Height);
    }
}

d3.csv("data/newData2.csv", function (error, data_) {
    if (error) throw error;
    let imageData = d3.nest().key(d => d.Image).entries(data_)

    let groups = []
    console.log(imageData)

    imageData.forEach((d, i) => {
        let data = d.values;
        let pairsInImage = []

        for (let i = 0; i < data.length; i++) {
            for (let j = i + 1; j < data.length; j++) {
                // Overlap > threshold
                let iouOutput = iou(data[i], data[j]);
                if (iouOutput.iou > iouThreshold) {
                    if (!pairsObj[iouOutput.label]) {
                        pairsObj[iouOutput.label] = 1
                    } else {
                        pairsObj[iouOutput.label] += 1
                    }
                    pairsInImage.push(iouOutput)
                }

                // occlusion

                let occlusion = boxWithin(data[i], data[j]);
                if (occlusion.bool) {
                    if (!occlusionObj[occlusion.order]) {
                        occlusionObj[occlusion.order] = {}
                        occlusionObj[occlusion.order].count = 1
                        occlusionObj[occlusion.order].images = []
                        occlusionObj[occlusion.order].images.push(d.key)
                    } else {
                        occlusionObj[occlusion.order].count += 1
                        occlusionObj[occlusion.order].images.push(d.key)
                    }
                }
            }
        }

        let visited = {}, thisGroup = []
        if (pairsInImage.length > 1) {
            console.log(pairsInImage, d.key)
            // console.log(compareTwoPairs(pairsInImage))
            let pairLabels = pairsInImage.map(d => d.label)
            groups.push(compareGroup(pairLabels))
        }

    })

    console.log(groups)

    let testGroup = [], testObj = {}
    groups.forEach((d, i) => {
        console.log(i)
        d.forEach(e => {
            if (!testObj[e.join("_")]){
                testObj[e.join("_")] = 1;
            }
            else testObj[e.join("_")] += 1
            console.log(e)
        })
    })

    console.log(testObj)
    
    occlusionArr = d3.keys(occlusionObj).map(d => {
        return {
            pairName: d,
            count: occlusionObj[d].count,
            images: occlusionObj[d].images,
        }
    }).sort((a, b) => b.count - a.count)

})

function recursive(data) {
    for (let i = 0; i < data.length; i++) {

    }
}

function compareTwoPairs(pairsInImage) {
    merge = []
    for (let i = 0; i < pairsInImage.length; i++) {
        let pair1 = pairsInImage[i]
        for (let j = i + 1; j < pairsInImage.length; j++) {
            let pair2 = pairsInImage[j]

            if ((pair1.boxA.Label === pair2.boxA.Label) || (pair1.boxB.Label === pair2.boxA.Label)) {
                // match pair
                // merge pair
                let merge = [pair1.boxA.Label, pair1.boxB.Label, pair2.boxB.Label]
            } else if ((pair1.boxA.Label === pair2.boxB.Label) || (pair1.boxB.Label === pair2.boxB.Label)) {

            }

        }
    }

}

function compareGroup(pairLabel) {
    let merge = [], thisMerge
    for (let i = 0; i < pairLabel.length; i++) {
        for (let j = i + 1; j < pairLabel.length; j++) {
            let pair1 = pairLabel[i].split("_"),
                pair2 = pairLabel[j].split("_");

            if (pair1.filter(value => pair2.includes(value)).length > 0) {
                // merge
                thisMerge = [...new Set([...pair1, ...pair2])]
                pairLabel[i] = pairLabel[j] = thisMerge.join("_")
                merge.push(thisMerge)
            }
        }
    }

    return simplifyArray(merge)
}

function simplifyArray(array) {
    let output = JSON.parse(JSON.stringify(array));
    for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i].filter(value => array[j].includes(value)).length > 0) {
                // is sub-array
                if (array[i].length > array[j].length) {
                    output[j] = []
                } else output[i] = []
            }
        }
    }

    return output.filter(d => d.length > 0).map(d => d.sort())
}