function build_line_chart_1(){
    line_chart_1_svg = d3.select("svg#line_chart1");
    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_1_svg.style("height").slice(0, -2));
    var padding = 50;
    var xscaleData = dataset_brands.map((a) => a['Year'])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a,b) => a - b);

    var xscale = d3.scalePoint()
        .domain(xscaleData)
        .range([padding, svg_width - padding]);

    var hscale = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['# Models'];
            }),
        ])
        .range([svg_height - padding, padding]);

    var g = line_chart_1_svg.append("g")
    brands_list.forEach(function(brand) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Year']))
                .y(datum => hscale(datum['# Models'])))
    }) 

    var yaxis = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    line_chart_1_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + padding + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .call(yaxis);

    line_chart_1_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - svg_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Models Developed");
    
    var xscaleDataFiltered = xscaleData.filter(function (d, i) {
        if (i % 5 == 0) return d;
    });
    
    var xaxis = d3.axisBottom() // we are creating a d3 axis
        .scale(xscale) // we are adding our padding
        .tickValues(xscaleDataFiltered)
        .tickSizeOuter(0);
        
    line_chart_1_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);
    
      // text label for the x axis
    line_chart_1_svg.append("text")
        .attr(
          "transform",
          "translate(" + svg_width / 2 + " ," + (svg_height - padding / 3) + ")"
        )
        .attr("class", "label")
        .text("Year");                
}

function build_line_chart_2(){
    line_chart_2_svg = d3.select("svg#line_chart2");
    var svg_width = parseInt(line_chart_2_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_2_svg.style("height").slice(0, -2));
    var padding = 50;
    var xscaleData = dataset_brands.map((a) => a['Year'])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a,b) => a - b);

    var xscale = d3.scalePoint()
        .domain(xscaleData)
        .range([padding, svg_width - padding]);

    var hscale = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['Sales'];
            }),
        ])
        .range([svg_height - padding, padding]);

    var g = line_chart_2_svg.append("g")
    brands_list.forEach(function(brand) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Year']))
                .y(datum => hscale(datum['Sales'])))
    }) 

    var yaxis = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    line_chart_2_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + padding + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .call(yaxis);

    line_chart_2_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - svg_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Sales");
    
    var xscaleDataFiltered = xscaleData.filter(function (d, i) {
        if (i % 5 == 0) return d;
    });
    
    var xaxis = d3.axisBottom() // we are creating a d3 axis
        .scale(xscale) // we are adding our padding
        .tickValues(xscaleDataFiltered)
        .tickSizeOuter(0);
        
    line_chart_2_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);
    
      // text label for the x axis
    line_chart_2_svg.append("text")
        .attr(
          "transform",
          "translate(" + svg_width / 2 + " ," + (svg_height - padding / 3) + ")"
        )
        .attr("class", "label")
        .text("Year");                
}