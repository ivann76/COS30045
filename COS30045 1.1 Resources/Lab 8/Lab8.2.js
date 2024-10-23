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
        console.log("Color scale domain:", color.domain()); // Log the color scale domain

        // Load the GeoJSON data for Victoria's LGAs
        d3.json("LGA_VIC.json").then(function(json) {
            // Merge the CSV data with the GeoJSON data
            for (var i = 0; i < data.length; i++) {
                var csvLGA = data[i].LGA_name;
                var unemployed = +data[i].unemployed;
                console.log(`Processing CSV LGA: ${csvLGA}, Unemployed: ${unemployed}`);

                // Find the matching LGA in the GeoJSON and add the unemployment value
                for (var j = 0; j < json.features.length; j++) {
                    var jsonLGA = json.features[j].properties.LGA_name;

                    if (csvLGA === jsonLGA) {
                        json.features[j].properties.unemployed = unemployed;
                        console.log(`Matched ${csvLGA} with GeoJSON and set unemployed to ${unemployed}`);
                        break;
                    }
                }
            }

            // Check merged data
            console.log(json.features); // Log GeoJSON features to verify unemployment data

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
                .attr("d", path)
                .style("fill", function(d) {
                    // Use the unemployment value to determine the color
                    var value = d.properties.unemployed;
                    console.log("Unemployment value for", d.properties.LGA_name, ":", value); // Log the value
                    return value ? color(value) : "#ccc";  // Grey for missing data
                });

            // Load the city data and plot circles on the map
            d3.csv("VIC_city.csv").then(function(cities) {
                svg.selectAll("circle")
                    .data(cities)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        const lon = +d.lon;  // Convert to number
                        const lat = +d.lat;  // Convert to number
                        if (isNaN(lon) || isNaN(lat)) {
                            console.error("Invalid coordinates:", d.lon, d.lat); // Log invalid coordinates
                            return 0;  // Fallback or handle error
                        }
                        return projection([lon, lat])[0];  // Convert lon to x value
                    })
                    .attr("cy", function(d) {
                        const lon = +d.lon;  // Convert to number
                        const lat = +d.lat;  // Convert to number
                        if (isNaN(lon) || isNaN(lat)) {
                            console.error("Invalid coordinates:", d.lon, d.lat); // Log invalid coordinates
                            return 0;  // Fallback or handle error
                        }
                        return projection([lon, lat])[1];  // Convert lat to y value
                    })
                    .attr("r", 3)  // Circle radius
                    .style("fill", "red");  // Circle color
            }).catch(function(error) {
                console.log("Error loading the city data:", error);
            });

            // Create a legend for the color scale
            const legend = d3.select("#legend");
            const legendScale = d3.scaleLinear()
                .domain(color.domain())
                .range([0, 300]);  // Adjust width as needed

            // Create an axis for the legend
            const legendAxis = d3.axisBottom(legendScale)
                .tickSize(13)
                .tickFormat(d3.format(".0f"))
                .tickValues(color.domain());

            legend.append("svg")
                .attr("width", 320)  // Width of the legend
                .attr("height", 50)
                .append("g")
                .attr("class", "legendAxis")
                .attr("transform", "translate(10,20)")  // Position the axis
                .call(legendAxis);

            // Add color bars for the legend
            legend.selectAll("rect")
                .data(color.range().map(function(d, i) {
                    return {
                        x0: legendScale(color.domain()[i]),
                        x1: legendScale(color.domain()[i + 1]),
                        z: d
                    };
                }))
                .enter().append("rect")
                .attr("height", 10)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });

        }).catch(function(error) {
            console.log("Error loading the GeoJSON file:", error);
        });
    }).catch(function(error) {
        console.log("Error loading the CSV file:", error);
    });