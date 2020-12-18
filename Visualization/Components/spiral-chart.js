const PERIODS_AVAILABLE = [
    {"display": "1 Sem", "months": 6, "div": 6, "by": "month"},
    {"display": "1 Year", "months": 12, "div": 12, "by": "month"},
    {"display": "2 Years", "months": 24, "div": 8, "by": "quarter"},
    {"display": "3 Years", "months": 36, "div": 12, "by": "quarter"},
    {"display": "4 Years", "months": 48, "div": 8, "by": "semester"},
]
var spiral_chart_svg
var selected_period_months = PERIODS_AVAILABLE[2]
var spiral_color_scale
var spiral_heatmap
var dataset_spiral_chart

function build_spiral_chart() {
    spiral_chart_svg = d3.select("svg#spiral_chart");
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));

    const margin = { "top": 0, "bottom": 20, "left": 20, "right": 20 }
    const chartRadius = svg_height / 2 - margin.bottom;

    dataset_spiral_chart = treatDataset();
    addColorScale(d3.extent(dataset_spiral_chart, datum => datum["Models"]), d3.rgb(153, 204, 255), d3.rgb(0, 76, 153));

    //set the options for the sprial heatmap
    spiral_heatmap = spiralHeatmap()
        .radius(chartRadius)
        .holeRadiusProportion(0)
        .arcsPerCoil(selected_period_months['div'])
        .coilPadding(0.05);

    const g = spiral_chart_svg.append("g")
        .attr("id", "spiral_group")
        .attr("transform", "translate(" + 
            (svg_width / 2) + "," + 
            (svg_height / 2 - margin.bottom + margin.top) + ")");

    g.datum(dataset_spiral_chart)
        .call(spiral_heatmap);

    g.selectAll(".arc").selectAll("path")
        .style("fill", datum => spiral_color_scale(datum["Models"]))
        .on("mouseover", (event, datum) => dispatch.call("hover_spiral_chart", this, event, datum))
        .on("mouseout", (event, datum) => dispatch.call("hover_remove_spiral_chart", this, event, datum));
    
    spiral_chart_svg.append("text")
            .attr("x", svg_width * 0.97)
            .attr("y", svg_height * 0.05)
            .attr("dominant-baseline", "middle")
            .attr("dy", ".35em")
            .attr("class", "text_module_title text_left")
            .text("Number of Models");

    addPeriodSelection();
    addErrorMessage();
    createTooltipSpiralChart();
}

function spiralHeatmap () {
    // constants
    const radians = 0.0174532925
    // Default values
    var radius = 250
    var holeRadiusProportion = 0.3
    var arcsPerCoil = 12
    var coilPadding = 0 
    var arcLabel = ''
    var coilLabel = ''
  
    function chart (selection) {
      selection.each(function (data) {
        updatePathData(data)
  
        var thisSelection = d3
          .select(this)
          .append('g')
          .attr('class', 'spiral-heatmap')
  
        var arcs = thisSelection.selectAll('.arc')
          .data(data).enter()
          .append('g')
          .attr('class', 'arc');
  
        arcs.append('path').attr('d', function (d) {
          // start at vertice 1
          var start = 'M ' + d.x1 + ' ' + d.y1
          // inner curve to vertice 2
          var side1 = ' Q ' + d.controlPoint1x + ' ' + d.controlPoint1y + ' ' + d.x2 + ' ' + d.y2
          // straight line to vertice 3
          var side2 = 'L ' + d.x3 + ' ' + d.y3
          // outer curve vertice 4
          var side3 = ' Q ' + d.controlPoint2x + ' ' + d.controlPoint2y + ' ' + d.x4 + ' ' + d.y4
          return start + ' ' + side1 + ' ' + side2 + ' ' + side3 + ' Z'
        })
      })
  
      function updatePathData (data) {
        var holeRadius = radius * holeRadiusProportion
        var arcAngle = 360 / arcsPerCoil
        var dataLength = data.length
        var coils = Math.ceil(dataLength / arcsPerCoil)
        var coilWidth = radius * (1 - holeRadiusProportion) / (coils + 1)
  
        data.forEach(function (d, i) {
          var coil = Math.floor(i / arcsPerCoil)
          var position = i - coil * arcsPerCoil
          var startAngle = position * arcAngle
          var endAngle = (position + 1) * arcAngle
          var startInnerRadius = holeRadius + i / arcsPerCoil * coilWidth
          var startOuterRadius = holeRadius + i / arcsPerCoil * coilWidth + coilWidth * (1 - coilPadding)
          var endInnerRadius = holeRadius + (i + 1) / arcsPerCoil * coilWidth
          var endOuterRadius = holeRadius + (i + 1) / arcsPerCoil * coilWidth + coilWidth * (1 - coilPadding)
  
          // vertices of each arc
          d.x1 = x(startAngle, startInnerRadius)
          d.y1 = y(startAngle, startInnerRadius)
          d.x2 = x(endAngle, endInnerRadius)
          d.y2 = y(endAngle, endInnerRadius)
          d.x3 = x(endAngle, endOuterRadius)
          d.y3 = y(endAngle, endOuterRadius)
          d.x4 = x(startAngle, startOuterRadius)
          d.y4 = y(startAngle, startOuterRadius)
  
          // CURVE CONTROL POINTS
          var midAngle = startAngle + arcAngle / 2
          var midInnerRadius =
            holeRadius + (i + 0.5) / arcsPerCoil * coilWidth
          var midOuterRadius =
            holeRadius +
            (i + 0.5) / arcsPerCoil * coilWidth +
            coilWidth * (1 - coilPadding)
  
          // MID POINTS, WHERE THE CURVE WILL PASS THRU
          d.mid1x = x(midAngle, midInnerRadius)
          d.mid1y = y(midAngle, midInnerRadius)
          d.mid2x = x(midAngle, midOuterRadius)
          d.mid2y = y(midAngle, midOuterRadius)
  
          d.controlPoint1x = (d.mid1x - 0.25 * d.x1 - 0.25 * d.x2) / 0.5
          d.controlPoint1y = (d.mid1y - 0.25 * d.y1 - 0.25 * d.y2) / 0.5
          d.controlPoint2x = (d.mid2x - 0.25 * d.x3 - 0.25 * d.x4) / 0.5
          d.controlPoint2y = (d.mid2y - 0.25 * d.y3 - 0.25 * d.y4) / 0.5
  
          d.arcNumber = position
          d.coilNumber = coil
        })
  
        return data
      }
  
      function x (angle, radius) {
        return radius * Math.sin((360 - angle + 180) * radians)
      }
  
      function y (angle, radius) {
        return radius * Math.cos((360 - angle + 180) * radians)
      }
    }
  
    chart.radius = function (value) {
      if (!arguments.length) return radius
      radius = value
      return chart
    }
  
    chart.holeRadiusProportion = function (value) {
      if (!arguments.length) return holeRadiusProportion
      holeRadiusProportion = value
      return chart
    }
  
    chart.arcsPerCoil = function (value) {
      if (!arguments.length) return arcsPerCoil
      arcsPerCoil = value
      return chart
    }
  
    chart.coilPadding = function (value) {
      if (!arguments.length) return coilPadding
      coilPadding = value
      return chart
    }
  
    chart.arcLabel = function (value) {
      if (!arguments.length) return arcLabel
      arcLabel = value
      return chart
    }
  
    chart.coilLabel = function (value) {
      if (!arguments.length) return coilLabel
      coilLabel = value
      return chart
    }
    
    chart.startAngle = function (value) {
      if (!arguments.length) return startAngle
      startAngle = value
      return chart
    }
  
    return chart
}

function treatDataset() {
    var groupBy = selected_period_months['by'];

    var filteredDataset = [];
    if (selected_brands.length == 0) filteredDataset = dataset_models;
    else filteredDataset = dataset_models.filter(elem => selected_brands.includes(elem['Brand']));

    var finalDataset = []
    for (var year = start_date.getFullYear(); year <= end_date.getFullYear(); year ++) {
        var step;
        if (groupBy == 'month') step = 1;
        else if (groupBy == 'quarter') step = 3;
        else if (groupBy == 'semester') step = 6;

        for (var month = 0; month < 12; month += step)
            finalDataset.push({'Date': new Date(year, month, 1), 'Models': 0});
            // finalDataset.push({'Date': new Date(year, month, 1), 'Year': year, 'Month': month, 'Models': 0});
    }
    
    filteredDataset.forEach(function(elem) {
        var month = undefined;
        var year = elem['Date'].getFullYear();
        
        if (groupBy == 'month') month = elem['Date'].getMonth();
        else if (groupBy == 'quarter') month = Math.floor(elem['Date'].getMonth() / 3) * 3;
        else if (groupBy == 'semester') month = Math.floor(elem['Date'].getMonth() / 6) * 6;
        
        var date = new Date(year, month, 1)
        var item = finalDataset.find(elem2 => elem2['Date'].getTime() == date.getTime());
        var push_elem = {'Date': date, 'Models': 1};

        if (item == undefined) console.log("Something went wrong!")
        else item['Models'] += 1;
    })

    var sortedFinalDataset = finalDataset.sort((a, b) => a['Date'] - b['Date'])

    for (var i = sortedFinalDataset.length - 1; i >= 0; i--) {
        if (sortedFinalDataset[i]['Models'] == 0) sortedFinalDataset.pop();
        else break;
    }

    // console.log(sortedFinalDataset);
    return sortedFinalDataset;
}

function addColorScale(datum ,startColor, endColor) {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const WIDTH = svg_width / 40
    const HEIGHT = svg_height * 0.50

    spiral_color_scale = d3.scaleLinear().range([startColor, endColor]);
    spiral_color_scale.domain(datum);

    var defs = spiral_chart_svg.append("defs");

    var linearGradient = defs.append("linearGradient")
        .attr("id", "linearGradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");
    
    linearGradient.append("stop")
        .attr("offset", 0)
        .attr("stop-color", startColor);
    linearGradient.append("stop")
        .attr("offset", 1)
        .attr("stop-color", endColor);

    var scale_g = spiral_chart_svg.append("g");

    scale_g.append("rect")
        .attr("x", svg_width - (svg_width / 10 + WIDTH))
        .attr("y", svg_height * 2 / 5 - HEIGHT / 3)
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("fill", "url(#linearGradient)");

    scale_g.append("text")
        .attr("class", "spiral_scale_number")
        .attr("id", "bottom_spiral_scale")
        .attr("x", svg_width - (svg_width / 10 + WIDTH / 2))
        .attr("y", svg_height * 2 / 5 + HEIGHT * 2 / 3 + svg_height * 0.06)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size","0.75em")
        .text(datum[0]);
    scale_g.append("text")
        .attr("class", "spiral_scale_number")
        .attr("id", "top_spiral_scale")
        .attr("x", svg_width - (svg_width / 10 + WIDTH / 2))
        .attr("y", svg_height * 2 / 5 - HEIGHT / 3 - svg_height * 0.06)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size","0.75em")
        .text(datum[1]);
}

function addPeriodSelection() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));

    const LINE_WIDTH = svg_width * 0.75;
    const step = LINE_WIDTH / (PERIODS_AVAILABLE.length - 1);

    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));

    var axis = spiral_chart_svg.append("g").attr("class", "axis");
    axis.append("path")
        .classed("selection_axis", true)
        .attr("d", d3.line()([[0 - 5, 0], [LINE_WIDTH + 5, 0]]))
    
    PERIODS_AVAILABLE.forEach(function(elem, index) {
        var tick = axis.append("g");
        tick.append("circle")
            .attr("class", "circle_point_axis")
            .attr("cx", step * index)
            .attr("cy", 0)
            .attr("r", 3);
        tick.append("text")
            .attr("class", "text_axis_ticks middle")
            .attr("x", step * index)
            .attr("y", svg_height / 11)
            .attr("dominant-baseline", "middle")
            .text(elem['display']);

    });
    axis.attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + svg_height * 0.88 + ")");

    axis.append("circle")
        .attr("cx", PERIODS_AVAILABLE.findIndex(elem => elem == selected_period_months) * step)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("id", "period_circle")
        .attr("class", "circle_selector draggable");

    prepare_event_period_selection();
}

function addErrorMessage() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const WIDTH = svg_width * 0.50;
    const HEIGHT = svg_height * 0.50;

    var errorMessage = spiral_chart_svg.append("g")
        .attr("class", "ErrorMessage hidden");
    
    errorMessage.attr("transform", "translate(" + (svg_width - WIDTH) / 2 + ", " + (svg_height - HEIGHT) / 2 + ")");

    errorMessage.append("rect")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("fill", "white")
        .attr("stroke-width", 1)
        .attr("rx", 15)
        .attr("ry", 15)
        .attr("stroke", "black");

    var errorText = errorMessage.append("g")
        .attr("class", "ErrorText");
    
    errorText.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("font-family", "Verdana, Geneva, Tahoma, sans-serif")
        .text("Select a period of time big enough for at least one revolution!")
        .call(wrap, WIDTH * 0.90);

    var errorTextHeight = errorText.node().getBoundingClientRect().height;
    errorText.attr("transform", "translate(" + WIDTH / 2 + ", " + (HEIGHT - errorTextHeight) / 2 + ")");
}

function prepare_event_period_selection() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    const LINE_WIDTH = svg_width * 0.75;

    function dragged(event, datum) {
        var new_x = event.x;
        const step = LINE_WIDTH / (PERIODS_AVAILABLE.length - 1);
        
        var index = Math.round(new_x / step);
        if (index > PERIODS_AVAILABLE.length - 1) index = PERIODS_AVAILABLE.length - 1;
        else if (index < 0) index = 0;

        d3.select(this).attr("r", 8)
            .attr("cx", index * step);
        selected_period_months = PERIODS_AVAILABLE[index];
        // console.log("New Selected Period Months: ", selected_period_months);
    }

    spiral_chart_svg.select(".circle_selector")
        .call(d3.drag()
            .on("start", function(event, datum) {
                d3.select(this).attr("r", 7)
            })
            .on("drag", dragged)
            .on("end", function(event, datum) {
                d3.select(this).attr("r", 6);
                dispatch.call("changed_spiral_period", this)
            }))
        .on("mousemove", function(event, datum) { d3.select(this).attr("r", 8)})
        .on("mouseout", function(event, datum) { d3.select(this).attr("r", 6)});
}

function resetPeriodSelection() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    const LINE_WIDTH = svg_width * 0.75;
    const step = LINE_WIDTH / (PERIODS_AVAILABLE.length - 1);

    spiral_chart_svg.select(".circle_selector").transition().duration(1000)
        .attr("cx", 2 * step);
    selected_period_months = PERIODS_AVAILABLE[2];
}

function updateSpiralChart() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const margin = { "top": 0, "bottom": 20, "left": 20, "right": 20 }
    const chartRadius = svg_height / 2 - margin.bottom;

    dataset_spiral_chart = treatDataset();
    if (dataset_spiral_chart.length < selected_period_months['div']) {
        spiral_chart_svg.select("g#spiral_group")
            .classed("hidden", true);
        spiral_chart_svg.select("g.ErrorMessage")
            .classed("hidden", false);
        
        return;
    }
        
    spiral_chart_svg.select("g#spiral_group")
        .classed("hidden", false);
    spiral_chart_svg.select("g.ErrorMessage")
        .classed("hidden", true);
    
    var domain = d3.extent(dataset_spiral_chart, datum => datum["Models"]);
    spiral_color_scale.domain(domain);

    spiral_chart_svg.select("#bottom_spiral_scale").text(domain[0]);
    spiral_chart_svg.select("#top_spiral_scale").text(domain[1]);

    spiral_chart_svg.select("g#spiral_group").remove();

    spiral_heatmap = spiralHeatmap()
        .radius(chartRadius)
        .holeRadiusProportion(0)
        .arcsPerCoil(selected_period_months['div'])
        .coilPadding(0.05)
        .arcLabel("Month")
        .coilLabel("Year")

    const g = spiral_chart_svg.append("g")
        .attr("id", "spiral_group")
        .attr("transform", "translate(" + 
            (svg_width / 2) + "," + 
            (svg_height / 2 - margin.bottom + margin.top) + ")");

    g.datum(dataset_spiral_chart)
        .call(spiral_heatmap);

    g.selectAll(".arc").selectAll("path")
        .style("fill", datum => spiral_color_scale(datum["Models"]))
        .on("mouseover", (event, datum) => dispatch.call("hover_spiral_chart", this, event, datum))
        .on("mouseout", (event, datum) => dispatch.call("hover_remove_spiral_chart", this, event, datum));
}

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

function createTooltipSpiralChart() {
    var mockInformation = {'Date': new Date(0, 0, 1), 'Models': 0};
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip hidden")
        .attr("id", "tooltip_spiral_chart")
        .datum(mockInformation);
        
    tooltip.append("p").attr('id', 'TooltipDateInfo').html(datum => "<b>Date:</b> " + datum['Date']);
    tooltip.append("p").attr('id', 'TooltipModelsInfo').html(datum => "<b>Number of Models:</b> " + datum['Models']);
}

function show_tooltip_spiral_chart(event, information) {
    var tooltip = d3.select("div#tooltip_spiral_chart")
        .datum(information);

    const margin = { "top": 0, "bottom": 20, "left": 20, "right": 20 }
    const distanceTooltip = - 0.25 * parseInt(spiral_chart_svg.style("width").slice(0, -2));

    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    var left = spiral_chart_svg.node().getBoundingClientRect().x;
    var top = spiral_chart_svg.node().getBoundingClientRect().y;
    
    tooltip.select('#TooltipDateInfo').html(datum => "<b>Date:</b> " + dateTextSpiralChart(datum));
    tooltip.select('#TooltipModelsInfo').html(datum => "<b>Number of Models:</b> " + datum['Models']);

    const box_width = parseFloat(tooltip.style("width").slice(0, -2));
    const box_height = parseFloat(tooltip.style("height").slice(0, -2));
    var new_y = y + top - distanceTooltip - box_height;
    var new_x = x + left - distanceTooltip - box_width;
    
    tooltip.style("top", new_y).style("left", new_x);
    tooltip.classed("hidden", false);
}

function dateTextSpiralChart(datum) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    var dateString = datum['Date'].getFullYear();
    if (selected_period_months['by'] == 'month') dateString += " - " + monthNames[datum['Date'].getMonth()];
    if (selected_period_months['by'] == 'quarter') dateString += " - Quarter " + ((datum['Date'].getMonth() / 3) + 1);
    if (selected_period_months['by'] == 'semester') dateString += " - Semester " + ((datum['Date'].getMonth() / 6) + 1);

    return dateString;
}

function remove_tooltip_spiral_chart() {
    var tooltip = d3.select("div#tooltip_spiral_chart");
    
    tooltip.classed("hidden", true);
}