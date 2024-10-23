// Define the dimensions of the SVG
const width = 600;
const height = 600;

// Define the color scale for the choropleth map
var color = d3.scaleQuantize()
    .range(["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"]);

// Load the CSV file containing unemployment data
d3.csv("VIC_LGA_unemployment.csv").then(function(data) {
    // Set the color domain based on the unemployment values in the CSV
    color.domain([
        d3.min(data, function(d) { return +d.unemployed; }),
        d3.max(data, function(d) { return +d.unemployed; })
    ]);

    // Load the GeoJSON data for Victoria's LGAs
    d3.json("LGA_VIC.json").then(function(json) {
        // Merge the CSV data with the GeoJSON data
        for (var i = 0; i < data.length; i++) {
            var csvLGA = data[i].LGA_name;
            var unemployed = +data[i].unemployed;

            // Find the matching LGA in the GeoJSON and add the unemployment value
            for (var j = 0; j < json.features.length; j++) {
                var jsonLGA = json.features[j].properties.LGA_name.trim();
                if (csvLGA === jsonLGA) {
                    json.features[j].properties.unemployed = unemployed;
                    break;
                }
            }
        }

        // Select the actual SVG element by ID
        const svg = d3.select("#map")
            .attr("width", width)
            .attr("height", height);

        // Define the projection (Mercator) and center it on Victoria
        const projection = d3.geoMercator()
            .center([145, -37])  // Center on Victoria (longitude, latitude)
            .translate([width / 2, height / 2])  // Center the map within the SVG
            .scale(3000);  // Scale for zoom

        // Define a path generator using the projection
        const path = d3.geoPath().projection(projection);

        // Bind the GeoJSON data and create the map paths
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("class", "lga-boundary")
            .attr("d", path)  // This applies the path generator
            .style("fill", function(d) {
                // Use the unemployment value to determine the color
                var value = d.properties.unemployed;
                return value ? color(value) : "#ccc";  // Grey for missing data
            });




        // Tooltip element
        const tooltip = d3.select("#tooltip");

        // Load the city data and plot circles on the map
        d3.csv("VIC_city.csv").then(function(cities) {
            svg.selectAll("circle")
                .data(cities)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    const lon = +d.lon;  // Convert to number
                    const lat = +d.lat;  // Convert to number
                    return projection([lon, lat])[0];  // Convert lon to x value
                })
                .attr("cy", function(d) {
                    const lon = +d.lon;  // Convert to number
                    const lat = +d.lat;  // Convert to number
                    return projection([lon, lat])[1];  // Convert lat to y value
                })
                .attr("r", 3)  // Circle radius
                .style("fill", "red")  // Circle color
                .on("mouseover", function(event, d) {
                    // Show tooltip with the correct city name field
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltip.html(d.place)  // Use the 'place' field for city name
                        .style("left", (event.pageX + 5) + "px")  // Position tooltip
                        .style("top", (event.pageY - 28) + "px");
                })                
                .on("mousemove", function(event) {
                    // Update tooltip position as the mouse moves
                    tooltip.style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    // Hide tooltip
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }).catch(function(error) {
            console.log("Error loading the city data:", error);
        });

        // Create a legend for the color scale (same as before)
        // Legend code goes here...
    }).catch(function(error) {
        console.log("Error loading the GeoJSON file:", error);
    });
}).catch(function(error) {
    console.log("Error loading the CSV file:", error);
});
