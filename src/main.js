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
  entryStrings = entryStrings.filter(function (item) {
    return item !== "";
  });
  const entries = entryStrings.map((entryString) => {
    let fields = entryString.trim().split(/,+\s*\n/);
    return fields.reduce((entry, field) => {
      const match = field.match(/(\w+)\s*=\s*{([^}]*)}/);

      if (match) {
        const fieldName = match[1].toLowerCase();
        const fieldValue = match[2];
        entry[fieldName] = fieldValue;
      }
      return entry;
    }, {});
  });
  const json = JSON.stringify(entries);
  const data = JSON.parse(json);
  return data;
}

///////////////////////////////////

function draw(data) {
  let topFive = 5;
  // set the dimensions and margins of the graph
  var svgYrht = document.getElementById("Yrviz");
  var marginYr = { top: 30, right: 30, bottom: 30, left: 30 };
  var wid = Object.keys(YEAR(data)[1]).length * 10;
  svgYrht.setAttribute("width", `${wid}`);
  if (wid > 300) {
    console.log(svgYrht.getBoundingClientRect().width);
    var widthYr = wid - marginYr.left - marginYr.right;
    var heightYr = 300 - marginYr.top - marginYr.bottom;
  } else {
    svgYrht.setAttribute("width", "300px");
    var widthYr = 300 - marginYr.left - marginYr.right;
    var heightYr = 300 - marginYr.top - marginYr.bottom;
  }
  //console.log(Object.keys(YEAR(data)[1]).length)
  var svgYr = d3
    .select("#Yrviz")
    .append("svg")
    .attr("width", widthYr + marginYr.left + marginYr.right)
    .attr("height", heightYr + marginYr.top + marginYr.bottom)
    .append("g")
    .attr("transform", "translate(" + marginYr.left + "," + marginYr.top + ")");

  var widthJr = 300;
  heightJr = widthJr;
  marginJr = 20;
  var radius = Math.min(widthJr, heightJr) / 2 - marginJr;
  var svgJr = d3
    .select("#Jrviz")
    .append("svg")
    .attr("width", widthJr)
    .attr("height", heightJr)
    .append("g")
    .attr("transform", "translate(" + widthJr / 2 + "," + heightJr / 2 + ")");
  //////////////////////////////////////////////////
  const dtYr = Object.entries(YEAR(data)[1]).map(([key, value]) => ({
    key: key,
    value: value,
  }));
  var x = d3
    .scaleBand()
    .range([0, widthYr])
    .domain(
      dtYr.map(function (d) {
        return d.key;
      })
    )
    .padding(0.2);
  svgYr
    .append("g")
    .attr("transform", "translate(0," + heightYr + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,8)rotate(-90)")
    .style("text-anchor", "end");

  // Y axis
  var y = d3
    .scaleLinear()
    .domain([0, Math.max(...Object.values(YEAR(data)[1]))])
    .range([heightYr, 0]);
  svgYr.append("g").call(d3.axisLeft(y));

  // Bars
  svgYr
    .selectAll("mybar")
    .data(dtYr)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.key);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return heightYr - y(d.value);
    })
    .attr("fill", "#D9D9D9");

  document.getElementById("TopYr").innerHTML = "Year";

  /////////////////////////////////////////
  Jrreversesort = Object.entries(JOURNAL(data)[1]).sort((a, b) => b[1] - a[1]);
  const dtJr = Object.fromEntries(Jrreversesort.slice(0, topFive));
  console.log(dtJr);
  //Object.fromEntries
  var color = d3
    .scaleOrdinal()
    .domain(dtJr)
    .range(
      [
        "#ffffff",
        "#f1f1f1",
        "#dedede",
        "#c6c6c6",
        "#a7a7a7",
        "#878787",
        "#686868",
        "#474747",
        "#222222",
        "#000000",
      ].reverse()
    );

  var pie = d3.pie().value(function (d) {
    return d.value;
  });
  var data_ready = pie(d3.entries(dtJr));

  var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

  svgJr
    .selectAll("whatever")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", function (d) {
      return color(d.data.key);
    })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  svgJr
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("text")
    .text(function (d) {
      return d.data.key;
    })
    .attr("transform", function (d) {
      return "translate(" + arcGenerator.centroid(d) + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", widthJr / 30);

  document.getElementById("TopJr").innerHTML = "Top Journals";
  /////////////////AUTHORS/////////////////
  //console.log(Object.entries(JOURNAL(data)[1]).sort((a,b) => b[1]-a[1]))

  keysSorted = Object.keys(AUTHOR(data)[1])
    .sort(function (a, b) {
      return AUTHOR(data)[1][a] - AUTHOR(data)[1][b];
    })
    .reverse();
  document.getElementById("TopAth").innerHTML = "Top Authors:";
  var x = document.createElement("OL");
  x.setAttribute("id", "myOl");
  document.getElementById("Ath").appendChild(x);
  let LastFirst = [];
  for (let i = 0; i < keysSorted.length; i++) {
    LastFirst.push(keysSorted[i].trim().split(/,\s/));
  }

  for (let i = 0; i < topFive; i++) {
    var y = document.createElement("LI");
    //var t = document.createTextNode(Object.values(keysSorted)[i]);
    var t = document.createTextNode(LastFirst[i][1] + " " + LastFirst[i][0]);
    y.appendChild(t);
    document.getElementById("myOl").appendChild(y);
  }

  //esc action
  document.body.onkeyup = function (e) {
    if (e.keyCode == 27) {
      //clear canvas
      document.getElementById("readfile").value = null;

      document.getElementById("TopYr").innerHTML = "";
      svgYr.selectAll("*").remove();

      document.getElementById("TopJr").innerHTML = "";
      svgJr.selectAll("*").remove();

      document.getElementById("TopAth").innerHTML = "";
      var rem = document.getElementById("myOl");
      rem.remove();

      //hide "press esc"
      console.log(document.getElementById("readfile").files.length !== 0);
      var esc = document.getElementById("press-esc");
      if (document.getElementById("readfile").files.length == 0) {
        esc.style.visibility = "hidden";
      }
    }
  };
  console.log(document.getElementById("readfile").files.length !== 0);
  var esc = document.getElementById("press-esc");
  if (document.getElementById("readfile").files.length !== 0) {
    esc.style.visibility = "visible";
  } else {
    esc.style.visibility = "hidden";
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
    if ("author" in d[i]) {
      AuthStrings = d[i].author.trim().split(/.and./);
      for (let j = 0; j < AuthStrings.length; j++) {
        Ath.push(AuthStrings[j]);
      }
    }
  }

  Ath.forEach(function (x) {
    counts[x] = (counts[x] || 0) + 1;
  });
  return [Ath, counts];
}
