const show_images = false

var fulldataset_models
var dataset_models
var fulldataset_brands

var dispatch = d3.dispatch("selectBrand",
    "unselectBrand", "hover_brand", "hover_remove_brand");

var dataset_brands
var brands_list
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
    /* --------------- SELECTION OF BRAND ------------------ */
    dispatch.on("selectBrand", function(brand) {
        if (selected_brands.length >= MAX_BRANDS_SELECTED) return;
        selected_brands.push(brand);
        addBrandColor(brand);
        brandUpdateColor(brand);

        update_brand_selection_selected_brand();
    });

    /* --------------- UNSELECTION OF BRAND ------------------ */
    dispatch.on("unselectBrand", function(brand) {
        const index = selected_brands.indexOf(brand);
        selected_brands.splice(index, 1);
        removeColorBrand(brand);
        brandUpdateColor(brand);

        update_brand_selection_unselected_brand();
    });

    /* --------------- HOVER POINT OF BRAND ------------------ */
    dispatch.on("hover_brand", function(brand) {
        highlight_line(brand);
    });
    
    dispatch.on("hover_remove_brand", function(brand) {
        remove_highlight_line(brand);
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