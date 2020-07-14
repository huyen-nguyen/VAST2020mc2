let groups = [], pairsObj = {}, pairsArr = [], occlusionObj = {}, occlusionArr = []
let occlusion;
const iouThreshold = 0.5, secondaryThreshold = 0.4

// var svg2 = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + margin.left + "," + margin.top + ")")
//     .attr("id", "svg2");

// d3.csv("MC2-Image-Data/Person1/Person1_1.csv", function (error, data) {
//     if (error) throw error;
//     console.log(data)
//
// })

let globalObj3 = {}

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

d3.csv("data/newData2.csv", function (error, predData) {
    if (error) throw error;
    // console.log("predData: ", predData)
    let imagePredData = d3.nest().key(d => d.Image).entries(predData)

    let groups = []

    imagePredData.forEach((d, i) => {
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

        if (pairsInImage.length > 1) {
            let pairLabels = pairsInImage.map(d => {
                return {
                    label: d.label,
                    image: d.boxA.Image
                }
            })
            let outputCompare = compareGroup(pairLabels)
            groups.push(outputCompare)

        }

    })

    // console.log(groups)

    let groupObj = {}
    groups.forEach((d, i) => {
        // console.log(i)
        d.groups.forEach(e => {
            if (!groupObj[e.join("_")]){
                groupObj[e.join("_")] = {};
                groupObj[e.join("_")].count = 1;
                groupObj[e.join("_")].images = [];
                groupObj[e.join("_")].images.push(d.image)
            }
            else {
                groupObj[e.join("_")].count += 1;
                groupObj[e.join("_")].images.push(d.image)
            }

            // console.log(e)
        })
    })

    // console.log(groupObj)
    // console.log(occlusionObj)

    let groupArr = objToArr(groupObj).filter(d => d.images.length > 1)
    console.log("Groups: ", groupArr)
    console.log("Occlusion: ",objToArr(occlusionObj))

    occlusion = objToArr(occlusionObj).slice(0,20)

    console.log(occlusion)

//    --------------------- end analysis of prediction set ---------------------
})
    d3.csv("data/labels.csv", function (error, truthData) {
        if (error) throw error
        console.log("truthData: ", truthData)
        // let imageTruthData = d3.nest().key(d => d.Image).entries(truthData)

        // let groupedByPerson = d3.nest().key(d => d.Person).entries(truthData)
        // console.log(groupedByPerson)

        // let arr = [], obj = {}

        let imagePredData = d3.nest().key(d => d.Image).entries(truthData)

        let groups = []

        imagePredData.forEach((d, i) => {
            let data = d.values;
            let pairsInImage = []

            for (let i = 0; i < data.length; i++) {
                for (let j = i + 1; j < data.length; j++) {
                    pairsInImage.push({
                        label: data[i].Object + "_" + data[j].Object,
                        boxA: data[i]
                    })
                }
            }

            if (pairsInImage.length > 1) {
                let pairLabels = pairsInImage.map(d => {
                    return {
                        label: d.label,
                        image: d.boxA.Image
                    }
                })
                let outputCompare = compareGroup(pairLabels)
                groups.push(outputCompare)

            }

        })

        // console.log(groups)

        let groupObj = {}
        groups.forEach((d, i) => {
            // console.log(i)
            d.groups.forEach(e => {
                if (!groupObj[e.join("_")]){
                    groupObj[e.join("_")] = {};
                    groupObj[e.join("_")].count = 1;
                    groupObj[e.join("_")].images = [];
                    groupObj[e.join("_")].images.push(d.image)
                }
                else {
                    groupObj[e.join("_")].count += 1;
                    groupObj[e.join("_")].images.push(d.image)
                }

                // console.log(e)
            })
        })

        console.log(groupObj)
        // console.log(occlusionObj)

        let groupArr = objToArr(groupObj).filter(d => d.images.length > 1)
        console.log("Groups: ", groupArr)
        console.log("Occlusion: ",objToArr(occlusionObj))

        occlusion = objToArr(occlusionObj)


        // console.log(imagePredData)
        // console.log(imageTruthData)
        //
        // let globalObj = {}, globalObj2 = {};
        // imageTruthData.forEach(d => {
        //     // same key means same image looked at
        //     let truthArr = d.values
        //     let corresp = imagePredData.find(e => e.key === d.key)
        //     // console.log(d.key,  "pred: ", corresp? corresp.values : "not found", "truth: ", d.values,)
        //
        //     if (corresp) {
        //         corresp.values.forEach(p => {
        //             truthArr.forEach(t => {
        //                 if (!globalObj[p.Label + "_" + t.Object]) {
        //                     globalObj[p.Label + "_" + t.Object] = {}
        //                     globalObj[p.Label + "_" + t.Object].count = 1
        //                     globalObj[p.Label + "_" + t.Object].images = []
        //                     globalObj[p.Label + "_" + t.Object].images.push(d.key)
        //                     globalObj[p.Label + "_" + t.Object].scores = []
        //                     globalObj[p.Label + "_" + t.Object].scores.push(+p.Score)
        //                 }
        //                 else {
        //                     globalObj[p.Label + "_" + t.Object].count += 1
        //                     globalObj[p.Label + "_" + t.Object].images.push(d.key)
        //                     globalObj[p.Label + "_" + t.Object].scores.push(+p.Score)
        //                 }
        //
        //                 // other structure
        //                 if (!globalObj2[p.Label]) {
        //                     globalObj2[p.Label] = {}
        //                     globalObj2[p.Label][t.Object] = 1
        //                 }
        //                 else if (!globalObj2[p.Label][t.Object]) {
        //                     globalObj2[p.Label][t.Object] = 1
        //                 }
        //                 else {
        //                     globalObj2[p.Label][t.Object] += 1
        //                 }
        //             })
        //         })
        //     }
        // })
        //
        // d3.keys(globalObj2).forEach(d => {
        //     globalObj3[d] = []
        //     globalObj3[d] = d3.keys(globalObj2[d]).map(e => {
        //         return {
        //             des: e,
        //             count: globalObj2[d][e]
        //         }
        //     }).sort((a,b) => +b.count - +a.count)
        // })
        //
        // console.log(globalObj)
        // console.log(globalObj3)
        // console.log(objToArr(globalObj))

    })


d3.csv("data/labels.csv", function (error, truthData) {
    if (error) throw error
    console.log("truthData: ", truthData)
    // let imageTruthData = d3.nest().key(d => d.Image).entries(truthData)

    let groupedByPerson = d3.nest().key(d => d.Person).key(d => d.Object)
        .entries(truthData)
        .sort((a,b) => +a.key.slice(6) - +b.key.slice(6))
    console.log(groupedByPerson)

    let arr = [], obj = {}, objPerson = {}

    for (let i = 0; i < groupedByPerson.length; i++){
        for (let j = i+1; j < groupedByPerson.length; j ++){
            if (i !== j){
                let array1 = groupedByPerson[i].values.map(d => d.key);
                let array2 = groupedByPerson[j].values.map(d => d.key);
                let intersect = array1.filter(value => array2.includes(value)).sort().filter(d => d !== "none")
                if (intersect.length > 0){
                    objPerson[groupedByPerson[i].key + "_" + groupedByPerson[j].key] = intersect.length
                    if (intersect.length > 1){
                        for (let m = 0; m < intersect.length-1; m ++){
                            for (let n = m+1; n < intersect.length; n++){
                                if (!obj[intersect[m] + "_" + intersect[n]]){
                                    obj[intersect[m] + "_" + intersect[n]] = {}
                                    obj[intersect[m] + "_" + intersect[n]][groupedByPerson[i].key] = true;
                                    obj[intersect[m] + "_" + intersect[n]][groupedByPerson[j].key] = true;
                                }
                                else {
                                    obj[intersect[m] + "_" + intersect[n]][groupedByPerson[i].key] = true;
                                    obj[intersect[m] + "_" + intersect[n]][groupedByPerson[j].key] = true;                                }
                            }
                        }
                    }

                }
            }
        }
    }

    console.log(obj)

    d3.keys(obj).forEach(d => {
        let [source, target] = d.split("_")
        arr.push({
            "source": source,
            "target": target,
            "value": d3.keys(obj[d]).length
        })
    })
    console.log(arr)

    let arr2 = []
    console.log(objPerson)

    d3.keys(objPerson).forEach(d => {
        let [source, target] = d.split("_")
        arr2.push({
            "source": source,
            "target": target,
            "value": objPerson[d]
        })
    })

    console.log(arr2)

    // truthData.forEach(d => {
    //     if (d.Object !== "none"){
    //         if (!obj[d.Person + "_" + d.Object]){
    //             obj[d.Person + "_" + d.Object] = 1
    //         }
    //         else {
    //             obj[d.Person + "_" + d.Object] += 1
    //         }
    //     }
    // })
    // console.log(obj)
    // d3.keys(obj).forEach(d => {
    //     let [Person, Object] = d.split("_")
    //     arr.push({
    //         "source": Person,
    //         "target": Object,
    //         "value": obj[d]
    //     })
    // })
    //
    // console.log(arr)
})

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

function objToArr(obj){
    return d3.keys(obj).map(d => {
        return {
            name: d,
            count: obj[d].count,
            images: obj[d].images,
        }
    }).sort((a, b) => b.count - a.count)
}

function compareGroup(pairLabelInput) {
    let pairLabel = pairLabelInput.map(d => d.label)
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

    return {
        groups: simplifyArray(merge),
        image: pairLabelInput[0].image
    }
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

function getRecommend(array) {
    let labels = array.map(d => d.Label)

    console.log(globalObj3)

    let bigArr = [], obj = {}
    labels.forEach(d => {
        bigArr = bigArr.concat(globalObj3[d])
    })

    console.log(bigArr)

    bigArr.forEach(d => {
        if (!obj[d.des]){
            obj[d.des] = {}
            obj[d.des].occurence = 1
            obj[d.des].count = d.count
        }
        else {
            obj[d.des].occurence += 1
            obj[d.des].count += d.count
        }
    })

    console.log(objToArr2(obj))
    return objToArr2(obj).slice(0,10).map(d => d.name).map(d => {
        return {
            Label: d
        }
    })

}

function objToArr2(obj){
    return d3.keys(obj).map(d => {
        return {
            name: d,
            count: obj[d].count,
            occurence: obj[d].occurence,
        }
    }).sort((a, b) => b.occurence - a.occurence)
}