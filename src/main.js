// load bibtex file 
/*
async function getData() {
    let bibtexString = ""; //full biblio as a string
    //let file = "https://raw.githubusercontent.com/ithar14/test-file/main/2/bib.bib"
    let file= '/upload-file'

    await fetch(file)
        .then(response => response.text())
        .then(data => {
            bibtexString = data;
            bibJson(bibtexString);
            draw(bibJson(bibtexString));
        })
        .catch(error => {
            console.error('Error loading BibTeX file:', error);
        });

}

getData(); /// execute
*/

let data;

////////////////////////////////////
function readFile(input) {
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
        data = reader.result;
        bibtexString = data;
        bibJson(bibtexString);
        draw(bibJson(bibtexString));
    };

    reader.onerror = function () {
        alert(reader.error);
    };
}

function bibJson(bibtexString) {
    let entryStrings = ""; //each citation 
    entryStrings = bibtexString.trim().split(/@\w+\{[^}]+,/g);
    entryStrings = entryStrings.filter(function (item) { return item !== '' })
    const entries = entryStrings.map(entryString => {
        let fields = entryString.trim().split(/,+\s*\n/)
        return fields.reduce((entry, field) => {
            const match = field.match(/(\w+)\s*=\s*{([^}]*)}/)

            if (match) {
                const fieldName = match[1].toLowerCase()
                const fieldValue = match[2]
                entry[fieldName] = fieldValue;
            }
            return entry;
        }, {});
    });
    const json = JSON.stringify(entries)
    const data = JSON.parse(json);
    return data
}

///////////////////////////////////

function draw(data) {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 300 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var svgYr = d3.select("#Yrviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var widthJr = 300
    heightJr = widthJr
    marginJr = 40
    var radius = Math.min(widthJr, heightJr) / 2 - marginJr
    var svgJr = d3.select("#Jrviz")
        .append("svg")
        .attr("width", widthJr)
        .attr("height", heightJr)
        .append("g")
        .attr("transform", "translate(" + widthJr / 2 + "," + heightJr / 2 + ")");

    const dtYr = Object.entries(YEAR(data)[1]).map(([key, value]) => ({
        key: key,
        value: value
    }));
    var x = d3.scaleBand()
        .range([0, width])
        .domain(dtYr.map(function (d) { return d.key; }))
        .padding(0.2);
    svgYr.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleLinear()
        .domain([0, Math.max(...Object.values(YEAR(data)[1]))])
        .range([height, 0]);
    svgYr.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svgYr.selectAll("mybar")
        .data(dtYr)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", "#69b3a2")


    /////////////////////////////////////////
    Jrreversesort=Object.entries(JOURNAL(data)[1]).sort(function (a, b) { return JOURNAL(data)[1][a] - JOURNAL(data)[1][b] }).reverse();
    const dtJr = JOURNAL(data)[1]
    //const dtJr = Object.fromEntries(Jrreversesort.splice(70, 77))
    
    //Object.fromEntries
    var color = d3.scaleOrdinal()
        .domain(dtJr)
        .range(d3.schemeSet2);

    var pie = d3.pie()
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(dtJr))

    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    svgJr
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    svgJr
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.key })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", widthJr / 30)


    /////////////////AUTHORS/////////////////
    console.log(Object.entries(JOURNAL(data)[1]).sort((a,b) => b[1]-a[1]))
    console.log(AUTHOR(data))

    keysSorted = Object.keys(AUTHOR(data)[1]).sort(function (a, b) { return AUTHOR(data)[1][a] - AUTHOR(data)[1][b] }).reverse()
    document.getElementById("Top").innerHTML = "Top Authors:"
    var x = document.createElement("OL");
    x.setAttribute("id", "myOl");
    document.getElementById('Ath').appendChild(x);

    for (let i = 0; i < 5; i++) {
        var y = document.createElement("LI");
        var t = document.createTextNode(Object.values(keysSorted)[i]);
        y.appendChild(t);
        document.getElementById("myOl").appendChild(y);
    }
}


function YEAR(d) {
    let Yr = []; //years from JSON
    let Yrs = []; // min +++ max Yr
    let counts = {};
    for (let i = 0; i < d.length; i++) {
        Yr.push(Number(d[i].year));
    }

    for (let i = Math.min(...Yr) - 1; i < Math.max(...Yr); i++) {
        Yrs.push(i + 1);
    }
    Yrs.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 0;
    });
    Yr.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
    });
    return [Yrs, counts];
}

function JOURNAL(d) {
    let Jr = []; //years from JSON
    let counts = {};
    for (let i = 0; i < d.length; i++) {
        Jr.push(d[i].journal);
    }
    Jr.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
    });
    return [Jr, counts];
}


function AUTHOR(d) {
    let Ath = [];
    let counts = {};
    let AuthStrings = [];

    for (let i = 0; i < d.length; i++) {
        if ('author' in d[i]) {
            AuthStrings = d[i].author.trim().split(/.and./);
            for (let j = 0; j < AuthStrings.length; j++) {
                Ath.push(AuthStrings[j]);
            };
        }
    };

    Ath.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
    });
    return [Ath, counts];
}

