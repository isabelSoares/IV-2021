const show_images = false

var fulldataset_models
var dataset_models
var fulldataset_brands

var dispatch = d3.dispatch("clickBrand", "selectBrand", "unselectBrand",
    "hover_brand", "hover_remove_brand",
    "hover_line_chart", "hover_remove_line_chart");

var dataset_brands
var brands_list
var closeToBrand = undefined
var selected_brands = []

var start_date = new Date(1992, 0, 1)
var end_date = new Date(2019, 0, 1)

const DatasetDir = "../Datasets/"

function init() {
    d3.dsv(";", DatasetDir + "Brands_Parsed.csv").then(function (data) {
        data.forEach(function(element) {
            if (element['Year'] == 'null') element['Year'] = null;
            else element['Year'] = parseInt(element['Year'])

            element['# Models'] = parseInt(element['# Models'])
            
            if (element['Sales'] == 'null') element['Sales'] = 0;
            else element['Sales'] = parseInt(element['Sales'])

            computeDateBrands(element);
        });

        fulldataset_brands = data;
        brands_list = fulldataset_brands.map(elem => elem['Brand'])
            .filter((value, index, self) => self.indexOf(value) === index);
        
        d3.dsv(";", DatasetDir + "Models_Parsed.csv").then(function (data) {
            data.forEach(element => {
                if (element['year'] == 'null') element['year'] = null;
                else element['year'] = parseInt(element['year'])
                if (element['quarter'] == 'null') element['quarter'] = null;
                else element['quarter'] = parseInt(element['quarter'])
                if (element['month_id'] == 'null') element['month_id'] = null;
                else element['month_id'] = parseInt(element['month_id'])

                computeDateModel(element);
            });

            fulldataset_models = data;
            dataset_models = fulldataset_models;

            console.log("Brands: ", fulldataset_brands);
            console.log("Models: ", fulldataset_models);

            filterDatasets();

            // console.log("Start Date: ", start_date);
            // console.log("End Date: ", end_date);

            build_time_selection_svg();
            build_brand_selection_form();
            build_line_charts();
            build_spiral_chart();
            
            prepareEvents();
            if (show_images) appendImages();
            
        });
    });
}

function filterDatasets() {
    dataset_brands = fulldataset_brands.filter(function(elem) {
        return (elem['Date'] >= start_date &&
            elem['Date'] <= end_date) 
    });

    dataset_models = fulldataset_models.filter(function(elem) {
        return (elem['Date'] >= start_date &&
            elem['Date'] <= end_date) 
    });
}

function computeDateBrands(element) {
    var year = element['Year'];
    if (year == null) element['Date'] = undefined;
    else element['Date'] = new Date(year, 0, 1);
}

function computeDateModel(element) {
    var year = element['year'];
    var quarter = element['quarter'];
    var month = element['month_id'];

    if (month == undefined && quarter == undefined) month = 1;
    if (month == undefined && quarter != undefined) month = (quarter - 1) * 4;

    if (year == null) element['Date'] = undefined;
    else element['Date'] = new Date(year, month - 1, 1);
}

function prepareEvents() {
    /* --------------- CLICKED LINE OF BRAND ------------------ */
    dispatch.on("clickBrand", function() {
        if (closeToBrand == undefined) return;

        if (selected_brands.includes(closeToBrand)) dispatch.call("unselectBrand", this);
        else dispatch.call("selectBrand", this);
    });

    /* --------------- SELECTION OF BRAND ------------------ */
    dispatch.on("selectBrand", function() {
        if (closeToBrand == undefined) return;
        if (selected_brands.length >= MAX_BRANDS_SELECTED) return;

        selected_brands.push(closeToBrand);
        addBrandColor(closeToBrand);
        brandUpdateColor(closeToBrand);

        update_brand_selection_selected_brand();
    });

    /* --------------- UNSELECTION OF BRAND ------------------ */
    dispatch.on("unselectBrand", function() {
        if (closeToBrand == undefined) return;

        const index = selected_brands.indexOf(closeToBrand);
        selected_brands.splice(index, 1);
        removeColorBrand(closeToBrand);
        brandUpdateColor(closeToBrand);

        update_brand_selection_unselected_brand();
    });

    /* --------------- HOVER POINT OF BRAND ------------------ */
    dispatch.on("hover_brand", function(event, line_chart, brand) {
        highlight_line(brand);
        show_circle(event, line_chart, brand);
    });
    
    dispatch.on("hover_remove_brand", function(brand) {
        remove_highlight_line(brand);
        remove_circle();
    });
    
    /* --------------- HOVER LINE CHART ------------------ */
    dispatch.on("hover_line_chart", function(event, line_chart) {
        var newCloseToBrand
        var path = getClosestPath(event, line_chart, 20);

        if (path != undefined) {
            const index = parseInt(d3.select(path).attr("id").split("_")[3]);
            newCloseToBrand = brands_list[index];
        } else newCloseToBrand = undefined

        if (closeToBrand != undefined && newCloseToBrand != closeToBrand) {
            dispatch.call("hover_remove_brand", this, closeToBrand)
        }

        if (newCloseToBrand != undefined && newCloseToBrand != closeToBrand) {
            dispatch.call("hover_brand", this, event, line_chart, newCloseToBrand);
        }

        closeToBrand = newCloseToBrand;   
    });

    dispatch.on("hover_remove_line_chart", function() {
        dispatch.call("hover_remove_brand", this, closeToBrand)
        closeToBrand = undefined;
    });
}

function appendImages() {
    var small_multiples = d3.select("svg#small_multiples_line_chart")
                            .append("svg:image")
                            .attr("xlink:href", "Resources/Small Multiples.png")
                            .attr("height", "100%")
                            .attr("width", "100%")
                            .attr("preserveAspectRatio", "none");

    var parallel_coords = d3.select("svg#parallel_coordinates_chart")
                            .append("svg:image")
                            .attr("xlink:href", "Resources/Parallel Line Charts.png")
                            .attr("height", "100%")
                            .attr("width", "100%")
                            .attr("preserveAspectRatio", "none");

    var glyph = d3.select("svg#glyph_chart")
                  .append("svg:image")
                  .attr("xlink:href", "Resources/Glyphs.png")
                  .attr("height", "100%")
                  .attr("width", "100%")
                  .attr("preserveAspectRatio", "none");
}