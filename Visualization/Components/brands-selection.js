

const MAX_BRANDS_SELECTED = 4;

var brand_selection_form
var brands_selection_svgs = {}

var brands_colors = [
    { "Color": d3.rgb(162,50,22), "Brand": undefined },
    { "Color": d3.rgb(226,115,18), "Brand": "OnePlus" },
    { "Color": d3.rgb(243,175,22), "Brand": undefined },
    { "Color": d3.rgb(46,112,61), "Brand": "Mitac" }
]

function build_brand_selection_form() {
    /* ---- CENTERING DIV UNSELECTED TAKING INTO ACCOUNT SCROLLBAR ---- */
    var div_unselected = d3.select("div#unselected_brands_div");
    var div_node = div_unselected.node();
    var scrollbar_width = div_node.offsetWidth - div_node.clientWidth;
    var margins = div_unselected.style("margin").replace("px", "").split(" ")
        .map(elem => parseFloat(elem));
    margins[3] += scrollbar_width / 2;
    margins[1] -= scrollbar_width / 2;
    margins = margins.map(elem => elem + 'px');
    div_unselected.style("margin", margins.join(" "));


    var top = d3.select("svg#brands_selection_top");
    var selected = d3.select("svg#selected_brands_svg");
    var unselected = d3.select("svg#unselected_brands_svg");
    
    var svg_width_selected = parseInt(selected.style("width").slice(0, -2));
    var svg_width_unselected = parseInt(unselected.style("width").slice(0, -2));
    const WIDTH_BOX = svg_width_unselected;
    var brand_selection = d3.select("div#brands_selection");
    var brand_selection_height = parseInt(brand_selection.style("height").slice(0, -2));
    const HEIGHT_BOX = brand_selection_height * 0.29 / MAX_BRANDS_SELECTED;
    var selected_div = d3.select("div#selected_brands_div");
    selected_div.style("height", HEIGHT_BOX * selected_brands.length);
    var unselected_div = d3.select("div#unselected_brands_div");
    unselected_div.style("height", brand_selection_height * 0.90 - HEIGHT_BOX * selected_brands.length);

    brands_selection_svgs = {
        "top": top,
        "selected": selected,
        "unselected": unselected
    }

    top.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("class", "text_module_title text_center")
        .text("Select Brands");
    
    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem));
    unselected.attr("height", unselected_brands.length * HEIGHT_BOX);

    var selected_g = selected.append("g").attr("id", "selected_brands");
    selected_g.selectAll("g")
        .data(selected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g") 
                    .classed("brand_box selectedBrand", true) 
                    .on("click", (event, datum) => dispatch.call("unselectBrand", this, datum));
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", datum => getColorBrand(datum))
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("dominant-baseline", "middle")
                    .attr("class", "text_brands")
                    .text(datum => datum)
                
                return g;
            } ,
            exit => exit.remove()
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width_selected - WIDTH_BOX) / 2 + "," + index * HEIGHT_BOX + ")");

    var unselected_g = unselected.append("g").attr("id", "unselected_brands");
    unselected_g.selectAll("g")
        .data(unselected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")
                    .classed("brand_box unselectedBrand", true) 
                    .on("click", (event, datum) => dispatch.call("selectBrand", this, datum));
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", "white")
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("dominant-baseline", "middle")
                    .attr("class", "text_brands")
                    .text(datum => datum);
                
                return g;
            } ,
            exit => exit.remove()
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width_unselected - WIDTH_BOX) / 2 + "," + index * HEIGHT_BOX + ")");
}

function update_brand_selection_selected_brand() {
    var svg_width_selected = parseInt(brands_selection_svgs.selected.style("width").slice(0, -2));
    var svg_width_unselected = parseInt(brands_selection_svgs.unselected.style("width").slice(0, -2));
    const WIDTH_BOX = svg_width_unselected;
    var brand_selection = d3.select("div#brands_selection");
    var brand_selection_height = parseInt(brand_selection.style("height").slice(0, -2));
    const HEIGHT_BOX = brand_selection_height * 0.29 / MAX_BRANDS_SELECTED;
    var selected_div = d3.select("div#selected_brands_div");
    selected_div.style("height", HEIGHT_BOX * selected_brands.length);
    var unselected_div = d3.select("div#unselected_brands_div");
    unselected_div.style("height", brand_selection_height * 0.90 - HEIGHT_BOX * selected_brands.length);

    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem));
    brands_selection_svgs.unselected.attr("height", unselected_brands.length * HEIGHT_BOX);

    brands_selection_svgs.selected.select("#selected_brands")
        .selectAll("g")
        .data(selected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")
                    .classed("brand_box selectedBrand", true) 
                    .on("click", (event, datum) => dispatch.call("unselectBrand", this, datum));
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", datum => getColorBrand(datum))
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("dominant-baseline", "middle")
                    .attr("class", "text_brands")
                    .text(datum => datum)
                
                return g;
            } ,
            exit => exit.remove()
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width_selected - WIDTH_BOX) / 2 + "," + index * HEIGHT_BOX + ")");
        
    brands_selection_svgs.unselected.select("#unselected_brands")
        .selectAll("g")
        .data(unselected_brands, datum => datum)
        .join(exit => exit.remove())
        .attr("transform", (datum, index) => "translate(" + (svg_width_unselected - WIDTH_BOX) / 2 + "," + index * HEIGHT_BOX + ")");
}

function update_brand_selection_unselected_brand() {
    var svg_width_selected = parseInt(brands_selection_svgs.selected.style("width").slice(0, -2));
    var svg_width_unselected = parseInt(brands_selection_svgs.unselected.style("width").slice(0, -2));
    const WIDTH_BOX = svg_width_unselected;
    var brand_selection = d3.select("div#brands_selection");
    var brand_selection_height = parseInt(brand_selection.style("height").slice(0, -2));
    const HEIGHT_BOX = brand_selection_height * 0.29 / MAX_BRANDS_SELECTED;
    var selected_div = d3.select("div#selected_brands_div");
    selected_div.style("height", HEIGHT_BOX * selected_brands.length);
    var unselected_div = d3.select("div#unselected_brands_div");
    unselected_div.style("height", brand_selection_height * 0.90 - HEIGHT_BOX * selected_brands.length);
    
    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem));
    brands_selection_svgs.unselected.attr("height", unselected_brands.length * HEIGHT_BOX);

    brands_selection_svgs.selected.select("#selected_brands")
        .selectAll("g")
        .data(selected_brands, datum => datum)
        .join(exit => exit.remove())
        .attr("transform", (datum, index) => "translate(" + (svg_width_selected - WIDTH_BOX) / 2 + "," + index * HEIGHT_BOX + ")");

    brands_selection_svgs.unselected.select("#unselected_brands")
        .selectAll("g")
        .data(unselected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")
                    .classed("brand_box unselectedBrand", true) 
                    .on("click", (event, datum) => dispatch.call("selectBrand", this, datum));
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", "white")
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("dominant-baseline", "middle")
                    .attr("class", "text_brands")
                    .text(datum => datum)
                    .text(datum => datum)
                    .text(datum => datum)
                
                return g;
            }
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width_unselected - WIDTH_BOX) / 2 + "," + index * HEIGHT_BOX + ")");
}

function addBrandColor(brand) {
    var available = brands_colors.filter(elem => elem['Brand'] == undefined);
    var color = available[Math.floor(Math.random() * available.length)]['Color'];

    brands_colors.find(elem => elem['Color'] == color)['Brand'] = brand;
}

function getColorBrand(brand) {
    return brands_colors.find(elem => elem['Brand'] == brand)['Color'];
}

function removeColorBrand(brand) {
    brands_colors.find(elem => elem['Brand'] == brand)['Brand'] = undefined;
}