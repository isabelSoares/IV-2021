var dragHandler = d3.drag()
var fulldataset_models
var dataset_models
var fulldataset_brands
var dataset_brands
var brands_list
var selected_brands = []

var time_selection_svg

const MAX_BRANDS_SELECTED = 4;
var brands_selection_svgs = {}

var min_date
var max_date
var start_date = new Date(2000, 0, 1)
var end_date = new Date(2015, 0, 1)
var time_scale

var brand_selection_form
var line_chart_1_svg
var line_chart_2_svg
var spiral_chart_svg

const DatasetDir = "../Datasets/"

function init() {
    d3.dsv(";", DatasetDir + "Brands_Parsed.csv").then(function (data) {
        data.forEach(function(elem) {
            if (elem['Year'] == 'null') elem['Year'] = null;
            else elem['Year'] = parseInt(elem['Year'])

            elem['# Models'] = parseInt(elem['# Models'])
            
            if (elem['Sales'] == 'null') elem['Sales'] = 0;
            else elem['Sales'] = parseInt(elem['Sales'])
        });

        fulldataset_brands = data;
        dataset_brands = fulldataset_brands;
        brands_list = dataset_brands.map(elem => elem['Brand'])
            .filter((value, index, self) => self.indexOf(value) === index);
        
        d3.dsv(";", DatasetDir + "Models_Parsed.csv").then(function (data) {
            data.forEach(element => {
                if (element['year'] == 'null') element['year'] = null;
                else element['year'] = parseInt(element['year'])
                if (element['quarter'] == 'null') element['quarter'] = null;
                else element['quarter'] = parseInt(element['quarter'])
                if (element['month_id'] == 'null') element['month_id'] = null;
                else element['month_id'] = parseInt(element['month_id'])
            });

            fulldataset_models = data;
            dataset_models = fulldataset_models;

            // console.log("Brands: ", fulldataset_brands);
            // console.log("Models: ", fulldataset_models);

            build_time_selection_svg();
            build_brand_selection_form();
            build_line_chart_1();
            build_line_chart_2();
            build_spiral_chart();
            
        });
    });
}